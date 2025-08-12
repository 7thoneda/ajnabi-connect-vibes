import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gem, Eye, Heart, Unlock, Coins, Sparkles, Star, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface BlurredProfile {
  id: string;
  blurredPhoto: string;
  originalPhoto: string;
  username: string;
  age: number;
  distance: string;
  actionType: "liked" | "viewed";
  timeAgo: string;
  unlockCost: number;
  isUnlocked: boolean;
}

interface BlurredProfilesScreenProps {
  profiles: BlurredProfile[];
  coinBalance: number;
  onBack: () => void;
  onUnlockProfile: (profileId: string, cost: number) => void;
  onBuyCoins: () => void;
}

export function BlurredProfilesScreen({ 
  profiles, 
  coinBalance, 
  onBack, 
  onUnlockProfile, 
  onBuyCoins 
}: BlurredProfilesScreenProps) {
  const [unlockedProfiles, setUnlockedProfiles] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleUnlock = (profile: BlurredProfile) => {
    if (coinBalance < profile.unlockCost) {
      toast({
        title: "Not enough coins",
        description: `You need ${profile.unlockCost} coins to unlock this profile.`,
        variant: "destructive"
      });
      return;
    }

    setUnlockedProfiles(prev => new Set([...prev, profile.id]));
    onUnlockProfile(profile.id, profile.unlockCost);
    
    toast({
      title: "Profile unlocked! 🎉",
      description: `You can now see ${profile.username}'s full profile.`,
    });
  };

  const likedProfiles = profiles.filter(p => p.actionType === "liked");
  const viewedProfiles = profiles.filter(p => p.actionType === "viewed");

  const ProfileCard = ({ profile }: { profile: BlurredProfile }) => {
    const isUnlocked = unlockedProfiles.has(profile.id) || profile.isUnlocked;
    
    return (
      <div className="flex-shrink-0 w-40 sm:w-44 group">
        <Card className="shadow-card rounded-2xl border-0 overflow-hidden h-full transform rotate-1 hover:rotate-0 transition-all duration-500 hover:scale-105 hover:shadow-warm bg-white/90 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="relative">
              <div className="aspect-[3/4] overflow-hidden rounded-t-2xl">
                <img 
                  src={isUnlocked ? profile.originalPhoto : profile.blurredPhoto}
                  alt={isUnlocked ? `${profile.username}'s profile` : "Blurred profile"}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    !isUnlocked ? 'filter blur-md scale-110' : ''
                  }`}
                />
                
                {/* Frosted glass overlay for locked profiles */}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-lg border border-white/40 shadow-lg">
                        <Unlock className="w-6 h-6 animate-pulse" />
                      </div>
                      <p className="text-xs font-medium font-poppins drop-shadow-lg">Tap to Unlock</p>
                    </div>
                  </div>
                )}

                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-white to-gray-50/80">
              {isUnlocked ? (
                <div className="mb-3">
                  <h3 className="font-bold text-sm font-poppins text-gray-800 mb-1">{profile.username}, {profile.age}</h3>
                  <p className="text-xs text-gray-500 font-poppins flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                    {profile.distance} • {profile.timeAgo}
                  </p>
                </div>
              ) : (
                <div className="mb-3">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full mb-2 animate-pulse" />
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-2/3 animate-pulse" />
                </div>
              )}
              
              {!isUnlocked && (
                <Button
                  onClick={() => handleUnlock(profile)}
                  disabled={coinBalance < profile.unlockCost}
                  className="w-full h-10 rounded-xl font-poppins font-semibold text-sm bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 shadow-warm hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <Gem className="w-4 h-4 mr-2 animate-gentle-bounce" />
                  Unlock ({profile.unlockCost})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 safe-area-top safe-area-bottom relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-16 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-gentle-bounce" />
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-8 w-28 h-28 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl animate-gentle-bounce" style={{ animationDelay: '2s' }} />
      </div>

      {/* Gradient Header with smooth fade transition */}
      <div className="relative bg-gradient-primary pt-16 pb-8 px-4 rounded-b-[32px] shadow-warm">
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full w-12 h-12 backdrop-blur-sm border border-white/20 shadow-lg hover:scale-110 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-white animate-float" />
              <h1 className="font-dancing text-3xl font-bold text-white">
                Profile Activity
              </h1>
              <Star className="w-5 h-5 text-white animate-pulse" />
            </div>
            <p className="text-white/90 font-poppins text-sm">Discover who's interested in you</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-full px-4 py-2 flex items-center gap-2 backdrop-blur-md border border-white/30 shadow-lg">
              <Coins className="w-4 h-4 text-white animate-gentle-bounce" />
              <span className="text-white font-bold font-poppins text-sm">{coinBalance}</span>
            </div>
            <Button 
              onClick={onBuyCoins}
              variant="outline"
              size="icon"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 rounded-full w-12 h-12 backdrop-blur-sm shadow-lg hover:scale-110 transition-all duration-300"
            >
              <Gem className="w-4 h-4 animate-float" />
            </Button>
          </div>
        </div>
        
        {/* Smooth fade transition overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-slate-50/20" />
      </div>

      <div className="px-4 -mt-6 pb-24 relative z-10">
        <div className="max-w-lg mx-auto space-y-6">
          {/* 3D Animated Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-warm rounded-2xl border-0 bg-gradient-to-br from-white via-red-50/50 to-pink-50/30 backdrop-blur-sm transform hover:scale-105 hover:rotate-1 transition-all duration-500 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 text-center relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative">
                  <Heart className="w-7 h-7 text-white animate-float" />
                  <div className="absolute inset-0 bg-gradient-to-br from-red-300 to-pink-400 rounded-2xl blur-lg opacity-50 animate-pulse" />
                </div>
                <div className="text-3xl font-bold font-poppins text-gray-800 mb-1 transform group-hover:scale-110 transition-transform duration-300">
                  {likedProfiles.length}
                </div>
                <div className="text-sm text-red-600 font-poppins font-semibold">Liked You</div>
                <div className="text-xs text-gray-500 font-poppins mt-1">❤️ Hearts received</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-warm rounded-2xl border-0 bg-gradient-to-br from-white via-blue-50/50 to-cyan-50/30 backdrop-blur-sm transform hover:scale-105 hover:-rotate-1 transition-all duration-500 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 text-center relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 relative">
                  <Eye className="w-7 h-7 text-white animate-float" style={{ animationDelay: '0.5s' }} />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-2xl blur-lg opacity-50 animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
                <div className="text-3xl font-bold font-poppins text-gray-800 mb-1 transform group-hover:scale-110 transition-transform duration-300">
                  {viewedProfiles.length}
                </div>
                <div className="text-sm text-blue-600 font-poppins font-semibold">Viewed You</div>
                <div className="text-xs text-gray-500 font-poppins mt-1">👀 Profile visits</div>
              </CardContent>
            </Card>
          </div>

          {/* Liked Profiles Section with Horizontal Carousel */}
          {likedProfiles.length > 0 && (
            <div className="space-y-4">
              {/* Sticky Section Header */}
              <div className="sticky top-20 z-20 bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-card border border-white/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-gentle-bounce">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-poppins text-gray-800 flex items-center gap-2">
                      People who liked you
                      <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                    </h2>
                    <p className="text-sm text-gray-600 font-poppins">Swipe to browse all profiles</p>
                  </div>
                </div>
              </div>

              {/* Horizontal Carousel */}
              <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x snap-mandatory">
                  {likedProfiles.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                  
                  {/* Add more cards CTA */}
                  <div className="flex-shrink-0 w-40 sm:w-44">
                    <Card className="h-full shadow-card rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm transform rotate-1 hover:rotate-0 transition-all duration-500 hover:scale-105 cursor-pointer group">
                      <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                        <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Heart className="w-6 h-6 text-white animate-float" />
                        </div>
                        <h3 className="font-bold text-sm font-poppins text-gray-800 mb-2">Get More Likes</h3>
                        <p className="text-xs text-gray-600 font-poppins mb-4">Start matching to get more profile likes</p>
                        <Button 
                          onClick={onBack}
                          size="sm"
                          className="bg-gradient-primary text-white font-poppins rounded-xl shadow-card hover:shadow-warm transform hover:scale-105 transition-all duration-300"
                        >
                          Start Matching
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Scroll indicator */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {likedProfiles.map((_, index) => (
                    <div key={index} className="w-2 h-2 bg-primary/30 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Viewed Profiles Section with Horizontal Carousel */}
          {viewedProfiles.length > 0 && (
            <div className="space-y-4">
              {/* Sticky Section Header */}
              <div className="sticky top-20 z-20 bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-card border border-white/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg animate-gentle-bounce" style={{ animationDelay: '0.5s' }}>
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-poppins text-gray-800 flex items-center gap-2">
                      People who viewed you
                      <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                    </h2>
                    <p className="text-sm text-gray-600 font-poppins">Swipe to see all viewers</p>
                  </div>
                </div>
              </div>

              {/* Horizontal Carousel */}
              <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x snap-mandatory">
                  {viewedProfiles.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                  
                  {/* Add more cards CTA */}
                  <div className="flex-shrink-0 w-40 sm:w-44">
                    <Card className="h-full shadow-card rounded-2xl border-2 border-dashed border-blue-300/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 backdrop-blur-sm transform -rotate-1 hover:rotate-0 transition-all duration-500 hover:scale-105 cursor-pointer group">
                      <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Eye className="w-6 h-6 text-white animate-float" />
                        </div>
                        <h3 className="font-bold text-sm font-poppins text-gray-800 mb-2">Get More Views</h3>
                        <p className="text-xs text-gray-600 font-poppins mb-4">Update your profile to attract more viewers</p>
                        <Button 
                          onClick={onBack}
                          size="sm"
                          className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-poppins rounded-xl shadow-card hover:shadow-warm transform hover:scale-105 transition-all duration-300"
                        >
                          Edit Profile
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Scroll indicator */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {viewedProfiles.map((_, index) => (
                    <div key={index} className="w-2 h-2 bg-blue-400/30 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Empty State */}
          {profiles.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl border-0 shadow-warm transform hover:scale-105 transition-all duration-500 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-purple-500/5" />
              <CardContent className="p-12 text-center relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg backdrop-blur-sm border border-white/40">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center animate-float">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 font-dancing text-gray-800">No activity yet</h3>
                <p className="text-gray-600 font-poppins text-base mb-8 leading-relaxed">
                  When people like or view your profile, they'll appear here with beautiful animations
                </p>
                <div className="space-y-4">
                  <Button 
                    onClick={onBack}
                    variant="gradient"
                    className="font-poppins h-12 px-8 rounded-2xl shadow-warm hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                    Start Matching
                  </Button>
                  <p className="text-xs text-gray-500 font-poppins">
                    💡 Tip: Complete your profile and stay active to get more attention!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Low Coins Warning */}
          {coinBalance < 10 && profiles.some(p => !p.isUnlocked && !unlockedProfiles.has(p.id)) && (
            <Card className="border-2 border-orange-300/50 bg-gradient-to-br from-orange-50 via-yellow-50/80 to-amber-50/60 rounded-3xl shadow-warm backdrop-blur-sm transform hover:scale-105 transition-all duration-500 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-yellow-400/10 animate-pulse" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg animate-gentle-bounce">
                    <Gem className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-orange-800 font-poppins text-lg">Running low on coins?</h4>
                      <Zap className="w-4 h-4 text-orange-600 animate-pulse" />
                    </div>
                    <p className="text-sm text-orange-700 font-poppins mb-4 leading-relaxed">
                      You need more coins to unlock profiles and discover who's interested in you. Don't miss out on potential connections!
                    </p>
                    <Button 
                      onClick={onBuyCoins}
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-poppins h-10 px-6 rounded-2xl shadow-warm hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      <Gem className="w-4 h-4 mr-2 animate-gentle-bounce" />
                      Buy Coins Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Motivational CTA Card */}
          <Card className="bg-gradient-to-br from-purple-50 via-pink-50/80 to-blue-50/60 rounded-3xl border-0 shadow-warm backdrop-blur-sm transform hover:scale-105 transition-all duration-500 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 animate-pulse" />
            <CardContent className="p-8 text-center relative z-10">
              <div className="flex justify-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center animate-float">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '0.3s' }}>
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '0.6s' }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 font-dancing text-gray-800">Keep the momentum going!</h3>
              <p className="text-gray-600 font-poppins text-sm mb-6 leading-relaxed">
                The more you interact, the more people will discover your amazing profile
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={onBack}
                  variant="gradient"
                  className="font-poppins h-10 px-6 rounded-2xl shadow-card hover:shadow-warm transform hover:scale-105 transition-all duration-300"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Start Matching
                </Button>
                <Button 
                  onClick={onBuyCoins}
                  variant="outline"
                  className="font-poppins h-10 px-6 rounded-2xl border-2 border-primary/30 hover:bg-primary/10 transform hover:scale-105 transition-all duration-300"
                >
                  <Gem className="w-4 h-4 mr-2 text-primary" />
                  Get Coins
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}