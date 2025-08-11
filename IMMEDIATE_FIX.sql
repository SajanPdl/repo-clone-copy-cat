-- IMMEDIATE FIX: Stop New Users from Automatically Becoming Premium
-- Run this in your Supabase SQL Editor to fix the issue immediately

-- Step 1: Check current state
SELECT 'Current premium_subscriptions count:' as info, COUNT(*) as count FROM premium_subscriptions;

-- Step 2: Drop the problematic function that might be causing automatic premium assignment
DROP FUNCTION IF EXISTS public.is_premium_user(uuid);

-- Step 3: Create a new function that ONLY checks the new subscription system
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
  );
END;
$$;

-- Step 4: Check if there are any triggers or default values causing automatic premium assignment
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'premium_subscriptions';

-- Step 5: Check if there are any RLS policies that might be causing issues
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'premium_subscriptions';

-- Step 6: Verify the fix - this should return false for new users
-- (Replace 'your-test-user-id' with an actual user ID to test)
-- SELECT public.is_premium_user('your-test-user-id'::uuid);

-- Step 7: Check current premium users to see who was automatically assigned
SELECT 
  'Users with old premium subscriptions:' as info,
  COUNT(*) as count
FROM premium_subscriptions;

-- Step 8: Show what's in the old premium_subscriptions table
SELECT 
  user_id,
  plan_type,
  status,
  expires_at,
  created_at
FROM premium_subscriptions
ORDER BY created_at DESC
LIMIT 10;

-- Step 9: Check the new subscription system
SELECT 
  'New subscription system status:' as info,
  COUNT(*) as user_subscriptions_count
FROM user_subscriptions;

SELECT 
  'Subscription plans available:' as info,
  COUNT(*) as plans_count
FROM subscription_plans;
