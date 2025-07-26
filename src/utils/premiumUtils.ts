
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
    const { data, error } = await supabase
      .from('premium_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching premium subscription:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching premium subscription:', error);
    return null;
  }
};

export const createPremiumSubscription = async (
  userId: string, 
  planType: string = 'premium',
  durationMonths: number = 1
) => {
  try {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);
    
    const { data, error } = await supabase
      .from('premium_subscriptions')
      .insert({
        user_id: userId,
        plan_type: planType,
        status: 'active',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating premium subscription:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating premium subscription:', error);
    return null;
  }
};
