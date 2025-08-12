import { Coins, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoinHeaderProps {
  balance: number;
  onOpenCoins: () => void;
}

export function CoinHeader({ balance, onOpenCoins }: CoinHeaderProps) {
  return (
    <div 
      className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl px-3 py-2 cursor-pointer hover:scale-105 transition-transform shadow-card"
      onClick={onOpenCoins}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-white/20 rounded-full">
            <Coins className="w-3 h-3 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-[10px] font-poppins font-medium">Your Coins</p>
            <p className="text-white text-xs font-bold font-poppins">{balance}</p>
          </div>
        </div>
        <Button 
          size="sm"
          className="bg-yellow-400 hover:bg-yellow-500 text-orange-800 font-poppins font-semibold h-5 px-2 rounded-md border-0 shadow-none text-[10px]"
          onClick={(e) => {
            e.stopPropagation();
            onOpenCoins();
          }}
        >
          <Plus className="w-3 h-3 mr-1" />
          Buy
        </Button>
      </div>
    </div>
  );
}