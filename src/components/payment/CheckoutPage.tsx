import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, CreditCard, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SubscriptionPlan {
  id: string;
  plan_code: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
}

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form fields
  const [transactionId, setTransactionId] = useState('');
  const [senderName, setSenderName] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const planCode = searchParams.get('plan');

  useEffect(() => {
    if (planCode) {
      fetchPlanDetails();
    }
  }, [planCode]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      
      const { data: planData, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('plan_code', planCode)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setPlan(planData);
    } catch (error) {
      console.error('Error fetching plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to load plan details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `receipt_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-receipts')
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    return filePath;
  };

  const handleSubmitPayment = async () => {
    if (!plan || !transactionId || !senderName || !receiptFile) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields and upload receipt',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Authentication required');

      // Upload receipt file
      const receiptFilePath = await handleFileUpload(receiptFile);

      // Create payment request
      const { error: paymentError } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          plan_type: plan.plan_code,
          amount: plan.price,
          currency: plan.currency,
          payment_method: 'esewa',
          transaction_id: transactionId,
          sender_name: senderName,
          receipt_file_path: receiptFilePath,
          status: 'pending'
        });

      if (paymentError) throw paymentError;

      toast({
        title: 'Payment Submitted Successfully!',
        description: 'Your payment is being reviewed. You will be notified once approved.',
      });

      // Reset form
      setTransactionId('');
      setSenderName('');
      setReceiptFile(null);
      setAdditionalNotes('');

      // Redirect to payment status page
      setTimeout(() => {
        window.location.href = '/payment-status';
      }, 2000);

    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Plan Not Found</h2>
        <p className="text-gray-600 mb-4">The selected plan could not be found or is no longer available.</p>
        <Link to="/subscription">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/subscription">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Complete Your Purchase</h1>
          <p className="text-gray-600">Follow the steps below to complete your subscription</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plan Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Order Summary</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-medium">{plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{plan.duration_days} days</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>{formatPrice(plan.price, plan.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Payment Instructions</h3>
                <div className="space-y-2 text-sm text-green-800">
                  <p>1. Open eSewa app or website</p>
                  <p>2. Send <strong>{formatPrice(plan.price, plan.currency)}</strong> to:</p>
                  <div className="bg-white p-2 rounded font-mono text-center">
                    9765630970
                  </div>
                  <p>3. Take a screenshot of the successful transaction</p>
                  <p>4. Fill the form below and upload your receipt</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="transaction-id">eSewa Transaction ID *</Label>
                  <Input
                    id="transaction-id"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID from eSewa"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sender-name">Sender Name *</Label>
                  <Input
                    id="sender-name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Enter the name used for payment"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="receipt-upload">Payment Receipt *</Label>
                  <Input
                    id="receipt-upload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload screenshot or PDF of your eSewa transaction
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any additional information about your payment..."
                    rows={3}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSubmitPayment}
                disabled={submitting || !transactionId || !senderName || !receiptFile}
                className="w-full"
                size="lg"
              >
                {submitting ? 'Submitting...' : 'Submit Payment for Review'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Plan Price:</span>
                  <span>{formatPrice(plan.price, plan.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{plan.duration_days} days</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{formatPrice(plan.price, plan.currency)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm capitalize">{feature.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-yellow-800">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>Payment verification typically takes 24 hours</p>
              </div>
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>You will receive email notification once approved</p>
              </div>
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>Access will be granted immediately after approval</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
