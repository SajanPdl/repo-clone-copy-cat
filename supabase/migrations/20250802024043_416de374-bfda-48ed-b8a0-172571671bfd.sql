
-- Create events table for calendar/events system
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('exam', 'fest', 'webinar', 'job_fair', 'workshop', 'other')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  region TEXT,
  stream TEXT,
  max_attendees INTEGER,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create job_listings table for jobs/internships
CREATE TABLE public.job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT,
  job_type TEXT NOT NULL CHECK (job_type IN ('internship', 'full_time', 'part_time', 'contract', 'freelance')),
  location TEXT,
  is_remote BOOLEAN DEFAULT false,
  stipend INTEGER, -- For internships (per month)
  salary_min INTEGER, -- Annual salary range
  salary_max INTEGER,
  experience_required TEXT,
  skills_required TEXT[],
  application_url TEXT,
  application_deadline TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create referral_program table for ambassador/referral system
CREATE TABLE public.referral_program (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  total_referrals INTEGER DEFAULT 0,
  total_rewards_earned NUMERIC DEFAULT 0,
  current_month_referrals INTEGER DEFAULT 0,
  rank_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create referral_transactions table
CREATE TABLE public.referral_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_amount NUMERIC DEFAULT 0,
  reward_type TEXT CHECK (reward_type IN ('points', 'credits', 'merchandise')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'redeemed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create merch_store table for merchandise
CREATE TABLE public.merch_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('stickers', 'tees', 'planners', 'accessories', 'other')),
  price NUMERIC NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_print_on_demand BOOLEAN DEFAULT false,
  printify_product_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create merch_orders table
CREATE TABLE public.merch_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES merch_store(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC NOT NULL,
  shipping_address JSONB NOT NULL,
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_id TEXT,
  tracking_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create mind_maps table for interactive mind maps
CREATE TABLE public.mind_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  map_data JSONB NOT NULL, -- Stores the mind map structure
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create daily_planner table for student planning
CREATE TABLE public.daily_planner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_completed BOOLEAN DEFAULT false,
  pomodoro_sessions INTEGER DEFAULT 0,
  estimated_time INTEGER, -- in minutes
  category TEXT DEFAULT 'study' CHECK (category IN ('study', 'assignment', 'exam', 'personal', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create pomodoro_sessions table for tracking focus time
CREATE TABLE public.pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES daily_planner(id),
  session_duration INTEGER NOT NULL DEFAULT 25, -- in minutes
  break_duration INTEGER NOT NULL DEFAULT 5,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create search_analytics table for enhanced search
CREATE TABLE public.search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  search_query TEXT NOT NULL,
  search_category TEXT,
  results_count INTEGER,
  clicked_result_id TEXT,
  search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_planner ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for events
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (is_admin(auth.uid()));

-- Create RLS policies for job_listings
CREATE POLICY "Anyone can view active job listings" ON public.job_listings FOR SELECT USING (true);
CREATE POLICY "Admins can manage job listings" ON public.job_listings FOR ALL USING (is_admin(auth.uid()));

-- Create RLS policies for referral_program
CREATE POLICY "Users can view their own referral info" ON public.referral_program FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own referral info" ON public.referral_program FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own referral info" ON public.referral_program FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all referral info" ON public.referral_program FOR ALL USING (is_admin(auth.uid()));

-- Create RLS policies for referral_transactions
CREATE POLICY "Users can view their referral transactions" ON public.referral_transactions FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);
CREATE POLICY "System can insert referral transactions" ON public.referral_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage referral transactions" ON public.referral_transactions FOR ALL USING (is_admin(auth.uid()));

-- Create RLS policies for merch_store
CREATE POLICY "Anyone can view active merch" ON public.merch_store FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage merch" ON public.merch_store FOR ALL USING (is_admin(auth.uid()));

-- Create RLS policies for merch_orders
CREATE POLICY "Users can view their own orders" ON public.merch_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.merch_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON public.merch_orders FOR ALL USING (is_admin(auth.uid()));

-- Create RLS policies for mind_maps
CREATE POLICY "Anyone can view public mind maps" ON public.mind_maps FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own mind maps" ON public.mind_maps FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create mind maps" ON public.mind_maps FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own mind maps" ON public.mind_maps FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all mind maps" ON public.mind_maps FOR ALL USING (is_admin(auth.uid()));

-- Create RLS policies for daily_planner
CREATE POLICY "Users can manage their own tasks" ON public.daily_planner FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for pomodoro_sessions
CREATE POLICY "Users can manage their own sessions" ON public.pomodoro_sessions FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for search_analytics
CREATE POLICY "Users can view their own search history" ON public.search_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert search analytics" ON public.search_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all search analytics" ON public.search_analytics FOR ALL USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_event_type ON public.events(event_type);
CREATE INDEX idx_job_listings_job_type ON public.job_listings(job_type);
CREATE INDEX idx_job_listings_location ON public.job_listings(location);
CREATE INDEX idx_referral_program_user_id ON public.referral_program(user_id);
CREATE INDEX idx_referral_program_referral_code ON public.referral_program(referral_code);
CREATE INDEX idx_daily_planner_user_id ON public.daily_planner(user_id);
CREATE INDEX idx_daily_planner_due_date ON public.daily_planner(due_date);
CREATE INDEX idx_search_analytics_query ON public.search_analytics(search_query);

-- Add triggers for updated_at columns
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_listings_updated_at BEFORE UPDATE ON public.job_listings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_program_updated_at BEFORE UPDATE ON public.referral_program
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merch_store_updated_at BEFORE UPDATE ON public.merch_store
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merch_orders_updated_at BEFORE UPDATE ON public.merch_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mind_maps_updated_at BEFORE UPDATE ON public.mind_maps
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_planner_updated_at BEFORE UPDATE ON public.daily_planner
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
