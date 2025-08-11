-- QUICK FIX: Create Missing Subscription Plan Functions
-- Run this if the diagnostic shows missing functions

-- ===========================================
-- STEP 1: Ensure is_admin function exists
-- ===========================================

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND is_admin = true
  );
END;
$$;

-- ===========================================
-- STEP 2: Create subscription plan functions
-- ===========================================

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

-- ===========================================
-- STEP 3: Grant permissions
-- ===========================================

GRANT EXECUTE ON FUNCTION public.get_all_subscription_plans() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subscription_plan_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_subscription_plan(text, text, text, numeric, text, integer, jsonb, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_subscription_plan(uuid, text, text, text, numeric, text, integer, jsonb, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_subscription_plan(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- ===========================================
-- STEP 4: Verify setup
-- ===========================================

SELECT 'Setup Complete!' as info;
SELECT 'Functions created:' as info, COUNT(*) as count FROM information_schema.routines 
WHERE routine_name IN ('get_all_subscription_plans', 'get_subscription_plan_stats', 'create_subscription_plan', 'update_subscription_plan', 'delete_subscription_plan');
