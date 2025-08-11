# Admin Panel Setup Guide - Production Ready

This guide will help you set up a fully functional admin panel for your education platform. Follow these steps in order to ensure everything works correctly.

## 🚀 Quick Start

1. **Run the SQL scripts** in your Supabase SQL Editor in this order:
   - `ADMIN_PANEL_SETUP_PART1.sql` - Creates tables
   - `ADMIN_PANEL_SETUP_PART2.sql` - Creates functions and permissions
   - `ADMIN_PANEL_SETUP_PART3.sql` - Sets up RLS policies and sample data

2. **Set up your first admin user** (see Admin User Setup below)
3. **Test the admin panel** by navigating to `/admin` in your app
4. **Deploy to production** (see Production Checklist below)

## 📋 Prerequisites

- Supabase project set up and running
- React app with authentication working
- Basic understanding of database operations

## 🗄️ Database Setup

### Step 1: Run Part 1 (Tables)
Execute `ADMIN_PANEL_SETUP_PART1.sql` in your Supabase SQL Editor. This creates:
- `users` - User management
- `study_materials` - Educational content
- `past_papers` - Exam papers
- `user_queries` - Support tickets
- `categories` - Content categories
- `grades` - Educational levels
- `blog_posts` - Blog management
- `events` - Event management
- `marketplace_listings` - Marketplace items
- `advertisements` - Ad management

### Step 2: Run Part 2 (Functions)
Execute `ADMIN_PANEL_SETUP_PART2.sql` to create:
- `is_admin()` - Admin role checking
- `get_all_subscription_plans()` - Subscription management
- `get_subscription_plan_stats()` - Revenue analytics
- CRUD functions for subscription plans

### Step 3: Run Part 3 (Policies & Data)
Execute `ADMIN_PANEL_SETUP_PART3.sql` to set up:
- Row Level Security (RLS) policies
- Sample data for testing
- Performance indexes
- Automatic timestamp updates

## 👑 Admin User Setup

### Option 1: Direct Database Update
```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE public.users 
SET is_admin = true, role = 'admin' 
WHERE email = 'your-email@example.com';
```

### Option 2: Create Admin User Function
```sql
-- Create a function to make a user admin
CREATE OR REPLACE FUNCTION make_user_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users 
  SET is_admin = true, role = 'admin' 
  WHERE email = user_email;
  
  RETURN FOUND;
END;
$$;

-- Use it (replace with your email)
SELECT make_user_admin('your-email@example.com');
```

## 🔐 Authentication & Authorization

### Protected Routes
The admin panel uses the `ProtectedRoute` component with admin role checking:

```tsx
// In your App.tsx or routing configuration
<Route 
  path="/admin/*" 
  element={
    <ProtectedRoute requireAdmin={true}>
      <AdminLayout />
    </ProtectedRoute>
  } 
/>
```

### Admin Role Checking
The `useAuth` hook provides admin status:
```tsx
const { user, isAdmin } = useAuth();

if (!isAdmin) {
  return <Navigate to="/" replace />;
}
```

## 📊 Admin Panel Features

### Dashboard
- **Real-time statistics** - Users, materials, revenue
- **Recent activities** - User registrations, queries
- **Support management** - Handle user queries
- **Performance metrics** - Downloads, views, subscriptions

### User Management
- View all users
- Update user roles
- Monitor user activity
- Manage user permissions

### Content Management
- **Study Materials** - Approve/reject uploads
- **Past Papers** - Manage exam papers
- **Blog Posts** - Content publishing
- **Categories & Grades** - Organize content

### Financial Management
- **Subscription Plans** - Create/edit plans
- **Revenue Analytics** - Track earnings
- **Payment Verification** - Monitor transactions

### System Settings
- **Advertisements** - Manage site ads
- **Events** - Schedule and manage events
- **Marketplace** - Oversee listings

## 🧪 Testing Your Setup

### 1. Database Verification
Run this query to check if everything is set up correctly:
```sql
SELECT 'Setup Check' as info;
SELECT 
  table_name,
  CASE WHEN table_name IN ('users', 'study_materials', 'past_papers', 'user_queries') 
       THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'study_materials', 'past_papers', 'user_queries');
```

### 2. Function Verification
```sql
SELECT 
  routine_name,
  CASE WHEN routine_name IN ('is_admin', 'get_all_subscription_plans') 
       THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'get_all_subscription_plans');
```

### 3. Admin Access Test
```sql
-- Test admin function (replace with your user ID)
SELECT is_admin('your-user-id-here');
```

## 🚀 Production Deployment Checklist

### Security
- [ ] RLS policies are enabled and tested
- [ ] Admin functions have proper security checks
- [ ] User roles are properly validated
- [ ] API endpoints are protected

### Performance
- [ ] Database indexes are created
- [ ] Real-time subscriptions are optimized
- [ ] Large data sets are paginated
- [ ] Images are optimized and compressed

### Monitoring
- [ ] Error logging is implemented
- [ ] Performance metrics are tracked
- [ ] User activity is monitored
- [ ] Database queries are optimized

### Backup & Recovery
- [ ] Database backups are scheduled
- [ ] Recovery procedures are documented
- [ ] Data export functionality exists
- [ ] Rollback procedures are tested

## 🔧 Troubleshooting

### Common Issues

#### 1. "Admin access required" error
- Check if user has `is_admin = true` in database
- Verify `is_admin()` function is working
- Check RLS policies

#### 2. Tables not found
- Run the setup scripts in order
- Check if tables exist in Supabase dashboard
- Verify schema permissions

#### 3. Real-time updates not working
- Check Supabase channel subscriptions
- Verify table change triggers
- Check browser console for errors

#### 4. Permission denied errors
- Verify RLS policies are correct
- Check user authentication status
- Ensure proper table grants

### Debug Commands
```sql
-- Check user permissions
SELECT * FROM public.users WHERE id = auth.uid();

-- Test admin function
SELECT is_admin(auth.uid());

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 📱 Mobile Responsiveness

The admin panel is designed to work on all devices:
- **Desktop** - Full feature access
- **Tablet** - Optimized layout
- **Mobile** - Touch-friendly interface

## 🔄 Updates & Maintenance

### Regular Tasks
- Monitor user queries and support tickets
- Review and approve content uploads
- Analyze performance metrics
- Update subscription plans as needed

### Database Maintenance
- Monitor table sizes and performance
- Clean up old data periodically
- Update statistics and indexes
- Backup important data

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase logs
3. Check browser console for errors
4. Verify database permissions
5. Test with a fresh admin user

## 🎯 Next Steps

After setting up the admin panel:
1. **Customize the interface** to match your brand
2. **Add more features** based on your needs
3. **Implement analytics** for better insights
4. **Set up automated workflows** for common tasks
5. **Create user documentation** for your team

---

**🎉 Congratulations!** Your admin panel is now production-ready and fully functional. You can manage your entire education platform from one centralized location.
