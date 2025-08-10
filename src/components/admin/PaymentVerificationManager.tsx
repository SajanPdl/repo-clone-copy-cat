
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Receipt, Eye, Check, X, Download } from 'lucide-react';

interface PaymentVerification {
  id: string;
  user_id: string;
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
  verified_by?: string;
}

const PaymentVerificationManager = () => {
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<PaymentVerification | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);


  useEffect(() => {
    fetchPaymentVerifications();
  }, []);

  // Fetch payment verifications from payment_requests table
  const fetchPaymentVerifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching payment verifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment verifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };


  // Approve or reject payment using RPC functions
  const handleVerifyPayment = async (verificationId: string, status: 'approved' | 'rejected') => {
    setProcessing(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Authentication required');

      let success = false;
      if (status === 'approved') {
        const { data, error } = await supabase.rpc('approve_payment_and_create_subscription', {
          payment_request_id: verificationId,
          admin_user_id: user.id,
          admin_notes: adminNotes || null
        });
        if (error) throw error;
        success = data;
      } else {
        const { data, error } = await supabase.rpc('reject_payment', {
          payment_request_id: verificationId,
          admin_user_id: user.id,
          admin_notes: adminNotes || null
        });
        if (error) throw error;
        success = data;
      }

      if (success) {
        toast({
          title: 'Success',
          description: `Payment ${status} successfully`,
        });
        setSelectedVerification(null);
        setAdminNotes('');
        fetchPaymentVerifications();
      } else {
        throw new Error(`Failed to ${status} payment`);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify payment',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };


  // View receipt by opening the file from Supabase Storage
  const viewReceipt = async (receiptPath: string) => {
    try {
      if (!receiptPath) {
        toast({ title: 'No receipt', description: 'No receipt file available.' });
        return;
      }
      // Generate a signed URL for the receipt file
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

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Verification</h1>
        <p className="text-gray-600 mt-2">Review and approve payment receipts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment List */}
        <div className="lg:col-span-2 space-y-4">
          {verifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payment verifications</h3>
                <p className="text-gray-600">Payment receipts will appear here for review</p>
              </CardContent>
            </Card>
          ) : (
            verifications.map((verification) => (
              <Card 
                key={verification.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedVerification?.id === verification.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedVerification(verification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-2">
                    <Receipt className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Payment {verification.id.slice(0, 8)}</span>
                  </div>
                    <Badge className={getStatusColor(verification.status)}>
                      {verification.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{verification.plan_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{verification.currency} {verification.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-xs">{verification.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sender:</span>
                      <span>{verification.sender_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span>{new Date(verification.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        viewReceipt(verification.receipt_file_path);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Receipt
                    </Button>
                    
                    {verification.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerifyPayment(verification.id, 'approved');
                          }}
                          disabled={processing}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerifyPayment(verification.id, 'rejected');
                          }}
                          disabled={processing}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Payment Details */}
        <div>
          {selectedVerification ? (
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Payment Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span>{selectedVerification.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">User ID:</span>
                      <span className="font-mono text-xs">{selectedVerification.user_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{selectedVerification.plan_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{selectedVerification.currency} {selectedVerification.amount}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Payment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-xs">{selectedVerification.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sender Name:</span>
                      <span>{selectedVerification.sender_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span>{selectedVerification.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span>{new Date(selectedVerification.created_at).toLocaleString()}</span>
                    </div>
                    {selectedVerification.verified_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verified:</span>
                        <span>{new Date(selectedVerification.verified_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedVerification.status === 'pending' && (
                  <div>
                    <h3 className="font-medium mb-2">Admin Notes</h3>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this verification..."
                      rows={3}
                    />
                    
                    <div className="flex space-x-2 mt-4">
                      <Button
                        onClick={() => handleVerifyPayment(selectedVerification.id, 'approved')}
                        disabled={processing}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleVerifyPayment(selectedVerification.id, 'rejected')}
                        disabled={processing}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {selectedVerification.admin_notes && (
                  <div>
                    <h3 className="font-medium mb-2">Previous Notes</h3>
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      {selectedVerification.admin_notes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Payment</h3>
                <p className="text-gray-600">Choose a payment verification to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentVerificationManager;
