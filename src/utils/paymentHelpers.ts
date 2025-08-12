import { COIN_PACKAGES, PREMIUM_PLANS, UNLIMITED_CALLS_PLAN } from '@/config/payments';

// Helper functions for payment-related calculations and formatting

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

export function getCoinPackageDetails(packageType: keyof typeof COIN_PACKAGES) {
  const pack = COIN_PACKAGES[packageType];
  if (!pack) return null;

  return {
    ...pack,
    formattedPrice: formatCurrency(pack.price),
    formattedOriginalPrice: formatCurrency(pack.originalPrice),
    discount: calculateDiscount(pack.originalPrice, pack.price),
    bonusCoins: packageType === 'medium' ? 20 : packageType === 'large' ? 100 : 0
  };
}

export function getPremiumPlanDetails(planType: keyof typeof PREMIUM_PLANS) {
  const plan = PREMIUM_PLANS[planType];
  if (!plan) return null;

  return {
    ...plan,
    formattedPrice: formatCurrency(plan.price),
    formattedOriginalPrice: formatCurrency(plan.originalPrice),
    discount: calculateDiscount(plan.originalPrice, plan.price)
  };
}

export function getUnlimitedCallsDetails() {
  return {
    ...UNLIMITED_CALLS_PLAN,
    formattedPrice: formatCurrency(UNLIMITED_CALLS_PLAN.price)
  };
}

// Validate payment amount
export function validatePaymentAmount(amount: number): boolean {
  return amount > 0 && amount <= 100000; // Max ₹1,00,000
}

// Generate order description
export function generateOrderDescription(
  type: 'coins' | 'premium' | 'unlimited_calls',
  packageId: string
): string {
  switch (type) {
    case 'coins':
      const coinPack = getCoinPackageDetails(packageId as keyof typeof COIN_PACKAGES);
      return coinPack ? `${coinPack.coins} Coins Package` : 'Coin Package';
    
    case 'premium':
      const premiumPlan = getPremiumPlanDetails(packageId as keyof typeof PREMIUM_PLANS);
      return premiumPlan ? `Premium Subscription - ${premiumPlan.duration}` : 'Premium Subscription';
    
    case 'unlimited_calls':
      return `Unlimited Voice Calls - ${UNLIMITED_CALLS_PLAN.duration}`;
    
    default:
      return 'AjnabiCam Purchase';
  }
}

// Payment success messages
export function getSuccessMessage(
  type: 'coins' | 'premium' | 'unlimited_calls',
  packageId?: string
): { title: string; description: string } {
  switch (type) {
    case 'coins':
      const coinPack = packageId ? getCoinPackageDetails(packageId as keyof typeof COIN_PACKAGES) : null;
      return {
        title: "Coins Added! 🎉",
        description: coinPack ? `${coinPack.coins} coins have been added to your account.` : 'Coins added successfully!'
      };
    
    case 'premium':
      const premiumPlan = packageId ? getPremiumPlanDetails(packageId as keyof typeof PREMIUM_PLANS) : null;
      return {
        title: "Premium Activated! 👑",
        description: premiumPlan ? `Welcome to Premium! Your ${premiumPlan.duration} subscription is now active.` : 'Premium subscription activated!'
      };
    
    case 'unlimited_calls':
      return {
        title: "Unlimited Calls Activated! 📞",
        description: `You now have unlimited voice calls for ${UNLIMITED_CALLS_PLAN.duration}.`
      };
    
    default:
      return {
        title: "Purchase Successful! ✅",
        description: 'Your purchase has been completed successfully.'
      };
  }
}