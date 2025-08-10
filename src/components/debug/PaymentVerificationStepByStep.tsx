import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PaymentVerificationStepByStep = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      name: 'Check Authentication',
      description: 'Verify user is logged in',
      action: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        return {
          success: !!user && !error,
          data: { user: user ? { id: user.id, email: user.email } : null, error: error?.message }
        };
      }
    },
    {
      name: 'Check Admin Status',
      description: 'Verify user has admin privileges',
      action: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, data: { error: 'No user found' } };
        
        const { data: isAdmin, error } = await supabase.rpc('is_admin', { user_id: user.id });
        return {
          success: isAdmin === true,
          data: { isAdmin, error: error?.message }
        };
      }
    },
    {
      name: 'Find Pending Payment',
      description: 'Look for a payment request to verify',
      action: async () => {
        const { data: payments, error } = await supabase
          .from('payment_requests')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);
        
        return {
          success: !error && payments && payments.length > 0,
          data: { payment: payments?.[0], error: error?.message }
        };
      }
    },
    {
      name: 'Test Approval Function',
      description: 'Test the approval RPC function directly',
      action: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, data: { error: 'No user found' } };
        
        // Get a pending payment
        const { data: payments } = await supabase
          .from('payment_requests')
          .select('*')
          .eq('status', 'pending')
          .limit(1);
        
        if (!payments || payments.length === 0) {
          return { success: false, data: { error: 'No pending payments found' } };
        }
        
        const payment = payments[0];
        
        // Test the approval function
        const { data, error } = await supabase.rpc('approve_payment_and_create_subscription', {
          payment_request_id: payment.id,
          admin_user_id: user.id,
          admin_notes: 'Step-by-step test'
        });
        
        return {
          success: !error && data === true,
          data: { result: data, error: error?.message, paymentId: payment.id }
        };
      }
    },
    {
      name: 'Verify Subscription Created',
      description: 'Check if subscription was actually created',
      action: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, data: { error: 'No user found' } };
        
        const { data: subscriptions, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active');
        
        return {
          success: !error && subscriptions && subscriptions.length > 0,
          data: { subscriptions, error: error?.message }
        };
      }
    }
  ];

  const runStep = async (stepIndex: number) => {
    setLoading(true);
    try {
      const step = steps[stepIndex];
      const result = await step.action();
      
      setResults(prev => ({
        ...prev,
        [stepIndex]: result
      }));
      
      if (result.success) {
        toast({
          title: `✅ ${step.name} - Success`,
          description: step.description,
        });
      } else {
        toast({
          title: `❌ ${step.name} - Failed`,
          description: result.data.error || 'Unknown error',
          variant: 'destructive'
        });
      }
      
      setCurrentStep(stepIndex + 1);
    } catch (error) {
      toast({
        title: `❌ ${steps[stepIndex].name} - Error`,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const runAllSteps = async () => {
    setCurrentStep(0);
    setResults({});
    
    for (let i = 0; i < steps.length; i++) {
      await runStep(i);
      // Small delay between steps
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const resetTest = () => {
    setCurrentStep(0);
    setResults({});
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payment Verification Step-by-Step Test</h1>
        <div className="flex gap-2">
          <Button onClick={runAllSteps} disabled={loading}>
            {loading ? 'Running...' : 'Run All Steps'}
          </Button>
          <Button onClick={resetTest} variant="outline">
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={index} className={currentStep > index ? 'border-green-200' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  Step {index + 1}
                </span>
                {step.name}
                {results[index] && (
                  <Badge variant={results[index].success ? 'default' : 'destructive'}>
                    {results[index].success ? 'PASS' : 'FAIL'}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600">{step.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button 
                  onClick={() => runStep(index)}
                  disabled={loading}
                  size="sm"
                >
                  Run This Step
                </Button>
                {results[index] && (
                  <div className="flex-1">
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(results[index].data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(results).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant={results[index]?.success ? 'default' : 'destructive'}>
                    {results[index]?.success ? '✅' : '❌'}
                  </Badge>
                  <span className="text-sm">{step.name}</span>
                  {results[index]?.data?.error && (
                    <span className="text-xs text-red-600">
                      Error: {results[index].data.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentVerificationStepByStep;
