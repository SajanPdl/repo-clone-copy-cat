
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan, transformDatabasePlan } from '@/types/subscription';
import { Crown, Check } from 'lucide-react';

const CheckoutPage = () => {
  const { planCode } = useParams<{ planCode: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (planCode) {
      fetchPlan();
    }
  }, [planCode]);

  const fetchPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('plan_code', planCode)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      setPlan(transformDatabasePlan(data));
    } catch (error) {
      console.error('Error fetching plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription plan',
        variant: 'destructive'
      });
      navigate('/premium');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !plan) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          plan_type: plan.plan_code,
          amount: plan.price,
          sender_name: senderName,
          transaction_id: transactionId,
          payment_method: 'esewa'
        });

      if (error) throw error;

      toast({
        title: 'Payment Request Submitted',
        description: 'Your payment request has been submitted for verification. You will be notified once approved.',
      });

      navigate('/payment-status');
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit payment request',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Plan Not Found</h2>
          <Button onClick={() => navigate('/premium')}>
            Back to Plans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Crown className="h-12 w-12 mx-auto text-indigo-600 mb-4" />
          <h1 className="text-3xl font-bold">Complete Your Purchase</h1>
          <p className="text-gray-600 mt-2">Upgrade to {plan.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Features included:</h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {plan.currency} {plan.price}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Valid for {plan.duration_days} days
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Payment Instructions:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Send NPR {plan.price} to eSewa ID: <strong>9841234567</strong></li>
                    <li>2. Take a screenshot of the payment</li>
                    <li>3. Fill the form below with payment details</li>
                    <li>4. Our team will verify and activate your subscription</li>
                  </ol>
                </div>

                <div>
                  <Label htmlFor="senderName">Sender Name</Label>
                  <Input
                    id="senderName"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Enter the name used in eSewa"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter eSewa transaction ID"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Payment Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
