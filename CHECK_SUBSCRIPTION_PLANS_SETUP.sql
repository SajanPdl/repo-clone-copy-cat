-- CHECK SUBSCRIPTION PLANS SETUP
-- Run this to diagnose what's missing

-- ===========================================
-- STEP 1: Check if tables exist
-- ===========================================

SELECT 'Tables Check:' as info;
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('subscription_plans', 'user_subscriptions', 'payment_requests') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscription_plans', 'user_subscriptions', 'payment_requests');

-- ===========================================
-- STEP 2: Check if functions exist
-- ===========================================

SELECT 'Functions Check:' as info;
SELECT 
    routine_name,
    CASE 
        WHEN routine_name IN ('get_all_subscription_plans', 'get_subscription_plan_stats', 'create_subscription_plan', 'update_subscription_plan', 'delete_subscription_plan') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_all_subscription_plans', 'get_subscription_plan_stats', 'create_subscription_plan', 'update_subscription_plan', 'delete_subscription_plan');

-- ===========================================
-- STEP 3: Check subscription plans data
-- ===========================================

SELECT 'Subscription Plans Data:' as info;
SELECT 
    COUNT(*) as total_plans,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_plans
FROM public.subscription_plans;

-- ===========================================
-- STEP 4: Check if is_admin function exists
-- ===========================================

SELECT 'Admin Function Check:' as info;
SELECT 
    routine_name,
    CASE 
        WHEN routine_name = 'is_admin' 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'is_admin';

-- ===========================================
-- STEP 5: Test admin function
-- ===========================================

SELECT 'Admin Function Test:' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'is_admin') 
        THEN public.is_admin('00000000-0000-0000-0000-000000000000'::uuid)
        ELSE 'Function does not exist'
    END as admin_test_result;
