
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Check, Star, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SubscriptionPlan } from '@/types/subscription';

const SubscriptionPlans = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { userSubscription, loading: subscriptionLoading, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
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

  const handleSelectPlan = (planCode: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to subscribe to a plan',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    // Navigate to checkout with selected plan
    navigate(`/checkout?plan=${planCode}`);
  };

  const isCurrentPlan = (planCode: string) => {
    return userSubscription?.plan_code === planCode;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getPlanIcon = (planCode: string) => {
    if (planCode.includes('premium')) {
      return <Crown className="h-6 w-6 text-purple-600" />;
    }
    if (planCode.includes('pro')) {
      return <Star className="h-6 w-6 text-blue-600" />;
    }
    return null;
  };

  const getPlanColor = (planCode: string) => {
    if (planCode.includes('premium')) {
      return 'from-purple-500 to-purple-700';
    }
    if (planCode.includes('pro')) {
      return 'from-blue-500 to-blue-700';
    }
    return 'from-gray-500 to-gray-700';
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600">
          Unlock premium features and accelerate your learning journey
        </p>
        {userSubscription && (
          <div className="mt-4">
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              Current Plan: {userSubscription.plan_name} 
              ({userSubscription.days_remaining} days remaining)
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isPopular = plan.plan_code === 'pro_monthly';
          const isPremium = plan.plan_code.includes('premium');
          const isCurrent = isCurrentPlan(plan.plan_code);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-transform hover:scale-105 ${
                isPopular ? 'ring-2 ring-blue-500 shadow-lg' : ''
              } ${isPremium ? 'ring-2 ring-purple-500' : ''}`}
            >
              {isPopular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-blue-500 text-white text-xs font-bold py-1 px-3 transform translate-x-6 translate-y-3 rotate-45">
                    Popular
                  </div>
                </div>
              )}
              
              {isPremium && (
                <div className="absolute top-0 right-0">
                  <div className="bg-purple-500 text-white text-xs font-bold py-1 px-3 transform translate-x-6 translate-y-3 rotate-45">
                    Premium
                  </div>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.plan_code)}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {formatPrice(plan.price)}
                  <span className="text-base font-normal text-gray-500">
                    /{plan.duration_days > 30 ? 'year' : 'month'}
                  </span>
                </div>
                {plan.description && (
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${
                    isCurrent 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : `bg-gradient-to-r ${getPlanColor(plan.plan_code)} hover:opacity-90`
                  }`}
                  onClick={() => handleSelectPlan(plan.plan_code)}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Plan' : 'Select Plan'}
                </Button>

                {plan.duration_days > 30 && (
                  <div className="text-center">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Save {Math.round((1 - (plan.price / (plan.duration_days / 30)) / (plans.find(p => p.plan_code === plan.plan_code.replace('yearly', 'monthly'))?.price || plan.price)) * 100)}%
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-12 text-center">
        <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-2">Need Help Choosing?</h3>
          <p className="text-gray-600 mb-4">
            Not sure which plan is right for you? Contact our support team for personalized recommendations.
          </p>
          <Button variant="outline" onClick={() => navigate('/contact')}>
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
