import { useState, useEffect } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReactionButton } from "./ReactionButton";
import { ReactionEffect } from "./ReactionEffect";
import { useToast } from "@/hooks/use-toast";
import { WebRTCService } from "@/services/webrtcService";
import { callMatchingService } from "@/services/callMatchingService";
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  RotateCcw,
  Flag,
  Heart,
  ArrowLeft,
  Clock,
  Sparkles,
  Loader2
} from "lucide-react";

interface VideoCallScreenProps {
  onEndCall: () => void;
  onReconnect: () => void;
  onReport: () => void;
  onBlock: () => void;
  onBack?: () => void;
  coinBalance?: number;
  onSpendCoins?: (amount: number) => void;
  userProfile?: {
    username: string;
    gender: 'male' | 'female' | 'other';
    matchPreference: 'anyone' | 'men' | 'women';
  };
  isPremium?: boolean;
}

export function VideoCallScreen({ 
  onEndCall, 
  onReconnect, 
  onReport, 
  onBlock, 
  onBack,
  coinBalance = 100,
  onSpendCoins,
  userProfile,
  isPremium = false
}: VideoCallScreenProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'searching' | 'connecting' | 'connected' | 'failed'>('searching');
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [userWantsToContinue, setUserWantsToContinue] = useState<boolean | null>(null);
  const [partnerWantsToContinue, setPartnerWantsToContinue] = useState<boolean | null>(null);
  const [waitingForPartner, setWaitingForPartner] = useState(false);
  const [activeReactions, setActiveReactions] = useState<Array<{ id: string; reaction: string }>>([]);
  const [showReactions, setShowReactions] = useState(false);
  const [webrtcService, setWebrtcService] = useState<WebRTCService | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<{ username: string; gender: string } | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const reactions = [
    { emoji: "🎆", label: "Fireworks", cost: 3 },
    { emoji: "💋", label: "Kiss", cost: 2 },
    { emoji: "💖", label: "Heart", cost: 1 },
    { emoji: "👏", label: "Clap", cost: 1 },
    { emoji: "😍", label: "Love", cost: 2 },
    { emoji: "🔥", label: "Fire", cost: 2 },
  ];
  
  // Initialize WebRTC service and start matching
  useEffect(() => {
    if (!userProfile) return;

    const initializeCall = async () => {
      try {
        setConnectionStatus('searching');
        
        // Create WebRTC service instance
        const service = new WebRTCService(`user-${Date.now()}`);
        setWebrtcService(service);

        // Set up event handlers
        service.onRemoteStream = (stream: MediaStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        };

        service.onConnectionEstablished = () => {
          setConnectionStatus('connected');
          toast({
            title: "Connected! 🎉",
            description: "You're now connected with your match.",
          });
        };
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => {
          const newDuration = prev + 1;
          
          // Show continuation dialog at 7 minutes (420 seconds)
          if (newDuration === 420) {
            setShowContinueDialog(true);
          }
          
          return newDuration;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [connectionStatus]);

  useEffect(() => {
    // Simulate partner's response after user makes their choice
    if (userWantsToContinue !== null && partnerWantsToContinue === null) {
      setWaitingForPartner(true);
      // Simulate partner response after 2-5 seconds
      const timeout = setTimeout(() => {
        const partnerResponse = Math.random() > 0.3; // 70% chance partner wants to continue
        setPartnerWantsToContinue(partnerResponse);
        setWaitingForPartner(false);
        
        if (!userWantsToContinue || !partnerResponse) {
          // If either user doesn't want to continue, end the call
          setTimeout(() => {
            onEndCall();
          }, 1500);
        } else {
          // Both want to continue, close dialog and continue call
          setShowContinueDialog(false);
          setUserWantsToContinue(null);
          setPartnerWantsToContinue(null);
        }
      }, 2000 + Math.random() * 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [userWantsToContinue, partnerWantsToContinue, onEndCall]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (callDuration >= 420) return "text-red-400"; // After 7 minutes
    if (callDuration >= 360) return "text-yellow-400"; // Last minute warning
    return "text-white";
  };

  const handleContinueChoice = (wantsToContinue: boolean) => {
    setUserWantsToContinue(wantsToContinue);
  };

  const handleReaction = (reaction: string, cost: number) => {
    if (coinBalance < cost) {
      toast({
        title: "Not enough coins",
        description: `You need ${cost} coins to send this reaction.`,
        variant: "destructive"
      });
      return;
    }

    // Spend coins
    onSpendCoins?.(cost);
    
    // Add reaction effect
    const reactionId = Date.now().toString();
    setActiveReactions(prev => [...prev, { id: reactionId, reaction }]);
    
    // Show success toast
    toast({
      title: "Reaction sent! ✨",
      description: `${reaction} sent for ${cost} coins`,
    });
  };

  const handleReactionComplete = (reactionId: string) => {
    setActiveReactions(prev => prev.filter(r => r.id !== reactionId));
  };

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'searching':
        return 'Finding your perfect match...';
      case 'connecting':
        return 'Connecting to your match...';
      case 'connected':
        return partnerInfo?.username || 'Anonymous User';
      case 'failed':
        return 'Connection failed';
      default:
        return 'Connecting...';
    }
  };
  return (
    <>
      <div className="fixed inset-0 bg-black z-50 safe-area-top safe-area-bottom">
        {/* Reaction Effects */}
        {activeReactions.map(({ id, reaction }) => (
          <ReactionEffect
            key={id}
            id={id}
            reaction={reaction}
            onComplete={handleReactionComplete}
          />
        ))}
        
        {/* Video Areas */}
        <div className="relative h-full flex flex-col">
          {/* Remote Video */}
          <div className="flex-1 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4">
            {connectionStatus !== 'connected' ? (
              <div className="text-center text-white">
                <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-3 sm:mb-4"></div>
                <p className="font-poppins text-sm sm:text-base">{getStatusMessage()}</p>
                {connectionStatus === 'searching' && (
                  <p className="font-poppins text-xs text-white/70 mt-2">
                    {isPremium ? 'Finding targeted matches...' : 'Random matching in progress...'}
                  </p>
                )}
              </div>
            ) : (
              <div className="w-full h-full relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Fallback when no remote stream */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-white/20 rounded-full flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                      <Heart className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white animate-float" />
                    </div>
                    <p className="text-base sm:text-lg md:text-xl font-semibold font-poppins">{getStatusMessage()}</p>
                    <p className="text-white/80 font-poppins text-sm sm:text-base">Connected via WebRTC</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reaction Panel */}
          {connectionStatus === 'connected' && (
            <div className="absolute top-20 sm:top-24 md:top-28 right-3 sm:right-4 md:right-6">
              <div className="flex flex-col items-end gap-2">
                <Button
                  onClick={() => setShowReactions(!showReactions)}
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 rounded-full bg-black/50 border-white/30 text-white hover:bg-black/70"
                >
                  <Sparkles className="w-5 h-5" />
                </Button>
                
                {showReactions && (
                  <div className="flex flex-col gap-2 animate-slide-up">
                    {reactions.map((reaction) => (
                      <ReactionButton
                        key={reaction.emoji}
                        emoji={reaction.emoji}
                        label={reaction.label}
                        cost={reaction.cost}
                        coinBalance={coinBalance}
                        onReact={handleReaction}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Local Video - Responsive positioning and sizing */}
          <div className="absolute top-4 sm:top-6 md:top-8 right-3 sm:right-4 md:right-6 w-20 h-24 sm:w-24 sm:h-32 md:w-28 md:h-36 bg-gray-800 rounded-lg sm:rounded-xl overflow-hidden border-2 border-white/30">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Fallback when camera is off */}
            {isCameraOff && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center">
                <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            )}
          </div>

          {/* Call Duration and Back Button */}
          <div className="absolute top-4 sm:top-6 md:top-8 left-3 sm:left-4 md:left-6 flex items-center gap-2 sm:gap-3">
            {onBack && (
              <Button
                onClick={onBack}
                variant="outline"
                size="icon"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 border-white/30 text-white hover:bg-black/70"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
            <Card className="bg-black/50 border-white/20 rounded-lg sm:rounded-xl border-0">
              <div className="px-2 sm:px-3 py-1 sm:py-2 flex items-center gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <p className={`font-mono text-sm sm:text-base md:text-lg font-poppins ${getTimeColor()}`}>
                  {formatTime(callDuration)}
                </p>
              </div>
            </Card>
          </div>

          {/* Controls - Responsive sizing and spacing */}
          <div className="absolute bottom-8 sm:bottom-10 md:bottom-12 left-0 right-0 px-4 sm:px-6">
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 md:space-x-6">
              <Button
                onClick={handleToggleAudio}
                variant={isMuted ? "destructive" : "outline"}
                size="icon"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {isMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
              </Button>

              <Button
                onClick={handleToggleVideo}
                variant={isCameraOff ? "destructive" : "outline"}
                size="icon"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {isCameraOff ? <CameraOff className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" /> : <Camera className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
              </Button>

              <Button
                onClick={handleCallEnd}
                variant="destructive"
                size="icon"
                className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full animate-pulse-warm shadow-warm"
              >
                <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </Button>

              <Button
                onClick={() => {
                  onReport();
                  toast({
                    title: "Report submitted",
                    description: "Thank you for keeping our community safe.",
                  });
                }}
                variant="outline"
                size="icon"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Flag className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </Button>

              <Button
                onClick={() => {
                  // Restart the matching process
                  window.location.reload();
                }}
                variant="outline"
                size="icon"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Call Dialog */}
      <Dialog open={showContinueDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-md p-0 overflow-hidden" hideCloseButton>
          <div className="bg-gradient-primary text-white p-6 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 animate-float" />
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                7 Minutes Complete!
              </DialogTitle>
            </DialogHeader>
            <p className="text-white/90 font-poppins">Would you like to continue this conversation?</p>
          </div>

          <div className="p-6">
            {userWantsToContinue === null ? (
              <div className="space-y-4">
                <p className="text-center text-foreground font-poppins mb-6">
                  Choose if you want to continue chatting with this person
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleContinueChoice(false)}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl font-poppins"
                  >
                    End Call
                  </Button>
                  <Button
                    onClick={() => handleContinueChoice(true)}
                    variant="gradient"
                    className="flex-1 h-12 rounded-xl font-poppins"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ) : waitingForPartner ? (
              <div className="text-center space-y-4">
                <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full mx-auto"></div>
                <p className="text-foreground font-poppins">
                  {userWantsToContinue 
                    ? "Waiting for the other person to decide..." 
                    : "Ending call..."
                  }
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                {userWantsToContinue && partnerWantsToContinue ? (
                  <>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Heart className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-foreground font-poppins font-semibold">
                      Great! Both of you want to continue. Enjoy your conversation! 💕
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <PhoneOff className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-foreground font-poppins">
                      {!userWantsToContinue 
                        ? "You chose to end the call. Redirecting to profile view..."
                        : "The other person chose to end the call. Redirecting to profile view..."
                      }
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}