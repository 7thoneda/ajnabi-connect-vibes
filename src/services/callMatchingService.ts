import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData 
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface MatchingRequest {
  id: string;
  userId: string;
  userGender: 'male' | 'female' | 'other';
  preferredGender: 'anyone' | 'men' | 'women';
  isPremium: boolean;
  callType: 'video' | 'voice';
  status: 'waiting' | 'matched' | 'cancelled';
  createdAt: Timestamp;
  matchedWith?: string;
  callId?: string;
}

export class CallMatchingService {
  private static instance: CallMatchingService;
  private matchingUnsubscribe: (() => void) | null = null;

  static getInstance(): CallMatchingService {
    if (!CallMatchingService.instance) {
      CallMatchingService.instance = new CallMatchingService();
    }
    return CallMatchingService.instance;
  }

  // Start looking for a match
  async startMatching(
    userId: string,
    userGender: 'male' | 'female' | 'other',
    preferredGender: 'anyone' | 'men' | 'women',
    isPremium: boolean,
    callType: 'video' | 'voice'
  ): Promise<string> {
    try {
      // First, try to find an existing match
      const existingMatch = await this.findExistingMatch(userGender, preferredGender, isPremium, callType);
      
      if (existingMatch) {
        // Join existing match
        await this.joinMatch(existingMatch.id, userId);
        return existingMatch.callId || existingMatch.id;
      } else {
        // Create new matching request
        const matchingDoc = await addDoc(collection(db, 'matchingRequests'), {
          userId,
          userGender,
          preferredGender,
          isPremium,
          callType,
          status: 'waiting',
          createdAt: Timestamp.now()
        });

        // Listen for matches
        this.listenForMatch(matchingDoc.id, userId);
        
        return matchingDoc.id;
      }
    } catch (error: any) {
      throw new Error(`Failed to start matching: ${error.message}`);
    }
  }

  // Find an existing compatible match
  private async findExistingMatch(
    userGender: 'male' | 'female' | 'other',
    preferredGender: 'anyone' | 'men' | 'women',
    isPremium: boolean,
    callType: 'video' | 'voice'
  ): Promise<DocumentData | null> {
    try {
      // Look for waiting requests that are compatible
      let matchQuery = query(
        collection(db, 'matchingRequests'),
        where('status', '==', 'waiting'),
        where('callType', '==', callType),
        orderBy('createdAt', 'asc'),
        limit(10)
      );

      const snapshot = await getDocs(matchQuery);
      
      for (const docSnap of snapshot.docs) {
        const request = { id: docSnap.id, ...docSnap.data() } as MatchingRequest;
        
        if (this.isCompatibleMatch(request, userGender, preferredGender, isPremium)) {
          return request;
        }
      }

      return null;
    } catch (error: any) {
      console.error('Error finding existing match:', error);
      return null;
    }
  }

  // Check if two users are compatible for matching
  private isCompatibleMatch(
    existingRequest: MatchingRequest,
    newUserGender: 'male' | 'female' | 'other',
    newUserPreference: 'anyone' | 'men' | 'women',
    newUserIsPremium: boolean
  ): boolean {
    // Check if existing user would accept new user
    const existingUserAccepts = this.wouldAcceptGender(
      existingRequest.preferredGender,
      existingRequest.isPremium,
      newUserGender
    );

    // Check if new user would accept existing user
    const newUserAccepts = this.wouldAcceptGender(
      newUserPreference,
      newUserIsPremium,
      existingRequest.userGender
    );

    return existingUserAccepts && newUserAccepts;
  }

  private wouldAcceptGender(
    preference: 'anyone' | 'men' | 'women',
    isPremium: boolean,
    targetGender: 'male' | 'female' | 'other'
  ): boolean {
    // Free users accept anyone
    if (!isPremium) {
      return true;
    }

    // Premium users follow their preferences
    switch (preference) {
      case 'men':
        return targetGender === 'male';
      case 'women':
        return targetGender === 'female';
      case 'anyone':
      default:
        return true;
    }
  }

  // Join an existing match
  private async joinMatch(matchingRequestId: string, userId: string): Promise<void> {
    try {
      const matchingRef = doc(db, 'matchingRequests', matchingRequestId);
      
      // Create a call document
      const callDoc = await addDoc(collection(db, 'calls'), {
        callerId: userId, // The joiner becomes the caller for WebRTC purposes
        receiverId: userId, // Will be updated with the original requester
        status: 'connecting',
        createdAt: Timestamp.now(),
        callType: 'video' // Will be updated based on the request
      });

      // Update the matching request
      await updateDoc(matchingRef, {
        status: 'matched',
        matchedWith: userId,
        callId: callDoc.id
      });
    } catch (error: any) {
      throw new Error(`Failed to join match: ${error.message}`);
    }
  }

  // Listen for match updates
  private listenForMatch(matchingRequestId: string, userId: string): void {
    const matchingRef = doc(db, 'matchingRequests', matchingRequestId);
    
    this.matchingUnsubscribe = onSnapshot(matchingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as MatchingRequest;
        
        if (data.status === 'matched' && data.matchedWith && data.callId) {
          // Match found!
          this.onMatchFound?.(data.callId, data.matchedWith);
          
          // Clean up listener
          if (this.matchingUnsubscribe) {
            this.matchingUnsubscribe();
            this.matchingUnsubscribe = null;
          }
        }
      }
    });
  }

  // Cancel matching
  async cancelMatching(matchingRequestId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'matchingRequests', matchingRequestId));
      
      if (this.matchingUnsubscribe) {
        this.matchingUnsubscribe();
        this.matchingUnsubscribe = null;
      }
    } catch (error: any) {
      console.error('Failed to cancel matching:', error);
    }
  }

  // Clean up old matching requests (should be called periodically)
  static async cleanupOldRequests(): Promise<void> {
    try {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      const oldRequestsQuery = query(
        collection(db, 'matchingRequests'),
        where('createdAt', '<', Timestamp.fromDate(fiveMinutesAgo)),
        where('status', '==', 'waiting')
      );

      const snapshot = await getDocs(oldRequestsQuery);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error: any) {
      console.error('Failed to cleanup old requests:', error);
    }
  }

  // Event handlers
  onMatchFound?: (callId: string, partnerId: string) => void;
  onError?: (error: string) => void;
}

// Import getDocs for cleanup function
import { getDocs } from 'firebase/firestore';

export const callMatchingService = CallMatchingService.getInstance();