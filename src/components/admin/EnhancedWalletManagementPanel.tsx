
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, ArrowUpFromLine, Check, X, User, Edit, Save } from 'lucide-react';

interface WithdrawalRequest {
  id: string;
  user_id: string;
  user_email?: string;
  amount: number;
  esewa_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at?: string;
  admin_notes?: string;
}

interface SellerWallet {
  id: string;
  user_id: string;
  user_email?: string;
  balance: number;
  esewa_id?: string;
  total_earnings?: number;
  total_withdrawals?: number;
}

const EnhancedWalletManagementPanel = () => {
  const { toast } = useToast();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [wallets, setWallets] = useState<SellerWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [editingWallet, setEditingWallet] = useState<string | null>(null);
  const [editedWallet, setEditedWallet] = useState<Partial<SellerWallet>>({});

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // Fetch withdrawal requests
      const { data: requests, error: reqError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (reqError) throw reqError;

      // Get user emails from auth.users for withdrawal requests
      const { data: users } = await supabase.auth.admin.listUsers();
      const userEmailMap = new Map<string, string>();
      users.users.forEach(user => {
        if (user.id && user.email) {
          userEmailMap.set(user.id, user.email);
        }
      });

      const mappedRequests = (requests || []).map((req: any) => ({
        ...req,
        user_id: req.user_id || req.seller_id,
        user_email: userEmailMap.get(req.user_id || req.seller_id) || 'Unknown'
      }));
      setWithdrawalRequests(mappedRequests);

      // Fetch seller wallets
      const { data: walletsData, error: walletError } = await supabase
        .from('seller_wallets')
        .select('*');
      
      if (walletError) throw walletError;

      const mappedWallets = (walletsData || []).map((wallet: any) => ({
        ...wallet,
        user_email: userEmailMap.get(wallet.user_id) || 'Unknown'
      }));
      
      setWallets(mappedWallets);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wallet data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    setProcessing(true);
    try {
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status,
          processed_at: new Date().toISOString(),
          admin_notes: adminNotes || null
        })
        .eq('id', requestId);
      
      if (updateError) throw updateError;

      if (status === 'approved' && selectedRequest) {
        const wallet = wallets.find(w => w.user_id === selectedRequest.user_id);
        if (wallet) {
          const newBalance = Number(wallet.balance) - Number(selectedRequest.amount);
          const newWithdrawals = (wallet.total_withdrawals || 0) + Number(selectedRequest.amount);
          
          const { error: walletError } = await supabase
            .from('seller_wallets')
            .update({
              balance: newBalance,
              total_withdrawals: newWithdrawals
            })
            .eq('id', wallet.id);
          
          if (walletError) throw walletError;
        }
      }

      toast({
        title: 'Success',
        description: `Withdrawal request ${status} successfully`,
      });

      setSelectedRequest(null);
      setAdminNotes('');
      fetchWalletData();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: 'Error',
        description: 'Failed to process withdrawal request',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const startEditWallet = (wallet: SellerWallet) => {
    setEditingWallet(wallet.id);
    setEditedWallet({
      balance: wallet.balance,
      esewa_id: wallet.esewa_id,
      total_earnings: wallet.total_earnings,
      total_withdrawals: wallet.total_withdrawals
    });
  };

  const saveWalletChanges = async () => {
    if (!editingWallet) return;
    
    try {
      const { error } = await supabase
        .from('seller_wallets')
        .update(editedWallet)
        .eq('id', editingWallet);
      
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Wallet updated successfully',
      });

      setEditingWallet(null);
      setEditedWallet({});
      fetchWalletData();
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast({
        title: 'Error',
        description: 'Failed to update wallet',
        variant: 'destructive'
      });
    }
  };

  const cancelEdit = () => {
    setEditingWallet(null);
    setEditedWallet({});
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
        <h1 className="text-3xl font-bold">Enhanced Wallet Management</h1>
        <p className="text-gray-600 mt-2">Manage seller wallets and withdrawal requests with full editing capabilities</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Wallets</p>
                <p className="text-2xl font-bold">{wallets.length}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {withdrawalRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <ArrowUpFromLine className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-green-600">
                  Rs. {wallets.reduce((sum, wallet) => sum + wallet.balance, 0).toLocaleString()}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Withdrawals</p>
                <p className="text-2xl font-bold text-purple-600">
                  Rs. {wallets.reduce((sum, wallet) => sum + (wallet.total_withdrawals || 0), 0).toLocaleString()}
                </p>
              </div>
              <ArrowUpFromLine className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdrawal Requests */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Withdrawal Requests</h2>
          
          {withdrawalRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ArrowUpFromLine className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No withdrawal requests</h3>
                <p className="text-gray-600">Withdrawal requests will appear here for review</p>
              </CardContent>
            </Card>
          ) : (
            withdrawalRequests.map((request) => (
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
                      <User className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">{request.user_email}</span>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">Rs. {request.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">eSewa ID:</span>
                      <span className="font-mono text-xs">{request.esewa_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Requested:</span>
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex items-center space-x-2 mt-3">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWithdrawalRequest(request.id, 'approved');
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
                          handleWithdrawalRequest(request.id, 'rejected');
                        }}
                        disabled={processing}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
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
                  <h3 className="font-medium mb-2">User Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">User ID:</span>
                      <span className="font-mono text-xs">{selectedRequest.user_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">User Email:</span>
                      <span>{selectedRequest.user_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">eSewa ID:</span>
                      <span>{selectedRequest.esewa_id}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Request Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">Rs. {selectedRequest.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(selectedRequest.status)}>
                        {selectedRequest.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Requested:</span>
                      <span>{new Date(selectedRequest.created_at).toLocaleString()}</span>
                    </div>
                    {selectedRequest.processed_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processed:</span>
                        <span>{new Date(selectedRequest.processed_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedRequest.status === 'pending' && (
                  <div>
                    <h3 className="font-medium mb-2">Admin Notes</h3>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this withdrawal..."
                      rows={3}
                    />
                    
                    <div className="flex space-x-2 mt-4">
                      <Button
                        onClick={() => handleWithdrawalRequest(selectedRequest.id, 'approved')}
                        disabled={processing}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleWithdrawalRequest(selectedRequest.id, 'rejected')}
                        disabled={processing}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {selectedRequest.admin_notes && (
                  <div>
                    <h3 className="font-medium mb-2">Previous Notes</h3>
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
                <p className="text-gray-600">Choose a withdrawal request to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Enhanced Wallet Overview with Editing */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Editable Wallet Overview</h2>
        <div className="grid grid-cols-1 gap-4">
          {wallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Wallet className="h-6 w-6 text-blue-500" />
                    <div>
                      <span className="font-medium">{wallet.user_email}</span>
                      <p className="text-sm text-gray-500">ID: {wallet.user_id.slice(-8)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Active</Badge>
                    {editingWallet === wallet.id ? (
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={saveWalletChanges}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => startEditWallet(wallet)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Balance</Label>
                    {editingWallet === wallet.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editedWallet.balance || 0}
                        onChange={(e) => setEditedWallet({...editedWallet, balance: parseFloat(e.target.value) || 0})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium text-green-600 text-lg">Rs. {wallet.balance.toLocaleString()}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Total Earnings</Label>
                    {editingWallet === wallet.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editedWallet.total_earnings || 0}
                        onChange={(e) => setEditedWallet({...editedWallet, total_earnings: parseFloat(e.target.value) || 0})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">Rs. {(wallet.total_earnings || 0).toLocaleString()}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Total Withdrawals</Label>
                    {editingWallet === wallet.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editedWallet.total_withdrawals || 0}
                        onChange={(e) => setEditedWallet({...editedWallet, total_withdrawals: parseFloat(e.target.value) || 0})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">Rs. {(wallet.total_withdrawals || 0).toLocaleString()}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">eSewa ID</Label>
                    {editingWallet === wallet.id ? (
                      <Input
                        value={editedWallet.esewa_id || ''}
                        onChange={(e) => setEditedWallet({...editedWallet, esewa_id: e.target.value})}
                        placeholder="eSewa ID"
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-mono text-sm">{wallet.esewa_id || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedWalletManagementPanel;
