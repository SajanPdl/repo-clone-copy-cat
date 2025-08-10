import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserSubscription {
  subscription_id: string;
  plan_code: string;
  plan_name: string;
  status: string;
  starts_at: string;
  expires_at: string;
  days_remaining: number;
}

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

export const useSubscription = () => {
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Fetch user's current subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .rpc('get_user_subscription', { user_id: user.id });

      if (!subscriptionError && subscriptionData && subscriptionData.length > 0) {
        setUserSubscription(subscriptionData[0]);
      }

      // Fetch available plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (plansError) throw plansError;
      setAvailablePlans(plansData || []);

    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSubscription = (planCode?: string): boolean => {
    if (!userSubscription) return false;
    
    if (planCode) {
      return userSubscription.plan_code === planCode && userSubscription.days_remaining > 0;
    }
    
    return userSubscription.days_remaining > 0;
  };

  const isProUser = (): boolean => {
    return hasActiveSubscription() && userSubscription?.plan_code.includes('pro');
  };

  const isPremiumUser = (): boolean => {
    return hasActiveSubscription() && userSubscription?.plan_code.includes('premium');
  };

  const getSubscriptionFeatures = (): string[] => {
    if (!userSubscription) return [];
    
    const plan = availablePlans.find(p => p.plan_code === userSubscription.plan_code);
    return plan?.features || [];
  };

  const refreshSubscription = async () => {
    await fetchSubscriptionData();
  };

  return {
    userSubscription,
    availablePlans,
    loading,
    error,
    hasActiveSubscription,
    isProUser,
    isPremiumUser,
    getSubscriptionFeatures,
    refreshSubscription
  };
};
