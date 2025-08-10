
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, Upload, ArrowLeft } from 'lucide-react';
import type { SubscriptionPlan } from '@/types/subscription';

const CheckoutPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planCode = searchParams.get('plan');

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [transactionId, setTransactionId] = useState('');
  const [senderName, setSenderName] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const ADMIN_ESEWA_ID = "9765630970";

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!planCode) {
      navigate('/subscription');
      return;
    }

    fetchPlan();
  }, [user, planCode, navigate]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('plan_code', planCode)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setSelectedPlan(data);
    } catch (error) {
      console.error('Error fetching plan:', error);
      toast({
        title: 'Error',
        description: 'Plan not found or inactive',
        variant: 'destructive'
      });
      navigate('/subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `receipt_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      return filePath;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSubmitPayment = async () => {
    if (!user || !selectedPlan || !receiptFile || !transactionId || !senderName) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields and upload receipt',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      // Upload receipt file
      const receiptFilePath = await handleFileUpload(receiptFile);
      if (!receiptFilePath) throw new Error('Receipt upload failed');

      // Create payment request
      const { error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          plan_type: selectedPlan.plan_code,
          amount: selectedPlan.price,
          currency: selectedPlan.currency,
          payment_method: 'esewa',
          transaction_id: transactionId,
          sender_name: senderName,
          receipt_file_path: receiptFilePath,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Payment Submitted',
        description: 'Your payment is being verified. You will be notified once approved.',
      });

      // Navigate to payment status page
      navigate('/payment-status');

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
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

  if (!selectedPlan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Plan not found</h2>
        <Button onClick={() => navigate('/subscription')}>
          View Available Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/subscription')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{selectedPlan.name}</h3>
              <p className="text-gray-600">{selectedPlan.description}</p>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span>{formatPrice(selectedPlan.price)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Duration: {selectedPlan.duration_days} days
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Features Included:</h4>
              <ul className="space-y-1">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-blue-800">
                    • {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              eSewa Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Payment Instructions:</h4>
              <ol className="text-sm text-green-800 space-y-1">
                <li>1. Open eSewa app or website</li>
                <li>2. Send <strong>{formatPrice(selectedPlan.price)}</strong> to:</li>
                <li className="font-mono bg-white p-2 rounded ml-4">{ADMIN_ESEWA_ID}</li>
                <li>3. Take screenshot of successful transaction</li>
                <li>4. Fill the form below and upload receipt</li>
              </ol>
            </div>

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
                  placeholder="Your full name as shown in eSewa"
                  required
                />
              </div>

              <div>
                <Label htmlFor="receipt-upload">Upload Payment Receipt *</Label>
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
            </div>

            <Button 
              onClick={handleSubmitPayment}
              disabled={submitting || !receiptFile || !transactionId || !senderName}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-90"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Payment for Verification
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>Payment will be verified within 24 hours</p>
              <p>You'll receive email notification once approved</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;
