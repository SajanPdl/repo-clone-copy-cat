-- Create payment_requests table for manual payment verification
CREATE TABLE public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('pro_monthly', 'pro_yearly', 'premium_monthly', 'premium_yearly')),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NPR',
  payment_method TEXT NOT NULL DEFAULT 'esewa',
  transaction_id TEXT,
  sender_name TEXT,
  receipt_file_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id)
);

-- Create subscription_plans table for plan definitions
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NPR',
  duration_days INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_subscriptions table for active subscriptions
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  payment_request_id UUID REFERENCES payment_requests(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, status) WHERE status = 'active'
);

-- Enable RLS on all tables
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_requests
CREATE POLICY "Users can view their own payment requests" ON public.payment_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment requests" ON public.payment_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment requests" ON public.payment_requests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment requests" ON public.payment_requests
  FOR ALL USING (is_admin(auth.uid()));

-- RLS policies for subscription_plans (public read, admin write)
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans
  FOR ALL USING (is_admin(auth.uid()));

-- RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions
  FOR ALL USING (is_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_payment_requests_updated_at
  BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id uuid, plan_code text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF plan_code IS NULL THEN
    -- Check for any active subscription
    RETURN EXISTS (
      SELECT 1 FROM public.user_subscriptions us
      JOIN public.subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 
      AND us.status = 'active' 
      AND us.expires_at > now()
    );
  ELSE
    -- Check for specific plan subscription
    RETURN EXISTS (
      SELECT 1 FROM public.user_subscriptions us
      JOIN public.subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 
      AND sp.plan_code = $2
      AND us.status = 'active' 
      AND us.expires_at > now()
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Function to get user's subscription details
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_id uuid)
RETURNS TABLE (
  subscription_id uuid,
  plan_code text,
  plan_name text,
  status text,
  starts_at timestamptz,
  expires_at timestamptz,
  days_remaining integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    sp.plan_code,
    sp.name,
    us.status,
    us.starts_at,
    us.expires_at,
    GREATEST(0, EXTRACT(EPOCH FROM (us.expires_at - now())) / 86400)::integer as days_remaining
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = $1 
  AND us.status = 'active' 
  AND us.expires_at > now()
  ORDER BY us.expires_at DESC
  LIMIT 1;
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty result on error
    RETURN;
END;
$$;

-- Function to approve payment and create subscription
CREATE OR REPLACE FUNCTION public.approve_payment_and_create_subscription(
  payment_request_id uuid,
  admin_user_id uuid,
  admin_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  payment_record record;
  plan_record record;
  new_expires_at timestamptz;
BEGIN
  -- Check if admin
  IF NOT is_admin(admin_user_id) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- Get payment request details
  SELECT * INTO payment_record 
  FROM public.payment_requests 
  WHERE id = payment_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment request not found or not pending';
  END IF;

  -- Get plan details
  SELECT * INTO plan_record 
  FROM public.subscription_plans 
  WHERE plan_code = payment_record.plan_type AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription plan not found or inactive';
  END IF;

  -- Calculate expiration date
  new_expires_at = now() + (plan_record.duration_days || ' days')::interval;

  -- Update payment request status
  UPDATE public.payment_requests 
  SET 
    status = 'approved',
    verified_at = now(),
    verified_by = admin_user_id,
    admin_notes = COALESCE(admin_notes, admin_notes),
    updated_at = now()
  WHERE id = payment_request_id;

  -- Cancel any existing active subscription
  UPDATE public.user_subscriptions 
  SET status = 'cancelled', updated_at = now()
  WHERE user_id = payment_record.user_id AND status = 'active';

  -- Create new subscription
  INSERT INTO public.user_subscriptions (
    user_id, 
    plan_id, 
    payment_request_id, 
    status, 
    starts_at, 
    expires_at
  ) VALUES (
    payment_record.user_id,
    plan_record.id,
    payment_request_id,
    'active',
    now(),
    new_expires_at
  );

  -- Update user role to 'pro' if it's a pro plan
  IF payment_record.plan_type LIKE 'pro_%' THEN
    UPDATE public.users 
    SET role = 'pro', updated_at = now()
    WHERE id = payment_record.user_id;
  END IF;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Function to reject payment
CREATE OR REPLACE FUNCTION public.reject_payment(
  payment_request_id uuid,
  admin_user_id uuid,
  admin_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Check if admin
  IF NOT is_admin(admin_user_id) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- Update payment request status
  UPDATE public.payment_requests 
  SET 
    status = 'rejected',
    verified_at = now(),
    verified_by = admin_user_id,
    admin_notes = COALESCE(admin_notes, admin_notes),
    updated_at = now()
  WHERE id = payment_request_id AND status = 'pending';

  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (plan_code, name, description, price, duration_days, features) VALUES
('pro_monthly', 'Pro Monthly', 'Access to premium features for 1 month', 999, 30, '["premium_downloads", "advanced_tools", "exclusive_resources", "priority_support"]'),
('pro_yearly', 'Pro Yearly', 'Access to premium features for 1 year (Save 20%)', 9999, 365, '["premium_downloads", "advanced_tools", "exclusive_resources", "priority_support", "early_access"]'),
('premium_monthly', 'Premium Monthly', 'Full access to all features for 1 month', 1499, 30, '["all_pro_features", "unlimited_downloads", "custom_analytics", "api_access"]'),
('premium_yearly', 'Premium Yearly', 'Full access to all features for 1 year (Save 25%)', 13499, 365, '["all_pro_features", "unlimited_downloads", "custom_analytics", "api_access", "dedicated_support"]');

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_subscription(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_payment_and_create_subscription(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_payment(uuid, uuid, text) TO authenticated;
