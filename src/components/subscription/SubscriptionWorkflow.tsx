import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, CreditCard, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { transformSubscriptionPlan } from '@/types/subscription';
import type { SubscriptionPlan, PaymentRequest } from '@/types/subscription';

const SubscriptionWorkflow = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    transactionId: '',
    senderName: '',
    receiptFile: null as File | null
  });

  useEffect(() => {
    fetchSubscriptionPlans();
    fetchPaymentRequests();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our SubscriptionPlan interface
      const transformedPlans = (data || []).map(transformSubscriptionPlan);
      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  const fetchPaymentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform to ensure proper typing
      const transformedRequests = (data || []).map(request => ({
        ...request,
        status: request.status as 'pending' | 'approved' | 'rejected'
      }));
      
      setPaymentRequests(transformedRequests);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
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

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
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

      fetchPaymentRequests();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-gray-600 mt-2">Choose a plan and submit payment verification</p>
      </div>

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

      {/* Payment Requests History */}
      {paymentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Payment Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Plan</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRequests.map((request) => (
                    <tr key={request.id} className="border-b">
                      <td className="p-2">{request.plan_type}</td>
                      <td className="p-2">NPR {request.amount}</td>
                      <td className="p-2">{getStatusBadge(request.status)}</td>
                      <td className="p-2">{new Date(request.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionWorkflow;
