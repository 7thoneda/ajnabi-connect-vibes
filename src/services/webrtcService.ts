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
  DocumentData 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import SimplePeer from 'simple-peer';

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
  private peer: SimplePeer.Instance | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callId: string | null = null;
  private userId: string;
  private isInitiator: boolean = false;
  private signalUnsubscribe: (() => void) | null = null;

  // WebRTC configuration with STUN servers
  private readonly peerConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

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
      this.isInitiator = true;

      // Initialize peer as initiator
      await this.initializePeer(true);
      
      // Listen for signals
      this.listenForSignals();

      return callDoc.id;
    } catch (error: any) {
      throw new Error(`Failed to create call: ${error.message}`);
    }
  }

  // Join an existing call
  async joinCall(callId: string): Promise<void> {
    try {
      this.callId = callId;
      this.isInitiator = false;

      // Update call with receiver info
      const callRef = doc(db, 'calls', callId);
      await updateDoc(callRef, {
        receiverId: this.userId,
        status: 'connecting'
      });

      // Initialize peer as receiver
      await this.initializePeer(false);
      
      // Listen for signals
      this.listenForSignals();
    } catch (error: any) {
      throw new Error(`Failed to join call: ${error.message}`);
    }
  }

  // Initialize SimplePeer instance
  private async initializePeer(initiator: boolean): Promise<void> {
    if (!this.localStream) {
      throw new Error('Local stream not initialized');
    }

    this.peer = new SimplePeer({
      initiator,
      trickle: true,
      stream: this.localStream,
      config: this.peerConfig
    });

    // Handle peer events
    this.peer.on('signal', (data) => {
      this.sendSignal(data);
    });

    this.peer.on('stream', (stream) => {
      this.remoteStream = stream;
      this.onRemoteStream?.(stream);
    });

    this.peer.on('connect', () => {
      this.onConnectionEstablished?.();
      this.updateCallStatus('connected');
    });

    this.peer.on('close', () => {
      this.onCallEnded?.();
    });

    this.peer.on('error', (error) => {
      console.error('Peer error:', error);
      this.onError?.(error.message);
    });
  }

  // Send signaling data through Firebase
  private async sendSignal(signalData: any): Promise<void> {
    if (!this.callId) return;

    try {
      await addDoc(collection(db, 'signals'), {
        type: signalData.type || 'signal',
        data: signalData,
        from: this.userId,
        to: this.isInitiator ? 'receiver' : 'caller',
        callId: this.callId,
        timestamp: Timestamp.now()
      });
    } catch (error: any) {
      console.error('Failed to send signal:', error);
    }
  }

  // Listen for incoming signals
  private listenForSignals(): void {
    if (!this.callId) return;

    const signalsQuery = query(
      collection(db, 'signals'),
      where('callId', '==', this.callId),
      where('to', '==', this.isInitiator ? 'caller' : 'receiver'),
      orderBy('timestamp', 'asc')
    );

    this.signalUnsubscribe = onSnapshot(signalsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const signalDoc = change.doc.data() as SignalData;
          if (signalDoc.from !== this.userId && this.peer) {
            this.peer.signal(signalDoc.data);
            
            // Clean up processed signal
            deleteDoc(change.doc.ref).catch(console.error);
          }
        }
      });
    });
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
      // Close peer connection
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
      }

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

      // Clean up call document and signals
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

// Import getDocs for cleanup function
import { getDocs } from 'firebase/firestore';