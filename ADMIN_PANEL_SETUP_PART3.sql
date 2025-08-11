-- ADMIN PANEL SETUP - PART 3: RLS Policies, Sample Data, and Final Config
-- Run this after PART 1 and PART 2 to complete the setup

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
-- STEP 5: Insert sample data for testing
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
AND routine_name IN ('is_admin', 'get_all_subscription_plan', 'get_subscription_plan_stats', 'create_subscription_plan', 'update_subscription_plan', 'delete_subscription_plan');

SELECT 'Admin Panel Setup Complete! 🎉' as status;
