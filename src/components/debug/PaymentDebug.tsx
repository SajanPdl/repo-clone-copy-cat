
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import type { SubscriptionPlan, PaymentRequest, SubscriptionWithPlan } from '@/types/subscription';

const PaymentDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDebugChecks();
  }, []);

  const runDebugChecks = async () => {
    const info: any = {};

    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      info.auth = {
        isAuthenticated: !!user,
        user: user ? { id: user.id, email: user.email } : null,
        error: authError?.message
      };

      // Check subscription plans
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);

      info.plans = {
        count: plans?.length || 0,
        data: plans,
        error: plansError?.message
      };

      // Check if user has subscription
      if (user) {
        const { data: subscription, error: subError } = await supabase
          .rpc('get_user_subscription', { user_id: user.id });

        info.subscription = {
          hasSubscription: !!(subscription && Array.isArray(subscription) && subscription.length > 0),
          data: subscription,
          error: subError?.message
        };
      }

      // Check payment requests
      if (user) {
        const { data: payments, error: paymentsError } = await supabase
          .from('payment_requests')
          .select('*')
          .eq('user_id', user.id);

        info.payments = {
          count: payments?.length || 0,
          data: payments,
          error: paymentsError?.message
        };
      }

      // Check storage bucket
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      const paymentBucket = buckets?.find(b => b.id === 'payment-receipts');
      
      info.storage = {
        paymentBucketExists: !!paymentBucket,
        bucketData: paymentBucket,
        error: bucketsError?.message
      };

    } catch (error) {
      info.generalError = error instanceof Error ? error.message : 'Unknown error';
    }

    setDebugInfo(info);
    setLoading(false);
  };

  const testPaymentSubmission = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in first');
        return;
      }

      // Test creating a payment request
      const { data, error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          plan_type: 'pro_monthly',
          amount: 999,
          currency: 'NPR',
          payment_method: 'esewa',
          transaction_id: 'TEST_' + Date.now(),
          sender_name: 'Test User',
          status: 'pending'
        })
        .select();

      if (error) {
        alert('Payment submission test failed: ' + error.message);
      } else {
        alert('Payment submission test successful!');
        runDebugChecks(); // Refresh debug info
      }
    } catch (error) {
      alert('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  if (loading) {
    return <div>Loading debug information...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payment System Debug</h1>
        <Button onClick={runDebugChecks}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Authentication
              <Badge variant={debugInfo.auth?.isAuthenticated ? 'default' : 'destructive'}>
                {debugInfo.auth?.isAuthenticated ? 'OK' : 'FAILED'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.auth, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Subscription Plans
              <Badge variant={debugInfo.plans?.count > 0 ? 'default' : 'destructive'}>
                {debugInfo.plans?.count || 0} plans
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(debugInfo.plans, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* User Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              User Subscription
              <Badge variant={debugInfo.subscription?.hasSubscription ? 'default' : 'secondary'}>
                {debugInfo.subscription?.hasSubscription ? 'ACTIVE' : 'NONE'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(debugInfo.subscription, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Payment Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Payment Requests
              <Badge variant="secondary">
                {debugInfo.payments?.count || 0} requests
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(debugInfo.payments, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Storage
              <Badge variant={debugInfo.storage?.paymentBucketExists ? 'default' : 'destructive'}>
                {debugInfo.storage?.paymentBucketExists ? 'OK' : 'MISSING'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.storage, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testPaymentSubmission}>
            Test Payment Submission
          </Button>
          <div className="text-sm text-gray-600">
            This will create a test payment request to verify the system is working.
          </div>
        </CardContent>
      </Card>

      {debugInfo.generalError && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">General Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-red-50 p-2 rounded text-red-700">
              {debugInfo.generalError}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentDebug;
