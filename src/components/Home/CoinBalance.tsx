import { Coins, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CoinBalanceProps {
  balance: number;
  onBuyCoins: () => void;
}

export function CoinBalance({ balance, onBuyCoins }: CoinBalanceProps) {
  return (
    <Card className="bg-gradient-secondary shadow-card rounded-xl sm:rounded-2xl border-none mb-3 sm:mb-4 md:mb-6">
      <CardContent className="flex items-center justify-between p-3 sm:p-4 md:p-6">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="p-1.5 sm:p-2 md:p-3 bg-white/20 rounded-full flex-shrink-0">
            <Coins className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white/80 text-xs sm:text-sm font-poppins">Your Coins</p>
            <p className="text-white text-lg sm:text-xl md:text-2xl font-bold font-poppins">{balance}</p>
          </div>
        </div>
        <Button 
          onClick={onBuyCoins}
          variant="coin"
          size="sm"
          className="bg-white/20 text-white hover:bg-white/30 font-poppins h-7 sm:h-8 md:h-10 px-2 sm:px-3 md:px-4 text-xs sm:text-sm flex-shrink-0"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Buy
        </Button>
      </CardContent>
    </Card>
  );
}