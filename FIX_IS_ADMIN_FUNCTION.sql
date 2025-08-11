-- FIX FOR is_admin FUNCTION - Run this in Supabase SQL Editor

-- Drop the existing function
DROP FUNCTION IF EXISTS public.is_admin(text);

-- Create the correct function with UUID parameter
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- Test the function
SELECT is_admin((SELECT id FROM auth.users WHERE email = 'sajanpoudel970@gmail.com'));

-- Verify your user is admin
SELECT id, email, role, created_at, updated_at 
FROM public.users 
WHERE email = 'sajanpoudel970@gmail.com';
