import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Gift, 
  Gem, 
  Crown, 
  Heart,
  Sparkles,
  X,
  Star
} from "lucide-react";

interface MysteryBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBox: () => void;
  reward?: {
    type: 'coins' | 'profile_unlock' | 'vip_feature';
    amount?: number;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  } | null;
}

const rarityConfig = {
  common: { color: 'from-gray-400 to-gray-500', label: 'Common', glow: 'shadow-gray-400/20' },
  rare: { color: 'from-blue-400 to-blue-500', label: 'Rare', glow: 'shadow-blue-400/30' },
  epic: { color: 'from-purple-400 to-purple-500', label: 'Epic', glow: 'shadow-purple-400/40' },
  legendary: { color: 'from-yellow-400 to-yellow-500', label: 'Legendary', glow: 'shadow-yellow-400/50' }
};

export function MysteryBoxModal({ isOpen, onClose, onOpenBox, reward }: MysteryBoxModalProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    if (reward) {
      setShowReward(true);
      setIsOpening(false);
    }
  }, [reward]);

  const handleOpenBox = () => {
    setIsOpening(true);
    setTimeout(() => {
      onOpenBox();
    }, 2000);
  };

  const handleClose = () => {
    setIsOpening(false);
    setShowReward(false);
    onClose();
  };

  const getRewardIcon = () => {
    if (!reward) return Gift;
    switch (reward.type) {
      case 'coins': return Gem;
      case 'profile_unlock': return Heart;
      case 'vip_feature': return Crown;
      default: return Gift;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-secondary text-white p-6 text-center relative">
          <Button 
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <Gift className="w-16 h-16 mx-auto mb-4 animate-float" />
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Mystery Box
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/90">You found a mystery box!</p>
        </div>

        <div className="p-6 text-center">
          {!showReward ? (
            <div className="space-y-6">
              <div className="relative">
                <div className={`w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl ${
                  isOpening ? 'animate-pulse scale-110' : 'hover:scale-105'
                } transition-all duration-300`}>
                  <Gift className={`w-16 h-16 text-white ${isOpening ? 'animate-spin' : 'animate-float'}`} />
                </div>
                {isOpening && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2 font-poppins">
                  {isOpening ? "Opening..." : "Tap to Open!"}
                </h3>
                <p className="text-muted-foreground font-poppins text-sm">
                  {isOpening 
                    ? "Revealing your surprise..." 
                    : "This box contains coins, profile unlocks, or VIP features!"
                  }
                </p>
              </div>

              {!isOpening && (
                <Button 
                  onClick={handleOpenBox}
                  className="w-full h-12 font-poppins font-semibold text-lg rounded-xl"
                  variant="gradient"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Open Mystery Box
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <div className={`w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br ${
                  rarityConfig[reward.rarity].color
                } flex items-center justify-center shadow-2xl ${
                  rarityConfig[reward.rarity].glow
                } animate-pulse`}>
                  {React.createElement(getRewardIcon(), { 
                    className: "w-16 h-16 text-white animate-bounce" 
                  })}
                </div>
                <div className="absolute -top-2 -right-2">
                  <Badge className={`bg-gradient-to-r ${rarityConfig[reward.rarity].color} text-white border-0`}>
                    {rarityConfig[reward.rarity].label}
                  </Badge>
                </div>
                {/* Sparkle effects */}
                <Star className="absolute -top-4 -left-4 w-6 h-6 text-yellow-400 animate-ping" />
                <Star className="absolute -bottom-2 -right-6 w-4 h-4 text-yellow-400 animate-ping delay-300" />
                <Star className="absolute -top-6 right-2 w-5 h-5 text-yellow-400 animate-ping delay-700" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-2 font-poppins text-primary">
                  Congratulations! 🎉
                </h3>
                <p className="text-lg font-semibold font-poppins mb-1">
                  {reward.description}
                </p>
                {reward.amount && (
                  <p className="text-muted-foreground font-poppins">
                    +{reward.amount} {reward.type === 'coins' ? 'Coins' : 'Items'}
                  </p>
                )}
              </div>

              <Button 
                onClick={handleClose}
                className="w-full h-12 font-poppins font-semibold text-lg rounded-xl"
                variant="gradient"
                size="lg"
              >
                <Heart className="w-5 h-5 mr-2" />
                Awesome!
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}