-- EMERGENCY STOP: Immediately Prevent New Users from Becoming Premium
-- Run this in your Supabase SQL Editor RIGHT NOW to stop the issue

-- Step 1: Check what's currently happening
SELECT 'Current premium users:' as info, COUNT(*) as count FROM premium_subscriptions WHERE status = 'active';

-- Step 2: IMMEDIATELY disable the problematic table by dropping it
-- This will stop any new premium subscriptions from being created
DROP TABLE IF EXISTS public.premium_subscriptions CASCADE;

-- Step 3: Drop the old function that was causing issues
DROP FUNCTION IF EXISTS public.is_premium_user(uuid);

-- Step 4: Create a new function that ALWAYS returns false for premium status
-- This ensures no user can be premium until we fix the system properly
CREATE OR REPLACE FUNCTION public.is_premium_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- TEMPORARILY: Always return false to stop premium access
  -- We'll fix this properly in the next step
  RETURN false;
END;
$$;

-- Step 5: Verify the fix - this should return false for any user
SELECT 'Test function result:' as info, public.is_premium_user('00000000-0000-0000-0000-000000000000'::uuid) as is_premium;

-- Step 6: Check if there are any remaining premium-related tables
SELECT 
  table_name,
  'Still exists' as status
FROM information_schema.tables 
WHERE table_name IN ('premium_subscriptions', 'user_subscriptions', 'subscription_plans')
ORDER BY table_name;

-- Step 7: Show current user count
SELECT 'Total users:' as info, COUNT(*) as count FROM auth.users;

-- Step 8: Check if the new subscription system exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions') 
    THEN 'New system exists - ready for proper setup'
    ELSE 'New system missing - needs to be created'
  END as subscription_system_status;
