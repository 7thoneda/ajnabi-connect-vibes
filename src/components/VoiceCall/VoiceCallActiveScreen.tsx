import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReactionButton } from "../VideoChat/ReactionButton";
import { ReactionEffect } from "../VideoChat/ReactionEffect";
import { useToast } from "@/hooks/use-toast";
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  RotateCcw,
  Flag,
  Heart,
  ArrowLeft,
  Volume2,
  VolumeX,
  Clock,
  Sparkles
} from "lucide-react";

interface VoiceCallActiveScreenProps {
  onEndCall: () => void;
  onReconnect: () => void;
  onReport: () => void;
  onBlock: () => void;
  onBack?: () => void;
  coinBalance?: number;
  onSpendCoins?: (amount: number) => void;
}

export function VoiceCallActiveScreen({ 
  onEndCall, 
  onReconnect, 
  onReport, 
  onBlock, 
  onBack,
  coinBalance = 100,
  onSpendCoins
}: VoiceCallActiveScreenProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [userWantsToContinue, setUserWantsToContinue] = useState<boolean | null>(null);
  const [partnerWantsToContinue, setPartnerWantsToContinue] = useState<boolean | null>(null);
  const [waitingForPartner, setWaitingForPartner] = useState(false);
  const [activeReactions, setActiveReactions] = useState<Array<{ id: string; reaction: string }>>([]);
  const [showReactions, setShowReactions] = useState(false);
  const { toast } = useToast();

  const reactions = [
    { emoji: "🎵", label: "Music", cost: 1 },
    { emoji: "👏", label: "Clap", cost: 1 },
    { emoji: "💖", label: "Heart", cost: 1 },
    { emoji: "😂", label: "Laugh", cost: 1 },
    { emoji: "🔥", label: "Fire", cost: 2 },
    { emoji: "✨", label: "Sparkle", cost: 2 },
  ];
  useEffect(() => {
    // Simulate connection
    const timer = setTimeout(() => setIsConnected(true), 2000);
    return () => clearTimeout(timer);
  }, []);

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
  }, [isConnected]);

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

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-50 safe-area-top safe-area-bottom">
        {/* Reaction Effects */}
        {activeReactions.map(({ id, reaction }) => (
          <ReactionEffect
            key={id}
            id={id}
            reaction={reaction}
            onComplete={handleReactionComplete}
          />
        ))}
        
        {/* Voice Call Interface */}
        <div className="relative h-full flex flex-col">
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

          {/* Reaction Panel */}
          {isConnected && (
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

          {/* Main Content Area */}
          <div className="flex-1 flex items-center justify-center p-4">
            {!isConnected ? (
              <div className="text-center text-white">
                <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-3 sm:mb-4"></div>
                <p className="font-poppins text-sm sm:text-base">Connecting to voice chat...</p>
              </div>
            ) : (
              <div className="text-center text-white">
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-white/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto backdrop-blur-sm">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse-warm">
                    <Heart className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white animate-float" />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 font-dancing">Voice Chat Active</h2>
                <p className="text-white/80 font-poppins text-sm sm:text-base">Connected with someone new</p>
                
                {/* Audio Visualization */}
                <div className="flex items-center justify-center gap-1 mt-4 sm:mt-6">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-white/60 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.8s'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Controls - Responsive sizing and spacing */}
          <div className="absolute bottom-8 sm:bottom-10 md:bottom-12 left-0 right-0 px-4 sm:px-6">
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 md:space-x-6">
              <Button
                onClick={() => setIsMuted(!isMuted)}
                variant={isMuted ? "destructive" : "outline"}
                size="icon"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {isMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
              </Button>

              <Button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                variant={isSpeakerOn ? "default" : "outline"}
                size="icon"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {isSpeakerOn ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
              </Button>

              <Button
                onClick={onEndCall}
                variant="destructive"
                size="icon"
                className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full animate-pulse-warm shadow-warm"
              >
                <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </Button>

              <Button
                onClick={onReport}
                variant="outline"
                size="icon"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Flag className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </Button>

              <Button
                onClick={onReconnect}
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
            <p className="text-white/90 font-poppins">Would you like to continue this voice conversation?</p>
          </div>

          <div className="p-6">
            {userWantsToContinue === null ? (
              <div className="space-y-4">
                <p className="text-center text-foreground font-poppins mb-6">
                  Choose if you want to continue talking with this person
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