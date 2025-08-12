import { useState, useEffect } from "react";
import splashImage from "@/assets/splash-screen.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowLogo(true), 500);
    const timer2 = setTimeout(() => onComplete(), 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{
          backgroundImage: `url(${splashImage})`,
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-primary opacity-60" />
      
      {/* Content */}
      <div className={`relative z-10 text-center transition-all duration-1000 ${showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
          AjnabiCam
        </h1>
        <p className="text-xl text-white/90 font-medium italic">
          Meet your new friend
        </p>
      </div>
    </div>
  );
}