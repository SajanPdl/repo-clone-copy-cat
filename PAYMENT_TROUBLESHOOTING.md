# Payment Flow Troubleshooting Guide

## Quick Test Links

1. **Payment Test Page**: `/debug/payment-test`
2. **Full Debug Page**: `/debug/payment`
3. **Subscription Page**: `/subscription`
4. **Checkout Page**: `/checkout?plan=pro_monthly`

## Common Issues and Solutions

### 1. Database Setup Issues

**Problem**: Tables or functions not found
**Solution**: Run the SQL setup in Supabase SQL editor

```sql
-- Copy and paste the content from payment_system_setup.sql
-- This will create all necessary tables, functions, and policies
```

### 2. Authentication Issues

**Problem**: User not logged in
**Solution**: 
- Make sure user is authenticated
- Check browser console for auth errors
- Try logging out and back in

### 3. RLS Policy Issues

**Problem**: Permission denied errors
**Solution**: Check if RLS policies are properly set up

```sql
-- Check RLS policies
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('payment_requests', 'subscription_plans', 'user_subscriptions');
```

### 4. Storage Bucket Issues

**Problem**: File upload fails
**Solution**: Verify storage bucket exists

```sql
-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'payment-receipts';
```

### 5. Function Issues

**Problem**: Database functions not working
**Solution**: Check if functions exist

```sql
-- Check functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('has_active_subscription', 'get_user_subscription');
```

## Testing Steps

### Step 1: Database Test
1. Go to `/debug/payment-test`
2. Click "Test Database Connection"
3. Should show "✅ Database connection successful"

### Step 2: Authentication Test
1. Make sure you're logged in
2. Check the Authentication status card
3. Should show "✅ Logged In"

### Step 3: Plans Test
1. Check the Subscription Plans status card
2. Should show "✅ X Plans" (where X > 0)

### Step 4: Payment Test
1. Fill in test form with:
   - Transaction ID: `TEST_123456789`
   - Sender Name: `Test User`
2. Click "Test Payment Submission"
3. Should create a payment request successfully

### Step 5: Full Flow Test
1. Go to `/subscription`
2. Click "Upgrade" on any plan
3. Should navigate to checkout page
4. Fill out payment form
5. Submit payment

## Debug Information

### Check Browser Console
- Open Developer Tools (F12)
- Look for any JavaScript errors
- Check Network tab for failed requests

### Check Supabase Logs
- Go to Supabase Dashboard
- Check Logs section for any errors
- Look for RLS policy violations

### Common Error Messages

1. **"relation does not exist"**: Tables not created
2. **"permission denied"**: RLS policy issues
3. **"function does not exist"**: Functions not created
4. **"authentication required"**: User not logged in

## Quick Fixes

### If Tables Don't Exist
```sql
-- Run the complete setup
-- Copy content from payment_system_setup.sql
```

### If Functions Don't Work
```sql
-- Recreate functions
-- Copy function definitions from payment_system_setup.sql
```

### If RLS Policies Are Wrong
```sql
-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view their own payment requests" ON public.payment_requests;
-- Then recreate all policies from payment_system_setup.sql
```

### If Storage Bucket Missing
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;
```

## Support

If you're still having issues:
1. Check the debug pages for specific error messages
2. Look at browser console for JavaScript errors
3. Check Supabase logs for database errors
4. Verify all SQL setup was run successfully
