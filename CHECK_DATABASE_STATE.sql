-- CHECK DATABASE STATE: See what's currently in your database
-- Run this first to understand your current setup

-- ===========================================
-- STEP 1: Check Table Existence
-- ===========================================

SELECT 
  'Table Status' as info,
  table_name,
  CASE 
    WHEN table_name = 'premium_subscriptions' THEN 'REMOVED - Good!'
    WHEN table_name IN ('user_subscriptions', 'subscription_plans') THEN 'EXISTS - Good!'
    WHEN table_name = 'seller_wallets' THEN 'EXISTS - Good!'
    ELSE 'Status unknown'
  END as status
FROM information_schema.tables
WHERE table_name IN ('premium_subscriptions', 'user_subscriptions', 'subscription_plans', 'seller_wallets')
ORDER BY table_name;

-- ===========================================
-- STEP 2: Check Table Structures
-- ===========================================

-- Check subscription_plans structure
SELECT 
  'subscription_plans columns:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'subscription_plans'
ORDER BY ordinal_position;

-- Check user_subscriptions structure
SELECT 
  'user_subscriptions columns:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- Check seller_wallets structure (if exists)
SELECT 
  'seller_wallets columns:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'seller_wallets'
ORDER BY ordinal_position;

-- ===========================================
-- STEP 3: Check Function Existence
-- ===========================================

SELECT 
  'Function Status' as info,
  routine_name,
  routine_type,
  CASE 
    WHEN routine_name = 'is_premium_user' THEN 'NEEDS UPDATE'
    WHEN routine_name = 'get_or_create_user_wallet' THEN 'NEEDS CREATE'
    WHEN routine_name = 'handle_new_user' THEN 'NEEDS UPDATE'
    ELSE 'Status unknown'
  END as status
FROM information_schema.routines
WHERE routine_name IN ('is_premium_user', 'get_or_create_user_wallet', 'handle_new_user')
ORDER BY routine_name;

-- ===========================================
-- STEP 4: Check Current Data
-- ===========================================

-- Check subscription plans
SELECT 
  'Current subscription plans:' as info,
  COUNT(*) as count
FROM subscription_plans;

-- Check user subscriptions
SELECT 
  'Current user subscriptions:' as info,
  COUNT(*) as count
FROM user_subscriptions;

-- Check wallets
SELECT 
  'Current wallets:' as info,
  COUNT(*) as count
FROM seller_wallets;

-- Check for duplicate wallets
SELECT 
  'Duplicate wallets check:' as info,
  user_id,
  COUNT(*) as wallet_count
FROM seller_wallets
GROUP BY user_id
HAVING COUNT(*) > 1;

-- ===========================================
-- STEP 5: Check User Counts
-- ===========================================

SELECT 
  'Total users:' as info,
  COUNT(*) as count
FROM auth.users;

-- ===========================================
-- SUMMARY
-- ===========================================
-- This script shows you the current state of your database
-- Run CORRECTED_FIX.sql after this to fix the issues
