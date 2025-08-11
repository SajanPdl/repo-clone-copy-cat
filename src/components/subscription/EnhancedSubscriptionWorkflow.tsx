import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Upload, CreditCard, CheckCircle, Crown, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { transformSubscriptionPlan } from '@/types/subscription';
import type { SubscriptionPlan, PaymentRequest } from '@/types/subscription';
import SubscriptionStatus from './SubscriptionStatus';
import PaymentStatusTracker from '../payment/PaymentStatusTracker';

const EnhancedSubscriptionWorkflow = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { userSubscription, refreshSubscription } = useSubscription();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    transactionId: '',
    senderName: '',
    receiptFile: null as File | null
  });

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      
      const transformedPlans = (data || []).map(transformSubscriptionPlan);
      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPaymentForm(prev => ({
        ...prev,
        receiptFile: event.target.files![0]
      }));
    }
  };

  const submitPaymentRequest = async () => {
    if (!selectedPlan) {
      toast({
        title: 'Error',
        description: 'Please select a subscription plan',
        variant: 'destructive'
      });
      return;
    }

    if (!paymentForm.transactionId || !paymentForm.senderName) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'Please login to submit payment request',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      let receiptPath = null;

      // Upload receipt file if provided
      if (paymentForm.receiptFile) {
        const fileExt = paymentForm.receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-receipts')
          .upload(filePath, paymentForm.receiptFile);

        if (uploadError) throw uploadError;
        receiptPath = filePath;
      }

      // Create payment request
      const { error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          plan_type: selectedPlan.plan_code,
          amount: selectedPlan.price,
          currency: selectedPlan.currency,
          transaction_id: paymentForm.transactionId,
          sender_name: paymentForm.senderName,
          receipt_file_path: receiptPath,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payment request submitted successfully. We will verify it soon.'
      });

      // Reset form
      setSelectedPlan(null);
      setPaymentForm({
        transactionId: '',
        senderName: '',
        receiptFile: null
      });

      // Refresh subscription status
      await refreshSubscription();
    } catch (error) {
      console.error('Error submitting payment request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit payment request',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planCode: string) => {
    if (planCode.includes('premium')) return <Crown className="h-5 w-5" />;
    return <Zap className="h-5 w-5" />;
  };

  const getPlanBadge = (planCode: string) => {
    if (planCode.includes('premium')) {
      return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">Pro</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-gray-600 mt-2">Manage your subscription and payment requests</p>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Current Status</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade Plans</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <SubscriptionStatus />
        </TabsContent>

        <TabsContent value="upgrade" className="space-y-6">
          {/* Subscription Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => handlePlanSelect(plan)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    {getPlanIcon(plan.plan_code)}
                    {getPlanBadge(plan.plan_code)}
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    <span className="text-xl font-bold">{plan.currency} {plan.price}</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Duration: {plan.duration_days} days</p>
                    <div>
                      <p className="text-sm font-medium mb-2">Features:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600">{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {selectedPlan?.id === plan.id && (
                    <div className="mt-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Form */}
          {selectedPlan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Verification for {selectedPlan.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Payment Instructions:</h3>
                  <p className="text-blue-800 text-sm mb-2">
                    1. Send {selectedPlan.currency} {selectedPlan.price} to our eSewa account: <strong>9876543210</strong>
                  </p>
                  <p className="text-blue-800 text-sm mb-2">
                    2. Fill in the transaction details below
                  </p>
                  <p className="text-blue-800 text-sm">
                    3. Upload your payment receipt (optional but recommended)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transactionId">Transaction ID *</Label>
                    <Input
                      id="transactionId"
                      value={paymentForm.transactionId}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
                      placeholder="Enter eSewa transaction ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="senderName">Sender Name *</Label>
                    <Input
                      id="senderName"
                      value={paymentForm.senderName}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, senderName: e.target.value }))}
                      placeholder="Name used in eSewa"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="receiptFile">Payment Receipt (Optional)</Label>
                  <Input
                    id="receiptFile"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                  />
                  {paymentForm.receiptFile && (
                    <p className="text-sm text-green-600 mt-1">
                      File selected: {paymentForm.receiptFile.name}
                    </p>
                  )}
                </div>

                <Button
                  onClick={submitPaymentRequest}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Submitting...' : 'Submit Payment Request'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentStatusTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSubscriptionWorkflow;
