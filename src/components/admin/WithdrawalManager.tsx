
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Wallet, 
  Check, 
  X, 
  Clock,
  User,
  CreditCard,
  Loader2,
  ArrowUpRight
} from 'lucide-react';

const WithdrawalManager = () => {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          seller:users!seller_id(email),
          wallet:seller_wallets(balance)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load withdrawal requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (withdrawalId: string, status: 'approved' | 'rejected') => {
    setProcessing(withdrawalId);
    
    try {
      const withdrawal = withdrawals.find(w => w.id === withdrawalId);
      
      if (status === 'approved' && withdrawal) {
        // Deduct amount from wallet
        const { error: walletError } = await supabase.rpc('update_wallet_balance', {
          p_wallet_id: withdrawal.wallet_id,
          p_amount: withdrawal.amount,
          p_transaction_type: 'debit',
          p_description: `Withdrawal approved - Request #${withdrawalId.slice(-8)}`,
          p_reference_id: withdrawalId
        });

        if (walletError) throw walletError;
      }

      // Update withdrawal status
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status,
          admin_notes: adminNotes[withdrawalId] || null,
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', withdrawalId);

      if (updateError) throw updateError;

      // Create notification
      await supabase
        .from('notifications')
        .insert([{
          user_id: withdrawal.seller_id,
          title: `Withdrawal ${status}`,
          message: status === 'approved' 
            ? `Your withdrawal request for NPR ${withdrawal.amount} has been approved.`
            : `Your withdrawal request for NPR ${withdrawal.amount} has been rejected.`,
          type: status === 'approved' ? 'success' : 'warning',
          reference_type: 'withdrawal',
          reference_id: withdrawalId
        }]);

      toast({
        title: status === 'approved' ? 'Withdrawal approved!' : 'Withdrawal rejected',
        description: `Withdrawal request has been ${status}.`
      });

      loadWithdrawals();
      setAdminNotes(prev => ({ ...prev, [withdrawalId]: '' }));
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: 'Error',
        description: 'Failed to process withdrawal request',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-600"><Check className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {withdrawals.filter(w => w.status === 'pending').length} Pending
        </Badge>
      </div>

      <div className="grid gap-6">
        {withdrawals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No withdrawal requests</h3>
              <p className="text-gray-600">Withdrawal requests will appear here when submitted.</p>
            </CardContent>
          </Card>
        ) : (
          withdrawals.map((withdrawal) => (
            <Card key={withdrawal.id} className={withdrawal.status === 'pending' ? 'border-blue-300 bg-blue-50' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowUpRight className="h-5 w-5" />
                      Withdrawal Request
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Request ID: {withdrawal.id.slice(-8)}
                    </p>
                  </div>
                  {getStatusBadge(withdrawal.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Seller Information
                    </h4>
                    <p className="text-sm">{withdrawal.seller?.email}</p>
                    <p className="text-sm">
                      eSewa ID: <span className="font-mono">{withdrawal.esewa_id}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Amount Details
                    </h4>
                    <p className="text-lg font-bold text-blue-600">NPR {withdrawal.amount}</p>
                    <p className="text-sm text-gray-600">
                      Wallet Balance: NPR {withdrawal.wallet?.balance || '0.00'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Request Info</h4>
                    <p className="text-sm">
                      Date: {new Date(withdrawal.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      Time: {new Date(withdrawal.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {withdrawal.status === 'pending' && (
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Admin Notes</label>
                      <Textarea
                        value={adminNotes[withdrawal.id] || ''}
                        onChange={(e) => setAdminNotes(prev => ({ ...prev, [withdrawal.id]: e.target.value }))}
                        placeholder="Optional notes for this withdrawal..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleWithdrawal(withdrawal.id, 'approved')}
                        disabled={processing === withdrawal.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {processing === withdrawal.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Approve & Process
                      </Button>
                      <Button
                        onClick={() => handleWithdrawal(withdrawal.id, 'rejected')}
                        disabled={processing === withdrawal.id}
                        variant="destructive"
                        className="flex-1"
                      >
                        {processing === withdrawal.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <X className="h-4 w-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {withdrawal.status !== 'pending' && withdrawal.admin_notes && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Admin Notes</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded">{withdrawal.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WithdrawalManager;
