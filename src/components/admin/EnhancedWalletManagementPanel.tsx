
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Edit3, 
  Save, 
  X as XIcon,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { toast } from 'sonner';

interface WalletData {
  id: string;
  balance: number;
  total_earnings: number;
  esewa_id: string;
  user_id: string;
  user_email: string;
}

interface WithdrawalData {
  id: string;
  amount: number;
  status: string;
  esewa_id: string;
  processed_at: string;
  processed_by: string;
  user_id: string;
  user_email: string;
}

const EnhancedWalletManagementPanel = () => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
  const [editingWallet, setEditingWallet] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<WalletData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallets();
    fetchWithdrawals();
  }, []);

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('seller_wallets')
        .select(`
          id,
          balance,
          esewa_id,
          user_id,
          created_at,
          updated_at
        `);

      if (error) throw error;

      // Fetch user emails separately
      const userIds = data?.map(wallet => wallet.user_id) || [];
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds);

      if (userError) throw userError;

      const userEmailMap = new Map(userData?.map(user => [user.id, user.email]) || []);

      const walletsWithEmail = data?.map(wallet => ({
        id: wallet.id,
        balance: wallet.balance || 0,
        total_earnings: wallet.balance || 0, // For now, using balance as total_earnings
        esewa_id: wallet.esewa_id || '',
        user_id: wallet.user_id,
        user_email: userEmailMap.get(wallet.user_id) || 'No email'
      })) || [];

      setWallets(walletsWithEmail);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      toast.error('Failed to fetch wallet data');
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          id,
          amount,
          status,
          esewa_id,
          processed_at,
          processed_by,
          seller_id,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user emails separately
      const userIds = data?.map(withdrawal => withdrawal.seller_id) || [];
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds);

      if (userError) throw userError;

      const userEmailMap = new Map(userData?.map(user => [user.id, user.email]) || []);

      const withdrawalsWithEmail = data?.map(withdrawal => ({
        id: withdrawal.id,
        amount: withdrawal.amount,
        status: withdrawal.status,
        esewa_id: withdrawal.esewa_id || '',
        processed_at: withdrawal.processed_at || '',
        processed_by: withdrawal.processed_by || '',
        user_id: withdrawal.seller_id,
        user_email: userEmailMap.get(withdrawal.seller_id) || 'No email'
      })) || [];

      setWithdrawals(withdrawalsWithEmail);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to fetch withdrawal data');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (wallet: WalletData) => {
    setEditingWallet(wallet.id);
    setEditForm(wallet);
  };

  const cancelEditing = () => {
    setEditingWallet(null);
    setEditForm({});
  };

  const saveWalletChanges = async () => {
    if (!editingWallet || !editForm) return;

    try {
      const { error } = await supabase
        .from('seller_wallets')
        .update({
          balance: editForm.balance,
          esewa_id: editForm.esewa_id
        })
        .eq('id', editingWallet);

      if (error) throw error;

      await fetchWallets();
      setEditingWallet(null);
      setEditForm({});
      toast.success('Wallet updated successfully');
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast.error('Failed to update wallet');
    }
  };

  const updateWithdrawalStatus = async (withdrawalId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status,
          processed_at: new Date().toISOString(),
          processed_by: 'admin'
        })
        .eq('id', withdrawalId);

      if (error) throw error;

      await fetchWithdrawals();
      toast.success(`Withdrawal ${status} successfully`);
    } catch (error) {
      console.error('Error updating withdrawal:', error);
      toast.error('Failed to update withdrawal status');
    }
  };

  if (loading) {
    return <div className="p-6">Loading wallet data...</div>;
  }

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const totalEarnings = wallets.reduce((sum, wallet) => sum + wallet.total_earnings, 0);
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Wallet Management</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {totalBalance.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingWithdrawals}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="wallets">
        <TabsList>
          <TabsTrigger value="wallets">User Wallets</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          <div className="grid gap-4">
            {wallets.map((wallet) => (
              <Card key={wallet.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{wallet.user_email}</CardTitle>
                      <CardDescription>User ID: {wallet.user_id}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {editingWallet === wallet.id ? (
                        <>
                          <Button size="sm" onClick={saveWalletChanges}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            <XIcon className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => startEditing(wallet)}>
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Current Balance</Label>
                      {editingWallet === wallet.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editForm.balance || 0}
                          onChange={(e) => setEditForm(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                        />
                      ) : (
                        <div className="text-lg font-semibold text-green-600">
                          Rs. {wallet.balance.toFixed(2)}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label>Total Earnings</Label>
                      {editingWallet === wallet.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editForm.total_earnings || 0}
                          onChange={(e) => setEditForm(prev => ({ ...prev, total_earnings: parseFloat(e.target.value) || 0 }))}
                        />
                      ) : (
                        <div className="text-lg font-semibold">
                          Rs. {wallet.total_earnings.toFixed(2)}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label>eSewa ID</Label>
                      {editingWallet === wallet.id ? (
                        <Input
                          value={editForm.esewa_id || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, esewa_id: e.target.value }))}
                        />
                      ) : (
                        <div className="text-lg">
                          {wallet.esewa_id || 'Not set'}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-4">
          <div className="grid gap-4">
            {withdrawals.map((withdrawal) => (
              <Card key={withdrawal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{withdrawal.user_email}</CardTitle>
                      <CardDescription>
                        Amount: Rs. {withdrawal.amount.toFixed(2)} • eSewa: {withdrawal.esewa_id}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge variant={
                        withdrawal.status === 'pending' ? 'destructive' :
                        withdrawal.status === 'approved' ? 'default' : 'secondary'
                      }>
                        {withdrawal.status}
                      </Badge>
                      {withdrawal.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => updateWithdrawalStatus(withdrawal.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => updateWithdrawalStatus(withdrawal.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {withdrawal.processed_at && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Processed on: {new Date(withdrawal.processed_at).toLocaleDateString()}
                      {withdrawal.processed_by && ` by ${withdrawal.processed_by}`}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedWalletManagementPanel;
