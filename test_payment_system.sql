-- Test Payment System Setup
-- Run this in your Supabase SQL editor to verify everything is working

-- 1. Check if tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payment_requests', 'subscription_plans', 'user_subscriptions')
ORDER BY table_name;

-- 2. Check if functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('has_active_subscription', 'get_user_subscription', 'approve_payment_and_create_subscription', 'reject_payment')
ORDER BY routine_name;

-- 3. Check subscription plans
SELECT 
  plan_code,
  name,
  price,
  currency,
  duration_days,
  is_active
FROM public.subscription_plans
ORDER BY price;

-- 4. Check storage bucket
SELECT 
  id,
  name,
  public
FROM storage.buckets 
WHERE id = 'payment-receipts';

-- 5. Test the get_user_subscription function (replace with a real user ID)
-- SELECT * FROM public.get_user_subscription('your-user-id-here');

-- 6. Check RLS policies
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
WHERE schemaname = 'public' 
AND tablename IN ('payment_requests', 'subscription_plans', 'user_subscriptions')
ORDER BY tablename, policyname;
