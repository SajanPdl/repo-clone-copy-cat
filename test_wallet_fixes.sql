-- Test script for wallet management fixes
-- This script tests the key functions without running the full migration

-- Test 1: Check if the get_or_create_user_wallet function exists
SELECT 
  routine_name, 
  routine_type, 
  data_type 
FROM information_schema.routines 
WHERE routine_name = 'get_or_create_user_wallet';

-- Test 2: Check if the is_premium_user function exists and uses the new system
SELECT 
  routine_name, 
  routine_type, 
  data_type 
FROM information_schema.routines 
WHERE routine_name = 'is_premium_user';

-- Test 3: Check current wallet structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'seller_wallets'
ORDER BY ordinal_position;

-- Test 4: Check for any duplicate wallets (should be 0 after fix)
SELECT 
  user_id,
  COUNT(*) as wallet_count
FROM seller_wallets
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Test 5: Check if unique constraint exists on user_id
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'seller_wallets' 
  AND constraint_type = 'UNIQUE';

-- Test 6: Check current premium subscriptions (should be empty after cleanup)
SELECT COUNT(*) as old_premium_count FROM premium_subscriptions;

-- Test 7: Check new subscription system
SELECT 
  'user_subscriptions' as table_name,
  COUNT(*) as record_count
FROM user_subscriptions
UNION ALL
SELECT 
  'subscription_plans' as table_name,
  COUNT(*) as record_count
FROM subscription_plans;
