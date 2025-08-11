
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';

const PremiumPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 w-full">
        <div className="container mx-auto px-4">
          <SubscriptionPlans />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PremiumPage;
