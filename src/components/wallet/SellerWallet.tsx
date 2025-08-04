
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface WalletTransaction {
  id: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  description: string;
  created_at: string;
  reference_id?: string;
}

const SellerWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [esewaId, setEsewaId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;

    try {
      const { data: walletData, error: walletError } = await supabase
        .from('seller_wallets')
        .select('balance, esewa_id')
        .eq('user_id', user.id)
        .single();

      if (walletError && walletError.code !== 'PGRST116') {
        throw walletError;
      }

      if (walletData) {
        setBalance(walletData.balance || 0);
        setEsewaId(walletData.esewa_id || '');
      }

      // Mock transactions for now
      const mockTransactions: WalletTransaction[] = [
        {
          id: '1',
          transaction_type: 'credit',
          amount: 450,
          description: 'Payment for Mathematics Notes',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '2',
          transaction_type: 'debit',
          amount: 200,
          description: 'Withdrawal request approved',
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      setTransactions(mockTransactions);

    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wallet data',
        variant: 'destructive'
      });
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!user || !withdrawalAmount || !esewaId) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }

    const amount = parseFloat(withdrawalAmount);
    if (amount <= 0 || amount > balance) {
      toast({
        title: 'Error',
        description: 'Invalid withdrawal amount',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await supabase
        .from('seller_wallets')
        .update({ esewa_id: esewaId })
        .eq('user_id', user.id);

      toast({
        title: 'Success',
        description: 'Withdrawal request submitted successfully',
      });

      setWithdrawalAmount('');
      fetchWalletData();

    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit withdrawal request',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? 
      <ArrowDownToLine className="h-4 w-4 text-green-600" /> :
      <ArrowUpFromLine className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Seller Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your earnings and withdrawals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Wallet Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600">Rs. {balance.toFixed(2)}</p>
            <p className="text-gray-500 mt-2">Available for withdrawal</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="esewa-id">Your eSewa ID</Label>
            <Input
              id="esewa-id"
              value={esewaId}
              onChange={(e) => setEsewaId(e.target.value)}
              placeholder="Enter your eSewa ID"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Withdrawal Amount</Label>
            <Input
              id="amount"
              type="number"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              placeholder="Enter amount to withdraw"
              max={balance}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Available: Rs. {balance.toFixed(2)}
            </p>
          </div>

          <Button 
            onClick={handleWithdrawalRequest}
            disabled={isSubmitting || balance <= 0}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Request Withdrawal'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'credit' ? '+' : '-'}Rs. {transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerWallet;
