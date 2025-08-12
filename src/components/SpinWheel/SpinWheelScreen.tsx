import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Gem, Gift, Star, Heart, Zap, Crown, Trophy, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SpinWheelScreenProps {
  onBack: () => void;
  onCoinsEarned: (amount: number) => void;
}

const wheelSections = [
  { id: 1, label: "Better Luck", icon: Heart, color: "from-gray-400 to-gray-500", reward: null },
  { id: 2, label: "50 Coins", icon: Gem, color: "from-yellow-400 to-yellow-500", reward: 50 },
  { id: 3, label: "Try Again", icon: Star, color: "from-blue-400 to-blue-500", reward: null },
  { id: 4, label: "Premium Day", icon: Crown, color: "from-purple-400 to-purple-500", reward: null },
  { id: 5, label: "Next Time", icon: Zap, color: "from-red-400 to-red-500", reward: null },
  { id: 6, label: "100 Coins", icon: Gem, color: "from-green-400 to-green-500", reward: 100 },
  { id: 7, label: "Keep Going", icon: Trophy, color: "from-pink-400 to-pink-500", reward: null },
  { id: 8, label: "Almost!", icon: Sparkles, color: "from-indigo-400 to-indigo-500", reward: null },
  { id: 9, label: "So Close", icon: Gift, color: "from-orange-400 to-orange-500", reward: null },
];

export function SpinWheelScreen({ onBack, onCoinsEarned }: SpinWheelScreenProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(true);
  const [lastSpinDate, setLastSpinDate] = useState<string | null>(null);
  const [timeUntilNextSpin, setTimeUntilNextSpin] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already spun today
    const storedDate = localStorage.getItem('lastSpinDate');
    const today = new Date().toDateString();
    
    if (storedDate === today) {
      setCanSpin(false);
      setLastSpinDate(storedDate);
    }

    // Update countdown timer
    const interval = setInterval(() => {
      if (!canSpin) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeLeft = tomorrow.getTime() - now.getTime();
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        setTimeUntilNextSpin(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        
        if (timeLeft <= 0) {
          setCanSpin(true);
          setLastSpinDate(null);
          localStorage.removeItem('lastSpinDate');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [canSpin]);

  const handleSpin = () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    
    // Generate random rotation (multiple full spins + final position)
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const finalRotation = Math.random() * 360;
    const totalRotation = rotation + (spins * 360) + finalRotation;
    
    setRotation(totalRotation);

    // Calculate which section we landed on
    const normalizedRotation = (360 - (finalRotation % 360)) % 360;
    const sectionAngle = 360 / wheelSections.length;
    const sectionIndex = Math.floor(normalizedRotation / sectionAngle);
    const landedSection = wheelSections[sectionIndex];

    // Show result after animation completes
    setTimeout(() => {
      setIsSpinning(false);
      setCanSpin(false);
      
      const today = new Date().toDateString();
      localStorage.setItem('lastSpinDate', today);
      setLastSpinDate(today);

      if (landedSection.reward) {
        onCoinsEarned(landedSection.reward);
        toast({
          title: "🎉 Congratulations!",
          description: `You won ${landedSection.reward} coins!`,
        });
      } else {
        toast({
          title: landedSection.label,
          description: "Come back tomorrow for another spin!",
        });
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="bg-gradient-primary pt-16 pb-8 px-4 rounded-b-3xl shadow-warm">
        <div className="flex items-center justify-between mb-4">
          <Button 
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-center">
            <h1 className="font-dancing text-4xl font-bold text-white mb-1">
              Daily Spin
            </h1>
            <p className="text-white/90 font-poppins text-sm">Win coins every day!</p>
          </div>
          <div className="w-12" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="px-4 -mt-6 pb-24 space-y-6">
        <div className="max-w-lg mx-auto">
          {/* Spin Wheel */}
          <Card className="shadow-card rounded-2xl border-0 overflow-hidden mb-6">
            <CardContent className="p-8 text-center">
              <div className="relative w-80 h-80 mx-auto mb-6">
                {/* Wheel */}
                <div 
                  className="w-full h-full rounded-full border-8 border-white shadow-2xl relative overflow-hidden transition-transform duration-3000 ease-out"
                  style={{ 
                    transform: `rotate(${rotation}deg)`,
                    background: `conic-gradient(${wheelSections.map((section, index) => {
                      const startAngle = (index * 360) / wheelSections.length;
                      const endAngle = ((index + 1) * 360) / wheelSections.length;
                      return `from ${startAngle}deg to ${endAngle}deg, var(--tw-gradient-stops)`;
                    }).join(', ')})`,
                  }}
                >
                  {wheelSections.map((section, index) => {
                    const angle = (index * 360) / wheelSections.length;
                    const Icon = section.icon;
                    return (
                      <div
                        key={section.id}
                        className="absolute w-full h-full flex items-center justify-center"
                        style={{
                          transform: `rotate(${angle + 20}deg)`,
                          transformOrigin: 'center',
                        }}
                      >
                        <div 
                          className={`absolute top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-br ${section.color} rounded-lg p-3 shadow-lg`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white text-center whitespace-nowrap">
                          {section.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-white shadow-lg"></div>
                </div>
                
                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-primary rounded-full shadow-lg flex items-center justify-center z-10">
                  <Gem className="w-8 h-8 text-white" />
                </div>
              </div>

              {canSpin ? (
                <Button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="w-full h-14 font-poppins font-bold text-lg rounded-xl"
                  variant="gradient"
                  size="lg"
                >
                  {isSpinning ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"></div>
                      Spinning...
                    </>
                  ) : (
                    <>
                      <Gift className="w-6 h-6 mr-3" />
                      Spin Now!
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-center">
                  <Button
                    disabled
                    className="w-full h-14 font-poppins font-bold text-lg rounded-xl mb-4"
                    variant="outline"
                  >
                    <Gift className="w-6 h-6 mr-3" />
                    Already Spun Today
                  </Button>
                  <p className="text-sm text-muted-foreground font-poppins">
                    Next spin available in: <span className="font-mono font-bold">{timeUntilNextSpin}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rewards Info */}
          <Card className="shadow-card rounded-2xl border-0">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 font-poppins text-center">Daily Rewards</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-secondary/10 rounded-xl p-3 text-center">
                  <Gem className="w-6 h-6 text-coin mx-auto mb-2" />
                  <p className="text-sm font-semibold font-poppins">50 Coins</p>
                  <p className="text-xs text-muted-foreground font-poppins">Common</p>
                </div>
                <div className="bg-gradient-premium/10 rounded-xl p-3 text-center">
                  <Gem className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold font-poppins">100 Coins</p>
                  <p className="text-xs text-muted-foreground font-poppins">Rare</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4 font-poppins">
                💡 Spin once per day to win coins and other rewards!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}