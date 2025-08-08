
-- Fix the user_dashboard_stats view to remove security definer issues
DROP VIEW IF EXISTS user_dashboard_stats;

-- Recreate as a regular view without security definer
CREATE VIEW user_dashboard_stats AS
SELECT 
  sp.user_id,
  sp.points,
  sp.level,
  sp.total_uploads,
  sp.total_downloads,
  sp.total_sales,
  COUNT(DISTINCT b.id) as total_bookmarks,
  COUNT(DISTINCT sa.id) as total_activities
FROM student_profiles sp
LEFT JOIN bookmarks b ON b.user_id = sp.user_id
LEFT JOIN student_activities sa ON sa.user_id = sp.user_id
GROUP BY sp.user_id, sp.points, sp.level, sp.total_uploads, sp.total_downloads, sp.total_sales;

-- Fix all database functions with proper security settings
CREATE OR REPLACE FUNCTION public.increment_listing_views(listing_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.marketplace_listings 
  SET views_count = views_count + 1 
  WHERE id = listing_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_listing_interest(listing_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.marketplace_listings 
  SET interest_count = interest_count + 1 
  WHERE id = listing_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_download_count(material_id integer, table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF table_name = 'study_materials' THEN
    UPDATE public.study_materials SET downloads = downloads + 1 WHERE id = material_id;
  ELSIF table_name = 'past_papers' THEN
    UPDATE public.past_papers SET downloads = downloads + 1 WHERE id = material_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_student_activity(p_user_id uuid, p_activity_type text, p_points integer DEFAULT 0, p_description text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.increment_material_views(material_id integer, table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF table_name = 'study_materials' THEN
    UPDATE study_materials SET views = views + 1 WHERE id = material_id;
  ELSIF table_name = 'past_papers' THEN
    UPDATE past_papers SET views = views + 1 WHERE id = material_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = ''
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

-- Create premium subscriptions table for server-side premium status
CREATE TABLE IF NOT EXISTS public.premium_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'premium',
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on premium subscriptions
ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for premium subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.premium_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.premium_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.premium_subscriptions
  FOR ALL
  USING (is_admin(auth.uid()));

-- Function to check premium status
CREATE OR REPLACE FUNCTION public.is_premium_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.premium_subscriptions 
    WHERE user_id = $1 
    AND status = 'active' 
    AND expires_at > now()
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
