-- COMPLETE FIX: Stop Automatic Premium Users and Set Up Proper System
-- Run this in your Supabase SQL Editor to fix the issue completely

-- ===========================================
-- STEP 1: EMERGENCY STOP - Remove Problematic System
-- ===========================================

-- Check current state
SELECT 'Current premium users:' as info, COUNT(*) as count FROM premium_subscriptions WHERE status = 'active';

-- IMMEDIATELY remove the problematic table and function
DROP TABLE IF EXISTS public.premium_subscriptions CASCADE;
DROP FUNCTION IF EXISTS public.is_premium_user(uuid);

-- ===========================================
-- STEP 2: Set Up Proper Subscription System
-- ===========================================

-- Create subscription plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan_code TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NPR',
  duration_days INTEGER NOT NULL,
  features JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'expired', 'cancelled')),
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_request_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, plan_id)
);

-- ===========================================
-- STEP 3: Create Proper Premium Check Function
-- ===========================================

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
      AND (sp.plan_code = 'pro' OR sp.plan_code = 'premium')
      AND us.expires_at > now()
  );
END;
$$;

-- ===========================================
-- STEP 4: Set Up Wallet Management (One Wallet Per User)
-- ===========================================

-- Ensure seller_wallets table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.seller_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  esewa_id TEXT,
  total_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_withdrawals NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

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
-- STEP 5: Update User Creation Function
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
-- STEP 6: Insert Default Subscription Plans
-- ===========================================

-- Insert basic subscription plans
INSERT INTO public.subscription_plans (name, plan_code, description, price, currency, duration_days, features, is_active)
VALUES 
  ('Basic Plan', 'basic', 'Basic access to study materials', 0, 'NPR', 365, '{"uploads": 5, "downloads": 10}', true),
  ('Pro Plan', 'pro', 'Premium access with unlimited uploads and downloads', 999, 'NPR', 365, '{"uploads": "unlimited", "downloads": "unlimited", "priority_support": true}', true),
  ('Premium Plan', 'premium', 'Ultimate access with all features', 1999, 'NPR', 365, '{"uploads": "unlimited", "downloads": "unlimited", "priority_support": true, "advanced_features": true}', true)
ON CONFLICT (plan_code) DO NOTHING;

-- ===========================================
-- STEP 7: Enable RLS and Set Policies
-- ===========================================

-- Enable RLS on new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;

-- Basic policies (you can customize these)
CREATE POLICY "Subscription plans are viewable by everyone" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own wallet" ON public.seller_wallets FOR SELECT USING (auth.uid() = user_id);

-- ===========================================
-- STEP 8: Verify the Fix
-- ===========================================

-- Test that new users are NOT premium
SELECT 'Test function result:' as info, public.is_premium_user('00000000-0000-0000-0000-000000000000'::uuid) as is_premium;

-- Check current tables
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

-- Check subscription plans
SELECT 'Available plans:' as info, COUNT(*) as count FROM public.subscription_plans;

-- Check current users
SELECT 'Total users:' as info, COUNT(*) as count FROM auth.users;

-- ===========================================
-- STEP 9: Clean Up Any Existing Premium Users
-- ===========================================

-- This will remove any existing premium status from users
-- (Only run this if you want to reset all users to non-premium)
-- UPDATE public.user_subscriptions SET status = 'inactive' WHERE status = 'active';

-- ===========================================
-- SUMMARY OF WHAT THIS FIX DOES:
-- ===========================================
-- ✅ Removes the problematic premium_subscriptions table
-- ✅ Creates a proper subscription system with user_subscriptions + subscription_plans
-- ✅ Ensures one wallet per user with automatic creation
-- ✅ New users will NOT be premium by default
-- ✅ Premium status only comes from actual subscriptions
-- ✅ Proper RLS policies for security
