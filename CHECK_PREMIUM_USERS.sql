-- CHECK PREMIUM USERS: Comprehensive Diagnostic
-- Run this in your Supabase SQL Editor to understand how users are getting premium status

-- ===========================================
-- STEP 1: Check All Possible Premium Sources
-- ===========================================

-- Check if old premium_subscriptions table still exists
SELECT 
  'Old premium_subscriptions table:' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'premium_subscriptions') 
    THEN 'EXISTS - This is the problem!'
    ELSE 'REMOVED - Good!'
  END as status;

-- Check current premium users in old system (if table exists)
SELECT 
  'Users in old premium system:' as info,
  COUNT(*) as count
FROM premium_subscriptions 
WHERE status = 'active';

-- Check new subscription system
SELECT 
  'Users in new subscription system:' as info,
  COUNT(*) as count
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active'
  AND (sp.plan_code LIKE 'pro_%' OR sp.plan_code LIKE 'premium_%');

-- ===========================================
-- STEP 2: Check Recent User Activity
-- ===========================================

-- Show recent users and their premium status
SELECT 
  'Recent users and premium status:' as info,
  u.id,
  u.email,
  u.created_at,
  CASE 
    WHEN EXISTS (SELECT 1 FROM premium_subscriptions ps WHERE ps.user_id = u.id AND ps.status = 'active') 
    THEN 'Premium (old system)'
    WHEN EXISTS (
      SELECT 1 FROM user_subscriptions us 
      JOIN subscription_plans sp ON us.plan_id = sp.id 
      WHERE us.user_id = u.id 
        AND us.status = 'active' 
        AND (sp.plan_code LIKE 'pro_%' OR sp.plan_code LIKE 'premium_%')
    ) 
    THEN 'Premium (new system)'
    ELSE 'Not Premium'
  END as premium_status
FROM auth.users u
ORDER BY u.created_at DESC
LIMIT 10;

-- ===========================================
-- STEP 3: Check Database Triggers
-- ===========================================

-- Check for any triggers that might auto-assign premium status
SELECT 
  'Triggers that might affect premium status:' as info,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('premium_subscriptions', 'user_subscriptions', 'users')
  OR action_statement LIKE '%premium%'
  OR action_statement LIKE '%subscription%';

-- ===========================================
-- STEP 4: Check RLS Policies
-- ===========================================

-- Check RLS policies that might affect premium access
SELECT 
  'RLS policies on premium-related tables:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('premium_subscriptions', 'user_subscriptions', 'subscription_plans', 'users')
ORDER BY tablename, policyname;

-- ===========================================
-- STEP 5: Check Functions and Their Logic
-- ===========================================

-- Check current is_premium_user function definition
SELECT 
  'Current is_premium_user function:' as info,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'is_premium_user';

-- Check handle_new_user function (if it exists)
SELECT 
  'handle_new_user function:' as info,
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- ===========================================
-- STEP 6: Test Premium Status for Specific Users
-- ===========================================

-- Test the function with a dummy user
SELECT 
  'Test is_premium_user with dummy user:' as info,
  public.is_premium_user('00000000-0000-0000-0000-000000000000'::uuid) as result;

-- Test with actual recent users (replace with actual user IDs if needed)
-- SELECT 
--   'Test with actual user:' as info,
--   u.email,
--   public.is_premium_user(u.id) as is_premium
-- FROM auth.users u
-- ORDER BY u.created_at DESC
-- LIMIT 5;

-- ===========================================
-- STEP 7: Check for Manual Premium Assignments
-- ===========================================

-- Check if there are any manual entries in subscription tables
SELECT 
  'Manual premium assignments in old system:' as info,
  ps.user_id,
  ps.plan_type,
  ps.status,
  ps.created_at,
  u.email
FROM premium_subscriptions ps
JOIN auth.users u ON ps.user_id = u.id
WHERE ps.status = 'active'
ORDER BY ps.created_at DESC;

-- Check manual assignments in new system
SELECT 
  'Manual premium assignments in new system:' as info,
  us.user_id,
  sp.plan_code,
  us.status,
  us.created_at,
  u.email
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
JOIN auth.users u ON us.user_id = u.id
WHERE us.status = 'active'
  AND (sp.plan_code LIKE 'pro_%' OR sp.plan_code LIKE 'premium_%')
ORDER BY us.created_at DESC;

-- ===========================================
-- STEP 8: Check for Default Values
-- ===========================================

-- Check if any tables have default values that might cause premium status
SELECT 
  'Default values that might affect premium:' as info,
  table_name,
  column_name,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE (table_name = 'premium_subscriptions' OR table_name = 'user_subscriptions')
  AND column_default IS NOT NULL
ORDER BY table_name, column_name;

-- ===========================================
-- SUMMARY
-- ===========================================

SELECT 'DIAGNOSTIC COMPLETE' as info, 'Check results above to identify premium source' as message;
