-- Fix RLS policies for admin operations
-- The issue is that we need to ensure admin operations work correctly

-- First, let's check and fix the is_admin function to be more robust
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

-- Update study_materials policies to be more explicit
DROP POLICY IF EXISTS "Admins can insert study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Admins can update study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Admins can delete study materials" ON public.study_materials;

-- Recreate admin policies for study_materials
CREATE POLICY "Admins can insert study materials" 
ON public.study_materials 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update study materials" 
ON public.study_materials 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete study materials" 
ON public.study_materials 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Similarly fix past_papers policies
DROP POLICY IF EXISTS "Admins can insert past papers" ON public.past_papers;
DROP POLICY IF EXISTS "Admins can update past papers" ON public.past_papers;
DROP POLICY IF EXISTS "Admins can delete past papers" ON public.past_papers;

CREATE POLICY "Admins can insert past papers" 
ON public.past_papers 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update past papers" 
ON public.past_papers 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete past papers" 
ON public.past_papers 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Fix blog_posts policies
DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;

CREATE POLICY "Admins can insert blog posts" 
ON public.blog_posts 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update blog posts" 
ON public.blog_posts 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete blog posts" 
ON public.blog_posts 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Fix advertisements policies
DROP POLICY IF EXISTS "Admins can insert advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Admins can update advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Admins can delete advertisements" ON public.advertisements;

CREATE POLICY "Admins can insert advertisements" 
ON public.advertisements 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update advertisements" 
ON public.advertisements 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete advertisements" 
ON public.advertisements 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Fix categories policies
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;

CREATE POLICY "Admins can insert categories" 
ON public.categories 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update categories" 
ON public.categories 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories" 
ON public.categories 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Fix grades policies
DROP POLICY IF EXISTS "Admins can insert grades" ON public.grades;
DROP POLICY IF EXISTS "Admins can update grades" ON public.grades;
DROP POLICY IF EXISTS "Admins can delete grades" ON public.grades;

CREATE POLICY "Admins can insert grades" 
ON public.grades 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update grades" 
ON public.grades 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete grades" 
ON public.grades 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Add adsterra ad type to advertisements table
ALTER TABLE public.advertisements 
ADD COLUMN IF NOT EXISTS ad_type text DEFAULT 'banner';

-- Add constraint for ad_type
ALTER TABLE public.advertisements 
DROP CONSTRAINT IF EXISTS valid_ad_type;

ALTER TABLE public.advertisements 
ADD CONSTRAINT valid_ad_type 
CHECK (ad_type IN ('banner', 'popup', 'popunder', 'native', 'video'));

-- Insert adsterra configuration as controllable ad
INSERT INTO public.advertisements (
  title, 
  content, 
  position, 
  ad_type,
  link_url,
  is_active
) VALUES (
  'Adsterra Popunder', 
  'Adsterra popunder advertisement for monetization', 
  'content', 
  'popunder',
  '//defiantexemplifytheme.com/29/69/42/29694258fa5594ca74300ab5064ba6f5.js',
  true
) ON CONFLICT DO NOTHING;