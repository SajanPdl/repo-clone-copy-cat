
import { supabase } from '@/integrations/supabase/client';

export const checkPremiumStatus = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_premium_user', {
      user_id: userId
    });
    
    if (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};

export const getPremiumSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc('get_user_subscription', {
      user_id: userId
    });
    
    if (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
    
    // Return the first active subscription if any
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
};

export const createPremiumSubscription = async (
  userId: string, 
  planCode: string = 'premium_monthly',
  durationDays: number = 30
) => {
  try {
    // First, get the subscription plan
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('plan_code', planCode)
      .eq('is_active', true)
      .single();
    
    if (planError || !planData) {
      console.error('Error fetching subscription plan:', planError);
      return null;
    }
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);
    
    // Cancel any existing active subscription
    await supabase
      .from('user_subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('status', 'active');
    
    // Create new subscription
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: planData.id,
        status: 'active',
        starts_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    return null;
  }
};

export const hasActiveSubscription = async (userId: string, planCode?: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_active_subscription', {
      user_id: userId,
      plan_code: planCode || null
    });
    
    if (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};
