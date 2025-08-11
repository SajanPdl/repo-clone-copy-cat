-- Admin Panel Fix Script
-- Copy and paste this entire script into your Supabase SQL Editor and run it

-- ===========================================
-- 1. FIX ADMIN AUTHENTICATION
-- ===========================================

-- Ensure users table exists and has correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Create trigger to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Create trigger for new auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- 2. FIX STUDY_MATERIALS TABLE
-- ===========================================

-- Add missing columns to study_materials if they don't exist
ALTER TABLE public.study_materials 
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create unique index on slug if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS study_materials_slug_idx ON public.study_materials(slug) WHERE slug IS NOT NULL;

-- ===========================================
-- 3. FIX PAST_PAPERS TABLE
-- ===========================================

-- Add missing columns to past_papers if they don't exist
ALTER TABLE public.past_papers 
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'pdf';

-- Create unique index on slug if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS past_papers_slug_idx ON public.past_papers(slug) WHERE slug IS NOT NULL;

-- ===========================================
-- 4. FIX CATEGORIES AND GRADES TABLES
-- ===========================================

-- Ensure categories table has correct structure
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure grades table has correct structure
CREATE TABLE IF NOT EXISTS public.grades (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default categories if they don't exist
INSERT INTO public.categories (name, description) VALUES
('Notes', 'Comprehensive study notes for all subjects'),
('Question Banks', 'Practice questions and problem sets'),
('Lab Manuals', 'Practical lab guides and experiments'),
('Reference Books', 'Additional reference materials'),
('Worksheets', 'Practice worksheets and assignments')
ON CONFLICT (name) DO NOTHING;

-- Insert default grades if they don't exist
INSERT INTO public.grades (name, description) VALUES
('Grade 9', 'Class 9 materials'),
('Grade 10', 'Class 10 CBSE board materials'),
('Grade 11', 'Class 11 intermediate level'),
('Grade 12', 'Class 12 CBSE board materials'),
('Undergraduate', 'University level materials')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 5. FIX RLS POLICIES FOR STUDY_MATERIALS
-- ===========================================

-- Enable RLS on study_materials
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Admins can insert study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Admins can update study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Admins can delete study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can view study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can insert study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can update study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can delete study materials" ON public.study_materials;

-- Create comprehensive policies for study_materials
CREATE POLICY "Anyone can view approved study materials" 
ON public.study_materials 
FOR SELECT 
USING (approval_status = 'approved');

CREATE POLICY "Users can view their own materials" 
ON public.study_materials 
FOR SELECT 
USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all study materials" 
ON public.study_materials 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert study materials" 
ON public.study_materials 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update study materials" 
ON public.study_materials 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete study materials" 
ON public.study_materials 
FOR DELETE 
USING (public.is_admin(auth.uid()));

-- ===========================================
-- 6. FIX RLS POLICIES FOR PAST_PAPERS
-- ===========================================

-- Enable RLS on past_papers
ALTER TABLE public.past_papers ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view past papers" ON public.past_papers;
DROP POLICY IF EXISTS "Admins can insert past papers" ON public.past_papers;
DROP POLICY IF EXISTS "Admins can update past papers" ON public.past_papers;
DROP POLICY IF EXISTS "Admins can delete past papers" ON public.past_papers;
DROP POLICY IF EXISTS "Users can view past papers" ON public.past_papers;
DROP POLICY IF EXISTS "Users can insert past papers" ON public.past_papers;
DROP POLICY IF EXISTS "Users can update past papers" ON public.past_papers;
DROP POLICY IF EXISTS "Users can delete past papers" ON public.past_papers;

-- Create comprehensive policies for past_papers
CREATE POLICY "Anyone can view past papers" 
ON public.past_papers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can view their own papers" 
ON public.past_papers 
FOR SELECT 
USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all past papers" 
ON public.past_papers 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert past papers" 
ON public.past_papers 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update past papers" 
ON public.past_papers 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete past papers" 
ON public.past_papers 
FOR DELETE 
USING (public.is_admin(auth.uid()));

-- ===========================================
-- 7. FIX RLS POLICIES FOR CATEGORIES AND GRADES
-- ===========================================

-- Enable RLS on categories and grades
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;

DROP POLICY IF EXISTS "Anyone can view grades" ON public.grades;
DROP POLICY IF EXISTS "Admins can insert grades" ON public.grades;
DROP POLICY IF EXISTS "Admins can update grades" ON public.grades;
DROP POLICY IF EXISTS "Admins can delete grades" ON public.grades;

-- Create policies for categories
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update categories" 
ON public.categories 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories" 
ON public.categories 
FOR DELETE 
USING (public.is_admin(auth.uid()));

-- Create policies for grades
CREATE POLICY "Anyone can view grades" 
ON public.grades 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert grades" 
ON public.grades 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update grades" 
ON public.grades 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete grades" 
ON public.grades 
FOR DELETE 
USING (public.is_admin(auth.uid()));

-- ===========================================
-- 8. FIX IS_ADMIN FUNCTION
-- ===========================================

-- Update the is_admin function to be more robust
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Check if user exists and has admin role
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND role = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- If there's any error, return false for security
    RETURN false;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- ===========================================
-- 9. CREATE HELPER FUNCTIONS
-- ===========================================

-- Function to increment material views
CREATE OR REPLACE FUNCTION public.increment_material_views(material_id INTEGER, table_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF table_name = 'study_materials' THEN
    UPDATE public.study_materials SET views = views + 1 WHERE id = material_id;
  ELSIF table_name = 'past_papers' THEN
    UPDATE public.past_papers SET views = views + 1 WHERE id = material_id;
  END IF;
END;
$$;

-- Function to increment download count
CREATE OR REPLACE FUNCTION public.increment_download_count(material_id INTEGER, table_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF table_name = 'study_materials' THEN
    UPDATE public.study_materials SET downloads = downloads + 1 WHERE id = material_id;
  ELSIF table_name = 'past_papers' THEN
    UPDATE public.past_papers SET downloads = downloads + 1 WHERE id = material_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 10. CREATE TRIGGERS
-- ===========================================

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_study_materials_updated_at ON public.study_materials;
CREATE TRIGGER update_study_materials_updated_at 
  BEFORE UPDATE ON public.study_materials 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_past_papers_updated_at ON public.past_papers;
CREATE TRIGGER update_past_papers_updated_at 
  BEFORE UPDATE ON public.past_papers 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- 11. SET UP ADMIN ROLE FOR CURRENT USER
-- ===========================================

-- This will set up the current authenticated user as admin
-- Run this after you're logged in
DO $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user ID from auth.uid()
  current_user_id := auth.uid();
  
  -- Insert or update the user with admin role
  IF current_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, role, created_at, updated_at)
    SELECT 
      current_user_id,
      email,
      'admin',
      now(),
      now()
    FROM auth.users 
    WHERE id = current_user_id
    ON CONFLICT (id) DO UPDATE SET 
      role = 'admin',
      updated_at = now();
    
    RAISE NOTICE 'Admin role set up for user: %', current_user_id;
  ELSE
    RAISE NOTICE 'No authenticated user found. Please log in first.';
  END IF;
END $$;

-- ===========================================
-- 12. VERIFICATION
-- ===========================================

-- Check the setup (these should all return results)
SELECT 'Users table' as table_name, count(*) as count FROM public.users
UNION ALL
SELECT 'Study materials' as table_name, count(*) as count FROM public.study_materials
UNION ALL
SELECT 'Past papers' as table_name, count(*) as count FROM public.past_papers
UNION ALL
SELECT 'Categories' as table_name, count(*) as count FROM public.categories
UNION ALL
SELECT 'Grades' as table_name, count(*) as count FROM public.grades;

-- Check admin policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('study_materials', 'past_papers', 'categories', 'grades');

-- Check if is_admin function works
SELECT public.is_admin(auth.uid()) as is_admin;

-- Success message
SELECT 'Admin panel fix completed successfully!' as status;
