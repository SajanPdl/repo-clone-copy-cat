
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WalletTransaction {
  id: string;
  wallet_id: string;
  seller_id: string;
  amount: number;
  status: string;
  esewa_id: string;
  processed_at: string;
  processed_by: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  username?: string;
  email?: string;
}

interface WalletStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalAmount: number;
}

const EnhancedWalletManagementPanel = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<WalletStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet transactions
      const { data: transactionData, error: transactionError } = await supabase
        .rpc('get_wallet_transactions_with_profiles');

      if (transactionError) {
        console.error('Transaction error:', transactionError);
      } else {
        setTransactions(transactionData || []);
      }

      // Fetch withdrawal requests
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          profiles:user_id (
            username,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (withdrawalError) {
        console.error('Withdrawal error:', withdrawalError);
      } else {
        setWithdrawalRequests(withdrawalData || []);
      }
      
      // Calculate stats from withdrawal requests
      const statsData = (withdrawalData || []).reduce((acc, request) => {
        acc.totalRequests++;
        acc.totalAmount += request.amount;
        
        switch (request.status) {
          case 'pending':
            acc.pendingRequests++;
            break;
          case 'approved':
            acc.approvedRequests++;
            break;
          case 'rejected':
            acc.rejectedRequests++;
            break;
        }
        
        return acc;
      }, {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        totalAmount: 0
      });
      
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch wallet data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWithdrawalStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: newStatus,
          admin_notes: adminNotes,
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Withdrawal request ${newStatus} successfully`
      });

      setSelectedTransaction(null);
      setAdminNotes('');
      fetchWalletData();
    } catch (error) {
      console.error('Error updating withdrawal request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update withdrawal request',
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
        <h1 className="text-3xl font-bold">Enhanced Wallet Management</h1>
        <p className="text-gray-600 mt-2">Manage seller wallet withdrawal requests and transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Requests</p>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold">{stats.approvedRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejectedRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Amount</p>
                <p className="text-2xl font-bold">NPR {stats.totalAmount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="withdrawals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
          <TabsTrigger value="transactions">Wallet Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading withdrawal requests...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">User</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">eSewa ID</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Created</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawalRequests.map((request) => (
                        <tr key={request.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">
                                {request.profiles?.username || 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {request.profiles?.email || request.user_id}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold">NPR {request.amount}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {request.esewa_id}
                            </span>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-500">
                              {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-4">
                            {request.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateWithdrawalStatus(request.id, 'approved')}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUpdateWithdrawalStatus(request.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading transactions...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">User</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">
                                {transaction.username || 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {transaction.email || transaction.seller_id}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold">NPR {transaction.amount}</span>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedWalletManagementPanel;
