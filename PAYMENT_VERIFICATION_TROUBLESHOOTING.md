# Payment Verification Troubleshooting Guide

## Quick Test Links

1. **Payment Verification Debug**: `/debug/payment-verification`
2. **General Payment Debug**: `/debug/payment`
3. **Payment Test**: `/debug/payment-test`
4. **Admin Panel**: `/admin` (Payment Verification section)

## Common Issues and Solutions

### 1. "Admin access required" Error

**Problem**: The verification fails because the user doesn't have admin privileges.

**Check**:
- Visit `/debug/payment-verification` and look at the "Admin Status" section
- Ensure your user has the `admin` role in the `public.users` table

**Solution**:
```sql
-- Check if user exists in public.users table
SELECT * FROM public.users WHERE id = 'your-user-id';

-- Add admin role if missing
INSERT INTO public.users (id, email, role, created_at, updated_at)
VALUES ('your-user-id', 'your-email@example.com', 'admin', now(), now())
ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = now();
```

### 2. "Function does not exist" Error

**Problem**: The RPC functions are not properly created in the database.

**Check**:
- Visit `/debug/payment-verification` and look at "RPC Functions" and "Approve Function" sections
- Check for errors in the function existence tests

**Solution**:
```sql
-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('approve_payment_and_create_subscription', 'reject_payment', 'is_admin');

-- If missing, run the payment_system_setup.sql script again
```

### 3. "Payment request not found" Error

**Problem**: The payment request doesn't exist or has wrong status.

**Check**:
- Visit `/debug/payment-verification` and look at "Payment Requests" section
- Ensure there are pending payment requests to verify

**Solution**:
```sql
-- Check payment requests
SELECT * FROM public.payment_requests ORDER BY created_at DESC;

-- Create a test payment if none exist
INSERT INTO public.payment_requests (
  user_id, plan_type, amount, currency, payment_method, 
  transaction_id, sender_name, status
) VALUES (
  'your-user-id', 'pro_monthly', 999, 'NPR', 'esewa',
  'TEST_' || extract(epoch from now()), 'Test User', 'pending'
);
```

### 4. "Subscription plan not found" Error

**Problem**: The subscription plan referenced in the payment request doesn't exist.

**Check**:
- Visit `/debug/payment-verification` and look at "Subscription Plans" section
- Ensure plans exist and are active

**Solution**:
```sql
-- Check subscription plans
SELECT * FROM public.subscription_plans WHERE is_active = true;

-- Insert plans if missing
INSERT INTO public.subscription_plans (plan_code, name, description, price, duration_days, features, is_active) 
VALUES
('pro_monthly', 'Pro Monthly', 'Access to premium features for 1 month', 999, 30, '["premium_downloads", "advanced_tools", "exclusive_resources", "priority_support"]', true),
('pro_yearly', 'Pro Yearly', 'Access to premium features for 1 year (Save 20%)', 9999, 365, '["premium_downloads", "advanced_tools", "exclusive_resources", "priority_support", "early_access"]', true)
ON CONFLICT (plan_code) DO NOTHING;
```

### 5. Database Permission Issues

**Problem**: The user doesn't have proper permissions to execute functions or access tables.

**Check**:
- Look for permission-related errors in the debug output
- Check if RLS policies are blocking access

**Solution**:
```sql
-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.approve_payment_and_create_subscription(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_payment(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'payment_requests';
```

## Step-by-Step Debugging Process

### Step 1: Check Authentication and Admin Status
1. Visit `/debug/payment-verification`
2. Look at "Authentication" and "Admin Status" sections
3. Ensure you're logged in and have admin privileges

### Step 2: Verify Database Setup
1. Check "Payment Requests" section - should show existing requests
2. Check "Subscription Plans" section - should show active plans
3. Check "RPC Functions" and "Approve Function" sections - should show "OK"

### Step 3: Test the Verification Process
1. If no payment requests exist, click "Create Test Payment"
2. Click "Test Verification Process" to test the approval function
3. Check for specific error messages

### Step 4: Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try to verify a payment and look for error messages
4. Check Network tab for failed API calls

## Quick Fix Commands

### Reset Payment System (if everything is broken)
```sql
-- Drop and recreate tables (WARNING: This will delete all data)
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;
DROP TABLE IF EXISTS public.payment_requests CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;

-- Run the payment_system_setup.sql script again
```

### Fix Admin Role
```sql
-- Ensure your user has admin role
INSERT INTO public.users (id, email, role, created_at, updated_at)
VALUES ('your-user-id', 'your-email@example.com', 'admin', now(), now())
ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = now();
```

### Check Function Logs
```sql
-- Enable function logging to see what's happening
ALTER FUNCTION public.approve_payment_and_create_subscription(uuid, uuid, text) SET log_statement = 'all';
```

## Common Error Messages and Solutions

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| "Admin access required" | User not admin | Add admin role to user |
| "function does not exist" | RPC function missing | Run payment_system_setup.sql |
| "Payment request not found" | No pending payments | Create test payment |
| "Subscription plan not found" | Plan doesn't exist | Insert subscription plans |
| "permission denied" | RLS policy blocking | Check and fix RLS policies |
| "relation does not exist" | Table missing | Run payment_system_setup.sql |

## Testing the Complete Flow

1. **Create a test payment**:
   - Visit `/debug/payment-verification`
   - Click "Create Test Payment"

2. **Verify the payment**:
   - Go to `/admin` → Payment Verification section
   - Find the test payment and click "Approve"

3. **Check the result**:
   - Visit `/payment-status` to see if subscription was created
   - Check `/debug/payment-verification` for updated data

## Still Having Issues?

If you're still experiencing problems after following this guide:

1. **Collect debug information**:
   - Visit `/debug/payment-verification`
   - Take screenshots of all sections
   - Check browser console for errors

2. **Check database directly**:
   - Go to Supabase Dashboard → SQL Editor
   - Run the test queries from this guide

3. **Verify the setup**:
   - Ensure `payment_system_setup.sql` was run successfully
   - Check that all tables and functions exist

4. **Contact support** with:
   - Screenshots of debug pages
   - Browser console errors
   - Database query results
   - Steps you've already tried
