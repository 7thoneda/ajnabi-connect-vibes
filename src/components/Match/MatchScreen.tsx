import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Crown, Zap, Heart, ArrowLeft, Gem } from "lucide-react";

interface MatchScreenProps {
  onStartMatch: () => void;
  isPremium: boolean;
  matchPreference: "anyone" | "men" | "women";
  onChangePreference: (pref: "anyone" | "men" | "women") => void;
  onRequestUpgrade: () => void;
  onBack?: () => void;
  onBuyCoins?: () => void;
}

export function MatchScreen({
  onStartMatch,
  isPremium,
  matchPreference,
  onChangePreference,
  onRequestUpgrade,
  onBack,
  onBuyCoins,
}: MatchScreenProps) {
  const PreferenceButton = ({
    value,
    label,
    emoji,
  }: { value: "anyone" | "men" | "women"; label: string; emoji: string }) => {
    const locked = !isPremium && value !== "anyone";
    const isActive = matchPreference === value;
    return (
      <button
        onClick={() => (locked ? onRequestUpgrade() : onChangePreference(value))}
        className={`relative flex-1 h-20 rounded-3xl border-2 transition-all duration-300 overflow-hidden group
           ${isActive 
             ? "bg-white text-gray-800 border-gray-200 shadow-lg scale-105 shadow-gray-200/50" 
             : "bg-white/60 text-gray-600 border-gray-100 hover:bg-white hover:shadow-md"
           }
           ${locked ? "opacity-60" : ""}`}
        aria-disabled={locked}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-2">
          <span className="text-2xl">{emoji}</span>
          <span className="font-poppins font-semibold text-sm">{label}</span>
          {locked && (
            <div className="absolute top-2 right-2">
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
          )}
        </div>
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-3xl" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-24 safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="pt-16 pb-8 px-6">
        <div className="flex items-center justify-between mb-8">
          {onBack && (
            <Button 
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:bg-white/80 rounded-full w-12 h-12 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1" />
          {onBuyCoins && (
            <Button 
              onClick={onBuyCoins}
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:bg-white/80 rounded-full w-12 h-12 shadow-sm"
            >
              <Gem className="w-5 h-5" />
            </Button>
          )}
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-3 font-dancing">Find Your Match</h1>
          <p className="text-gray-600 font-poppins text-lg">Connect with amazing people nearby</p>
        </div>
      </div>

      <div className="px-6 space-y-8 max-w-md mx-auto">
        {/* Premium Feature Pill */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-0.5 shadow-lg">
            <div className="bg-white rounded-full px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold font-poppins text-gray-800">Premium Feature</p>
                    <p className="text-xs text-gray-600 font-poppins">Choose your preferred gender</p>
                  </div>
                </div>
                <Button 
                  onClick={onRequestUpgrade} 
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-poppins rounded-full px-4 h-8 shadow-lg"
                >
                  Upgrade
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Match Preferences */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 font-poppins mb-2">
              {isPremium ? "Who do you want to meet?" : "Random Matching"}
            </h3>
            <p className="text-gray-500 font-poppins text-sm">
              {isPremium ? "Choose your preference" : "Meet diverse people from all backgrounds"}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <PreferenceButton value="anyone" label="Everyone" emoji="🌟" />
            <PreferenceButton value="men" label="Men" emoji="👨" />
            <PreferenceButton value="women" label="Women" emoji="👩" />
          </div>
        </div>

        {/* Main CTA Button */}
        <div className="text-center space-y-6">
          <div className="relative">
            <Button 
              onClick={onStartMatch}
              className="w-full h-20 font-poppins font-bold text-xl rounded-3xl bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:from-red-600 hover:via-pink-600 hover:to-orange-600 text-white border-0 shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 animate-pulse-warm relative overflow-hidden group"
              size="lg"
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-pink-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative flex items-center justify-center space-x-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold">Start Matching</div>
                  <div className="text-sm opacity-90">Find your perfect match</div>
                </div>
              </div>
            </Button>
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 rounded-3xl blur-xl opacity-30 -z-10 animate-pulse" />
          </div>
          
          {/* Secondary indicators */}
          <div className="flex items-center justify-center gap-6 text-gray-500">
            <div className="flex items-center gap-2">
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-2">
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 font-poppins text-center">How it works</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-4 bg-white/60 rounded-2xl p-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold font-poppins">
                1
              </div>
              <div>
                <p className="font-medium font-poppins text-gray-800">Tap Start Matching</p>
                <p className="text-sm text-gray-600 font-poppins">We'll find someone perfect for you</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/60 rounded-2xl p-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold font-poppins">
                2
              </div>
              <div>
                <p className="font-medium font-poppins text-gray-800">Video Chat</p>
                <p className="text-sm text-gray-600 font-poppins">Have a face-to-face conversation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/60 rounded-2xl p-4">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold font-poppins">
                3
              </div>
              <div>
                <p className="font-medium font-poppins text-gray-800">Make Friends</p>
                <p className="text-sm text-gray-600 font-poppins">Connect and continue chatting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}