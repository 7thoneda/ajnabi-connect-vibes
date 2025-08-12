import { supabase } from "@/integrations/supabase/client";
import { RAZORPAY_KEY_ID, PAYMENT_CONFIG } from '@/config/payments';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  paymentId?: string;
  orderId?: string;
  data?: any;
}

export interface PaymentOptions {
  amount: number;
  productType: 'coins' | 'premium' | 'unlimited_calls';
  productDetails: any;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
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
    try {
      // Test if Razorpay script can be loaded
      const isLoaded = await this.loadRazorpayScript();
      return { available: isLoaded };
    } catch (error) {
      return { available: false, error: 'Failed to load Razorpay' };
    }
  }

  static async initiatePayment(options: PaymentOptions): Promise<void> {
    try {
      // Load Razorpay script
      const isScriptLoaded = await this.loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Create order via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('razorpay-payments', {
        body: {
          action: 'create_order',
          amount: options.amount,
          currency: 'INR',
          product_type: options.productType,
          product_details: options.productDetails,
          user_id: user.id,
        },
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Failed to create order');
      }

      // Configure Razorpay options
      const razorpayOptions = {
        key: RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.order_id,
        name: PAYMENT_CONFIG.company.name,
        description: PAYMENT_CONFIG.company.description,
        image: PAYMENT_CONFIG.company.logo,
        theme: PAYMENT_CONFIG.company.theme,
        handler: async (response: any) => {
          try {
            // Verify payment via Supabase Edge Function
            const { data: verificationData, error: verificationError } = await supabase.functions.invoke('razorpay-payments', {
              body: {
                action: 'verify_payment',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                user_id: user.id,
              },
            });

            if (verificationError || !verificationData.success) {
              throw new Error(verificationData?.error || 'Payment verification failed');
            }

            options.onSuccess(verificationData);
          } catch (error) {
            console.error('Payment verification error:', error);
            options.onError(error);
          }
        },
        modal: {
          ondismiss: () => {
            options.onError({ message: 'Payment cancelled by user' });
          },
        },
        prefill: {
          email: user.email || '',
        },
        notes: {
          user_id: user.id,
          product_type: options.productType,
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();

    } catch (error) {
      console.error('Payment initiation error:', error);
      options.onError(error);
    }
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

    return new Promise((resolve) => {
      this.initiatePayment({
        amount: plan.price,
        productType: 'premium',
        productDetails: { 
          planId, 
          duration: plan.duration,
          coins: 0 
        },
        onSuccess: (response) => {
          resolve({
            success: true,
            paymentId: response.order?.razorpay_payment_id,
            orderId: response.order?.razorpay_order_id,
            data: response
          });
        },
        onError: (error) => {
          resolve({
            success: false,
            error: error.message || 'Payment failed'
          });
        }
      });
    });
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

    return new Promise((resolve) => {
      this.initiatePayment({
        amount: coinPackage.price,
        productType: 'coins',
        productDetails: { 
          packageId, 
          coins: coinPackage.coins 
        },
        onSuccess: (response) => {
          resolve({
            success: true,
            paymentId: response.order?.razorpay_payment_id,
            orderId: response.order?.razorpay_order_id,
            data: response
          });
        },
        onError: (error) => {
          resolve({
            success: false,
            error: error.message || 'Payment failed'
          });
        }
      });
    });
  }

  // Unlimited calls subscription
  static async subscribeToUnlimitedCalls(
    autoRenew: boolean,
    userInfo?: { name?: string; email?: string; phone?: string }
  ): Promise<PaymentResult> {
    const { UNLIMITED_CALLS_PLAN } = await import('@/config/payments');
    
    return new Promise((resolve) => {
      this.initiatePayment({
        amount: UNLIMITED_CALLS_PLAN.price,
        productType: 'unlimited_calls',
        productDetails: { 
          duration: UNLIMITED_CALLS_PLAN.duration,
          autoRenew 
        },
        onSuccess: (response) => {
          resolve({
            success: true,
            paymentId: response.order?.razorpay_payment_id,
            orderId: response.order?.razorpay_order_id,
            data: response
          });
        },
        onError: (error) => {
          resolve({
            success: false,
            error: error.message || 'Payment failed'
          });
        }
      });
    });
  }
}