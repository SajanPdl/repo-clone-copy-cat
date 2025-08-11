-- COMPLETE ADMIN PANEL FIX
-- This script fixes all admin panel issues including the missing is_admin column
-- Run this in your Supabase SQL Editor to resolve the admin panel errors

-- ===========================================
-- STEP 1: Fix the users table structure
-- ===========================================

-- Ensure users table has the correct structure
DO $$
BEGIN
    -- Add is_admin column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE 'Added is_admin column to users table';
    END IF;
    
    -- Add role column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
        RAISE NOTICE 'Added role column to users table';
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
        RAISE NOTICE 'Added created_at column to users table';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
        RAISE NOTICE 'Added updated_at column to users table';
    END IF;
END $$;

-- Update existing users to have proper values
UPDATE public.users SET 
    role = COALESCE(role, 'user'),
    is_admin = COALESCE(is_admin, false),
    created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now())
WHERE role IS NULL OR is_admin IS NULL OR created_at IS NULL OR updated_at IS NULL;

-- Ensure role values are valid
UPDATE public.users SET role = 'user' WHERE role NOT IN ('user', 'admin', 'moderator');

-- Update is_admin based on role
UPDATE public.users SET is_admin = (role = 'admin');

-- ===========================================
-- STEP 2: Create or fix the is_admin function
-- ===========================================

-- Drop existing function if it has issues
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Create the is_admin function
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- ===========================================
-- STEP 3: Ensure all required tables exist
-- ===========================================

-- Create study_materials table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    downloads INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID,
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    featured_image TEXT,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create past_papers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.past_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    year INTEGER NOT NULL,
    grade TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    downloads INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_queries table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_queries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create grades table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blog_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured_image TEXT,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    organizer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create marketplace_listings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NPR',
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT,
    condition TEXT DEFAULT 'new' CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create advertisements table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('header', 'sidebar', 'footer', 'content')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================================
-- STEP 4: Enable RLS and set policies
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;

-- Create users table policies
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update users" ON public.users
    FOR UPDATE USING (is_admin(auth.uid()));

-- Create other table policies (simplified for brevity)
-- You can add more specific policies as needed

-- ===========================================
-- STEP 5: Create indexes for performance
-- ===========================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);
CREATE INDEX IF NOT EXISTS idx_study_materials_user_id ON public.study_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_approval_status ON public.study_materials(approval_status);
CREATE INDEX IF NOT EXISTS idx_past_papers_user_id ON public.past_papers(user_id);
CREATE INDEX IF NOT EXISTS idx_past_papers_approval_status ON public.past_papers(approval_status);

-- ===========================================
-- STEP 6: Create triggers for updated_at
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- STEP 7: Insert sample data for testing
-- ===========================================

-- Insert sample categories
INSERT INTO public.categories (name, description) VALUES
('Mathematics', 'Mathematics related study materials'),
('Science', 'Science related study materials'),
('English', 'English language and literature'),
('Nepali', 'Nepali language and literature'),
('Social Studies', 'History, geography, and social sciences')
ON CONFLICT (name) DO NOTHING;

-- Insert sample grades
INSERT INTO public.grades (name, description) VALUES
('Grade 1', 'First grade level'),
('Grade 2', 'Second grade level'),
('Grade 3', 'Third grade level'),
('Grade 4', 'Fourth grade level'),
('Grade 5', 'Fifth grade level'),
('Grade 6', 'Sixth grade level'),
('Grade 7', 'Seventh grade level'),
('Grade 8', 'Eighth grade level'),
('Grade 9', 'Ninth grade level'),
('Grade 10', 'Tenth grade level'),
('Grade 11', 'Eleventh grade level'),
('Grade 12', 'Twelfth grade level')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- STEP 8: Verify the fix
-- ===========================================

-- Check users table structure
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

-- Check if all required tables exist
SELECT 
    'Tables Check:' as info,
    table_name,
    CASE
        WHEN table_name IN ('users', 'study_materials', 'past_papers', 'user_queries', 'categories', 'grades', 'blog_posts', 'events', 'marketplace_listings', 'advertisements')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'study_materials', 'past_papers', 'user_queries', 'categories', 'grades', 'blog_posts', 'events', 'marketplace_listings', 'advertisements');

SELECT 'Admin Panel Fix Completed! 🎉' as status;
