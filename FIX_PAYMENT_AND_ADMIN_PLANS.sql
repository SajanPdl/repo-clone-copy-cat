-- FIX PAYMENT REQUEST ISSUES & ADD ADMIN SUBSCRIPTION PLAN MANAGEMENT
-- Run this in your Supabase SQL Editor to fix payment issues and add admin functionality

-- ===========================================
-- STEP 1: Fix Payment Request Issues
-- ===========================================

-- Check if payment_requests table exists and has correct structure
DO $$
BEGIN
    -- Create payment_requests table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_requests') THEN
        CREATE TABLE public.payment_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            plan_type TEXT NOT NULL,
            amount NUMERIC(10,2) NOT NULL,
            currency TEXT NOT NULL DEFAULT 'NPR',
            payment_method TEXT NOT NULL DEFAULT 'esewa',
            transaction_id TEXT,
            sender_name TEXT,
            receipt_file_path TEXT,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            admin_notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            verified_at TIMESTAMP WITH TIME ZONE,
            verified_by UUID REFERENCES auth.users(id)
        );
    END IF;
END $$;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add currency column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_requests' AND column_name = 'currency') THEN
        ALTER TABLE public.payment_requests ADD COLUMN currency TEXT NOT NULL DEFAULT 'NPR';
    END IF;
    
    -- Add payment_method column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_requests' AND column_name = 'payment_method') THEN
        ALTER TABLE public.payment_requests ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'esewa';
    END IF;
    
    -- Add receipt_file_path column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_requests' AND column_name = 'receipt_file_path') THEN
        ALTER TABLE public.payment_requests ADD COLUMN receipt_file_path TEXT;
    END IF;
    
    -- Add verified_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_requests' AND column_name = 'verified_at') THEN
        ALTER TABLE public.payment_requests ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add verified_by column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_requests' AND column_name = 'verified_by') THEN
        ALTER TABLE public.payment_requests ADD COLUMN verified_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Enable RLS on payment_requests
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can create their own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Admins can view all payment requests" ON public.payment_requests;

-- Create RLS policies for payment_requests
CREATE POLICY "Users can view their own payment requests" ON public.payment_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment requests" ON public.payment_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment requests" ON public.payment_requests
  FOR ALL USING (is_admin(auth.uid()));

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_payment_requests_updated_at ON public.payment_requests;
CREATE TRIGGER update_payment_requests_updated_at
  BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- STEP 2: Fix Storage Bucket Issue
-- ===========================================

-- Note: Storage buckets need to be created via Supabase Dashboard
-- This is a reminder to create the 'payment-receipts' bucket with public access

-- ===========================================
-- STEP 3: Add Admin Subscription Plan Management Functions
-- ===========================================

-- Function to create a new subscription plan
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

-- Function to update a subscription plan
CREATE OR REPLACE FUNCTION public.update_subscription_plan(
    plan_id uuid,
    plan_code text DEFAULT NULL,
    name text DEFAULT NULL,
    description text DEFAULT NULL,
    price numeric DEFAULT NULL,
    currency text DEFAULT NULL,
    duration_days integer DEFAULT NULL,
    features jsonb DEFAULT NULL,
    is_active boolean DEFAULT NULL
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
        plan_code = COALESCE(update_subscription_plan.plan_code, plan_code),
        name = COALESCE(update_subscription_plan.name, name),
        description = COALESCE(update_subscription_plan.description, description),
        price = COALESCE(update_subscription_plan.price, price),
        currency = COALESCE(update_subscription_plan.currency, currency),
        duration_days = COALESCE(update_subscription_plan.duration_days, duration_days),
        features = COALESCE(update_subscription_plan.features, features),
        is_active = COALESCE(update_subscription_plan.is_active, is_active),
        updated_at = now()
    WHERE id = plan_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription plan not found';
    END IF;

    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to update subscription plan: %', SQLERRM;
END;
$$;

-- Function to delete a subscription plan
CREATE OR REPLACE FUNCTION public.delete_subscription_plan(plan_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    admin_user_id uuid;
    active_subscriptions_count integer;
BEGIN
    -- Check if user is admin
    SELECT auth.uid() INTO admin_user_id;
    IF NOT is_admin(admin_user_id) THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;

    -- Check if plan has active subscriptions
    SELECT COUNT(*) INTO active_subscriptions_count
    FROM public.user_subscriptions
    WHERE plan_id = delete_subscription_plan.plan_id AND status = 'active';

    IF active_subscriptions_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete plan with active subscriptions. Deactivate instead.';
    END IF;

    -- Delete plan
    DELETE FROM public.subscription_plans WHERE id = plan_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription plan not found';
    END IF;

    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to delete subscription plan: %', SQLERRM;
END;
$$;

-- Function to get all subscription plans (admin only)
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

-- Function to get subscription plan statistics
CREATE OR REPLACE FUNCTION public.get_subscription_plan_stats()
RETURNS TABLE (
    total_plans bigint,
    active_plans bigint,
    total_subscriptions bigint,
    active_subscriptions bigint,
    total_revenue numeric,
    monthly_revenue numeric
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
        (SELECT COUNT(*) FROM public.subscription_plans) as total_plans,
        (SELECT COUNT(*) FROM public.subscription_plans WHERE is_active = true) as active_plans,
        (SELECT COUNT(*) FROM public.user_subscriptions) as total_subscriptions,
        (SELECT COUNT(*) FROM public.user_subscriptions WHERE status = 'active') as active_subscriptions,
        (SELECT COALESCE(SUM(pr.amount), 0) FROM public.payment_requests pr WHERE pr.status = 'approved') as total_revenue,
        (SELECT COALESCE(SUM(pr.amount), 0) FROM public.payment_requests pr 
         WHERE pr.status = 'approved' AND pr.created_at >= date_trunc('month', now())) as monthly_revenue;
END;
$$;

-- ===========================================
-- STEP 4: Grant Permissions
-- ===========================================

-- Grant execute permissions on admin functions
GRANT EXECUTE ON FUNCTION public.create_subscription_plan(text, text, text, numeric, text, integer, jsonb, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_subscription_plan(uuid, text, text, text, numeric, text, integer, jsonb, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_subscription_plan(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_subscription_plans() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subscription_plan_stats() TO authenticated;

-- ===========================================
-- STEP 5: Create Admin RLS Policies for subscription_plans
-- ===========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can manage all subscription plans" ON public.subscription_plans;

-- Create RLS policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all subscription plans" ON public.subscription_plans
  FOR ALL USING (is_admin(auth.uid()));

-- ===========================================
-- STEP 6: Verify Setup
-- ===========================================

-- Check tables
SELECT 'Tables created:' as info, COUNT(*) as count FROM information_schema.tables 
WHERE table_name IN ('subscription_plans', 'user_subscriptions', 'payment_requests');

-- Check functions
SELECT 'Functions created:' as info, COUNT(*) as count FROM information_schema.routines 
WHERE routine_name IN ('create_subscription_plan', 'update_subscription_plan', 'delete_subscription_plan', 'get_all_subscription_plans', 'get_subscription_plan_stats');

-- Check subscription plans
SELECT 'Available plans:' as info, COUNT(*) as count FROM public.subscription_plans WHERE is_active = true;

-- Test admin function
SELECT 'Admin function test:' as info, public.is_admin('00000000-0000-0000-0000-000000000000'::uuid) as result;

-- ===========================================
-- SUMMARY
-- ===========================================
-- ✅ Payment request system fixed
-- ✅ Admin subscription plan management functions added
-- ✅ RLS policies configured
-- ✅ Permissions granted
-- ✅ Storage bucket reminder added
