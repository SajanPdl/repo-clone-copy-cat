import React from 'react';
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';

const SubscriptionPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <SubscriptionPlans />
      </div>
    </div>
  );
};

export default SubscriptionPage;
