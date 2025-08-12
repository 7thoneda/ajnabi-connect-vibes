import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Heart, MapPin, Zap, ArrowLeft } from "lucide-react";

interface PostCallProfileScreenProps {
  profile: {
    username: string;
    age: number;
    photos: string[];
    bio: string;
    distance: string;
    commonInterests: number;
    aboutMe: {
      gender: string;
      religion: string;
      drinking: string;
      smoking: string;
    };
    interests: string[];
  };
  onReject: () => void;
  onAccept: () => void;
  onBack?: () => void;
}

export function PostCallProfileScreen({ profile, onReject, onAccept, onBack }: PostCallProfileScreenProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handlePhotoScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const photoWidth = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / photoWidth);
    setCurrentPhotoIndex(newIndex);
  };

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Photo Section with Scrollable Photos */}
      <div className="relative">
        <div 
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          onScroll={handlePhotoScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {profile.photos.map((photo, index) => (
            <div key={index} className="w-full flex-shrink-0 snap-start relative">
              <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-secondary/20">
                <img 
                  src={photo} 
                  alt={`${profile.username} photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Profile info overlay on first photo */}
                {index === 0 && (
                  <div className="absolute bottom-6 left-6 text-white">
                    {onBack && index === 0 && (
                      <div className="absolute top-[-200px] left-[-24px]">
                        <Button
                          onClick={onBack}
                          variant="outline"
                          size="icon"
                          className="w-12 h-12 rounded-full bg-black/50 border-white/30 text-white hover:bg-black/70"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </Button>
                      </div>
                    )}
                    <h1 className="text-3xl font-bold mb-2 font-poppins">
                      {profile.username}, {profile.age}
                    </h1>
                    <div className="flex items-center gap-4 text-sm font-poppins">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.distance}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        <span>{profile.commonInterests} Common Interest{profile.commonInterests !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Photo indicators */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {profile.photos.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentPhotoIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 w-1'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Profile Details */}
      <div className="px-6 py-6 space-y-6">
        {/* Bio Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 font-poppins">Bio</h3>
          <p className="text-foreground leading-relaxed font-poppins">
            {profile.bio}
          </p>
        </div>

        {/* About Me Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 font-poppins">About Me</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👩</span>
              <span className="font-poppins">{profile.aboutMe.gender}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎵</span>
              <span className="font-poppins">{profile.aboutMe.religion}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚭</span>
              <span className="font-poppins">{profile.aboutMe.smoking}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🍷</span>
              <span className="font-poppins">{profile.aboutMe.drinking}</span>
            </div>
          </div>
        </div>

        {/* Interests Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 font-poppins">Interest</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, index) => (
              <Badge 
                key={index}
                variant="outline"
                className="px-4 py-2 rounded-full font-poppins border-primary/20 text-foreground"
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-8 left-0 right-0 px-6 safe-area-bottom">
        <div className="flex items-center justify-center gap-8">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-16 h-16 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-card"
            onClick={onReject}
            aria-label="Reject connection"
          >
            <X className="w-8 h-8" />
          </Button>
          <Button
            variant="default"
            size="lg"
            className="rounded-full w-16 h-16 bg-gradient-primary border-0 text-white shadow-warm hover:scale-105 transition-transform"
            onClick={onAccept}
            aria-label="Accept connection"
          >
            <Heart className="w-8 h-8" />
          </Button>
        </div>
      </div>
    </div>
  );
}