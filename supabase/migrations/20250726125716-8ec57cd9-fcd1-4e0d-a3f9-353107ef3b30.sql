
-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'trophy',
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points_required INTEGER DEFAULT 0,
  is_system_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  awarded_by_admin UUID DEFAULT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS for achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements
CREATE POLICY "Everyone can view achievements" 
  ON public.achievements 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage achievements" 
  ON public.achievements 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- RLS policies for user achievements
CREATE POLICY "Users can view their own achievements" 
  ON public.user_achievements 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user achievements" 
  ON public.user_achievements 
  FOR SELECT 
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can grant achievements" 
  ON public.user_achievements 
  FOR INSERT 
  WITH CHECK (is_admin(auth.uid()));

-- Function to auto-grant achievements based on points
CREATE OR REPLACE FUNCTION public.check_and_grant_achievements(p_user_id UUID, p_points INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    achievement_record RECORD;
BEGIN
    -- Loop through system-generated achievements
    FOR achievement_record IN 
        SELECT id, points_required 
        FROM public.achievements 
        WHERE is_system_generated = true 
        AND points_required <= p_points
    LOOP
        -- Grant achievement if user doesn't have it
        INSERT INTO public.user_achievements (user_id, achievement_id)
        VALUES (p_user_id, achievement_record.id)
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END LOOP;
END;
$$;

-- Update the add_student_activity function to check for achievements
CREATE OR REPLACE FUNCTION public.add_student_activity(p_user_id uuid, p_activity_type text, p_points integer DEFAULT 0, p_description text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $$
DECLARE
    new_points INTEGER;
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
    updated_at = now()
  RETURNING points INTO new_points;
    
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
  
  -- Check and grant achievements based on new points
  PERFORM check_and_grant_achievements(p_user_id, COALESCE(new_points, p_points));
END;
$$;

-- Function for admins to manually grant achievements
CREATE OR REPLACE FUNCTION public.admin_grant_achievement(p_user_id UUID, p_achievement_id UUID, p_admin_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Check if caller is admin
    IF NOT is_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Only admins can grant achievements';
    END IF;
    
    -- Grant the achievement
    INSERT INTO public.user_achievements (user_id, achievement_id, awarded_by_admin)
    VALUES (p_user_id, p_achievement_id, p_admin_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
END;
$$;

-- Insert some default achievements
INSERT INTO public.achievements (name, description, icon, rarity, points_required, is_system_generated) VALUES
('First Steps', 'Welcome to EduSanskriti! You have started your learning journey.', 'star', 'common', 0, true),
('Getting Started', 'You have earned your first 50 points!', 'trophy', 'common', 50, true),
('Active Learner', 'You have reached 100 points and are actively engaged!', 'medal', 'rare', 100, true),
('Knowledge Seeker', 'Impressive! You have earned 250 points.', 'award', 'rare', 250, true),
('Dedicated Student', 'Amazing! You have reached 500 points.', 'crown', 'epic', 500, true),
('Education Master', 'Legendary! You have earned 1000 points.', 'gem', 'legendary', 1000, true);
