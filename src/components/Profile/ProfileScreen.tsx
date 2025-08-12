import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageCropModal } from "@/components/Onboarding/ImageCropModal";
import { MapPin, Zap, Heart, Edit, Camera, Plus, ArrowLeft, Gem, Eye, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  username: string;
  photos: string[];
  bio: string;
  interests: string[];
  age?: number;
}

interface ProfileScreenProps {
  profile: UserProfile;
  onEdit?: () => void;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onBack?: () => void;
  onBuyCoins?: () => void;
  onViewBlurredProfiles?: () => void;
}

export function ProfileScreen({ profile, onEdit, onUpdateProfile, onBack, onBuyCoins, onViewBlurredProfiles }: ProfileScreenProps) {
  const { username, photos, bio, interests, age = 20 } = profile;
  const [showCropModal, setShowCropModal] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string>("");
  const { toast } = useToast();

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && photos.length < 6) {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPendingImageUrl(result);
          setShowCropModal(true);
        };
        reader.readAsDataURL(file);
      }
    } else if (photos.length >= 6) {
      toast({
        title: "Maximum photos reached",
        description: "You can upload a maximum of 6 photos.",
        variant: "destructive"
      });
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    const updatedProfile = {
      ...profile,
      photos: [...photos, croppedImageUrl]
    };
    
    onUpdateProfile?.(updatedProfile);
    setPendingImageUrl("");
    setShowCropModal(false);
    
    toast({
      title: "Photo added successfully!",
      description: "Your new photo has been added to your profile.",
    });
  };

  const handleCropCancel = () => {
    setPendingImageUrl("");
    setShowCropModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-primary px-4 py-3 pt-16 pb-6 rounded-b-1xl shadow-warm">
        <div className="flex items-left justify-between">
          {onBack && (
            <Button 
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold font-poppins text-white">My Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            {onBuyCoins && (
              <Button 
                onClick={onBuyCoins}
                variant="outline"
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 p-3 rounded-full min-h-10 min-w-10"
              >
                <Gem className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 font-poppins h-10 px-4 rounded-xl"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 pb-24 space-y-6">
        <div className="max-w-4xl mx-auto">
          {/* Photo Grid - Keep exactly as it is */}
          <Card className="shadow-card rounded-2xl border-0 overflow-hidden">
            <CardContent className="p-0">
              {/* Scrollable Photo Section */}
              <div className="relative">
                <div 
                  className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {photos.map((photo, index) => (
                    <div key={index} className="w-full flex-shrink-0 snap-start relative">
                      <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20">
                        <img 
                          src={photo} 
                          alt={`${username} photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Gradient overlay for text readability on first photo */}
                        {index === 0 && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-4 text-white">
                              <h2 className="text-2xl font-bold mb-1 font-poppins">{username}, {age}</h2>
                              <div className="flex items-center gap-4 text-sm font-poppins">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>2 km away</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Zap className="w-4 h-4" />
                                  <span>Recently Active</span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Photo Button as last slide */}
                  {photos.length < 6 && (
                    <div className="w-full flex-shrink-0 snap-start">
                      <label className="aspect-[4/3] bg-muted/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                        <div className="text-center">
                          <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground font-poppins">Add Photo</p>
                          <p className="text-xs text-muted-foreground/70 font-poppins mt-1">
                            Crop & adjust after upload
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
                
                {/* Photo indicators */}
                {photos.length > 1 && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {photos.map((_, index) => (
                      <div
                        key={index}
                        className="h-1 w-8 bg-white/50 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Unlocks Section - Redesigned as horizontal card */}
          {onViewBlurredProfiles && (
            <Card className="bg-white rounded-2xl shadow-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <Unlock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold font-poppins text-gray-800">Profile Unlocks</h3>
                      <p className="text-sm text-gray-600 font-poppins">
                        See who's interested in you
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    {/* Liked You Count */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Heart className="w-5 h-5 text-red-500" />
                        <span className="text-xl font-bold font-poppins text-gray-800">3</span>
                      </div>
                      <p className="text-xs text-gray-500 font-poppins font-medium">Liked You</p>
                    </div>
                    
                    {/* Subtle divider */}
                    <div className="w-px h-8 bg-gray-200"></div>
                    
                    {/* Viewed You Count */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Eye className="w-5 h-5 text-blue-500" />
                        <span className="text-xl font-bold font-poppins text-gray-800">2</span>
                      </div>
                      <p className="text-xs text-gray-500 font-poppins font-medium">Viewed You</p>
                    </div>
                    
                    {/* View Button */}
                    <Button 
                      onClick={onViewBlurredProfiles}
                      variant="gradient" 
                      className="font-poppins h-10 px-6 rounded-xl ml-4"
                    >
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* About Me Section - Separate card */}
          <Card className="bg-white rounded-2xl shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold font-poppins text-gray-800">About Me</h3>
                <Button variant="ghost" size="sm" onClick={onEdit} className="text-gray-500 hover:text-gray-700">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <div className="w-full h-px bg-gray-100 mb-4"></div>
              <p className="text-gray-700 leading-relaxed font-poppins text-sm">{bio}</p>
            </CardContent>
          </Card>

          {/* Lifestyle Section - Separate card */}
          <Card className="bg-white rounded-2xl shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold font-poppins text-gray-800">Lifestyle</h3>
                <Button variant="ghost" size="sm" onClick={onEdit} className="text-gray-500 hover:text-gray-700">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <div className="w-full h-px bg-gray-100 mb-4"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <span className="text-lg mb-1 block">🚭</span>
                  <span className="text-sm font-medium font-poppins text-gray-700">Non-smoker</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <span className="text-lg mb-1 block">🍷</span>
                  <span className="text-sm font-medium font-poppins text-gray-700">Social Drinker</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <span className="text-lg mb-1 block">🏃‍♀️</span>
                  <span className="text-sm font-medium font-poppins text-gray-700">Active</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <span className="text-lg mb-1 block">🐕</span>
                  <span className="text-sm font-medium font-poppins text-gray-700">Dog Lover</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Interests Section - Separate card */}
          <Card className="bg-white rounded-2xl shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold font-poppins text-gray-800">My Interests</h3>
                <Button variant="ghost" size="sm" onClick={onEdit} className="text-gray-500 hover:text-gray-700">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <div className="w-full h-px bg-gray-100 mb-4"></div>
              <div className="flex flex-wrap gap-3">
                {interests.map((interest, index) => (
                  <Badge 
                    key={index}
                    className="bg-primary/10 text-primary border-0 hover:bg-primary/15 font-poppins px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {interest}
                  </Badge>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full h-8 w-8 p-0 border-gray-200 hover:border-primary/50 hover:bg-primary/5" 
                  onClick={onEdit}
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={showCropModal}
        onClose={handleCropCancel}
        onCropComplete={handleCropComplete}
        imageUrl={pendingImageUrl}
      />
    </div>
  );
}