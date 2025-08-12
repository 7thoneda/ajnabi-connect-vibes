import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ReactionEffectProps {
  reaction: string;
  id: string;
  onComplete: (id: string) => void;
}

export function ReactionEffect({ reaction, id, onComplete }: ReactionEffectProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onComplete(id), 300);
    }, 2500);

    return () => clearTimeout(timer);
  }, [id, onComplete]);

  const getAnimationClass = () => {
    switch (reaction) {
      case "🎆":
        return "animate-fireworks";
      case "💋":
        return "animate-kiss";
      case "💖":
        return "animate-floating-heart";
      case "👏":
        return "animate-clap";
      case "😍":
        return "animate-love-eyes";
      case "🔥":
        return "animate-fire";
      default:
        return "animate-bounce";
    }
  };

  const getPositionClass = () => {
    // Random position for variety
    const positions = [
      "top-1/4 left-1/4",
      "top-1/3 right-1/4", 
      "top-1/2 left-1/3",
      "top-2/3 right-1/3",
      "top-1/4 left-1/2",
      "top-3/4 left-1/4"
    ];
    return positions[Math.floor(Math.random() * positions.length)];
  };

  return (
    <div
      className={cn(
        "absolute z-50 pointer-events-none transition-all duration-300",
        getPositionClass(),
        getAnimationClass(),
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0"
      )}
    >
      <span className="text-6xl drop-shadow-lg">{reaction}</span>
    </div>
  );
}