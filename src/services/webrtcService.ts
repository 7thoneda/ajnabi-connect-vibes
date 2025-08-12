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
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
}

export interface ICECandidateData {
  candidate: string;
  sdpMLineIndex: number | null;
  sdpMid: string | null;
  callId: string;
  from: string;
  timestamp: Timestamp;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callId: string | null = null;
  private userId: string;
  private isInitiator: boolean = false;
  private callUnsubscribe: (() => void) | null = null;
  private iceCandidatesUnsubscribe: (() => void) | null = null;

  // WebRTC configuration with STUN servers
  private readonly peerConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
  };

  constructor(userId: string) {
    this.userId = userId;
  }

  // Initialize local media stream
  async initializeMedia(callType: 'video' | 'voice'): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Local stream initialized:', this.localStream);
      return this.localStream;
    } catch (error: any) {
      console.error('Failed to access media devices:', error);
      throw new Error(`Failed to access media devices: ${error.message}`);
    }
  }

  // Create a new call as initiator
  async createCall(callType: 'video' | 'voice'): Promise<string> {
    try {
      console.log('Creating call as initiator');
      
      // Initialize media first
      await this.initializeMedia(callType);
      
      // Create call document
      const callDoc = await addDoc(collection(db, 'calls'), {
        callerId: this.userId,
        status: 'waiting',
        createdAt: Timestamp.now(),
        callType
      });

      this.callId = callDoc.id;
      this.isInitiator = true;

      // Initialize peer connection
      await this.initializePeerConnection();
      
      // Create offer
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      // Save offer to Firebase
      await updateDoc(doc(db, 'calls', this.callId), {
        offer: {
          type: offer.type,
          sdp: offer.sdp
        }
      });

      console.log('Call created with offer:', this.callId);
      
      // Listen for answer
      this.listenForCallUpdates();
      this.listenForICECandidates();

      return callDoc.id;
    } catch (error: any) {
      console.error('Failed to create call:', error);
      throw new Error(`Failed to create call: ${error.message}`);
    }
  }

  // Join an existing call as receiver
  async joinCall(callId: string, callType: 'video' | 'voice'): Promise<void> {
    try {
      console.log('Joining call as receiver:', callId);
      
      // Initialize media first
      await this.initializeMedia(callType);
      
      this.callId = callId;
      this.isInitiator = false;

      // Get call data
      const callRef = doc(db, 'calls', callId);
      const callSnap = await getDocs(query(collection(db, 'calls'), where('__name__', '==', callId)));
      
      if (callSnap.empty) {
        throw new Error('Call not found');
      }

      const callData = { id: callSnap.docs[0].id, ...callSnap.docs[0].data() } as CallData;
      
      if (!callData.offer) {
        throw new Error('No offer found in call');
      }

      // Update call with receiver info
      await updateDoc(callRef, {
        receiverId: this.userId,
        status: 'connecting'
      });

      // Initialize peer connection
      await this.initializePeerConnection();

      // Set remote description (offer)
      await this.peerConnection!.setRemoteDescription(callData.offer);

      // Create answer
      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);

      // Save answer to Firebase
      await updateDoc(callRef, {
        answer: {
          type: answer.type,
          sdp: answer.sdp
        },
        status: 'connecting'
      });

      console.log('Answer created and saved');
      
      // Listen for updates
      this.listenForCallUpdates();
      this.listenForICECandidates();

    } catch (error: any) {
      console.error('Failed to join call:', error);
      throw new Error(`Failed to join call: ${error.message}`);
    }
  }

  // Initialize peer connection
  private async initializePeerConnection(): Promise<void> {
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.peerConnection = new RTCPeerConnection(this.peerConfig);
    
    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event);
      this.remoteStream = event.streams[0];
      this.onRemoteStream?.(this.remoteStream);
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.callId) {
        console.log('New ICE candidate:', event.candidate);
        this.sendICECandidate(event.candidate);
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('Connection state changed:', state);
      
      if (state === 'connected') {
        this.onConnectionEstablished?.();
        this.updateCallStatus('connected');
      } else if (state === 'disconnected' || state === 'failed') {
        this.onCallEnded?.();
      }
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      console.log('ICE connection state changed:', state);
      
      if (state === 'disconnected' || state === 'failed') {
        this.onError?.('Connection lost');
      }
    };

    console.log('Peer connection initialized');
  }

  // Listen for call updates (answer from receiver)
  private listenForCallUpdates(): void {
    if (!this.callId) return;

    const callRef = doc(db, 'calls', this.callId);
    
    this.callUnsubscribe = onSnapshot(callRef, async (docSnap) => {
      if (docSnap.exists()) {
        const callData = { id: docSnap.id, ...docSnap.data() } as CallData;
        
        // If we're the initiator and received an answer
        if (this.isInitiator && callData.answer && this.peerConnection) {
          console.log('Received answer:', callData.answer);
          try {
            await this.peerConnection.setRemoteDescription(callData.answer);
          } catch (error) {
            console.error('Failed to set remote description:', error);
          }
        }
      }
    });
  }

  // Listen for ICE candidates
  private listenForICECandidates(): void {
    if (!this.callId) return;

    const candidatesQuery = query(
      collection(db, 'iceCandidates'),
      where('callId', '==', this.callId),
      where('from', '!=', this.userId),
      orderBy('timestamp', 'asc')
    );

    this.iceCandidatesUnsubscribe = onSnapshot(candidatesQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const candidateData = change.doc.data() as ICECandidateData;
          console.log('Received ICE candidate:', candidateData);
          
          if (this.peerConnection && this.peerConnection.remoteDescription) {
            try {
              await this.peerConnection.addIceCandidate({
                candidate: candidateData.candidate,
                sdpMLineIndex: candidateData.sdpMLineIndex,
                sdpMid: candidateData.sdpMid
              });
              
              // Clean up processed candidate
              await deleteDoc(change.doc.ref);
            } catch (error) {
              console.error('Failed to add ICE candidate:', error);
            }
          }
        }
      });
    });
  }

  // Send ICE candidate through Firebase
  private async sendICECandidate(candidate: RTCIceCandidate): Promise<void> {
    if (!this.callId) return;

    try {
      await addDoc(collection(db, 'iceCandidates'), {
        candidate: candidate.candidate,
        sdpMLineIndex: candidate.sdpMLineIndex,
        sdpMid: candidate.sdpMid,
        callId: this.callId,
        from: this.userId,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Failed to send ICE candidate:', error);
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
      console.log('Ending call');
      
      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          track.stop();
        });
        this.localStream = null;
      }

      // Update call status
      await this.updateCallStatus('ended');

      // Clean up listeners
      if (this.callUnsubscribe) {
        this.callUnsubscribe();
        this.callUnsubscribe = null;
      }

      if (this.iceCandidatesUnsubscribe) {
        this.iceCandidatesUnsubscribe();
        this.iceCandidatesUnsubscribe = null;
      }

      // Clean up call data
      if (this.callId) {
        await this.cleanupCallData(this.callId);
        this.callId = null;
      }

      this.remoteStream = null;
      this.isInitiator = false;
      
      console.log('Call ended successfully');
    } catch (error: any) {
      console.error('Failed to end call:', error);
    }
  }

  // Clean up call-related data
  private async cleanupCallData(callId: string): Promise<void> {
    try {
      // Delete call document
      await deleteDoc(doc(db, 'calls', callId));

      // Delete associated ICE candidates
      const candidatesQuery = query(
        collection(db, 'iceCandidates'),
        where('callId', '==', callId)
      );

      const candidatesSnapshot = await getDocs(candidatesQuery);
      const deletePromises = candidatesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log('Call data cleaned up');
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
      console.log('Audio toggled:', audioTrack.enabled);
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
      console.log('Video toggled:', videoTrack.enabled);
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

  // Get call ID
  getCallId(): string | null {
    return this.callId;
  }

  // Check if is initiator
  getIsInitiator(): boolean {
    return this.isInitiator;
  }

  // Event handlers (to be set by components)
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionEstablished?: () => void;
  onCallEnded?: () => void;
  onError?: (error: string) => void;
}