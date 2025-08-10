import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download, 
  RefreshCw,
  ArrowLeft 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaymentRequest {
  id: string;
  plan_type: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id: string;
  sender_name: string;
  receipt_file_path: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  verified_at?: string;
}

interface UserSubscription {
  subscription_id: string;
  plan_code: string;
  plan_name: string;
  status: string;
  starts_at: string;
  expires_at: string;
  days_remaining: number;
}

const PaymentStatusPage = () => {
  const { toast } = useToast();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Fetch payment requests
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (paymentError) throw paymentError;
      setPaymentRequests(paymentData || []);

      // Fetch current subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .rpc('get_user_subscription', { user_id: user.id });

      if (!subscriptionError && subscriptionData && subscriptionData.length > 0) {
        setUserSubscription(subscriptionData[0]);
      }

    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPaymentData();
    setRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Payment information updated',
    });
  };

  const viewReceipt = async (receiptPath: string) => {
    try {
      if (!receiptPath) {
        toast({ title: 'No receipt', description: 'No receipt file available.' });
        return;
      }
      
      const { data, error } = await supabase.storage
        .from('payment-receipts')
        .createSignedUrl(receiptPath, 60);
      
      if (error || !data?.signedUrl) throw error || new Error('No signed URL');
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to load receipt',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  const getPlanDisplayName = (planCode: string) => {
    const planNames: Record<string, string> = {
      'pro_monthly': 'Pro Monthly',
      'pro_yearly': 'Pro Yearly',
      'premium_monthly': 'Premium Monthly',
      'premium_yearly': 'Premium Yearly'
    };
    return planNames[planCode] || planCode;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/subscription">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Payment Status</h1>
            <p className="text-gray-600">Track your payment requests and subscription status</p>
          </div>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Current Subscription Status */}
      {userSubscription && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Active Subscription</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-semibold">{userSubscription.plan_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className="bg-green-100 text-green-800">
                  {userSubscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Days Remaining</p>
                <p className="font-semibold">{userSubscription.days_remaining} days</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Started: {new Date(userSubscription.starts_at).toLocaleDateString()}</p>
              <p>Expires: {new Date(userSubscription.expires_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentRequests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payment Requests</h3>
              <p className="text-gray-600 mb-4">You haven't made any payment requests yet.</p>
              <Link to="/subscription">
                <Button>Browse Plans</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentRequests.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <h3 className="font-semibold">{getPlanDisplayName(payment.plan_type)}</h3>
                        <p className="text-sm text-gray-600">
                          {formatPrice(payment.amount, payment.currency)}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Transaction ID</p>
                      <p className="font-mono">{payment.transaction_id}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sender Name</p>
                      <p>{payment.sender_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Submitted</p>
                      <p>{new Date(payment.created_at).toLocaleString()}</p>
                    </div>
                    {payment.verified_at && (
                      <div>
                        <p className="text-gray-600">Verified</p>
                        <p>{new Date(payment.verified_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {payment.admin_notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-1">Admin Notes:</p>
                      <p className="text-sm text-gray-600">{payment.admin_notes}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewReceipt(payment.receipt_file_path)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Receipt
                    </Button>
                    
                    {payment.status === 'pending' && (
                      <div className="text-sm text-yellow-600 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Under Review
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-1">Payment Verification</h4>
            <p>Payment verification typically takes 24 hours. You'll receive an email notification once your payment is approved.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Receipt Issues</h4>
            <p>If you're having trouble viewing your receipt, please contact support with your transaction ID.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Payment Rejected?</h4>
            <p>If your payment was rejected, check the admin notes above and ensure your receipt clearly shows the transaction details.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentStatusPage;
