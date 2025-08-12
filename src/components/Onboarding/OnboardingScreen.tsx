import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X, Heart, ArrowRight, Sparkles, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageCropModal } from "./ImageCropModal";

interface UserProfile {
  username: string;
  photos: string[];
  bio: string;
  interests: string[];
  matchPreference: "anyone" | "men" | "women";
  gender: "male" | "female" | "other";
}

interface OnboardingScreenProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: Partial<UserProfile>;
  isPremium?: boolean;
  onRequestUpgrade?: () => void;
}

const availableInterests = [
  "🎵 Music", "🎬 Movies", "🏃‍♀️ Fitness", "🍳 Cooking", "📚 Reading", "✈️ Travel",
  "🎨 Art", "📸 Photography", "🎮 Gaming", "⚽ Sports", "🌱 Nature", "💻 Tech",
  "👗 Fashion", "🧘‍♀️ Yoga", "☕ Coffee", "🐕 Dogs", "🐱 Cats", "🎭 Theater",
  "🍷 Wine", "🏖️ Beach", "🏔️ Mountains", "🎪 Adventure", "📖 Writing", "🎯 Goals"
];

export function OnboardingScreen({ onComplete, initialProfile, isPremium = false, onRequestUpgrade }: OnboardingScreenProps) {
  const [username, setUsername] = useState(initialProfile?.username ?? "");
  const [photos, setPhotos] = useState<string[]>(initialProfile?.photos ?? []);
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialProfile?.interests ?? []);
  const [matchPreference, setMatchPreference] = useState<"anyone" | "men" | "women">(initialProfile?.matchPreference ?? "anyone");
  const [gender, setGender] = useState<"male" | "female" | "other">(initialProfile?.gender ?? "male");
  const [showCropModal, setShowCropModal] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string>("");
  const { toast } = useToast();

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && photos.length < 6) {
      const newPhotos = Array.from(files).slice(0, 6 - photos.length);
      // Process only the first file for cropping
      const file = newPhotos[0];
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
    setPhotos(prev => [...prev, croppedImageUrl]);
    setPendingImageUrl("");
    setShowCropModal(false);
    
    toast({
      title: "Photo added successfully!",
      description: "Your photo has been cropped and added to your profile.",
    });
  };

  const handleCropCancel = () => {
    setPendingImageUrl("");
    setShowCropModal(false);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    
    // Clean up blob URLs to prevent memory leaks
    const photoUrl = photos[index];
    if (photoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoUrl);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : prev.length < 10 ? [...prev, interest] : prev
    );
  };

  const canSubmit = () => {
    return username.trim().length >= 2 && 
           photos.length >= 2 && 
           bio.trim().length >= 20 && 
           selectedInterests.length >= 3;
  };

  const handleSubmit = () => {
    if (!canSubmit()) {
      toast({
        title: "Please complete all fields",
        description: "Make sure to fill in all required information.",
        variant: "destructive"
      });
      return;
    }

    onComplete({
      username: username.trim(),
      photos,
      bio: bio.trim(),
      interests: selectedInterests,
      matchPreference,
      gender,
    });
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
        onClick={() => (locked ? onRequestUpgrade?.() : setMatchPreference(value))}
        className={`relative flex-1 h-12 sm:h-14 rounded-xl border-2 text-sm font-medium transition-all duration-300 overflow-hidden
           ${isActive 
             ? "bg-gradient-primary text-white border-transparent shadow-warm scale-105" 
             : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
           }
           ${locked ? "opacity-60" : ""}`}
        aria-disabled={locked}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-1">
          <span className="text-lg">{emoji}</span>
          <span className="font-poppins font-semibold text-xs">{label}</span>
        </div>
      </button>
    );
  };

  const GenderButton = ({
    value,
    label,
    emoji,
  }: { value: "male" | "female" | "other"; label: string; emoji: string }) => {
    const isActive = gender === value;
    return (
      <button
        onClick={() => setGender(value)}
        className={`relative flex-1 h-12 sm:h-14 rounded-xl border-2 text-sm font-medium transition-all duration-300
           ${isActive 
             ? "bg-gradient-secondary text-white border-transparent shadow-warm scale-105" 
             : "bg-background text-foreground border-border hover:border-secondary/50 hover:bg-secondary/5"
           }`}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-1">
          <span className="text-lg">{emoji}</span>
          <span className="font-poppins font-semibold text-xs">{label}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col">
      {/* Status Bar Safe Area */}
      <div className="safe-area-top bg-gradient-primary" />
      
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4 flex-shrink-0">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white animate-float" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 font-dancing">
            Create Your Profile
          </h1>
          <p className="text-white/90 font-poppins text-sm sm:text-base lg:text-lg">
            Tell us about yourself to find better matches
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 min-h-0 overflow-y-auto">
        <Card className="shadow-card rounded-2xl sm:rounded-3xl border-0 max-w-4xl mx-auto">
          <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8">
            
            {/* Name Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold font-poppins">What's your name?</h3>
              </div>
              <Input
                placeholder="Enter your first name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-base h-12 rounded-xl font-poppins"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground font-poppins">
                {username.length}/20 characters (minimum 2)
              </p>
            </div>

            {/* Gender Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-secondary" />
                <h3 className="text-lg font-semibold font-poppins">Your Gender</h3>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <GenderButton value="male" label="Male" emoji="👨" />
                <GenderButton value="female" label="Female" emoji="👩" />
                <GenderButton value="other" label="Other" emoji="🌟" />
              </div>
            </div>

            {/* Photos Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold font-poppins">Add your photos</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-[3/4] rounded-xl overflow-hidden">
                    <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black/50 text-white rounded-full p-1 backdrop-blur-sm hover:bg-black/70 transition-colors"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-primary text-white px-2 py-1 rounded-full text-[10px] sm:text-xs font-poppins">
                        Main
                      </div>
                    )}
                  </div>
                ))}
                
                {photos.length < 6 && (
                  <label className="aspect-[3/4] border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-primary/5 hover:bg-primary/10">
                    <div className="text-center">
                      <Plus className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-primary" />
                      <p className="text-xs sm:text-sm text-primary font-poppins font-medium">Add Photo</p>
                      <p className="text-[10px] sm:text-xs text-primary/70 font-poppins mt-1">
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
                )}
              </div>
              <p className="text-xs text-muted-foreground font-poppins">
                {photos.length}/6 photos • Minimum 2 required
              </p>
            </div>

            {/* Bio Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold font-poppins">Tell us about yourself</h3>
              </div>
              <Textarea
                placeholder="I love exploring new places, trying different cuisines, and having deep conversations over coffee. Looking for someone who shares my passion for adventure and can make me laugh..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[120px] resize-none rounded-xl font-poppins text-sm leading-relaxed"
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground font-poppins">
                  {bio.length}/500 characters
                </p>
                <p className="text-xs text-muted-foreground font-poppins">
                  Minimum 20 characters
                </p>
              </div>
            </div>

            {/* Interests Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold font-poppins">What are you into?</h3>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                {availableInterests.map((interest) => (
                  <Badge
                    key={interest}
                    variant={selectedInterests.includes(interest) ? "default" : "outline"}
                    className={`cursor-pointer transition-all hover:scale-105 font-poppins px-3 py-2 text-xs sm:text-sm ${
                      selectedInterests.includes(interest) 
                        ? "bg-primary text-white shadow-warm" 
                        : "hover:bg-primary/10"
                    }`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center font-poppins">
                {selectedInterests.length}/10 selected • Minimum 3 required
              </p>
            </div>

            {/* Match Preferences Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold font-poppins">Who do you want to meet?</h3>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <PreferenceButton value="anyone" label="Everyone" emoji="🌟" />
                <PreferenceButton value="men" label="Men" emoji="👨" />
                <PreferenceButton value="women" label="Women" emoji="👩" />
              </div>
              {!isPremium && (
                <div className="bg-premium/10 border border-premium/20 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-premium rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">👑</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium font-poppins">Premium Feature</p>
                      <p className="text-xs text-muted-foreground font-poppins">
                        Filter by gender with Premium
                      </p>
                    </div>
                    <Button 
                      onClick={onRequestUpgrade} 
                      variant="outline" 
                      size="sm"
                      className="border-premium text-premium hover:bg-premium hover:text-white font-poppins flex-shrink-0"
                    >
                      Upgrade
                    </Button>
                  </div>
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 flex-shrink-0 max-w-4xl mx-auto w-full">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className="w-full h-12 sm:h-14 lg:h-16 rounded-xl sm:rounded-2xl font-poppins font-semibold text-base sm:text-lg lg:text-xl"
          variant="gradient"
        >
          Complete Profile
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-2" />
        </Button>
      </div>
      
      {/* Bottom Safe Area */}
      <div className="safe-area-bottom bg-gradient-primary" />
      
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