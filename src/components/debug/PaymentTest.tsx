
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubscriptionPlan {
  id: string;
  plan_code: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

const PaymentTest = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const transformedPlans = (data || []).map((plan: any): SubscriptionPlan => ({
        id: plan.id,
        plan_code: plan.plan_code,
        name: plan.name,
        description: plan.description || '',
        price: Number(plan.price) || 0,
        currency: plan.currency || 'NPR',
        duration_days: Number(plan.duration_days) || 30,
        features: Array.isArray(plan.features) ? plan.features : [],
        is_active: Boolean(plan.is_active)
      }));

      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Test</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading plans...</div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <div key={plan.id} className="border p-4 rounded">
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                  <p className="font-bold">{plan.currency} {plan.price}</p>
                </div>
              ))}
            </div>
          )}
          <Button onClick={fetchPlans} className="mt-4">
            Refresh Plans
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTest;
