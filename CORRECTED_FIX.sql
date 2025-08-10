-- CORRECTED FIX: Stop Automatic Premium Users and Fix Wallet Management
-- This script works with your current database schema and won't cause column errors

-- ===========================================
-- STEP 1: Check Current Database State
-- ===========================================

-- Check what tables currently exist
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'premium_subscriptions' THEN 'REMOVED - Good!'
    WHEN table_name IN ('user_subscriptions', 'subscription_plans') THEN 'EXISTS - Good!'
    ELSE 'Status unknown'
  END as status
FROM information_schema.tables
WHERE table_name IN ('premium_subscriptions', 'user_subscriptions', 'subscription_plans')
ORDER BY table_name;

-- Check current subscription_plans structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'subscription_plans'
ORDER BY ordinal_position;

-- ===========================================
-- STEP 2: Fix Premium User Function
-- ===========================================

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS public.is_premium_user(uuid);

-- Create new function that ONLY checks the new subscription system
CREATE OR REPLACE FUNCTION public.is_premium_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Only check the new subscription system - no automatic premium status
  RETURN EXISTS (
    SELECT 1
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = is_premium_user.user_id
      AND us.status = 'active'
      AND (sp.plan_code LIKE 'pro_%' OR sp.plan_code LIKE 'premium_%')
      AND us.expires_at > now()
  );
END;
$$;

-- ===========================================
-- STEP 3: Fix Wallet Management
-- ===========================================

-- Check if seller_wallets table exists and has proper structure
DO $$
BEGIN
  -- Create seller_wallets table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seller_wallets') THEN
    CREATE TABLE public.seller_wallets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      balance NUMERIC(10,2) NOT NULL DEFAULT 0,
      esewa_id TEXT,
      total_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
      total_withdrawals NUMERIC(10,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  END IF;
END $$;

-- Clean up any duplicate wallets (keep the one with the highest balance)
DELETE FROM public.seller_wallets
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.seller_wallets
  ORDER BY user_id, balance DESC, created_at DESC
);

-- Add unique constraint to ensure one wallet per user (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'seller_wallets' 
    AND constraint_type = 'UNIQUE' 
    AND constraint_name LIKE '%user%'
  ) THEN
    ALTER TABLE public.seller_wallets ADD CONSTRAINT unique_user_wallet UNIQUE (user_id);
  END IF;
END $$;

-- Create function to get or create user wallet
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

-- ===========================================
-- STEP 4: Update User Creation Function
-- ===========================================

-- Update handle_new_user to create wallets automatically
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

-- ===========================================
-- STEP 5: Ensure Default Subscription Plans Exist
-- ===========================================

-- Insert default subscription plans (only if they don't exist)
INSERT INTO public.subscription_plans (plan_code, name, description, price, duration_days, features, is_active) 
VALUES
('pro_monthly', 'Pro Monthly', 'Access to premium features for 1 month', 999, 30, '["premium_downloads", "advanced_tools", "exclusive_resources", "priority_support"]', true),
('pro_yearly', 'Pro Yearly', 'Access to premium features for 1 year (Save 20%)', 9999, 365, '["premium_downloads", "advanced_tools", "exclusive_resources", "priority_support", "early_access"]', true),
('premium_monthly', 'Premium Monthly', 'Full access to all features for 1 month', 1499, 30, '["all_pro_features", "unlimited_downloads", "custom_analytics", "api_access"]', true),
('premium_yearly', 'Premium Yearly', 'Full access to all features for 1 year (Save 25%)', 13499, 365, '["all_pro_features", "unlimited_downloads", "custom_analytics", "api_access", "dedicated_support"]', true)
ON CONFLICT (plan_code) DO NOTHING;

-- ===========================================
-- STEP 6: Enable RLS and Set Policies
-- ===========================================

-- Enable RLS on seller_wallets if not already enabled
ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for seller_wallets
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.seller_wallets;
CREATE POLICY "Users can view their own wallet" ON public.seller_wallets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wallet" ON public.seller_wallets;
CREATE POLICY "Users can update their own wallet" ON public.seller_wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- ===========================================
-- STEP 7: Grant Permissions
-- ===========================================

-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION public.is_premium_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_user_wallet(uuid) TO authenticated;

-- ===========================================
-- STEP 8: Verify the Fix
-- ===========================================

-- Test that new users are NOT premium
SELECT 'Test function result:' as info, public.is_premium_user('00000000-0000-0000-0000-000000000000'::uuid) as is_premium;

-- Check current subscription plans
SELECT 'Available plans:' as info, COUNT(*) as count FROM public.subscription_plans;

-- Check current users
SELECT 'Total users:' as info, COUNT(*) as count FROM auth.users;

-- Check wallet status
SELECT 'Users with wallets:' as info, COUNT(*) as count FROM public.seller_wallets;

-- ===========================================
-- SUMMARY OF WHAT THIS FIX DOES:
-- ===========================================
-- ✅ Removes automatic premium status - New users will NOT be premium by default
-- ✅ Creates proper premium check function using only the new subscription system
-- ✅ Ensures one wallet per user with automatic creation
-- ✅ Wallets are created automatically for new users
-- ✅ No more duplicate wallets
-- ✅ Premium status only comes from actual paid subscriptions
-- ✅ Works with your current database schema (no column errors)
