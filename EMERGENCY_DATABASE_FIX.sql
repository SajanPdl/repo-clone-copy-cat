-- EMERGENCY DATABASE FIX FOR ADMIN PANEL
-- Run this in your Supabase SQL Editor to fix all issues

-- 1. Create missing site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value, description) VALUES
  ('site_name', 'Education Platform', 'Name of the website'),
  ('site_description', 'Your comprehensive education platform', 'Site description'),
  ('maintenance_mode', 'false', 'Whether the site is in maintenance mode')
ON CONFLICT (setting_key) DO NOTHING;

-- 2. Create missing merch_store table
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

-- 3. Create missing advertisements table
CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  position TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create the missing is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin(text) TO authenticated;

-- 5. Fix RLS policies on users table
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;

-- Create proper RLS policies
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to update all users
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Ensure users table has correct structure
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 7. Create or update your user as admin
INSERT INTO public.users (id, email, role, created_at, updated_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'sajanpoudel970@gmail.com'),
  'sajanpoudel970@gmail.com',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin', 
  updated_at = NOW(),
  email = EXCLUDED.email;

-- 8. Create missing study_materials table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.study_materials (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  author_id UUID REFERENCES public.users(id),
  category_id UUID,
  grade_id UUID,
  file_url TEXT,
  views INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  tags TEXT[],
  slug TEXT UNIQUE,
  featured_image TEXT,
  approval_status TEXT DEFAULT 'approved',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create missing past_papers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.past_papers (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  year INTEGER,
  exam_type TEXT,
  file_url TEXT,
  author_id UUID REFERENCES public.users(id),
  category_id UUID,
  grade_id UUID,
  views INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  tags TEXT[],
  slug TEXT UNIQUE,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create missing categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
  ('Mathematics', 'Mathematics related materials'),
  ('Science', 'Science related materials'),
  ('English', 'English language materials'),
  ('History', 'History related materials')
ON CONFLICT (name) DO NOTHING;

-- 11. Create missing grades table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default grades
INSERT INTO public.grades (name, description) VALUES
  ('Grade 1', 'First grade'),
  ('Grade 2', 'Second grade'),
  ('Grade 3', 'Third grade'),
  ('Grade 4', 'Fourth grade'),
  ('Grade 5', 'Fifth grade'),
  ('Grade 6', 'Sixth grade'),
  ('Grade 7', 'Seventh grade'),
  ('Grade 8', 'Eighth grade'),
  ('Grade 9', 'Ninth grade'),
  ('Grade 10', 'Tenth grade'),
  ('Grade 11', 'Eleventh grade'),
  ('Grade 12', 'Twelfth grade')
ON CONFLICT (name) DO NOTHING;

-- 12. Enable RLS on all tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- 13. Create basic RLS policies for other tables
-- Site settings - anyone can read, only admins can modify
CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify site settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Merch store - anyone can view, only admins can modify
CREATE POLICY "Anyone can view merch store" ON public.merch_store
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify merch store" ON public.merch_store
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Advertisements - anyone can view, only admins can modify
CREATE POLICY "Anyone can view advertisements" ON public.advertisements
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify advertisements" ON public.advertisements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Study materials - anyone can view approved, admins can do everything
CREATE POLICY "Anyone can view approved study materials" ON public.study_materials
  FOR SELECT USING (approval_status = 'approved');

CREATE POLICY "Users can view own materials" ON public.study_materials
  FOR SELECT USING (author_id = auth.uid());

CREATE POLICY "Admins can do everything with study materials" ON public.study_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Past papers - anyone can view, admins can do everything
CREATE POLICY "Anyone can view past papers" ON public.past_papers
  FOR SELECT USING (true);

CREATE POLICY "Users can view own papers" ON public.past_papers
  FOR SELECT USING (author_id = auth.uid());

CREATE POLICY "Admins can do everything with past papers" ON public.past_papers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Categories and grades - anyone can view, only admins can modify
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can view grades" ON public.grades
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify grades" ON public.grades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 14. Test the is_admin function
SELECT is_admin((SELECT id FROM auth.users WHERE email = 'sajanpoudel970@gmail.com'));

-- 15. Verify your user is now admin
SELECT id, email, role, created_at, updated_at 
FROM public.users 
WHERE email = 'sajanpoudel970@gmail.com';
