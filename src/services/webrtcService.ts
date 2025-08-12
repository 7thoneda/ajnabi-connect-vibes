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
  Timestamp,
  DocumentData,
  getDocs
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface CallData {
  id: string;
  callerId: string;
  receiverId?: string;
  status: 'waiting' | 'connecting' | 'connected' | 'ended';
  createdAt: Timestamp;
  endedAt?: Timestamp;
  callType: 'video' | 'voice';
}

export interface SignalData {
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
  from: string;
  to: string;
  callId: string;
  timestamp: Timestamp;
}

export class WebRTCService {
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callId: string | null = null;
  private userId: string;
  private signalUnsubscribe: (() => void) | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Initialize local media stream
  async initializeMedia(callType: 'video' | 'voice'): Promise<MediaStream> {
    try {
      const constraints = {
        video: callType === 'video',
        audio: true
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error: any) {
      throw new Error(`Failed to access media devices: ${error.message}`);
    }
  }

  // Create a new call
  async createCall(callType: 'video' | 'voice'): Promise<string> {
    try {
      const callDoc = await addDoc(collection(db, 'calls'), {
        callerId: this.userId,
        status: 'waiting',
        createdAt: Timestamp.now(),
        callType
      });

      this.callId = callDoc.id;
      return callDoc.id;
    } catch (error: any) {
      throw new Error(`Failed to create call: ${error.message}`);
    }
  }

  // Join an existing call
  async joinCall(callId: string): Promise<void> {
    try {
      this.callId = callId;

      // Update call with receiver info
      const callRef = doc(db, 'calls', callId);
      await updateDoc(callRef, {
        receiverId: this.userId,
        status: 'connecting'
      });
    } catch (error: any) {
      throw new Error(`Failed to join call: ${error.message}`);
    }
  }

  // Update call status
  private async updateCallStatus(status: CallData['status']): Promise<void> {
    if (!this.callId) return;

    try {
      const callRef = doc(db, 'calls', this.callId);
      const updateData: any = { status };
      
      if (status === 'ended') {
        updateData.endedAt = Timestamp.now();
      }

      await updateDoc(callRef, updateData);
    } catch (error: any) {
      console.error('Failed to update call status:', error);
    }
  }

  // End the call
  async endCall(): Promise<void> {
    try {
      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      // Update call status
      await this.updateCallStatus('ended');

      // Clean up listeners
      if (this.signalUnsubscribe) {
        this.signalUnsubscribe();
        this.signalUnsubscribe = null;
      }

      // Clean up call document
      if (this.callId) {
        await this.cleanupCallData(this.callId);
        this.callId = null;
      }

      this.remoteStream = null;
    } catch (error: any) {
      console.error('Failed to end call:', error);
    }
  }

  // Clean up call-related data
  private async cleanupCallData(callId: string): Promise<void> {
    try {
      // Delete call document
      await deleteDoc(doc(db, 'calls', callId));

      // Delete associated signals
      const signalsQuery = query(
        collection(db, 'signals'),
        where('callId', '==', callId)
      );

      const signalsSnapshot = await getDocs(signalsQuery);
      const deletePromises = signalsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error: any) {
      console.error('Failed to cleanup call data:', error);
    }
  }

  // Toggle audio
  toggleAudio(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  // Toggle video
  toggleVideo(): boolean {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Get remote stream
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // Event handlers (to be set by components)
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionEstablished?: () => void;
  onCallEnded?: () => void;
  onError?: (error: string) => void;
}