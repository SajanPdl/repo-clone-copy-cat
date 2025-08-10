-- Clean up old premium subscription system and fix wallet management
-- This migration removes the deprecated premium_subscriptions table and related functions
-- to ensure only the new subscription system (user_subscriptions + subscription_plans) is used
-- Also fixes wallet management to ensure one wallet per user

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
    SELECT 1
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = is_premium_user.user_id
      AND us.status = 'active'
      AND (sp.plan_code = 'pro' OR sp.plan_code = 'premium')
  );
END;
$$;

-- Create a new function to get user subscription details using the new subscription system
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  plan_id uuid,
  status text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  plan_name text,
  plan_code text,
  plan_price numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    us.id,
    us.user_id,
    us.plan_id,
    us.status,
    us.start_date,
    us.end_date,
    us.created_at,
    us.updated_at,
    sp.name AS plan_name,
    sp.plan_code AS plan_code,
    sp.price AS plan_price
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = get_user_subscription.user_id
    AND us.status = 'active'
  LIMIT 1;
END;
$$;

-- Fix wallet management: Ensure one wallet per user and auto-create wallets
-- First, clean up any duplicate wallets (keep the one with the highest balance)
DELETE FROM public.seller_wallets 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.seller_wallets
  ORDER BY user_id, balance DESC, created_at DESC
);

-- Add unique constraint to ensure one wallet per user
ALTER TABLE public.seller_wallets 
ADD CONSTRAINT unique_user_wallet UNIQUE (user_id);

-- Update the handle_new_user function to also create a wallet
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Create user record
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  
  -- Create wallet for the new user
  INSERT INTO public.seller_wallets (user_id, balance, esewa_id, total_earnings, total_withdrawals)
  VALUES (new.id, 0, NULL, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Create a function to get or create user wallet
CREATE OR REPLACE FUNCTION public.get_or_create_user_wallet(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  wallet_id uuid;
BEGIN
  -- Try to get existing wallet
  SELECT id INTO wallet_id
  FROM public.seller_wallets
  WHERE user_id = get_or_create_user_wallet.user_id;
  
  -- If no wallet exists, create one
  IF wallet_id IS NULL THEN
    INSERT INTO public.seller_wallets (user_id, balance, esewa_id, total_earnings, total_withdrawals)
    VALUES (get_or_create_user_wallet.user_id, 0, NULL, 0, 0)
    RETURNING id INTO wallet_id;
  END IF;
  
  RETURN wallet_id;
END;
$$;

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
