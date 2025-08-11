-- DIAGNOSE PREMIUM ISSUE: Find what's causing automatic premium assignment
-- Run this in your Supabase SQL Editor to identify the root cause

-- ===========================================
-- STEP 1: Check All Premium-Related Tables
-- ===========================================

SELECT 
  'Premium-related tables:' as info,
  table_name,
  CASE 
    WHEN table_name = 'premium_subscriptions' THEN 'PROBLEM - This should be removed'
    WHEN table_name IN ('user_subscriptions', 'subscription_plans') THEN 'OK - New system'
    ELSE 'Unknown table'
  END as status
FROM information_schema.tables
WHERE table_name LIKE '%premium%' OR table_name LIKE '%subscription%'
ORDER BY table_name;

-- ===========================================
-- STEP 2: Check All Functions Related to Premium
-- ===========================================

SELECT 
  'Premium-related functions:' as info,
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name LIKE '%premium%' OR routine_name LIKE '%subscription%'
ORDER BY routine_name;

-- ===========================================
-- STEP 3: Check All Triggers That Might Affect Users
-- ===========================================

SELECT 
  'Triggers on user-related tables:' as info,
  trigger_name,
  event_object_table,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('users', 'auth.users', 'premium_subscriptions', 'user_subscriptions')
ORDER BY event_object_table, trigger_name;

-- ===========================================
-- STEP 4: Check Default Values in Tables
-- ===========================================

SELECT 
  'Default values in premium tables:' as info,
  table_name,
  column_name,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('premium_subscriptions', 'user_subscriptions')
  AND column_default IS NOT NULL
ORDER BY table_name, ordinal_position;

-- ===========================================
-- STEP 5: Check Current Premium Users
-- ===========================================

-- Check old premium system
SELECT 
  'Old premium system users:' as info,
  COUNT(*) as count
FROM premium_subscriptions
WHERE status = 'active';

-- Check new subscription system
SELECT 
  'New subscription system users:' as info,
  COUNT(*) as count
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active'
  AND (sp.plan_code = 'pro' OR sp.plan_code = 'premium');

-- ===========================================
-- STEP 6: Check Recent User Creation
-- ===========================================

SELECT 
  'Recent users created:' as info,
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ===========================================
-- STEP 7: Check if handle_new_user Function Exists
-- ===========================================

SELECT 
  'handle_new_user function:' as info,
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- ===========================================
-- STEP 8: Check RLS Policies
-- ===========================================

SELECT 
  'RLS policies on premium tables:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('premium_subscriptions', 'user_subscriptions', 'subscription_plans')
ORDER BY tablename, policyname;

-- ===========================================
-- STEP 9: Test Current is_premium_user Function
-- ===========================================

-- Test with a dummy user ID
SELECT 
  'Test is_premium_user function:' as info,
  public.is_premium_user('00000000-0000-0000-0000-000000000000'::uuid) as result;

-- ===========================================
-- SUMMARY
-- ===========================================
-- This script shows you exactly what's causing the automatic premium assignment
-- Look for:
-- 1. premium_subscriptions table still existing
-- 2. Triggers on user creation that insert into premium_subscriptions
-- 3. Default values in premium_subscriptions that auto-assign status
-- 4. Functions that automatically create premium subscriptions
