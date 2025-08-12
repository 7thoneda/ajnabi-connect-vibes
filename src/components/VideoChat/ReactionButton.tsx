import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReactionButtonProps {
  emoji: string;
  label: string;
  cost: number;
  coinBalance: number;
  onReact: (reaction: string, cost: number) => void;
  className?: string;
}

export function ReactionButton({ 
  emoji, 
  label, 
  cost, 
  coinBalance, 
  onReact, 
  className 
}: ReactionButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const canAfford = coinBalance >= cost;

  const handleClick = () => {
    if (!canAfford) return;
    
    setIsAnimating(true);
    onReact(emoji, cost);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={!canAfford || isAnimating}
      variant="outline"
      size="sm"
      className={cn(
        "relative h-12 w-12 rounded-full bg-black/50 border-white/30 text-white hover:bg-black/70 transition-all duration-200",
        isAnimating && "scale-110 animate-pulse",
        !canAfford && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center">
        <span className="text-lg leading-none">{emoji}</span>
        <div className="flex items-center gap-1 mt-1">
          <Gem className="w-2 h-2" />
          <span className="text-[8px] font-bold">{cost}</span>
        </div>
      </div>
    </Button>
  );
}