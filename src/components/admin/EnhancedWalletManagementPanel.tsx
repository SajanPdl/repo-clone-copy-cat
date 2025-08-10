
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Search, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  DollarSign
} from 'lucide-react';

// Define interfaces based on actual database structure
interface WalletTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

interface WithdrawalRequest {
  id: string;
  user_id: string;
  wallet_id: string;
  amount: number;
  esewa_id: string | null;
  status: string;
  admin_notes: string | null;
  processed_at: string | null;
  processed_by: string | null;
  seller_id: string;
  created_at: string | null;
  updated_at: string | null;
}

const EnhancedWalletManagementPanel = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionError) {
        console.error('Transaction error:', transactionError);
      } else {
        setTransactions(transactionData || []);
      }

      // Fetch withdrawal requests
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (withdrawalError) {
        console.error('Withdrawal error:', withdrawalError);
      } else {
        setWithdrawalRequests(withdrawalData || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wallet data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithdrawal = async (requestId: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id,
          admin_notes: adminNotes || null
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Withdrawal request approved successfully'
      });
      
      fetchData();
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve withdrawal request',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectWithdrawal = async (requestId: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id,
          admin_notes: adminNotes || null
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Withdrawal request rejected'
      });
      
      fetchData();
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject withdrawal request',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
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

  const filteredRequests = withdrawalRequests.filter(request =>
    request.seller_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.esewa_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold">Wallet Management</h1>
        <p className="text-gray-600 mt-2">Manage user wallets and withdrawal requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Withdrawals</p>
                <p className="text-2xl font-bold">
                  {withdrawalRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Withdrawals</p>
                <p className="text-2xl font-bold">
                  {withdrawalRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold">
                  NPR {withdrawalRequests.reduce((sum, r) => sum + r.amount, 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdrawal Requests */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
              <div className="flex gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by seller ID or eSewa ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={fetchData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredRequests.map((request) => (
                  <Card 
                    key={request.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedRequest?.id === request.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">NPR {request.amount}</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Seller ID:</span>
                          <span className="font-mono text-xs">{request.seller_id?.slice(0, 8)}...</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">eSewa ID:</span>
                          <span>{request.esewa_id || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Requested:</span>
                          <span>{new Date(request.created_at || '').toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
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
                  <h3 className="font-medium mb-2">Withdrawal Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">NPR {selectedRequest.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">eSewa ID:</span>
                      <span>{selectedRequest.esewa_id || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                </div>

                {selectedRequest.status === 'pending' && (
                  <>
                    <div>
                      <h3 className="font-medium mb-2">Admin Notes</h3>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this withdrawal..."
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleApproveWithdrawal(selectedRequest.id)}
                        disabled={processing}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectWithdrawal(selectedRequest.id)}
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
                <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Request</h3>
                <p className="text-gray-600">Choose a withdrawal request to view details and take action</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedWalletManagementPanel;
