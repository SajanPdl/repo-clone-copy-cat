
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSecureAuth as useAuth } from '@/hooks/useSecureAuth';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CreditCard, 
  History,
  Upload,
  QrCode,
  Loader2
} from 'lucide-react';
import { 
  getSellerWallet, 
  getWalletTransactions,
  createWithdrawalRequest,
  getSiteSettings,
  updateSellerEsewaInfo
} from '@/utils/paymentUtils';

const SellerWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [esewaId, setEsewaId] = useState('');
  const [esewaQrFile, setEsewaQrFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;
    
    try {
      const [walletData, settingsData] = await Promise.all([
        getSellerWallet(user.id),
        getSiteSettings()
      ]);
      
      setWallet(walletData);
      setSettings(settingsData);
      setEsewaId(walletData.esewa_id || '');

      if (walletData.id) {
        const transactionsData = await getWalletTransactions(walletData.id);
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wallet information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEsewaInfo = async () => {
    if (!esewaId.trim()) {
      toast({
        title: 'eSewa ID required',
        description: 'Please enter your eSewa ID',
        variant: 'destructive'
      });
      return;
    }

    setUpdating(true);
    try {
      await updateSellerEsewaInfo(esewaId.trim(), esewaQrFile || undefined);
      
      toast({
        title: 'eSewa info updated!',
        description: 'Your eSewa information has been updated successfully.'
      });
      
      loadWalletData();
      setEsewaQrFile(null);
    } catch (error) {
      console.error('Error updating eSewa info:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update eSewa information. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!wallet || !withdrawalAmount) return;

    const amount = parseFloat(withdrawalAmount);
    const minAmount = parseFloat(settings?.min_withdrawal_amount || '100');
    const maxAmount = parseFloat(settings?.max_withdrawal_amount || '50000');

    if (amount < minAmount) {
      toast({
        title: 'Amount too low',
        description: `Minimum withdrawal amount is NPR ${minAmount}`,
        variant: 'destructive'
      });
      return;
    }

    if (amount > maxAmount) {
      toast({
        title: 'Amount too high',
        description: `Maximum withdrawal amount is NPR ${maxAmount}`,
        variant: 'destructive'
      });
      return;
    }

    if (amount > wallet.balance) {
      toast({
        title: 'Insufficient balance',
        description: 'You do not have enough balance for this withdrawal.',
        variant: 'destructive'
      });
      return;
    }

    if (!esewaId.trim()) {
      toast({
        title: 'eSewa ID required',
        description: 'Please set your eSewa ID first',
        variant: 'destructive'
      });
      return;
    }

    setWithdrawing(true);
    try {
      await createWithdrawalRequest(wallet.id, amount, esewaId.trim());
      
      toast({
        title: 'Withdrawal requested!',
        description: 'Your withdrawal request has been submitted for approval.'
      });
      
      setWithdrawalAmount('');
      loadWalletData();
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      toast({
        title: 'Withdrawal failed',
        description: 'Failed to create withdrawal request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setWithdrawing(false);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Wallet className="h-8 w-8 text-green-600" />
            Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div>
              <p className="text-gray-600 mb-2">Available Balance</p>
              <p className="text-4xl font-bold text-green-600">
                NPR {wallet?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            {wallet?.esewa_id && (
              <div className="bg-white/80 rounded-lg p-3 inline-block">
                <p className="text-sm text-gray-600">eSewa ID</p>
                <p className="font-mono font-medium">{wallet.esewa_id}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {transaction.transaction_type === 'credit' ? (
                          <ArrowDownLeft className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.transaction_type === 'credit' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'credit' ? '+' : '-'}NPR {transaction.amount}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.transaction_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Request Withdrawal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Withdrawal Limits</h3>
                <p className="text-blue-700 text-sm">
                  Minimum: NPR {settings?.min_withdrawal_amount || '100'} | 
                  Maximum: NPR {settings?.max_withdrawal_amount || '50,000'}
                </p>
              </div>

              <div>
                <Label htmlFor="withdrawal-amount">Withdrawal Amount (NPR)</Label>
                <Input
                  id="withdrawal-amount"
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="Enter amount"
                  max={wallet?.balance || 0}
                  min={settings?.min_withdrawal_amount || 100}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Available: NPR {wallet?.balance?.toFixed(2) || '0.00'}
                </p>
              </div>

              {!esewaId && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium">
                    Please set your eSewa ID in Settings before requesting withdrawal.
                  </p>
                </div>
              )}

              <Button
                onClick={handleWithdrawal}
                disabled={!withdrawalAmount || !esewaId || withdrawing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {withdrawing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Request Withdrawal
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                eSewa Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="esewa-id">eSewa ID*</Label>
                <Input
                  id="esewa-id"
                  value={esewaId}
                  onChange={(e) => setEsewaId(e.target.value)}
                  placeholder="Enter your eSewa ID"
                />
              </div>

              <div>
                <Label htmlFor="esewa-qr">eSewa QR Code (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="esewa-qr"
                    accept="image/*"
                    onChange={(e) => setEsewaQrFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="esewa-qr" className="cursor-pointer">
                    {esewaQrFile ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <QrCode className="h-6 w-6" />
                        <span>{esewaQrFile.name}</span>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <p>Upload eSewa QR Code</p>
                        <p className="text-xs">PNG, JPG (optional)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <Button
                onClick={handleUpdateEsewaInfo}
                disabled={updating || !esewaId.trim()}
                className="w-full"
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update eSewa Information'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerWallet;
