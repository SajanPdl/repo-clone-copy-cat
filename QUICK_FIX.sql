-- QUICK FIX FOR ADMIN PANEL - Run this in Supabase SQL Editor

-- 1. Create missing is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_admin(text) TO authenticated;

-- 2. Create missing tables
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.merch_store (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Fix RLS policies on users table
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = auth.uid());

-- 4. Make your user admin
INSERT INTO public.users (id, email, role, created_at, updated_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'sajanpoudel970@gmail.com'),
  'sajanpoudel970@gmail.com',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (id) 
DO UPDATE SET role = 'admin', updated_at = NOW();

-- 5. Test admin function
SELECT is_admin((SELECT id FROM auth.users WHERE email = 'sajanpoudel970@gmail.com'));
