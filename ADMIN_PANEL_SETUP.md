# Admin Panel Setup Guide

This guide will help you set up and troubleshoot the admin panel functionality for adding and deleting materials.

## Quick Fix

If you're experiencing issues with the admin panel, follow these steps:

### 1. Run the Database Migration

First, run the comprehensive migration to fix all admin panel issues:

```sql
-- Copy and paste this entire migration into your Supabase SQL Editor
-- File: supabase/migrations/20250812000000_fix_admin_panel_complete.sql
```

### 2. Set Up Admin Role

After running the migration, you need to set your user as an admin:

1. Go to `/admin/setup-helper` in your admin panel
2. Click "Run Admin Checks" to see what's missing
3. If your admin role is not set, click "Set Up Admin Role"
4. Refresh the page

### 3. Verify Setup

The setup helper will check:
- ✅ User authentication
- ✅ User exists in public.users table
- ✅ Admin role assignment
- ✅ is_admin function working
- ✅ Database table access
- ✅ RLS policies configured

## Detailed Setup Steps

### Step 1: Database Migration

The migration file `20250812000000_fix_admin_panel_complete.sql` will:

1. **Fix Admin Authentication**
   - Create/update users table
   - Set up proper RLS policies
   - Create admin role management

2. **Fix Study Materials Table**
   - Add missing columns (author_id, views, rating, tags, slug, etc.)
   - Create proper indexes
   - Set up RLS policies for admin operations

3. **Fix Past Papers Table**
   - Add missing columns
   - Set up RLS policies
   - Create proper indexes

4. **Fix Categories and Grades**
   - Ensure tables exist with correct structure
   - Insert default data
   - Set up RLS policies

5. **Fix RLS Policies**
   - Drop conflicting policies
   - Create comprehensive admin policies
   - Ensure admins can insert/update/delete

### Step 2: Admin Role Assignment

If you're the first user or have database access:

```sql
-- Replace 'your-email@example.com' with your actual email
INSERT INTO public.users (id, email, role) 
SELECT id, email, 'admin' 
FROM auth.users 
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = now();
```

### Step 3: Verify RLS Policies

Check that these policies exist:

```sql
-- Check study_materials policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'study_materials';

-- Check past_papers policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'past_papers';
```

## Troubleshooting Common Issues

### Issue 1: "Permission denied" when adding materials

**Cause**: RLS policies not properly configured or user not admin

**Solution**:
1. Run the migration
2. Set up admin role
3. Check RLS policies

### Issue 2: "Function is_admin does not exist"

**Cause**: Database function not created

**Solution**:
1. Run the migration (it creates the function)
2. Check function exists: `SELECT routine_name FROM information_schema.routines WHERE routine_name = 'is_admin';`

### Issue 3: "Table study_materials does not exist"

**Cause**: Database schema not properly set up

**Solution**:
1. Run the migration
2. Check table exists: `SELECT * FROM information_schema.tables WHERE table_name = 'study_materials';`

### Issue 4: "Column author_id does not exist"

**Cause**: Missing columns in table

**Solution**:
1. Run the migration (it adds missing columns)
2. Check columns: `SELECT column_name FROM information_schema.columns WHERE table_name = 'study_materials';`

## Manual Verification

### Check Database State

```sql
-- Check users table
SELECT * FROM public.users;

-- Check study_materials table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'study_materials';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('study_materials', 'past_papers', 'categories', 'grades');

-- Check functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'increment_material_views', 'update_updated_at_column');
```

### Test Admin Function

```sql
-- Test is_admin function (replace with your user ID)
SELECT public.is_admin('your-user-id-here');
```

## Component Fixes Applied

The following components have been fixed:

1. **StudyMaterialsManager.tsx**
   - Fixed material creation logic
   - Added proper error handling
   - Fixed delete functionality

2. **PastPapersManager.tsx**
   - Fixed paper creation logic
   - Added proper error handling
   - Fixed delete functionality

3. **StudyMaterialEditor.tsx**
   - Already properly configured

4. **AdminSetupHelper.tsx**
   - New component for troubleshooting
   - Automatic admin role setup
   - Comprehensive system checks

## Testing the Fix

After applying all fixes:

1. **Test Material Creation**:
   - Go to Study Materials → Add New Material
   - Fill in required fields
   - Upload a PDF
   - Save the material

2. **Test Material Deletion**:
   - Find an existing material
   - Click the delete button
   - Confirm deletion

3. **Test Past Paper Creation**:
   - Go to Past Papers → Add New Paper
   - Fill in required fields
   - Save the paper

4. **Test Past Paper Deletion**:
   - Find an existing paper
   - Click the delete button
   - Confirm deletion

## Support

If you continue to experience issues:

1. Check the browser console for error messages
2. Use the Admin Setup Helper (`/admin/setup-helper`)
3. Verify all migration steps completed successfully
4. Check that your user has admin role in the database

## Migration File Location

The complete fix migration is located at:
```
supabase/migrations/20250812000000_fix_admin_panel_complete.sql
```

Run this file in your Supabase SQL Editor to fix all admin panel issues.
