import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PaymentVerificationDebug = () => {
  const { toast } = useToast();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [testPaymentId, setTestPaymentId] = useState<string>('');

  useEffect(() => {
    runVerificationDebug();
  }, []);

  const runVerificationDebug = async () => {
    const info: any = {};

    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      info.auth = {
        isAuthenticated: !!user,
        user: user ? { id: user.id, email: user.email } : null,
        error: authError?.message
      };

      // Check if user is admin
      if (user) {
        const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', {
          user_id: user.id
        });
        info.adminCheck = {
          isAdmin: isAdmin,
          error: adminError?.message
        };
      }

      // Check payment_requests table
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      info.paymentRequests = {
        count: payments?.length || 0,
        data: payments,
        error: paymentsError?.message
      };

      // Check subscription_plans table
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);

      info.subscriptionPlans = {
        count: plans?.length || 0,
        data: plans,
        error: plansError?.message
      };

      // Check user_subscriptions table
      if (user) {
        const { data: subscriptions, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id);

        info.userSubscriptions = {
          count: subscriptions?.length || 0,
          data: subscriptions,
          error: subError?.message
        };
      }

      // Check RPC functions exist
      try {
        const { data: hasActiveSub, error: hasActiveError } = await supabase.rpc('has_active_subscription', {
          user_id: user?.id || 'test'
        });
        info.rpcFunctions = {
          has_active_subscription: {
            exists: !hasActiveError || !hasActiveError.message.includes('function'),
            error: hasActiveError?.message
          }
        };
      } catch (error) {
        info.rpcFunctions = {
          has_active_subscription: {
            exists: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }

      // Test approve_payment_and_create_subscription function
      if (info.paymentRequests.count > 0) {
        const testPayment = info.paymentRequests.data[0];
        setTestPaymentId(testPayment.id);
        
        try {
          const { data: approveTest, error: approveError } = await supabase.rpc('approve_payment_and_create_subscription', {
            payment_request_id: testPayment.id,
            admin_user_id: user?.id || 'test',
            admin_notes: 'Debug test'
          });
          info.approveFunction = {
            exists: !approveError || !approveError.message.includes('function'),
            error: approveError?.message,
            testResult: approveTest
          };
        } catch (error) {
          info.approveFunction = {
            exists: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }

    } catch (error) {
      info.generalError = error instanceof Error ? error.message : 'Unknown error';
    }

    setDebugInfo(info);
    setLoading(false);
  };

  const testVerificationProcess = async () => {
    if (!testPaymentId) {
      toast({
        title: 'No Test Payment',
        description: 'No payment request available for testing',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to test verification',
          variant: 'destructive'
        });
        return;
      }

      // Test the approval process
      const { data, error } = await supabase.rpc('approve_payment_and_create_subscription', {
        payment_request_id: testPaymentId,
        admin_user_id: user.id,
        admin_notes: 'Debug test verification'
      });

      if (error) {
        toast({
          title: 'Verification Test Failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Verification Test Successful',
          description: `Result: ${data}`,
        });
        runVerificationDebug(); // Refresh debug info
      }
    } catch (error) {
      toast({
        title: 'Verification Test Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  const createTestPayment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to create test payment',
          variant: 'destructive'
        });
        return;
      }

      const { data, error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          plan_type: 'pro_monthly',
          amount: 999,
          currency: 'NPR',
          payment_method: 'esewa',
          transaction_id: 'DEBUG_TEST_' + Date.now(),
          sender_name: 'Debug Test User',
          status: 'pending'
        })
        .select();

      if (error) {
        toast({
          title: 'Test Payment Creation Failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Test Payment Created',
          description: `Payment ID: ${data[0].id}`,
        });
        runVerificationDebug(); // Refresh debug info
      }
    } catch (error) {
      toast({
        title: 'Test Payment Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div>Loading verification debug information...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payment Verification Debug</h1>
        <div className="flex gap-2">
          <Button onClick={runVerificationDebug}>Refresh</Button>
          <Button onClick={createTestPayment} variant="outline">Create Test Payment</Button>
        </div>
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

        {/* Admin Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Admin Status
              <Badge variant={debugInfo.adminCheck?.isAdmin ? 'default' : 'destructive'}>
                {debugInfo.adminCheck?.isAdmin ? 'ADMIN' : 'NOT ADMIN'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.adminCheck, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Payment Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Payment Requests
              <Badge variant="secondary">
                {debugInfo.paymentRequests?.count || 0} requests
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.paymentRequests, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Subscription Plans
              <Badge variant={debugInfo.subscriptionPlans?.count > 0 ? 'default' : 'destructive'}>
                {debugInfo.subscriptionPlans?.count || 0} plans
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.subscriptionPlans, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* User Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              User Subscriptions
              <Badge variant="secondary">
                {debugInfo.userSubscriptions?.count || 0} subscriptions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.userSubscriptions, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* RPC Functions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              RPC Functions
              <Badge variant={debugInfo.rpcFunctions?.has_active_subscription?.exists ? 'default' : 'destructive'}>
                {debugInfo.rpcFunctions?.has_active_subscription?.exists ? 'OK' : 'MISSING'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.rpcFunctions, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Approve Function */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Approve Function
              <Badge variant={debugInfo.approveFunction?.exists ? 'default' : 'destructive'}>
                {debugInfo.approveFunction?.exists ? 'OK' : 'MISSING'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.approveFunction, null, 2)}
            </pre>
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
            <Button 
              onClick={testVerificationProcess}
              disabled={!testPaymentId}
            >
              Test Verification Process
            </Button>
            <Button onClick={createTestPayment} variant="outline">
              Create Test Payment
            </Button>
          </div>
          {testPaymentId && (
            <div className="text-sm text-gray-600">
              Test Payment ID: {testPaymentId}
            </div>
          )}
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

export default PaymentVerificationDebug;
