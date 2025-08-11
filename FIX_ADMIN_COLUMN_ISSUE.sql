-- Fix for missing is_admin column issue
-- This script resolves the "column 'is_admin' does not exist" error

-- First, check if the is_admin column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'is_admin'
    ) THEN
        -- Add the missing is_admin column
        ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
        
        -- Update existing users to set is_admin based on their role
        UPDATE public.users SET is_admin = (role = 'admin') WHERE is_admin IS NULL;
        
        RAISE NOTICE 'Added is_admin column to users table';
    ELSE
        RAISE NOTICE 'is_admin column already exists in users table';
    END IF;
END $$;

-- Ensure the is_admin function exists and works correctly
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Check if user has admin role
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = user_id 
    AND role = 'admin'
  );
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Verify the fix
SELECT 
    'Users table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Test the is_admin function
SELECT 
    'Testing is_admin function:' as info,
    id,
    email,
    role,
    is_admin,
    is_admin(id) as function_result
FROM public.users 
LIMIT 5;

-- Check RLS policies that use is_admin function
SELECT 
    'RLS policies using is_admin:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE qual LIKE '%is_admin%'
OR policyname LIKE '%admin%';

SELECT 'Admin column issue fix completed! ✅' as status;
