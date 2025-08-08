
-- Fix RLS policies for all tables to ensure admin functionality works properly

-- Update users table policies
DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id OR is_admin(auth.uid()));

-- Create admin insertion policy for users table if it doesn't exist
CREATE POLICY "Admins can insert users" ON users FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Fix study_materials policies
DROP POLICY IF EXISTS "Admins can insert study materials" ON study_materials;
CREATE POLICY "Admins can insert study materials" ON study_materials 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Fix past_papers policies 
DROP POLICY IF EXISTS "Admins can insert past papers" ON past_papers;
CREATE POLICY "Admins can insert past papers" ON past_papers
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Fix blog_posts policies
DROP POLICY IF EXISTS "Admins can insert blog posts" ON blog_posts;
CREATE POLICY "Admins can insert blog posts" ON blog_posts
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Fix categories policies
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
CREATE POLICY "Admins can insert categories" ON categories
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Fix grades policies
DROP POLICY IF EXISTS "Admins can insert grades" ON grades;
CREATE POLICY "Admins can insert grades" ON grades
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Fix advertisements policies
DROP POLICY IF EXISTS "Admins can insert advertisements" ON advertisements;
CREATE POLICY "Admins can insert advertisements" ON advertisements
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Create student profile table for the dashboard
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  university TEXT,
  course TEXT,
  year_of_study INTEGER,
  profile_image TEXT,
  bio TEXT,
  points INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Fresh Contributor',
  total_uploads INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student activities table for tracking dashboard metrics
CREATE TABLE IF NOT EXISTS public.student_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('upload', 'download', 'sale', 'bookmark', 'share')),
  points_earned INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('study_material', 'past_paper', 'marketplace_listing')),
  content_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Enable RLS on new tables
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_profiles
CREATE POLICY "Users can view their own profile" ON student_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON student_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON student_profiles FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON student_profiles FOR UPDATE USING (is_admin(auth.uid()));

-- RLS policies for student_activities
CREATE POLICY "Users can view their own activities" ON student_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activities" ON student_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all activities" ON student_activities FOR SELECT USING (is_admin(auth.uid()));

-- RLS policies for bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate user level based on points
CREATE OR REPLACE FUNCTION public.calculate_user_level(points INTEGER)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT 
    CASE 
      WHEN points < 100 THEN 'Fresh Contributor'
      WHEN points < 500 THEN 'Active Learner'
      WHEN points < 1000 THEN 'Knowledge Sharer'
      WHEN points < 2000 THEN 'Note Lord'
      WHEN points < 5000 THEN 'Top Seller'
      ELSE 'Education Master'
    END;
$$;

-- Function to add student activity and update points
CREATE OR REPLACE FUNCTION public.add_student_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_points INTEGER DEFAULT 0,
  p_description TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert activity
  INSERT INTO public.student_activities (user_id, activity_type, points_earned, description)
  VALUES (p_user_id, p_activity_type, p_points, p_description);
  
  -- Update user points and level
  INSERT INTO public.student_profiles (user_id, points, level)
  VALUES (p_user_id, p_points, calculate_user_level(p_points))
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    points = student_profiles.points + p_points,
    level = calculate_user_level(student_profiles.points + p_points),
    updated_at = now();
    
  -- Update activity counters
  IF p_activity_type = 'upload' THEN
    UPDATE public.student_profiles 
    SET total_uploads = total_uploads + 1 
    WHERE user_id = p_user_id;
  ELSIF p_activity_type = 'download' THEN
    UPDATE public.student_profiles 
    SET total_downloads = total_downloads + 1 
    WHERE user_id = p_user_id;
  ELSIF p_activity_type = 'sale' THEN
    UPDATE public.student_profiles 
    SET total_sales = total_sales + 1 
    WHERE user_id = p_user_id;
  END IF;
END;
$$;
