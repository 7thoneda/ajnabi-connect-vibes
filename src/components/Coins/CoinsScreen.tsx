import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gem, Flame, Gift, Star, Trophy, Zap, Crown, Calendar, Clock, TrendingUp } from "lucide-react";
import { Treasure } from "@/components/ui/icons";

interface LoginStreakData {
  currentStreak: number;
  lastLoginDate: string;
  claimedDays: number[];
  totalLogins: number;
}

interface CoinsScreenProps {
  coinBalance: number;
  streakData: LoginStreakData;
  hasUnlimitedCalls?: boolean;
  unlimitedCallsExpiry?: Date | null;
  autoRenewEnabled?: boolean;
  onBuyCoins: () => void;
  onOpenStreakModal: () => void;
  onOpenSpinWheel: () => void;
  onManageSubscription?: () => void;
}

export function CoinsScreen({ 
  coinBalance, 
  streakData, 
  hasUnlimitedCalls = false,
  unlimitedCallsExpiry,
  autoRenewEnabled = false,
  onBuyCoins, 
  onOpenStreakModal, 
  onOpenSpinWheel,
  onManageSubscription
}: CoinsScreenProps) {
  const getStreakReward = () => {
    if (streakData.currentStreak >= 30) return { coins: 100, type: "legendary" };
    if (streakData.currentStreak >= 7) return { coins: 50, type: "epic" };
    if (streakData.currentStreak >= 3) return { coins: 20, type: "rare" };
    return { coins: 5, type: "common" };
  };

  const streakReward = getStreakReward();

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* Header with gradient background */}
      <div className="relative bg-gradient-secondary pt-16 pb-8 px-4 rounded-b-3xl shadow-warm">
        <div className="text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gem className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-float" />
          </div>
          <h1 className="font-dancing text-4xl sm:text-5xl font-bold text-white mb-2">
            Your Treasure
          </h1>
          <p className="text-white/90 font-poppins text-sm sm:text-base">Coins, rewards & daily bonuses</p>
        </div>
      </div>

      <main className="pb-24 px-4 -mt-6 safe-area-bottom">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Unlimited Calls Subscription Status */}
          {hasUnlimitedCalls && unlimitedCallsExpiry && (
            <Card className="shadow-card rounded-2xl border-0 overflow-hidden border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold font-poppins">Unlimited Calls</h3>
                      <p className="text-sm text-muted-foreground font-poppins">
                        Active until {unlimitedCallsExpiry.toLocaleDateString()} at {unlimitedCallsExpiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-white font-poppins">Active</Badge>
                </div>
                
                {autoRenewEnabled && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-green-800 font-poppins">Auto-renew enabled</p>
                    </div>
                    <p className="text-xs text-green-600 font-poppins mt-1">
                      Will automatically renew for ₹19 every 24 hours
                    </p>
                  </div>
                )}
                
                {onManageSubscription && (
                  <Button 
                    onClick={onManageSubscription}
                    variant="outline"
                    className="w-full h-10 font-poppins rounded-xl"
                  >
                    Manage Subscription
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Coin Balance Card */}
          <Card className="shadow-card rounded-2xl border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-primary text-white p-6 text-center">
                <Gem className="w-16 h-16 mx-auto mb-4 animate-pulse-warm" />
                <p className="text-5xl font-bold font-poppins mb-2">{coinBalance}</p>
                <p className="text-white/90 font-poppins text-lg">Available Coins</p>
              </div>
              <div className="p-6">
                <Button 
                  onClick={onBuyCoins}
                  className="w-full h-14 font-poppins font-semibold text-lg rounded-xl"
                  variant="gradient"
                >
                  <Gem className="w-6 h-6 mr-3" />
                  Buy More Coins
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Login Streak Card */}
          <Card className="shadow-card rounded-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-primary text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-full">
                    <Flame className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white font-dancing">
                      Login Streak
                    </CardTitle>
                    <p className="text-white/90 font-poppins">Keep the fire burning!</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white font-poppins">{streakData.currentStreak}</div>
                  <div className="text-white/80 text-sm font-poppins">Days</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Streak Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl text-center">
                  <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-orange-800 font-poppins">{streakData.totalLogins}</p>
                  <p className="text-xs text-orange-600 font-poppins">Total Logins</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl text-center">
                  <Trophy className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-green-800 font-poppins">{streakData.claimedDays.length}</p>
                  <p className="text-xs text-green-600 font-poppins">Rewards Claimed</p>
                </div>
              </div>

              {/* Next Reward Preview */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      streakReward.type === "legendary" ? "bg-gradient-premium" :
                      streakReward.type === "epic" ? "bg-gradient-secondary" :
                      streakReward.type === "rare" ? "bg-gradient-primary" :
                      "bg-gray-400"
                    }`}>
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-800 font-poppins">Next Milestone</p>
                      <p className="text-sm text-purple-600 font-poppins">
                        {streakData.currentStreak < 3 ? "3 days" : 
                         streakData.currentStreak < 7 ? "7 days" : 
                         streakData.currentStreak < 30 ? "30 days" : "Keep going!"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Gem className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-purple-800 font-poppins">{streakReward.coins}</span>
                    </div>
                    <Badge className={`text-xs ${
                      streakReward.type === "legendary" ? "bg-gradient-premium" :
                      streakReward.type === "epic" ? "bg-gradient-secondary" :
                      streakReward.type === "rare" ? "bg-gradient-primary" :
                      "bg-gray-400"
                    } text-white border-0`}>
                      {streakReward.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button 
                onClick={onOpenStreakModal}
                className="w-full h-12 font-poppins font-semibold rounded-xl"
                variant="gradient"
              >
                <Flame className="w-5 h-5 mr-2" />
                View All Streak Rewards
              </Button>
            </CardContent>
          </Card>

          {/* Daily Spin Wheel Card */}
          <Card className="shadow-card rounded-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-premium text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-full">
                    <Treasure className="w-8 h-8 text-white animate-float" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white font-dancing">
                      Daily Spin
                    </CardTitle>
                    <p className="text-white/90 font-poppins">Win coins every day!</p>
                  </div>
                </div>
                <Gift className="w-10 h-10 text-white animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                  <div className="text-center">
                    <div className="flex justify-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Gem className="w-4 h-4 text-white" />
                      </div>
                      <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                        <Gem className="w-4 h-4 text-white" />
                      </div>
                      <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="font-semibold text-yellow-800 font-poppins">Possible Rewards</p>
                    <p className="text-sm text-yellow-600 font-poppins">50-100 coins or premium features</p>
                  </div>
                </div>

                <Button 
                  onClick={onOpenSpinWheel}
                  className="w-full h-12 font-poppins font-semibold rounded-xl"
                  variant="gradient"
                >
                  <Treasure className="w-5 h-5 mr-2" />
                  Spin Daily Wheel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Earning Tips Card */}
          <Card className="shadow-card rounded-2xl border-0 border-l-4 border-l-primary">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4 font-poppins flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-primary" />
                Ways to Earn Coins
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium font-poppins text-sm">Daily Login</p>
                      <p className="text-xs text-muted-foreground font-poppins">Keep your streak alive</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-poppins">5-100 coins</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-secondary/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Treasure className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="font-medium font-poppins text-sm">Daily Spin</p>
                      <p className="text-xs text-muted-foreground font-poppins">Try your luck once per day</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-poppins">50-100 coins</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium font-poppins text-sm">Mystery Boxes</p>
                      <p className="text-xs text-muted-foreground font-poppins">Random rewards after chats</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-poppins">5-100 coins</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium font-poppins text-sm">Watch Ads</p>
                      <p className="text-xs text-muted-foreground font-poppins">Earn coins by watching ads</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-poppins">50 coins</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-card rounded-2xl border-0 bg-gradient-primary text-white cursor-pointer hover:scale-105 transition-transform" onClick={onOpenStreakModal}>
              <CardContent className="p-4 text-center">
                <Flame className="w-8 h-8 mx-auto mb-2 animate-float" />
                <div className="text-xl font-bold font-poppins">{streakData.currentStreak}</div>
                <div className="text-sm opacity-90 font-poppins">Day Streak</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-card rounded-2xl border-0 bg-gradient-premium text-white cursor-pointer hover:scale-105 transition-transform" onClick={onOpenSpinWheel}>
              <CardContent className="p-4 text-center">
                <Treasure className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <div className="text-xl font-bold font-poppins">Spin</div>
                <div className="text-sm opacity-90 font-poppins">Daily Wheel</div>
              </CardContent>
            </Card>
          </div>

          {/* Coin Usage Tips */}
          <Card className="shadow-card rounded-2xl border-0">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4 font-poppins flex items-center gap-2 text-lg">
                <Star className="w-5 h-5 text-primary" />
                How to Use Coins
              </h4>
              <div className="space-y-3 text-sm text-muted-foreground font-poppins">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <p>Unlock blurred profiles to see who liked you</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <p>Send special reactions during video calls</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <p>Make voice calls (20 coins per call or ₹19/day unlimited)</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <p>Access premium features temporarily</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}