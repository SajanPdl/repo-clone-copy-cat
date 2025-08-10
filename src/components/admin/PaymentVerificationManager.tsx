import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Eye, CheckCircle, XCircle, Download, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentRequest {
  id: string;
  user_id: string;
  plan_type: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id: string;
  sender_name: string;
  receipt_file_path: string;
  status: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  verified_at: string;
  verified_by: string;
}

const PaymentVerificationManager = () => {
  const { toast } = useToast();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentRequests(data || []);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch payment requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (requestId: string) => {
    setProcessing(true);
    try {
      const { data, error } = await supabase
        .rpc('approve_payment_and_create_subscription', {
          payment_request_id: requestId,
          admin_user_id: (await supabase.auth.getUser()).data.user?.id,
          admin_notes: adminNotes || null
        });

      if (error) throw error;

      if (data) {
        toast({
          title: 'Success',
          description: 'Payment approved and subscription created successfully'
        });
        fetchPaymentRequests();
        setSelectedRequest(null);
        setAdminNotes('');
      } else {
        throw new Error('Failed to approve payment');
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve payment',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectPayment = async (requestId: string) => {
    setProcessing(true);
    try {
      const { data, error } = await supabase
        .rpc('reject_payment', {
          payment_request_id: requestId,
          admin_user_id: (await supabase.auth.getUser()).data.user?.id,
          admin_notes: adminNotes || null
        });

      if (error) throw error;

      if (data) {
        toast({
          title: 'Success',
          description: 'Payment rejected successfully'
        });
        fetchPaymentRequests();
        setSelectedRequest(null);
        setAdminNotes('');
      } else {
        throw new Error('Failed to reject payment');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject payment',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadReceipt = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('payment-receipts')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'receipt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to download receipt',
        variant: 'destructive'
      });
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Verification</h1>
        <p className="text-gray-600 mt-2">Review and verify subscription payment requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Requests List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Payment Requests</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payment requests...</p>
            </div>
          ) : paymentRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payment requests</h3>
                <p className="text-gray-600">Payment requests will appear here for verification</p>
              </CardContent>
            </Card>
          ) : (
            paymentRequests.map((request) => (
              <Card 
                key={request.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedRequest?.id === request.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedRequest(request)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Plan: {request.plan_type}</span>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{request.currency} {request.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-xs">{request.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sender:</span>
                      <span>{request.sender_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Request Details */}
        <div>
          {selectedRequest ? (
            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Payment Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{selectedRequest.plan_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{selectedRequest.currency} {selectedRequest.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-xs">{selectedRequest.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sender Name:</span>
                      <span>{selectedRequest.sender_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                </div>

                {selectedRequest.receipt_file_path && (
                  <div>
                    <h3 className="font-medium mb-2">Receipt</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadReceipt(selectedRequest.receipt_file_path)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Receipt
                    </Button>
                  </div>
                )}

                {selectedRequest.status === 'pending' && (
                  <>
                    <div>
                      <h3 className="font-medium mb-2">Admin Notes</h3>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this payment..."
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleApprovePayment(selectedRequest.id)}
                        disabled={processing}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectPayment(selectedRequest.id)}
                        disabled={processing}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </>
                )}

                {selectedRequest.admin_notes && (
                  <div>
                    <h3 className="font-medium mb-2">Admin Notes</h3>
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      {selectedRequest.admin_notes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Request</h3>
                <p className="text-gray-600">Choose a payment request to view details and take action</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentVerificationManager;
