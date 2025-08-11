-- ADMIN PANEL SETUP - PART 2: Functions and Permissions
-- Run this after PART 1 to set up admin functions

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
-- STEP 3: Grant permissions
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

SELECT 'Functions and permissions set up successfully! ✅' as status;
