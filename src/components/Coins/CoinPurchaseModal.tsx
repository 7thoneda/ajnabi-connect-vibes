import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Coins, X, Zap, CreditCard, Crown, Phone, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { PaymentService } from "@/services/paymentService";
import { COIN_PACKAGES, UNLIMITED_CALLS_PLAN } from "@/config/payments";
import { useToast } from "@/hooks/use-toast";

interface CoinPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (pack: string, coins: number) => void;
  onSubscribe?: (plan: string, autoRenew: boolean) => void;
  userInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export function CoinPurchaseModal({ isOpen, onClose, onPurchase, onSubscribe, userInfo }: CoinPurchaseModalProps) {
  const [autoRenewEnabled, setAutoRenewEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingItem, setProcessingItem] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<'live' | 'demo'>('live');
  const { toast } = useToast();

  // Test payment gateway on component mount
  useEffect(() => {
    const testGateway = async () => {
      const result = await PaymentService.testPaymentGateway();
      if (!result.available) {
        setPaymentMode('demo');
        console.warn('Payment gateway not available:', result.error);
      }
    };
    
    if (isOpen) {
      testGateway();
    }
  }, [isOpen, toast]);

  const coinPacks = [
    { 
      id: "small", 
      coins: COIN_PACKAGES.small.coins, 
      price: `₹${COIN_PACKAGES.small.price}`, 
      originalPrice: `₹${COIN_PACKAGES.small.originalPrice}`,
      badge: null,
      bonus: null 
    },
    { 
      id: "medium", 
      coins: COIN_PACKAGES.medium.coins, 
      price: `₹${COIN_PACKAGES.medium.price}`, 
      originalPrice: `₹${COIN_PACKAGES.medium.originalPrice}`,
      badge: "Most Popular",
      bonus: "+20 Bonus" 
    },
    { 
      id: "large", 
      coins: COIN_PACKAGES.large.coins, 
      price: `₹${COIN_PACKAGES.large.price}`, 
      originalPrice: `₹${COIN_PACKAGES.large.originalPrice}`,
      badge: "Best Value",
      bonus: "+100 Bonus" 
    },
  ];

  const handleCoinPurchase = async (packId: string) => {
    if (isProcessing || processingItem) return;
    
    setIsProcessing(true);
    setProcessingItem(packId);
    
    try {
      const result = await PaymentService.buyCoinPackage(
        packId as keyof typeof COIN_PACKAGES,
        userInfo
      );
      
      if (result.success) {
        // Only add coins after successful payment
        const pack = coinPacks.find(p => p.id === packId);
        if (pack) {
          onPurchase(packId, pack.coins);
          onClose();
          toast({
            title: "Payment Successful! 🎉",
            description: `Payment completed! ${pack.coins} coins have been added to your account.`,
          });
        }
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Payment was not completed. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Payment could not be processed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingItem(null);
    }
  };

  const handleSubscribe = async () => {
    if (isProcessing || processingItem) return;
    
    setIsProcessing(true);
    setProcessingItem('unlimited-calls');
    
    try {
      const result = await PaymentService.subscribeToUnlimitedCalls(autoRenewEnabled, userInfo);
      
      if (result.success) {
        // Only activate subscription after successful payment
        onSubscribe?.('daily-unlimited', autoRenewEnabled);
        onClose();
        toast({
          title: "Subscription Activated! 🎉",
          description: `Payment successful! You now have unlimited voice calls for 24 hours.`,
        });
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Payment was not completed. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Payment could not be processed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingItem(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-secondary text-white p-6 text-center relative">
          <Button 
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <Coins className="w-16 h-16 mx-auto mb-4 animate-float" />
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Buy Coins
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/90">Use coins to unlock profiles and features</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Daily Subscription Option */}
          <Card className="border-2 border-primary shadow-warm bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg">Unlimited Calls</span>
                      <Badge className="bg-primary text-white text-xs">
                        Best Deal
                      </Badge>
                    </div>
                    <p className="text-sm text-green-600 font-medium">24 hours unlimited access</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-lg font-bold text-primary">₹19</span>
                      <span className="text-sm text-muted-foreground">per day</span>
                    </div>
                  </div>
                </div>
                <Crown className="w-8 h-8 text-primary animate-float" />
              </div>
              
              {/* Features */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Unlimited voice calls for 24 hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>No time limits on conversations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Priority matching queue</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Premium reactions included</span>
                </div>
              </div>

              {/* Auto-renew option */}
              <div className="bg-white/50 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Auto-renew daily</p>
                      <p className="text-xs text-muted-foreground">Cancel anytime in settings</p>
                    </div>
                  </div>
                  <Switch
                    checked={autoRenewEnabled}
                    onCheckedChange={setAutoRenewEnabled}
                  />
                </div>
                {autoRenewEnabled && (
                  <div className="mt-2 p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700">
                      ✓ Your subscription will automatically renew every 24 hours
                    </p>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSubscribe}
                disabled={isProcessing || processingItem === 'unlimited-calls'}
                className="w-full h-12 font-poppins font-semibold rounded-xl relative"
                variant="gradient"
              >
                {processingItem === 'unlimited-calls' ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5 mr-2" />
                    Subscribe for ₹{UNLIMITED_CALLS_PLAN.price}/day
                    {paymentMode === 'demo' && (
                      <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        DEMO
                      </span>
                    )}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or buy coins</span>
            </div>
          </div>

          {coinPacks.map((pack) => (
            <Card 
              key={pack.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-warm border-2 ${
                pack.badge === "Most Popular" ? "border-primary shadow-warm" : "border-border"
              } ${isProcessing ? "opacity-50 pointer-events-none" : ""} ${
                processingItem === pack.id ? "ring-2 ring-primary/50" : ""
              }`}
              onClick={() => handleCoinPurchase(pack.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-coin/10 rounded-full">
                      <Coins className="w-6 h-6 text-coin" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg">{pack.coins} Coins</span>
                        {pack.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {pack.badge}
                          </Badge>
                        )}
                      </div>
                      {pack.bonus && (
                        <p className="text-sm text-green-600 font-medium">{pack.bonus}</p>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-primary">{pack.price}</span>
                        <span className="text-sm text-muted-foreground line-through">
                          {pack.originalPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="gradient" 
                    size="sm"
                    disabled={isProcessing || processingItem === pack.id}
                    className="min-w-[60px] relative"
                  >
                    {processingItem === pack.id ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-1" />
                        Buy
                        {paymentMode === 'demo' && (
                          <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[8px] px-1 rounded-full">
                            DEMO
                          </span>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-foreground font-poppins">Payment Methods</h4>
            <div className="flex space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1 font-poppins">
                <Zap className="w-3 h-3" />
                <span>UPI</span>
              </Badge>
              <Badge variant="outline" className="font-poppins">Netbanking</Badge>
              <Badge variant="outline" className="font-poppins">Cards</Badge>
            </div>
            <p className="text-xs text-muted-foreground font-poppins">
              🔒 Secure payments powered by Razorpay
              {paymentMode === 'demo' && (
                <span className="block mt-1 text-yellow-600">
                  ⚠️ Demo mode active - No real charges will be made
                </span>
              )}
            </p>
          </div>

          <div className="text-center">
            <Button variant="outline" className="w-full font-poppins h-12 rounded-xl">
              Watch Ad to Earn 50 Coins
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}