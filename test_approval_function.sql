-- Test the approval function directly
-- Replace 'your-payment-id' with the actual payment ID from your debug output

-- First, let's check what payment requests exist
SELECT 
  id,
  user_id,
  plan_type,
  status,
  created_at
FROM public.payment_requests 
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Test the approval function with a specific payment ID
-- Replace '7c1788ad-d776-444c-a499-ac8324388997' with your actual payment ID
SELECT approve_payment_and_create_subscription(
  '7c1788ad-d776-444c-a499-ac8324388997', -- Replace with your payment ID
  '17ae82ed-6dc2-4ca0-8ffc-f5ddb0253d8a', -- Your user ID
  'SQL direct test'
);

-- Check if the function exists and its definition
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'approve_payment_and_create_subscription'
AND routine_schema = 'public';

-- Check if the subscription plan exists
SELECT * FROM public.subscription_plans 
WHERE plan_code = 'pro_monthly' 
AND is_active = true;

-- Check if the payment request still exists and its status
SELECT 
  id,
  user_id,
  plan_type,
  status,
  verified_at,
  verified_by
FROM public.payment_requests 
WHERE id = '7c1788ad-d776-444c-a499-ac8324388997'; -- Replace with your payment ID

-- Check if any subscriptions were created
SELECT 
  us.id,
  us.user_id,
  us.status,
  us.starts_at,
  us.expires_at,
  sp.plan_code
FROM public.user_subscriptions us
JOIN public.subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '17ae82ed-6dc2-4ca0-8ffc-f5ddb0253d8a' -- Your user ID
ORDER BY us.created_at DESC;
