import { useState } from 'react';
import { PaymentService, PaymentResult } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';

interface UsePaymentProps {
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
}

export function usePayment({ onSuccess, onError }: UsePaymentProps = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processPayment = async (
    paymentType: 'coins' | 'premium' | 'unlimited_calls',
    packageId: string,
    userInfo?: { name?: string; email?: string; phone?: string },
    autoRenew?: boolean
  ) => {
    if (isProcessing) return null;

    setIsProcessing(true);

    try {
      let result: PaymentResult;

      switch (paymentType) {
        case 'coins':
          result = await PaymentService.buyCoinPackage(packageId as any, userInfo);
          break;
        case 'premium':
          result = await PaymentService.subscribeToPremium(packageId as any, userInfo);
          break;
        case 'unlimited_calls':
          result = await PaymentService.subscribeToUnlimitedCalls(autoRenew || false, userInfo);
          break;
        default:
          throw new Error('Invalid payment type');
      }

      if (result.success) {
        onSuccess?.(result);
        toast({
          title: "Payment Successful! 🎉",
          description: "Your purchase has been completed successfully.",
        });
      } else {
        onError?.(result.error || 'Payment failed');
        toast({
          title: "Payment Failed",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to process payment';
      onError?.(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    processPayment
  };
}