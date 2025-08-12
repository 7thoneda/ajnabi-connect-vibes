import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export class FirestoreService {
  // Create a new document
  static async createDocument(collectionName: string, data: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to create document: ${error.message}`);
    }
  }

  // Update an existing document
  static async updateDocument(collectionName: string, docId: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error: any) {
      throw new Error(`Failed to update document: ${error.message}`);
    }
  }

  // Delete a document
  static async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  // Get a single document
  static async getDocument(collectionName: string, docId: string): Promise<DocumentData | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error: any) {
      throw new Error(`Failed to get document: ${error.message}`);
    }
  }

  // Get multiple documents with optional filtering
  static async getDocuments(
    collectionName: string, 
    filters?: { field: string; operator: any; value: any }[],
    orderByField?: string,
    limitCount?: number
  ): Promise<DocumentData[]> {
    try {
      let q = collection(db, collectionName);
      
      // Apply filters
      if (filters) {
        filters.forEach(filter => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });
      }
      
      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, 'desc'));
      }
      
      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      throw new Error(`Failed to get documents: ${error.message}`);
    }
  }

  // Listen to real-time updates
  static subscribeToCollection(
    collectionName: string,
    callback: (documents: DocumentData[]) => void,
    filters?: { field: string; operator: any; value: any }[]
  ) {
    try {
      let q = collection(db, collectionName);
      
      // Apply filters
      if (filters) {
        filters.forEach(filter => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });
      }
      
      return onSnapshot(q, (querySnapshot: QuerySnapshot) => {
        const documents = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        callback(documents);
      });
    } catch (error: any) {
      throw new Error(`Failed to subscribe to collection: ${error.message}`);
    }
  }

  // Listen to a single document
  static subscribeToDocument(
    collectionName: string,
    docId: string,
    callback: (document: DocumentData | null) => void
  ) {
    try {
      const docRef = doc(db, collectionName, docId);
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() });
        } else {
          callback(null);
        }
      });
    } catch (error: any) {
      throw new Error(`Failed to subscribe to document: ${error.message}`);
    }
  }

  // WebRTC-specific methods for call management
  static async createCall(callData: {
    callerId: string;
    callType: 'video' | 'voice';
    status: 'waiting' | 'connecting' | 'connected' | 'ended';
  }): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'calls'), {
        ...callData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to create call: ${error.message}`);
    }
  }

  static async updateCallStatus(callId: string, status: string, additionalData?: any): Promise<void> {
    try {
      const callRef = doc(db, 'calls', callId);
      await updateDoc(callRef, {
        status,
        updatedAt: Timestamp.now(),
        ...additionalData
      });
    } catch (error: any) {
      throw new Error(`Failed to update call status: ${error.message}`);
    }
  }

  static async sendSignal(signalData: {
    type: string;
    data: any;
    from: string;
    to: string;
    callId: string;
  }): Promise<void> {
    try {
      await addDoc(collection(db, 'signals'), {
        ...signalData,
        timestamp: Timestamp.now()
      });
    } catch (error: any) {
      throw new Error(`Failed to send signal: ${error.message}`);
    }
  }

  static subscribeToSignals(
    callId: string,
    targetUser: string,
    callback: (signals: DocumentData[]) => void
  ) {
    try {
      const signalsQuery = query(
        collection(db, 'signals'),
        where('callId', '==', callId),
        where('to', '==', targetUser),
        orderBy('timestamp', 'asc')
      );

      return onSnapshot(signalsQuery, (snapshot) => {
        const signals = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        callback(signals);
      });
    } catch (error: any) {
      throw new Error(`Failed to subscribe to signals: ${error.message}`);
    }
  }
}