import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const PaymentTest = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [testMode, setTestMode] = useState(false);
  
  // Test form fields
  const [planCode, setPlanCode] = useState('pro_monthly');
  const [transactionId, setTransactionId] = useState('');
  const [senderName, setSenderName] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    initializeTest();
  }, []);

  const initializeTest = async () => {
    try {
      setLoading(true);
      
      // Check authentication
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        toast({
          title: 'Authentication Error',
          description: authError.message,
          variant: 'destructive'
        });
        return;
      }
      
      setUser(currentUser);

      // Fetch plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);

      if (plansError) {
        console.error('Plans error:', plansError);
        toast({
          title: 'Error Loading Plans',
          description: plansError.message,
          variant: 'destructive'
        });
        return;
      }

      setPlans(plansData || []);
      
    } catch (error) {
      console.error('Initialization error:', error);
      toast({
        title: 'Initialization Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      // Test basic table access
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      toast({
        title: 'Database Connection',
        description: '✅ Database connection successful',
      });

      return true;
    } catch (error) {
      console.error('Database test error:', error);
      toast({
        title: 'Database Connection',
        description: `❌ Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
      return false;
    }
  };

  const testPaymentSubmission = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to test payment submission',
        variant: 'destructive'
      });
      return;
    }

    if (!transactionId || !senderName) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in transaction ID and sender name',
        variant: 'destructive'
      });
      return;
    }

    try {
      setTestMode(true);

      // Test payment request creation
      const { data, error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          plan_type: planCode,
          amount: 999, // Test amount
          currency: 'NPR',
          payment_method: 'esewa',
          transaction_id: transactionId,
          sender_name: senderName,
          status: 'pending'
        })
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: 'Payment Test Successful',
        description: `Payment request created with ID: ${data[0].id}`,
      });

      // Reset form
      setTransactionId('');
      setSenderName('');
      setReceiptFile(null);

    } catch (error) {
      console.error('Payment test error:', error);
      toast({
        title: 'Payment Test Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setTestMode(false);
    }
  };

  const testSubscriptionFunction = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to test subscription function',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_user_subscription', { user_id: user.id });

      if (error) {
        throw error;
      }

      toast({
        title: 'Subscription Function Test',
        description: data && data.length > 0 
          ? `✅ User has subscription: ${data[0].plan_name}`
          : 'ℹ️ User has no active subscription',
      });

    } catch (error) {
      console.error('Subscription function error:', error);
      toast({
        title: 'Subscription Function Test',
        description: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment System Test</h1>
          <p className="text-gray-600">Test and debug the payment flow</p>
        </div>
        <Link to="/subscription">
          <Button variant="outline">Go to Subscription Page</Button>
        </Link>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={user ? 'default' : 'destructive'}>
              {user ? '✅ Logged In' : '❌ Not Logged In'}
            </Badge>
            {user && (
              <p className="text-xs text-gray-600 mt-1">{user.email}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={plans.length > 0 ? 'default' : 'destructive'}>
              {plans.length > 0 ? `✅ ${plans.length} Plans` : '❌ No Plans'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Database</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={testDatabaseConnection}
            >
              Test Connection
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testDatabaseConnection}>
              Test Database Connection
            </Button>
            <Button onClick={testSubscriptionFunction}>
              Test Subscription Function
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Test Form */}
      <Card>
        <CardHeader>
          <CardTitle>Test Payment Submission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="plan-select">Select Plan</Label>
            <select
              id="plan-select"
              value={planCode}
              onChange={(e) => setPlanCode(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.plan_code}>
                  {plan.name} - {plan.price} {plan.currency}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="test-transaction-id">Transaction ID</Label>
            <Input
              id="test-transaction-id"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="TEST_123456789"
            />
          </div>

          <div>
            <Label htmlFor="test-sender-name">Sender Name</Label>
            <Input
              id="test-sender-name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Test User"
            />
          </div>

          <Button 
            onClick={testPaymentSubmission}
            disabled={testMode || !transactionId || !senderName}
            className="w-full"
          >
            {testMode ? 'Testing...' : 'Test Payment Submission'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Link to="/subscription">
              <Button variant="outline" size="sm">Subscription Plans</Button>
            </Link>
            <Link to="/checkout?plan=pro_monthly">
              <Button variant="outline" size="sm">Checkout Page</Button>
            </Link>
            <Link to="/payment-status">
              <Button variant="outline" size="sm">Payment Status</Button>
            </Link>
            <Link to="/debug/payment">
              <Button variant="outline" size="sm">Full Debug</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTest;
