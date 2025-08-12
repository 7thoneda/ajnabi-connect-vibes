import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Users, Heart, Crown, Filter, Gem, Phone, Flame, Gift, Globe, Star, Sparkles, TrendingUp, Shield, Zap, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HomeScreenProps {
  onStartMatch: () => void;
  onBuyCoins: () => void;
  onUpgradePremium: () => void;
  onOpenSpinWheel: () => void;
  matchPreference: "anyone" | "men" | "women";
  onChangePreference: (pref: "anyone" | "men" | "women") => void;
  isPremium: boolean;
  hasUnlimitedCalls?: boolean;
  onRequestUpgrade: () => void;
}

export default function HomeScreen({
  onStartMatch,
  onBuyCoins,
  onUpgradePremium,
  onOpenSpinWheel,
  matchPreference,
  onChangePreference,
  isPremium,
  hasUnlimitedCalls = false,
  onRequestUpgrade,
}: HomeScreenProps) {
  const [coinBalance] = useState(100);
  const [liveUserCount] = useState(1247832);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    { name: "Rahul", text: "Made an amazing friend from Mumbai!", rating: 5, time: "2 hours ago" },
    { name: "Priya", text: "Found someone who shares my love for books!", rating: 5, time: "1 hour ago" },
    { name: "Arjun", text: "Great conversations and genuine connections!", rating: 5, time: "30 minutes ago" }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

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
        className={`relative flex-1 h-20 rounded-3xl border-2 transition-all duration-300 group ${
          isActive 
            ? "bg-gradient-primary text-white border-transparent shadow-warm scale-105" 
            : "bg-white text-gray-700 border-gray-200 hover:border-primary/30 hover:bg-primary/5 hover:scale-102"
        } ${locked ? "opacity-70" : ""}`}
        aria-disabled={locked}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-2">
          <span className="text-3xl">{emoji}</span>
          <span className="font-poppins font-semibold text-sm">{label}</span>
          {locked && (
            <Crown className="w-4 h-4 text-premium absolute top-2 right-2" />
          )}
        </div>
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-3xl" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/20 to-pink-50/20 pb-20 safe-area-top safe-area-bottom">
      {/* Header Section - Centered */}
      <div className="pt-16 pb-8 px-6 text-center">
        {/* App Logo & Branding */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-warm">
            <Video className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 font-dancing">AjnabiCam</h1>
          <p className="text-gray-600 font-poppins text-lg font-medium">Meet. Chat. Connect.</p>
        </div>

        {/* Global Stats */}
        <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mb-8">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="font-poppins font-medium">190+ Countries</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="font-poppins font-medium">1Cr+ Users</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span className="font-poppins font-medium">4.8★ Rating</span>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 max-w-md mx-auto">
        {/* Trending Now Pill */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-full px-6 py-3 shadow-warm animate-pulse-warm">
            <div className="flex items-center gap-2 text-white">
              <TrendingUp className="w-4 h-4" />
              <span className="font-poppins font-semibold text-sm">🔥 Peak hours - More matches!</span>
            </div>
          </div>
        </div>

      

        {/* Match Preferences */}
        <Card className="shadow-card rounded-3xl border-0 bg-white/90 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="font-poppins text-lg font-bold text-gray-800">Match Preference</h3>
              </div>
              <p className="text-gray-600 font-poppins text-sm">
                {isPremium ? "Choose who you want to meet" : "Upgrade to filter by gender"}
              </p>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <PreferenceButton value="anyone" label="Everyone" emoji="🌟" />
              <PreferenceButton value="men" label="Men" emoji="👨" />
              <PreferenceButton value="women" label="Women" emoji="👩" />
            </div>
            
            {!isPremium && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-gradient-premium rounded-xl">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold font-poppins text-purple-800">Unlock Gender Filters</p>
                      <p className="text-xs text-purple-600 font-poppins">Choose exactly who you want to meet</p>
                    </div>
                  </div>
                  <Button 
                    onClick={onRequestUpgrade} 
                    size="sm"
                    className="bg-gradient-premium text-white font-poppins rounded-xl shadow-warm hover:scale-105 transition-transform flex-shrink-0"
                  >
                    Upgrade
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

         {/* Main Action Buttons */}
        <div className="space-y-4">
          {/* Primary CTA - Start Matching */}
          <div className="relative">
            <Button 
              onClick={onStartMatch}
              className="w-full h-20 font-poppins font-bold text-xl rounded-3xl bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:from-red-600 hover:via-pink-600 hover:to-orange-600 text-white border-0 shadow-2xl hover:shadow-red-500/30 transition-all duration-300 hover:scale-105 overflow-hidden group"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
              
              <div className="relative flex items-center justify-center space-x-4">
                <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold leading-tight">Start Matching</div>
                  <div className="text-sm opacity-90 font-medium">
                    {liveUserCount.toLocaleString()} people online
                  </div>
                </div>
              </div>
            </Button>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 rounded-3xl blur-xl opacity-30 -z-10" />
          </div>

          {/* Secondary CTA - Voice Chat */}
          <div className="relative">
            <Button
              onClick={() => {/* Navigate to voice tab */}}
              className="w-full h-16 rounded-3xl text-white hover:scale-105 transition-all duration-300 border-0 shadow-xl relative overflow-hidden group bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700"
            >
              <div className="relative flex items-center justify-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold font-poppins">Voice Only Chat</div>
                  <div className="text-sm opacity-90 font-poppins flex items-center gap-2">
                    {hasUnlimitedCalls ? (
                      <>
                        <Crown className="w-4 h-4" />
                        <span>Unlimited access</span>
                      </>
                    ) : (
                      <>
                        <Gem className="w-4 h-4" />
                        <span>20 coins per call</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Button>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl blur-xl opacity-20 -z-10" />
          </div>
        </div>
        
        {/* Rewards & Streaks - Combined Card */}
        <Card className="shadow-card rounded-3xl border-0 bg-white/90 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold font-poppins text-gray-800 text-sm">Rewards & Streaks</h4>
                  <p className="text-xs text-gray-600 font-poppins">Daily bonuses & spin wheel</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Streak Counter */}
                <div className="text-center">
                  <div className="flex items-center gap-1 mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-lg font-bold font-poppins text-gray-800">3</span>
                  </div>
                  <p className="text-xs text-gray-500 font-poppins">Day Streak</p>
                </div>
                
                {/* Daily Spin */}
                <Button
                  onClick={onOpenSpinWheel}
                  size="sm"
                  className="bg-gradient-premium text-white font-poppins rounded-xl shadow-card hover:scale-105 transition-transform"
                >
                  <Gift className="w-4 h-4 mr-1" />
                  Spin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Stories Carousel */}
        <Card className="shadow-card rounded-3xl border-0 bg-white/90 backdrop-blur-md overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-pink-600" />
              <h3 className="font-poppins text-lg font-bold text-gray-800">Success Stories</h3>
            </div>
            
            <div className="relative h-20 overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-xl p-4 border border-pink-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {testimonial.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium font-poppins text-gray-800 mb-1">"{testimonial.text}"</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 font-poppins">- {testimonial.name}, {testimonial.time}</p>
                            <div className="flex gap-1">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Carousel indicators */}
              <div className="flex justify-center gap-1 mt-3">
                {testimonials.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-primary w-6' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safe & Secure - Simplified */}
        <Card className="shadow-card rounded-3xl border-0 bg-white/90 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h3 className="font-poppins text-lg font-bold text-gray-800 mb-2">Safe & Secure</h3>
              <p className="text-gray-600 font-poppins text-sm">Your privacy and safety are our top priority</p>
            </div>
            
            <div className="flex justify-center gap-8">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-help">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-xs font-medium font-poppins text-gray-700">Encrypted</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>End-to-end encrypted conversations</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-help">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-xs font-medium font-poppins text-gray-700">Moderated</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>24/7 content moderation</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-help">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-xs font-medium font-poppins text-gray-700">Reports</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Instant reporting system</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Premium Upgrade Card */}
        {!isPremium && (
          <Card className="shadow-card rounded-3xl border-0 overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6 text-center">
              <Crown className="w-16 h-16 mx-auto mb-4 animate-float" />
              <h3 className="text-xl font-bold mb-2 font-dancing">Upgrade to Premium</h3>
              <p className="text-white/90 font-poppins text-sm mb-6">
                Choose your ideal matches and get priority connections
              </p>
              
              {/* Key Perks */}
              <div className="flex items-center justify-center gap-6 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="font-poppins font-medium">Gender Filters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="font-poppins font-medium">Priority Queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span className="font-poppins font-medium">VIP Features</span>
                </div>
              </div>
              
              <Button 
                onClick={onRequestUpgrade}
                className="w-full h-12 bg-white text-purple-600 hover:bg-gray-50 font-poppins font-bold rounded-2xl shadow-lg hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Upgrade Now - Starting ₹29
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}