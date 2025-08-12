import { RAZORPAY_KEY_ID, PAYMENT_CONFIG } from '@/config/payments';

export interface PaymentResult {
  success: boolean;
  error?: string;
  paymentId?: string;
  orderId?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export class PaymentService {
  private static loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  static async testPaymentGateway(): Promise<{ available: boolean; error?: string }> {
    return { available: false, error: 'Payment backend not configured' };
  }

  private static async createOrder(amountInRupees: number, description: string): Promise<any> {
    throw new Error('Payment backend not configured');
  }

  private static async verifyPayment(paymentData: any): Promise<PaymentResult> {
    return {
      success: false,
      error: 'Payment backend not configured'
    };
  }

  private static async initiatePayment(
    amountInRupees: number, 
    description: string,
    userInfo?: { name?: string; email?: string; phone?: string }
  ): Promise<PaymentResult> {
    return {
      success: false,
      error: 'Payment backend not configured. Please set up a payment server to enable purchases.'
    };
  }

  // Premium subscription with price parameter
  static async subscribeToPremium(
    planId: keyof typeof import('@/config/payments').PREMIUM_PLANS,
    userInfo?: { name?: string; email?: string; phone?: string }
  ): Promise<PaymentResult> {
    const { PREMIUM_PLANS } = await import('@/config/payments');
    const plan = PREMIUM_PLANS[planId];
    
    if (!plan) {
      return {
        success: false,
        error: 'Invalid premium plan selected'
      };
    }

    const description = `Premium Subscription - ${plan.duration}`;
    return this.initiatePayment(plan.price, description, userInfo);
  }

  // Coin package purchase
  static async buyCoinPackage(
    packageId: keyof typeof import('@/config/payments').COIN_PACKAGES,
    userInfo?: { name?: string; email?: string; phone?: string }
  ): Promise<PaymentResult> {
    const { COIN_PACKAGES } = await import('@/config/payments');
    const coinPackage = COIN_PACKAGES[packageId];
    
    if (!coinPackage) {
      return {
        success: false,
        error: 'Invalid coin package selected'
      };
    }

    const description = `${coinPackage.coins} Coins Package`;
    return this.initiatePayment(coinPackage.price, description, userInfo);
  }

  // Unlimited calls subscription
  static async subscribeToUnlimitedCalls(
    autoRenew: boolean,
    userInfo?: { name?: string; email?: string; phone?: string }
  ): Promise<PaymentResult> {
    const { UNLIMITED_CALLS_PLAN } = await import('@/config/payments');
    
    const description = `Unlimited Voice Calls - ${UNLIMITED_CALLS_PLAN.duration}${autoRenew ? ' (Auto-renew)' : ''}`;
    return this.initiatePayment(UNLIMITED_CALLS_PLAN.price, description, userInfo);
  }
}