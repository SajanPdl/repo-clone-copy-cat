-- COMPLETE ADMIN PANEL SETUP
-- This script sets up all the missing database components needed for the admin panel
-- Run this in your Supabase SQL Editor to make the admin panel fully functional

-- ===========================================
-- STEP 1: Ensure all required tables exist
-- ===========================================

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    is_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

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
    price NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'NPR',
    category TEXT NOT NULL,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create advertisements table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    link_url TEXT,
    position TEXT NOT NULL CHECK (position IN ('header', 'sidebar', 'footer', 'content')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================================
-- STEP 2: Create or replace essential functions
-- ===========================================

-- Create is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND (is_admin = true OR role = 'admin')
  );
END;
$$;

-- Create function to get all subscription plans (admin only)
CREATE OR REPLACE FUNCTION public.get_all_subscription_plans()
RETURNS TABLE (
    id uuid,
    plan_code text,
    name text,
    description text,
    price numeric,
    currency text,
    duration_days integer,
    features jsonb,
    is_active boolean,
    created_at timestamptz,
    updated_at timestamptz,
    active_subscriptions_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if user is admin
    SELECT auth.uid() INTO admin_user_id;
    IF NOT is_admin(admin_user_id) THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;

    RETURN QUERY
    SELECT
        sp.id,
        sp.plan_code,
        sp.name,
        sp.description,
        sp.price,
        sp.currency,
        sp.duration_days,
        sp.features,
        sp.is_active,
        sp.created_at,
        sp.updated_at,
        COUNT(us.id) as active_subscriptions_count
    FROM public.subscription_plans sp
    LEFT JOIN public.user_subscriptions us ON sp.id = us.plan_id AND us.status = 'active'
    GROUP BY sp.id, sp.plan_code, sp.name, sp.description, sp.price, sp.currency,
             sp.duration_days, sp.features, sp.is_active, sp.created_at, sp.updated_at
    ORDER BY sp.price ASC;
END;
$$;

-- Create function to get subscription plan statistics
CREATE OR REPLACE FUNCTION public.get_subscription_plan_stats()
RETURNS TABLE (
    total_plans bigint,
    active_plans bigint,
    total_subscriptions bigint,
    active_subscriptions bigint,
    total_revenue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if user is admin
    SELECT auth.uid() INTO admin_user_id;
    IF NOT is_admin(admin_user_id) THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;

    RETURN QUERY
    SELECT
        COUNT(*) as total_plans,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_plans,
        (SELECT COUNT(*) FROM public.user_subscriptions) as total_subscriptions,
        (SELECT COUNT(*) FROM public.user_subscriptions WHERE status = 'active') as active_subscriptions,
        (SELECT COALESCE(SUM(amount), 0) FROM public.payment_requests WHERE status = 'approved') as total_revenue
    FROM public.subscription_plans;
END;
$$;

-- Create function to create subscription plan
CREATE OR REPLACE FUNCTION public.create_subscription_plan(
    plan_code text,
    name text,
    description text,
    price numeric,
    currency text DEFAULT 'NPR',
    duration_days integer,
    features jsonb DEFAULT '[]',
    is_active boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    admin_user_id uuid;
    new_plan_id uuid;
BEGIN
    -- Check if user is admin
    SELECT auth.uid() INTO admin_user_id;
    IF NOT is_admin(admin_user_id) THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;

    -- Insert new plan
    INSERT INTO public.subscription_plans (
        plan_code, name, description, price, currency,
        duration_days, features, is_active
    ) VALUES (
        plan_code, name, description, price, currency,
        duration_days, features, is_active
    ) RETURNING id INTO new_plan_id;

    RETURN new_plan_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create subscription plan: %', SQLERRM;
END;
$$;

-- Create function to update subscription plan
CREATE OR REPLACE FUNCTION public.update_subscription_plan(
    plan_id uuid,
    plan_code text,
    name text,
    description text,
    price numeric,
    currency text,
    duration_days integer,
    features jsonb,
    is_active boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if user is admin
    SELECT auth.uid() INTO admin_user_id;
    IF NOT is_admin(admin_user_id) THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;

    -- Update plan
    UPDATE public.subscription_plans SET
        plan_code = update_subscription_plan.plan_code,
        name = update_subscription_plan.name,
        description = update_subscription_plan.description,
        price = update_subscription_plan.price,
        currency = update_subscription_plan.currency,
        duration_days = update_subscription_plan.duration_days,
        features = update_subscription_plan.features,
        is_active = update_subscription_plan.is_active,
        updated_at = now()
    WHERE id = plan_id;

    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to update subscription plan: %', SQLERRM;
END;
$$;

-- Create function to delete subscription plan
CREATE OR REPLACE FUNCTION public.delete_subscription_plan(plan_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if user is admin
    SELECT auth.uid() INTO admin_user_id;
    IF NOT is_admin(admin_user_id) THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;

    -- Check if plan has active subscriptions
    IF EXISTS (SELECT 1 FROM public.user_subscriptions WHERE plan_id = delete_subscription_plan.plan_id AND status = 'active') THEN
        RAISE EXCEPTION 'Cannot delete plan with active subscriptions';
    END IF;

    -- Delete plan
    DELETE FROM public.subscription_plans WHERE id = plan_id;
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to delete subscription plan: %', SQLERRM;
END;
$$;

-- ===========================================
-- STEP 3: Insert sample data for testing
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

-- Insert sample advertisements
INSERT INTO public.advertisements (title, content, position, status) VALUES
('Welcome to Our Platform', 'Discover amazing study materials for all grades', 'header', 'active'),
('Premium Features', 'Unlock unlimited access to premium content', 'sidebar', 'active'),
('Get Started Today', 'Join thousands of students already learning', 'footer', 'active')
ON CONFLICT DO NOTHING;

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

-- Users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update users" ON public.users;
CREATE POLICY "Admins can update users" ON public.users
    FOR UPDATE USING (is_admin(auth.uid()));

-- Study materials policies
DROP POLICY IF EXISTS "Anyone can view approved materials" ON public.study_materials;
CREATE POLICY "Anyone can view approved materials" ON public.study_materials
    FOR SELECT USING (approval_status = 'approved');

DROP POLICY IF EXISTS "Users can view their own materials" ON public.study_materials;
CREATE POLICY "Users can view their own materials" ON public.study_materials
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all materials" ON public.study_materials;
CREATE POLICY "Admins can view all materials" ON public.study_materials
    FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can create materials" ON public.study_materials;
CREATE POLICY "Users can create materials" ON public.study_materials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own materials" ON public.study_materials;
CREATE POLICY "Users can update their own materials" ON public.study_materials
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update any material" ON public.study_materials;
CREATE POLICY "Admins can update any material" ON public.study_materials
    FOR UPDATE USING (is_admin(auth.uid()));

-- Past papers policies
DROP POLICY IF EXISTS "Anyone can view approved papers" ON public.past_papers;
CREATE POLICY "Anyone can view approved papers" ON public.past_papers
    FOR SELECT USING (approval_status = 'approved');

DROP POLICY IF EXISTS "Users can view their own papers" ON public.past_papers;
CREATE POLICY "Users can view their own papers" ON public.past_papers
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all papers" ON public.past_papers;
CREATE POLICY "Admins can view all papers" ON public.past_papers
    FOR SELECT USING (is_admin(auth.uid()));

-- User queries policies
DROP POLICY IF EXISTS "Anyone can create queries" ON public.user_queries;
CREATE POLICY "Anyone can create queries" ON public.user_queries
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all queries" ON public.user_queries;
CREATE POLICY "Admins can view all queries" ON public.user_queries
    FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update queries" ON public.user_queries;
CREATE POLICY "Admins can update queries" ON public.user_queries
    FOR UPDATE USING (is_admin(auth.uid()));

-- Categories and grades policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can view grades" ON public.grades;
CREATE POLICY "Anyone can view grades" ON public.grades
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage grades" ON public.grades;
CREATE POLICY "Admins can manage grades" ON public.grades
    FOR ALL USING (is_admin(auth.uid()));

-- Blog posts policies
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.blog_posts;
CREATE POLICY "Anyone can view published posts" ON public.blog_posts
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Authors can view their own posts" ON public.blog_posts;
CREATE POLICY "Authors can view their own posts" ON public.blog_posts
    FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins can view all posts" ON public.blog_posts;
CREATE POLICY "Admins can view all posts" ON public.blog_posts
    FOR SELECT USING (is_admin(auth.uid()));

-- Events policies
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
CREATE POLICY "Anyone can view events" ON public.events
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizers can manage their events" ON public.events;
CREATE POLICY "Organizers can manage their events" ON public.events
    FOR ALL USING (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
CREATE POLICY "Admins can manage all events" ON public.events
    FOR ALL USING (is_admin(auth.uid()));

-- Marketplace listings policies
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.marketplace_listings;
CREATE POLICY "Anyone can view active listings" ON public.marketplace_listings
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Sellers can manage their listings" ON public.marketplace_listings;
CREATE POLICY "Sellers can manage their listings" ON public.marketplace_listings
    FOR ALL USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Admins can manage all listings" ON public.marketplace_listings;
CREATE POLICY "Admins can manage all listings" ON public.marketplace_listings
    FOR ALL USING (is_admin(auth.uid()));

-- Advertisements policies
DROP POLICY IF EXISTS "Anyone can view active ads" ON public.advertisements;
CREATE POLICY "Anyone can view active ads" ON public.advertisements
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage ads" ON public.advertisements;
CREATE POLICY "Admins can manage ads" ON public.advertisements
    FOR ALL USING (is_admin(auth.uid()));

-- ===========================================
-- STEP 5: Grant permissions
-- ===========================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_subscription_plans() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subscription_plan_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_subscription_plan(text, text, text, numeric, text, integer, jsonb, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_subscription_plan(uuid, text, text, text, numeric, text, integer, jsonb, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_subscription_plan(uuid) TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_materials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.past_papers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_queries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grades TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_listings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.advertisements TO authenticated;

-- ===========================================
-- STEP 6: Create indexes for performance
-- ===========================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_materials_user_id ON public.study_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_approval_status ON public.study_materials(approval_status);
CREATE INDEX IF NOT EXISTS idx_study_materials_subject ON public.study_materials(subject);
CREATE INDEX IF NOT EXISTS idx_study_materials_grade ON public.study_materials(grade);

CREATE INDEX IF NOT EXISTS idx_past_papers_user_id ON public.past_papers(user_id);
CREATE INDEX IF NOT EXISTS idx_past_papers_approval_status ON public.past_papers(approval_status);
CREATE INDEX IF NOT EXISTS idx_past_papers_subject ON public.past_papers(subject);
CREATE INDEX IF NOT EXISTS idx_past_papers_year ON public.past_papers(year);

CREATE INDEX IF NOT EXISTS idx_user_queries_status ON public.user_queries(status);
CREATE INDEX IF NOT EXISTS idx_user_queries_created_at ON public.user_queries(created_at);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);

-- ===========================================
-- STEP 7: Create triggers for updated_at
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

DROP TRIGGER IF EXISTS update_study_materials_updated_at ON public.study_materials;
CREATE TRIGGER update_study_materials_updated_at
    BEFORE UPDATE ON public.study_materials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_past_papers_updated_at ON public.past_papers;
CREATE TRIGGER update_past_papers_updated_at
    BEFORE UPDATE ON public.past_papers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_queries_updated_at ON public.user_queries;
CREATE TRIGGER update_user_queries_updated_at
    BEFORE UPDATE ON public.user_queries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- STEP 8: Verify setup
-- ===========================================

-- Check if all tables exist
SELECT 'Tables Check:' as info;
SELECT
    table_name,
    CASE
        WHEN table_name IN ('users', 'study_materials', 'past_papers', 'user_queries', 'categories', 'grades', 'blog_posts', 'events', 'marketplace_listings', 'advertisements')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'study_materials', 'past_papers', 'user_queries', 'categories', 'grades', 'blog_posts', 'events', 'marketplace_listings', 'advertisements');

-- Check if all functions exist
SELECT 'Functions Check:' as info;
SELECT
    routine_name,
    CASE
        WHEN routine_name IN ('is_admin', 'get_all_subscription_plans', 'get_subscription_plan_stats', 'create_subscription_plan', 'update_subscription_plan', 'delete_subscription_plan')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('is_admin', 'get_all_subscription_plans', 'get_subscription_plan_stats', 'create_subscription_plan', 'update_subscription_plan', 'delete_subscription_plan');

SELECT 'Admin Panel Setup Complete! 🎉' as status;
