import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Crown, Gem, ArrowLeft, Mic, Users, Zap, Heart, Sparkles, Star } from "lucide-react";

interface VoiceCallScreenProps {
  onStartCall: () => void;
  isPremium: boolean;
  hasUnlimitedCalls?: boolean;
  coinBalance: number;
  matchPreference: "anyone" | "men" | "women";
  onChangePreference: (pref: "anyone" | "men" | "women") => void;
  onRequestUpgrade: () => void;
  onBack?: () => void;
  onBuyCoins?: () => void;
  onSpendCoins: (amount: number) => void;
}

export function VoiceCallScreen({
  onStartCall,
  isPremium,
  hasUnlimitedCalls = false,
  coinBalance,
  matchPreference,
  onChangePreference,
  onRequestUpgrade,
  onBack,
  onBuyCoins,
  onSpendCoins,
}: VoiceCallScreenProps) {
  const canMakeCall = isPremium || hasUnlimitedCalls || coinBalance >= 20;

  const handleStartCall = () => {
    if (hasUnlimitedCalls) {
      // User has unlimited calls subscription
      onStartCall();
    } else if (isPremium) {
      // Premium users still need to pay for voice calls unless they have unlimited
      if (coinBalance >= 20) {
        onSpendCoins(20);
        onStartCall();
      } else {
        onBuyCoins?.();
      }
    } else if (coinBalance >= 20) {
      // Free users pay per call
      onSpendCoins(20);
      onStartCall();
    } else {
      // Not enough coins
      onBuyCoins?.();
    }
  };

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
        className={`relative flex-1 h-16 rounded-2xl border-2 transition-all duration-300 group ${
          isActive 
            ? "bg-gradient-primary text-white border-transparent shadow-warm scale-105" 
            : "bg-white text-gray-700 border-gray-200 hover:border-primary/30 hover:bg-primary/5"
        } ${locked ? "opacity-70" : ""}`}
        aria-disabled={locked}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-2">
          <span className="text-2xl">{emoji}</span>
          <span className="font-poppins font-semibold text-sm">{label}</span>
          {locked && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-premium rounded-full flex items-center justify-center shadow-warm">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-24 safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="pt-16 pb-6 px-6">
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
            <button 
              onClick={onBuyCoins}
              className="bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-card hover:shadow-warm transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 rounded-full">
                  <Gem className="w-4 h-4 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="text-orange-600 text-xs font-medium font-poppins">Coins</p>
                  <p className="text-orange-800 text-sm font-bold font-poppins">{coinBalance}</p>
                </div>
              </div>
            </button>
          )}
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-warm">
            <Phone className="w-10 h-10 text-white animate-float" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-dancing">Voice Chat</h1>
          <p className="text-gray-600 font-poppins text-lg">Connect through voice only</p>
        </div>
      </div>

      <div className="px-6 space-y-6 max-w-md mx-auto">
        {/* Access Type Cards */}
        <div className="space-y-3">
          {hasUnlimitedCalls ? (
            <Card className="shadow-card rounded-2xl border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg font-poppins">Unlimited Access</h3>
                    <p className="text-white/90 font-poppins text-sm">24 hours of unlimited voice calls</p>
                  </div>
                  <Badge className="bg-white/20 text-white border-0 font-poppins">Active</Badge>
                </div>
              </CardContent>
            </Card>
          ) : isPremium ? (
            <Card className="shadow-card rounded-2xl border-0 bg-gradient-premium text-white">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg font-poppins">Premium Member</h3>
                    <p className="text-white/90 font-poppins text-sm">Unlimited voice calls included</p>
                  </div>
                  <Badge className="bg-white/20 text-white border-0 font-poppins">Active</Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Pay per Call Option */}
              <Card className="shadow-card rounded-2xl border-0 bg-white/80 backdrop-blur-md">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-100 rounded-2xl">
                        <Gem className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg font-poppins text-gray-800">Pay per Call</h3>
                        <p className="text-gray-600 font-poppins text-sm">20 coins per voice call</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600 font-poppins">20</div>
                      <div className="text-xs text-gray-500 font-poppins">coins</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-poppins">Your balance:</span>
                      <span className="font-bold text-gray-800 font-poppins">{coinBalance} coins</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Premium Option */}
              <Card className="shadow-card rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-premium rounded-2xl shadow-warm">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg font-poppins text-purple-800">Go Premium</h3>
                        <p className="text-purple-600 font-poppins text-sm">Unlimited calls + all features</p>
                      </div>
                    </div>
                    <Button 
                      onClick={onRequestUpgrade} 
                      size="sm"
                      className="bg-gradient-premium text-white font-poppins rounded-xl shadow-warm hover:scale-105 transition-transform"
                    >
                      Upgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Match Preferences */}
        <Card className="shadow-card rounded-2xl border-0 bg-white/80 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg font-poppins text-gray-800">Voice Match Preference</h3>
                <p className="text-gray-600 font-poppins text-sm">
                  {isPremium ? "Choose who you want to talk to" : "Random matching for free users"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <PreferenceButton value="anyone" label="Everyone" emoji="🌟" />
              <PreferenceButton value="men" label="Men" emoji="👨" />
              <PreferenceButton value="women" label="Women" emoji="👩" />
            </div>
            
            {!isPremium && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium font-poppins text-blue-800">Free Random Matching</p>
                    <p className="text-xs text-blue-600 font-poppins">Connect with anyone for authentic conversations</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main CTA Button */}
        <div className="relative">
          <Button 
            onClick={handleStartCall}
            disabled={!canMakeCall}
            className={`w-full h-20 font-poppins font-bold text-xl rounded-3xl shadow-2xl transition-all duration-300 relative overflow-hidden group ${
              canMakeCall 
                ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white hover:scale-105 animate-pulse-warm" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            size="lg"
          >
            {/* Animated background for enabled state */}
            {canMakeCall && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}
            
            <div className="relative flex items-center justify-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold">
                  {hasUnlimitedCalls ? "Start Unlimited Voice" : 
                   isPremium ? "Start Targeted Voice" : 
                   "Start Random Voice Chat"}
                </div>
                <div className="text-sm opacity-90">
                  {!canMakeCall ? "Need 20 coins" : 
                   hasUnlimitedCalls ? "No limits for 24h" :
                   isPremium ? "Choose your match" : 
                   "20 coins per call"}
                </div>
              </div>
            </div>
          </Button>
          
          {/* Glow effect for enabled state */}
          {canMakeCall && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl blur-xl opacity-30 -z-10 animate-pulse" />
          )}
        </div>

        {/* Low Coins Warning */}
        {!isPremium && !hasUnlimitedCalls && coinBalance < 20 && (
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-2xl">
                  <Gem className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-orange-800 font-poppins">Need More Coins</h4>
                  <p className="text-sm text-orange-700 font-poppins">You need 20 coins to start a voice call</p>
                </div>
                <Button 
                  onClick={onBuyCoins}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-poppins rounded-xl shadow-warm"
                >
                  Buy Coins
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
  );
}