import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Flame, 
  Gem, 
  Crown, 
  X,
  CheckCircle,
  Clock
} from "lucide-react";

interface LoginStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  onClaimReward: (day: number, reward: { type: 'coins' | 'premium'; amount?: number }) => void;
  claimedDays: number[];
}

const streakRewards = [
  { day: 1, type: 'coins' as const, amount: 2, icon: Gem, color: 'from-yellow-400 to-yellow-500' },
  { day: 2, type: 'coins' as const, amount: 3, icon: Gem, color: 'from-yellow-400 to-yellow-500' },
  { day: 3, type: 'coins' as const, amount: 5, icon: Gem, color: 'from-green-400 to-green-500' },
  { day: 4, type: 'coins' as const, amount: 7, icon: Gem, color: 'from-blue-400 to-blue-500' },
  { day: 5, type: 'coins' as const, amount: 10, icon: Gem, color: 'from-purple-400 to-purple-500' },
  { day: 6, type: 'coins' as const, amount: 12, icon: Gem, color: 'from-pink-400 to-pink-500' },
  { day: 7, type: 'coins' as const, amount: 15, icon: Gem, color: 'from-orange-400 to-orange-500' },
  { day: 30, type: 'premium' as const, amount: 1, icon: Crown, color: 'from-premium to-primary' },
];

export function LoginStreakModal({ isOpen, onClose, currentStreak, onClaimReward, claimedDays }: LoginStreakModalProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const canClaimDay = (day: number) => {
    return currentStreak >= day && !claimedDays.includes(day);
  };

  const handleClaimReward = (day: number) => {
    const reward = streakRewards.find(r => r.day === day);
    if (reward && canClaimDay(day)) {
      onClaimReward(day, { type: reward.type, amount: reward.amount });
      setSelectedDay(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-primary text-white p-6 text-center relative">
          <Button 
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <Flame className="w-16 h-16 mx-auto mb-4 animate-float" />
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Login Streak
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Calendar className="w-5 h-5" />
            <span className="text-xl font-bold">{currentStreak} Days</span>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {streakRewards.map((reward) => {
              const Icon = reward.icon;
              const isClaimed = claimedDays.includes(reward.day);
              const canClaim = canClaimDay(reward.day);
              const isLocked = currentStreak < reward.day;
              
              return (
                <Card 
                  key={reward.day}
                  className={`cursor-pointer transition-all duration-200 border-2 ${
                    canClaim ? "border-primary shadow-warm hover:scale-105" : 
                    isClaimed ? "border-green-500 bg-green-50" :
                    "border-border opacity-60"
                  }`}
                  onClick={() => canClaim && setSelectedDay(reward.day)}
                >
                  <CardContent className="p-3 text-center">
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r ${reward.color} flex items-center justify-center relative`}>
                      <Icon className="w-6 h-6 text-white" />
                      {isClaimed && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold font-poppins">Day {reward.day}</p>
                    <p className="text-xs text-muted-foreground font-poppins">
                      {reward.type === 'coins' ? `${reward.amount} Coins` : 'Premium Day'}
                    </p>
                    {canClaim && (
                      <Badge variant="default" className="mt-1 text-xs">
                        Claim Now!
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedDay && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold mb-2 font-poppins">Claim Day {selectedDay} Reward?</h4>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleClaimReward(selectedDay)}
                    className="flex-1 font-poppins"
                    variant="gradient"
                  >
                    Claim Reward
                  </Button>
                  <Button 
                    onClick={() => setSelectedDay(null)}
                    variant="outline"
                    className="flex-1 font-poppins"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center text-xs text-muted-foreground font-poppins">
            <p>💡 Login daily to maintain your streak and unlock amazing rewards!</p>
            <p className="mt-1">Next milestone: {currentStreak < 7 ? '7 days' : currentStreak < 30 ? '30 days' : 'Keep going!'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}