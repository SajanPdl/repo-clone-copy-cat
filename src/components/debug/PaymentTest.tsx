
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan, transformDatabasePlan } from '@/types/subscription';

const PaymentTest = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      const transformedPlans = (data || []).map(transformDatabasePlan);
      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscription plans',
        variant: 'destructive'
      });
    }
  };

  const testPayment = async (planCode: string) => {
    setLoading(true);
    try {
      // Simulate payment test
      toast({
        title: 'Payment Test',
        description: `Testing payment for plan: ${planCode}`,
      });
    } catch (error) {
      console.error('Payment test error:', error);
      toast({
        title: 'Error',
        description: 'Payment test failed',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Testing</h1>
        <p className="text-gray-600 mt-2">Test payment flows and subscription plans</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">{plan.description}</p>
                <p className="text-lg font-bold text-green-600">
                  {plan.currency} {plan.price}
                </p>
                <p className="text-sm text-gray-500">
                  {plan.duration_days} days
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Features:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>

              <Button 
                onClick={() => testPayment(plan.plan_code)}
                disabled={loading}
                className="w-full"
              >
                Test Payment
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PaymentTest;
