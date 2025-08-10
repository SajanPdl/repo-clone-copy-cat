import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, Crown, Star, Zap } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  plan_code: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

interface UserSubscription {
  subscription_id: string;
  plan_code: string;
  plan_name: string;
  status: string;
  starts_at: string;
  expires_at: string;
  days_remaining: number;
}

const SubscriptionPlans = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchPlansAndSubscription();
  }, []);

  const fetchPlansAndSubscription = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Fetch subscription plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (plansError) throw plansError;
      setPlans(plansData || []);

      // Fetch user's current subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .rpc('get_user_subscription', { user_id: user.id });

      if (!subscriptionError && subscriptionData && subscriptionData.length > 0) {
        setUserSubscription(subscriptionData[0]);
      }

    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription plans',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planCode: string) => {
    setSelectedPlan(planCode);
    // Navigate to checkout page
    window.location.href = `/checkout?plan=${planCode}`;
  };

  const getPlanIcon = (planCode: string) => {
    if (planCode.includes('premium')) return <Crown className="h-6 w-6" />;
    if (planCode.includes('pro')) return <Star className="h-6 w-6" />;
    return <Zap className="h-6 w-6" />;
  };

  const getPlanColor = (planCode: string) => {
    if (planCode.includes('premium')) return 'from-purple-500 to-pink-500';
    if (planCode.includes('pro')) return 'from-blue-500 to-cyan-500';
    return 'from-gray-500 to-gray-600';
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  const getDurationText = (days: number) => {
    if (days === 30) return 'month';
    if (days === 365) return 'year';
    return `${days} days`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Unlock premium features and take your learning to the next level with our flexible subscription plans.
        </p>
      </div>

      {/* Current Subscription Status */}
      {userSubscription && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Current Subscription: {userSubscription.plan_name}
                </h3>
                <p className="text-green-700">
                  Expires in {userSubscription.days_remaining} days
                </p>
                <p className="text-sm text-green-600">
                  Started: {new Date(userSubscription.starts_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = userSubscription?.plan_code === plan.plan_code;
          const isPopular = plan.plan_code.includes('pro_yearly') || plan.plan_code.includes('premium_yearly');
          
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                isCurrentPlan ? 'ring-2 ring-green-500 bg-green-50' : ''
              } ${isPopular ? 'ring-2 ring-blue-500 scale-105' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-12 h-12 rounded-full bg-gradient-to-r ${getPlanColor(plan.plan_code)} flex items-center justify-center text-white mb-4`}>
                  {getPlanIcon(plan.plan_code)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {formatPrice(plan.price, plan.currency)}
                  </div>
                  <div className="text-gray-500">
                    per {getDurationText(plan.duration_days)}
                  </div>
                  {plan.plan_code.includes('yearly') && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      Save up to 25%
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 capitalize">
                        {feature.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button 
                  className={`w-full ${
                    isCurrentPlan 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-gradient-to-r ' + getPlanColor(plan.plan_code) + ' hover:opacity-90'
                  }`}
                  onClick={() => handleUpgrade(plan.plan_code)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Features Comparison */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="text-center">Plan Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Feature</th>
                  <th className="text-center p-4">Free</th>
                  <th className="text-center p-4">Pro</th>
                  <th className="text-center p-4">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium">Basic Downloads</td>
                  <td className="text-center p-4">✓</td>
                  <td className="text-center p-4">✓</td>
                  <td className="text-center p-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Premium Downloads</td>
                  <td className="text-center p-4">✗</td>
                  <td className="text-center p-4">✓</td>
                  <td className="text-center p-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Advanced Tools</td>
                  <td className="text-center p-4">✗</td>
                  <td className="text-center p-4">✓</td>
                  <td className="text-center p-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Exclusive Resources</td>
                  <td className="text-center p-4">✗</td>
                  <td className="text-center p-4">✓</td>
                  <td className="text-center p-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Priority Support</td>
                  <td className="text-center p-4">✗</td>
                  <td className="text-center p-4">✓</td>
                  <td className="text-center p-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Unlimited Downloads</td>
                  <td className="text-center p-4">✗</td>
                  <td className="text-center p-4">✗</td>
                  <td className="text-center p-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Custom Analytics</td>
                  <td className="text-center p-4">✗</td>
                  <td className="text-center p-4">✗</td>
                  <td className="text-center p-4">✓</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">API Access</td>
                  <td className="text-center p-4">✗</td>
                  <td className="text-center p-4">✗</td>
                  <td className="text-center p-4">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">How does the payment process work?</h4>
            <p className="text-gray-600 text-sm">
              We use manual payment verification with eSewa. After payment, upload your receipt for admin approval within 24 hours.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Can I cancel my subscription?</h4>
            <p className="text-gray-600 text-sm">
              Yes, you can cancel anytime. Your access will continue until the end of your current billing period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What happens when my subscription expires?</h4>
            <p className="text-gray-600 text-sm">
              You'll lose access to premium features but can renew anytime. Your account and data remain intact.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPlans;
