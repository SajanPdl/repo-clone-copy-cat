-- Complete Database Restoration Migration
-- This migration creates all tables, functions, and policies in the correct order

-- ===========================================
-- 1. CREATE ALL TABLES FIRST
-- ===========================================

-- Create users table for role management
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add missing columns to existing tables
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS featured_image TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;

ALTER TABLE public.past_papers ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured_image TEXT;

-- Create study materials table
CREATE TABLE IF NOT EXISTS public.study_materials (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT DEFAULT 'pdf',
  downloads INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  approval_status TEXT DEFAULT 'approved',
  featured_image TEXT,
  slug TEXT UNIQUE,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create past papers table
CREATE TABLE IF NOT EXISTS public.past_papers (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  year INTEGER NOT NULL,
  board TEXT DEFAULT 'CBSE',
  file_url TEXT,
  downloads INTEGER DEFAULT 0,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT DEFAULT 'MeroAcademy Team',
  category TEXT DEFAULT 'Education',
  featured_image TEXT,
  is_published BOOLEAN DEFAULT true,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user queries table
CREATE TABLE IF NOT EXISTS public.user_queries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create grades table
CREATE TABLE IF NOT EXISTS public.grades (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create advertisements table
CREATE TABLE IF NOT EXISTS public.advertisements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  link_url TEXT,
  position TEXT DEFAULT 'sidebar',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  features JSONB,
  plan_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES public.subscription_plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create seller wallets table
CREATE TABLE IF NOT EXISTS public.seller_wallets (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  esewa_id TEXT,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  total_withdrawals DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create withdrawal requests table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  esewa_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create wallet transactions table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id SERIAL PRIMARY KEY,
  wallet_id INTEGER REFERENCES public.seller_wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment requests table
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method TEXT,
  order_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES public.user_subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  invoice_number TEXT UNIQUE,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 3. CREATE FUNCTIONS
-- ===========================================

-- Create is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND role = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Create handle_new_user function
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

-- Create update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create increment_download_count function
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

-- ===========================================
-- 4. CREATE TRIGGERS
-- ===========================================

-- Create trigger for new auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_study_materials_updated_at ON public.study_materials;
CREATE TRIGGER update_study_materials_updated_at BEFORE UPDATE ON public.study_materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_past_papers_updated_at ON public.past_papers;
CREATE TRIGGER update_past_papers_updated_at BEFORE UPDATE ON public.past_papers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- 5. CREATE RLS POLICIES
-- ===========================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

DROP POLICY IF EXISTS "Study materials are viewable by everyone" ON public.study_materials;
DROP POLICY IF EXISTS "Admins can insert study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Admins can update study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Admins can delete study materials" ON public.study_materials;

DROP POLICY IF EXISTS "Past papers are viewable by everyone" ON public.past_papers;
DROP POLICY IF EXISTS "Admins can insert past papers" ON public.past_papers;
DROP POLICY IF EXISTS "Admins can update past papers" ON public.past_papers;
DROP POLICY IF EXISTS "Admins can delete past papers" ON public.past_papers;

DROP POLICY IF EXISTS "Published blog posts are viewable by everyone" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can view all blog posts" ON public.blog_posts;

DROP POLICY IF EXISTS "Users can insert their own queries" ON public.user_queries;
DROP POLICY IF EXISTS "Users can view their own queries" ON public.user_queries;
DROP POLICY IF EXISTS "Admins can update user queries" ON public.user_queries;
DROP POLICY IF EXISTS "Admins can delete user queries" ON public.user_queries;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Grades are viewable by everyone" ON public.grades;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert grades" ON public.grades;
DROP POLICY IF EXISTS "Admins can update grades" ON public.grades;
DROP POLICY IF EXISTS "Admins can delete grades" ON public.grades;

DROP POLICY IF EXISTS "Active ads are viewable by everyone" ON public.advertisements;
DROP POLICY IF EXISTS "Admins can insert advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Admins can update advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Admins can delete advertisements" ON public.advertisements;

-- Users table policies
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update all users" ON public.users FOR UPDATE USING (is_admin(auth.uid()));

-- Study materials policies
CREATE POLICY "Study materials are viewable by everyone" ON public.study_materials FOR SELECT USING (true);
CREATE POLICY "Admins can insert study materials" ON public.study_materials FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update study materials" ON public.study_materials FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete study materials" ON public.study_materials FOR DELETE USING (is_admin(auth.uid()));

-- Past papers policies
CREATE POLICY "Past papers are viewable by everyone" ON public.past_papers FOR SELECT USING (true);
CREATE POLICY "Admins can insert past papers" ON public.past_papers FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update past papers" ON public.past_papers FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete past papers" ON public.past_papers FOR DELETE USING (is_admin(auth.uid()));

-- Blog posts policies
CREATE POLICY "Published blog posts are viewable by everyone" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can insert blog posts" ON public.blog_posts FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update blog posts" ON public.blog_posts FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete blog posts" ON public.blog_posts FOR DELETE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can view all blog posts" ON public.blog_posts FOR SELECT USING (is_admin(auth.uid()));

-- User queries policies
CREATE POLICY "Users can insert their own queries" ON public.user_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own queries" ON public.user_queries FOR SELECT USING (true);
CREATE POLICY "Admins can update user queries" ON public.user_queries FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete user queries" ON public.user_queries FOR DELETE USING (is_admin(auth.uid()));

-- Categories and grades policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Grades are viewable by everyone" ON public.grades FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert grades" ON public.grades FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update grades" ON public.grades FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete grades" ON public.grades FOR DELETE USING (is_admin(auth.uid()));

-- Advertisements policies
CREATE POLICY "Active ads are viewable by everyone" ON public.advertisements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert advertisements" ON public.advertisements FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update advertisements" ON public.advertisements FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete advertisements" ON public.advertisements FOR DELETE USING (is_admin(auth.uid()));

-- ===========================================
-- 6. GRANT PERMISSIONS
-- ===========================================

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_download_count(INTEGER, TEXT) TO authenticated;

-- ===========================================
-- 7. INSERT SAMPLE DATA
-- ===========================================

-- Insert sample categories
INSERT INTO public.categories (name, description) VALUES
('Notes', 'Study notes and summaries for various subjects'),
('Worksheets', 'Practice worksheets and exercises'),
('Question Banks', 'Collection of practice questions'),
('Reference Materials', 'Reference books and guides'),
('Lab Manuals', 'Laboratory experiment guides'),
('Sample Papers', 'Sample question papers for practice')
ON CONFLICT (name) DO NOTHING;

-- Insert sample grades
INSERT INTO public.grades (name, description) VALUES
('Grade 6', 'Class 6 materials and resources'),
('Grade 7', 'Class 7 materials and resources'),
('Grade 8', 'Class 8 materials and resources'),
('Grade 9', 'Class 9 materials and resources'),
('Grade 10', 'Class 10 board examination materials'),
('Grade 11', 'Class 11 intermediate level materials'),
('Grade 12', 'Class 12 board examination materials')
ON CONFLICT (name) DO NOTHING;

-- Insert sample subscription plans
INSERT INTO public.subscription_plans (name, description, price, duration_days, plan_code, features) VALUES
('Basic Plan', 'Access to basic study materials', 9.99, 30, 'BASIC', '["Study Materials", "Past Papers", "Basic Support"]'),
('Pro Plan', 'Full access to all features', 19.99, 30, 'PRO', '["Study Materials", "Past Papers", "Premium Content", "Priority Support", "Download All"]'),
('Annual Pro', 'Full access for 1 year', 199.99, 365, 'ANNUAL_PRO', '["Study Materials", "Past Papers", "Premium Content", "Priority Support", "Download All", "Exclusive Content"]')
ON CONFLICT (plan_code) DO NOTHING;

-- Insert sample study materials
INSERT INTO public.study_materials (title, description, subject, grade, category, file_type, downloads, is_featured, slug) VALUES
('Algebra Fundamentals', 'Complete guide to algebraic expressions and equations', 'Mathematics', 'Grade 9', 'Notes', 'pdf', 245, true, 'algebra-fundamentals-grade-9'),
('Photosynthesis Process', 'Detailed explanation of photosynthesis in plants', 'Biology', 'Grade 10', 'Notes', 'pdf', 189, false, 'photosynthesis-process-grade-10'),
('Chemical Reactions', 'Types of chemical reactions with examples', 'Chemistry', 'Grade 10', 'Notes', 'pdf', 156, true, 'chemical-reactions-grade-10'),
('World War II History', 'Comprehensive study of World War II events', 'History', 'Grade 9', 'Notes', 'pdf', 132, false, 'world-war-ii-history-grade-9'),
('Physics Laws of Motion', 'Newton''s laws and their applications', 'Physics', 'Grade 11', 'Notes', 'pdf', 298, true, 'physics-laws-of-motion-grade-11')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample past papers
INSERT INTO public.past_papers (title, subject, grade, year, board, downloads, slug) VALUES
('Mathematics Final Exam 2023', 'Mathematics', 'Grade 10', 2023, 'CBSE', 345, 'mathematics-final-exam-2023-grade-10'),
('Physics Board Paper 2023', 'Physics', 'Grade 12', 2023, 'CBSE', 289, 'physics-board-paper-2023-grade-12'),
('Chemistry Sample Paper 2023', 'Chemistry', 'Grade 11', 2023, 'CBSE', 234, 'chemistry-sample-paper-2023-grade-11'),
('Biology Annual Exam 2022', 'Biology', 'Grade 10', 2022, 'CBSE', 198, 'biology-annual-exam-2022-grade-10'),
('English Literature 2023', 'English', 'Grade 12', 2023, 'CBSE', 167, 'english-literature-2023-grade-12')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample blog posts
INSERT INTO public.blog_posts (title, content, excerpt, author, category, is_published, slug) VALUES
('How to Prepare for Board Exams', 'Board exams are crucial for every student''s academic journey. Here are some effective strategies to help you prepare better...', 'Essential tips and strategies for effective board exam preparation', 'Dr. Priya Sharma', 'Study Tips', true, 'how-to-prepare-for-board-exams'),
('Benefits of Regular Study', 'Consistency is key when it comes to academic success. Regular study habits can transform your learning experience...', 'Why maintaining consistent study habits is crucial for academic success', 'Prof. Raj Kumar', 'Study Tips', true, 'benefits-of-regular-study'),
('Science Fair Project Ideas', 'Looking for innovative science fair project ideas? Here are some exciting experiments you can try...', 'Creative and educational science fair project ideas for students', 'Dr. Anita Verma', 'Science', true, 'science-fair-project-ideas')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample advertisements
INSERT INTO public.advertisements (title, content, image_url, link_url, position, is_active) VALUES
('Online Tutoring Services', 'Get personalized online tutoring from expert teachers. All subjects available.', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop', 'https://example.com/tutoring', 'sidebar', true),
('CBSE Study Materials', 'Complete CBSE study materials for all grades. Download now!', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop', 'https://example.com/cbse-materials', 'header', true),
('Educational Apps', 'Download our mobile app for on-the-go learning. Available on Play Store.', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop', 'https://example.com/mobile-app', 'footer', true)
ON CONFLICT DO NOTHING;

-- Insert sample user queries
INSERT INTO public.user_queries (name, email, subject, message, status) VALUES
('Rahul Sharma', 'rahul.sharma@email.com', 'Missing Study Material', 'I cannot find the Physics notes for Grade 12. Can you please help me locate them?', 'open'),
('Priya Patel', 'priya.patel@email.com', 'Download Issue', 'I am facing issues while downloading PDF files. The download keeps failing.', 'closed'),
('Amit Kumar', 'amit.kumar@email.com', 'New Subject Request', 'Can you add Computer Science materials for Grade 9? It would be very helpful.', 'open')
ON CONFLICT DO NOTHING;

-- ===========================================
-- 8. CREATE INDEXES FOR BETTER PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_study_materials_featured ON public.study_materials(is_featured);
CREATE INDEX IF NOT EXISTS idx_past_papers_year_subject ON public.past_papers(year, subject);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
