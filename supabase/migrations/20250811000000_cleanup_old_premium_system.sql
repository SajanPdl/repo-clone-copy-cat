-- Clean up old premium subscription system
-- This migration removes the deprecated premium_subscriptions table and related functions
-- to ensure only the new subscription system (user_subscriptions + subscription_plans) is used

-- Drop the old is_premium_user function
DROP FUNCTION IF EXISTS public.is_premium_user(uuid);

-- Drop the old premium_subscriptions table
DROP TABLE IF EXISTS public.premium_subscriptions CASCADE;

-- Create a new function to check premium status using the new subscription system
CREATE OR REPLACE FUNCTION public.is_premium_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Check if user has any active subscription (pro or premium)
  RETURN EXISTS (
    SELECT 1 FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = $1 
    AND us.status = 'active' 
    AND us.expires_at > now()
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Grant execute permission on the new function
GRANT EXECUTE ON FUNCTION public.is_premium_user(uuid) TO authenticated;

-- Ensure the new subscription system is properly set up
-- This function checks if a user has an active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id uuid, plan_code text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF plan_code IS NULL THEN
    -- Check for any active subscription
    RETURN EXISTS (
      SELECT 1 FROM public.user_subscriptions us
      JOIN public.subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 
      AND us.status = 'active' 
      AND us.expires_at > now()
    );
  ELSE
    -- Check for specific plan subscription
    RETURN EXISTS (
      SELECT 1 FROM public.user_subscriptions us
      JOIN public.subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 
      AND sp.plan_code = $2
      AND us.status = 'active' 
      AND us.expires_at > now()
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- This function gets user's subscription details
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_id uuid)
RETURNS TABLE (
  subscription_id uuid,
  plan_code text,
  plan_name text,
  status text,
  starts_at timestamptz,
  expires_at timestamptz,
  days_remaining integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    sp.plan_code,
    sp.name,
    us.status,
    us.starts_at,
    us.expires_at,
    GREATEST(0, EXTRACT(EPOCH FROM (us.expires_at - now())) / 86400)::integer as days_remaining
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = $1 
  AND us.status = 'active' 
  AND us.expires_at > now()
  ORDER BY us.expires_at DESC
  LIMIT 1;
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty result on error
    RETURN;
END;
$$;

-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_subscription(uuid) TO authenticated;

-- Ensure default subscription plans exist
INSERT INTO public.subscription_plans (plan_code, name, description, price, duration_days, features) 
VALUES
('pro_monthly', 'Pro Monthly', 'Access to premium features for 1 month', 999, 30, '["premium_downloads", "advanced_tools", "exclusive_resources", "priority_support"]'),
('pro_yearly', 'Pro Yearly', 'Access to premium features for 1 year (Save 20%)', 9999, 365, '["premium_downloads", "advanced_tools", "exclusive_resources", "priority_support", "early_access"]'),
('premium_monthly', 'Premium Monthly', 'Full access to all features for 1 month', 1499, 30, '["all_pro_features", "unlimited_downloads", "custom_analytics", "api_access"]'),
('premium_yearly', 'Premium Yearly', 'Full access to all features for 1 year (Save 25%)', 13499, 365, '["all_pro_features", "unlimited_downloads", "custom_analytics", "api_access", "dedicated_support"]')
ON CONFLICT (plan_code) DO NOTHING;
