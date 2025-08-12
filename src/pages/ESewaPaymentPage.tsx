
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ESewaPayment from '@/components/payment/ESewaPayment';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';

const ESewaPaymentPage = () => {
  const { user } = useAuth();
  const { notifyPaymentApproved } = useNotificationTrigger();

  useEffect(() => {
    if (user) {
      // Show payment welcome notification
      notifyPaymentApproved(500, 'ESewa Payment Gateway');
    }
  }, [user, notifyPaymentApproved]);

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 w-full">
        <div className="container mx-auto px-4">
          <ESewaPayment
            itemId="test-item"
            itemType="study_material"
            amount={500}
            onPaymentComplete={() => console.log('Payment completed')}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ESewaPaymentPage;
