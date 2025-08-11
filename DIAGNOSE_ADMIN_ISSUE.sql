-- DIAGNOSE ADMIN PANEL ISSUE
-- Run this to identify the exact problem with the admin panel

-- ===========================================
-- STEP 1: Check users table structure
-- ===========================================

SELECT '=== USERS TABLE STRUCTURE ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name = 'is_admin' THEN '⚠️ CRITICAL - This column is missing!'
        WHEN column_name = 'role' THEN '⚠️ CRITICAL - This column is missing!'
        ELSE '✅ OK'
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- ===========================================
-- STEP 2: Check if users table exists
-- ===========================================

SELECT '=== USERS TABLE EXISTENCE ===' as info;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
        ) THEN '✅ Users table exists'
        ELSE '❌ Users table does NOT exist'
    END as status;

-- ===========================================
-- STEP 3: Check is_admin function
-- ===========================================

SELECT '=== IS_ADMIN FUNCTION ===' as info;

SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name = 'is_admin' THEN '✅ Function exists'
        ELSE '❌ Function missing'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'is_admin';

-- ===========================================
-- STEP 4: Test is_admin function
-- ===========================================

SELECT '=== TESTING IS_ADMIN FUNCTION ===' as info;

-- Try to call the function (this will show the actual error)
DO $$
BEGIN
    -- This will fail if there are issues
    PERFORM is_admin('00000000-0000-0000-0000-000000000000');
    RAISE NOTICE '✅ is_admin function works correctly';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ is_admin function error: %', SQLERRM;
END $$;

-- ===========================================
-- STEP 5: Check RLS policies
-- ===========================================

SELECT '=== RLS POLICIES ===' as info;

SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN qual LIKE '%is_admin%' THEN '⚠️ Uses is_admin function'
        ELSE '✅ Standard policy'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%is_admin%' OR policyname LIKE '%admin%');

-- ===========================================
-- STEP 6: Check current user data
-- ===========================================

SELECT '=== CURRENT USER DATA ===' as info;

-- Try to select from users table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.users LIMIT 1) THEN
        RAISE NOTICE '✅ Users table is accessible';
        
        -- Show sample data
        RAISE NOTICE 'Sample users:';
        FOR r IN SELECT id, email, role, is_admin FROM public.users LIMIT 3 LOOP
            RAISE NOTICE 'User: % | Email: % | Role: % | is_admin: %', r.id, r.email, r.role, r.is_admin;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ Users table is empty or not accessible';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error accessing users table: %', SQLERRM;
END $$;

-- ===========================================
-- STEP 7: Summary and recommendations
-- ===========================================

SELECT '=== SUMMARY AND RECOMMENDATIONS ===' as info;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'users' 
            AND column_name = 'is_admin'
        ) THEN '✅ is_admin column exists'
        ELSE '❌ is_admin column MISSING - Run FIX_ADMIN_COLUMN_ISSUE.sql'
    END as recommendation_1;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name = 'is_admin'
        ) THEN '✅ is_admin function exists'
        ELSE '❌ is_admin function MISSING - Run COMPLETE_ADMIN_PANEL_FIX.sql'
    END as recommendation_2;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
        ) THEN '✅ Users table exists'
        ELSE '❌ Users table MISSING - Run COMPLETE_ADMIN_PANEL_FIX.sql'
    END as recommendation_3;

SELECT '=== DIAGNOSIS COMPLETE ===' as info;
