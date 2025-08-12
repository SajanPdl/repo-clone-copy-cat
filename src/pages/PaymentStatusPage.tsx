import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PaymentStatusPage from '@/components/payment/PaymentStatusPage';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';

const PaymentStatusPageWrapper = () => {
  const { user } = useAuth();
  const { notifyPaymentApproved } = useNotificationTrigger();

  useEffect(() => {
    if (user) {
      // Show payment status welcome notification
      notifyPaymentApproved(0, 'Payment Status Check');
    }
  }, [user, notifyPaymentApproved]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentStatusPage />
    </div>
  );
};

export default PaymentStatusPageWrapper;
