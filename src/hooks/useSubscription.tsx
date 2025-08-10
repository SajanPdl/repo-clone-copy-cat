
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SubscriptionPlan, SubscriptionWithPlan } from '@/types/subscription';

export const useSubscription = () => {
  const [userSubscription, setUserSubscription] = useState<SubscriptionWithPlan | null>(null);
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

      // Fetch user's current subscription using the RPC function
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .rpc('get_user_subscription', { user_id: user.id });

      if (!subscriptionError && subscriptionData && Array.isArray(subscriptionData) && subscriptionData.length > 0) {
        setUserSubscription({
          id: subscriptionData[0].subscription_id,
          user_id: user.id,
          plan_id: '', // Not returned by RPC
          payment_request_id: null,
          status: subscriptionData[0].status as 'active' | 'expired' | 'cancelled',
          starts_at: subscriptionData[0].starts_at,
          expires_at: subscriptionData[0].expires_at,
          created_at: '', // Not returned by RPC
          updated_at: '', // Not returned by RPC
          plan_code: subscriptionData[0].plan_code,
          plan_name: subscriptionData[0].plan_name,
          days_remaining: subscriptionData[0].days_remaining
        });
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
