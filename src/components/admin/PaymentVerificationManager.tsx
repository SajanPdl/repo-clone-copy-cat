import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import type { PaymentRequest } from '@/types/subscription';
import { transformPaymentRequest } from '@/types/subscription';

const PaymentVerificationManager = () => {
  const { toast } = useToast();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
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
      
      // Transform the data to ensure proper typing
      const transformedData = (data || []).map(transformPaymentRequest);
      setPaymentRequests(transformedData);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      setProcessing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('approve_payment_and_create_subscription', {
        payment_request_id: paymentId,
        admin_user_id: user.id,
        admin_notes: adminNotes || null
      });

      if (error) throw error;

      if (data) {
        toast({
          title: 'Payment Approved',
          description: 'Payment has been approved and subscription created',
        });
        await fetchPaymentRequests();
        setSelectedPayment(null);
        setAdminNotes('');
      } else {
        throw new Error('Failed to approve payment');
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve payment',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      setProcessing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('reject_payment', {
        payment_request_id: paymentId,
        admin_user_id: user.id,
        admin_notes: adminNotes || null
      });

      if (error) throw error;

      if (data) {
        toast({
          title: 'Payment Rejected',
          description: 'Payment has been rejected',
        });
        await fetchPaymentRequests();
        setSelectedPayment(null);
        setAdminNotes('');
      } else {
        throw new Error('Failed to reject payment');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject payment',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const viewReceipt = async (receiptPath: string | null) => {
    if (!receiptPath) {
      toast({ title: 'No receipt', description: 'No receipt file available.' });
      return;
    }
    
    try {
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

  const filteredPayments = paymentRequests.filter(payment => {
    const matchesSearch = payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.plan_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const getPaymentStats = () => {
    const totalPayments = paymentRequests.length;
    const pendingPayments = paymentRequests.filter(p => p.status === 'pending').length;
    const approvedPayments = paymentRequests.filter(p => p.status === 'approved').length;
    const rejectedPayments = paymentRequests.filter(p => p.status === 'rejected').length;
    
    return { totalPayments, pendingPayments, approvedPayments, rejectedPayments };
  };

  const stats = getPaymentStats();

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
        <p className="text-gray-600 mt-2">Verify and manage subscription payment requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold">{stats.totalPayments}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingPayments}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{stats.approvedPayments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejectedPayments}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Requests</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by transaction ID, sender, or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button onClick={fetchPaymentRequests} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payment requests found</h3>
                <p className="text-gray-600">Try adjusting your search or filters.</p>
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(payment.status)}
                    <div>
                      <p className="font-medium">{payment.plan_type.replace('_', ' ').toUpperCase()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Rs. {payment.amount} | {payment.sender_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewReceipt(payment.receipt_file_path)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Receipt
                    </Button>
                    {payment.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Review Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Review Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-medium">{selectedPayment.plan_type.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-medium">Rs. {selectedPayment.amount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transaction ID</p>
                <p className="font-medium">{selectedPayment.transaction_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sender</p>
                <p className="font-medium">{selectedPayment.sender_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this payment verification..."
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleApprovePayment(selectedPayment.id)}
                  disabled={processing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {processing ? 'Processing...' : 'Approve'}
                </Button>
                <Button
                  onClick={() => handleRejectPayment(selectedPayment.id)}
                  disabled={processing}
                  variant="destructive"
                  className="flex-1"
                >
                  {processing ? 'Processing...' : 'Reject'}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedPayment(null);
                    setAdminNotes('');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PaymentVerificationManager;
