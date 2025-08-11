# Storage Bucket Setup for Payment Receipts

## Problem
Payment request submission is failing because the `payment-receipts` storage bucket doesn't exist in Supabase.

## Solution
Follow these steps to create the required storage bucket:

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar

### Step 2: Create Storage Bucket
1. Click **"Create a new bucket"**
2. Enter the following details:
   - **Name**: `payment-receipts`
   - **Public bucket**: ✅ **Check this option** (allows public access to uploaded files)
   - **File size limit**: `10 MB` (or your preferred limit)
   - **Allowed MIME types**: `image/*,application/pdf` (for images and PDFs)

### Step 3: Configure RLS Policies
After creating the bucket, go to the **Policies** tab and add these policies:

#### Policy 1: Allow authenticated users to upload
```sql
-- Policy name: "Allow authenticated users to upload receipts"
-- Operation: INSERT
-- Target roles: authenticated
-- Policy definition:
(auth.role() = 'authenticated')
```

#### Policy 2: Allow users to view their own receipts
```sql
-- Policy name: "Allow users to view their own receipts"
-- Operation: SELECT
-- Target roles: authenticated
-- Policy definition:
(auth.uid()::text = (storage.foldername(name))[1])
```

#### Policy 3: Allow admins to view all receipts
```sql
-- Policy name: "Allow admins to view all receipts"
-- Operation: SELECT
-- Target roles: authenticated
-- Policy definition:
(
  SELECT is_admin(auth.uid())
)
```

### Step 4: Test the Setup
1. Try submitting a payment request with a receipt file
2. Check if the file uploads successfully
3. Verify the payment request is created in the database

## Alternative: Disable File Upload (Temporary Fix)
If you want to test payment requests without file uploads, you can temporarily modify the frontend code to skip file uploads:

In `src/components/subscription/EnhancedSubscriptionWorkflow.tsx`, comment out the file upload section:

```typescript
// Comment out this section temporarily
/*
if (paymentForm.receiptFile) {
  const fileExt = paymentForm.receiptFile.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `receipts/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('payment-receipts')
    .upload(filePath, paymentForm.receiptFile);

  if (uploadError) throw uploadError;
  receiptPath = filePath;
}
*/
```

## Verification
After setting up the storage bucket, payment requests should work properly. You can verify by:

1. **Testing payment submission**: Submit a payment request with a receipt
2. **Checking admin panel**: View payment requests in the admin panel
3. **Testing approval**: Approve a payment request and verify subscription creation

## Troubleshooting
- **"Bucket not found" error**: Make sure the bucket name is exactly `payment-receipts`
- **"Permission denied" error**: Check RLS policies are correctly configured
- **"File too large" error**: Increase the file size limit in bucket settings
