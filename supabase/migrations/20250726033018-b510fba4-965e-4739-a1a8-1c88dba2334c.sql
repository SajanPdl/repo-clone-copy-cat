
-- Fix admin RLS policies to allow proper CRUD operations
-- Ensure admin users can bypass RLS for all administrative operations

-- Update study_materials policies
DROP POLICY IF EXISTS "Admins can delete study materials" ON study_materials;
DROP POLICY IF EXISTS "Admins can insert study materials" ON study_materials;
DROP POLICY IF EXISTS "Admins can update study materials" ON study_materials;

CREATE POLICY "Admins can delete study materials" ON study_materials 
FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert study materials" ON study_materials 
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update study materials" ON study_materials 
FOR UPDATE USING (is_admin(auth.uid()));

-- Update past_papers policies
DROP POLICY IF EXISTS "Admins can delete past papers" ON past_papers;
DROP POLICY IF EXISTS "Admins can insert past papers" ON past_papers;
DROP POLICY IF EXISTS "Admins can update past papers" ON past_papers;

CREATE POLICY "Admins can delete past papers" ON past_papers 
FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert past papers" ON past_papers 
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update past papers" ON past_papers 
FOR UPDATE USING (is_admin(auth.uid()));

-- Update categories policies
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;

CREATE POLICY "Admins can delete categories" ON categories 
FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert categories" ON categories 
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update categories" ON categories 
FOR UPDATE USING (is_admin(auth.uid()));

-- Update grades policies
DROP POLICY IF EXISTS "Admins can delete grades" ON grades;
DROP POLICY IF EXISTS "Admins can insert grades" ON grades;
DROP POLICY IF EXISTS "Admins can update grades" ON grades;

CREATE POLICY "Admins can delete grades" ON grades 
FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert grades" ON grades 
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update grades" ON grades 
FOR UPDATE USING (is_admin(auth.uid()));

-- Update blog_posts policies
DROP POLICY IF EXISTS "Admins can delete blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON blog_posts;

CREATE POLICY "Admins can delete blog posts" ON blog_posts 
FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert blog posts" ON blog_posts 
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update blog posts" ON blog_posts 
FOR UPDATE USING (is_admin(auth.uid()));

-- Update advertisements policies
DROP POLICY IF EXISTS "Admins can delete advertisements" ON advertisements;
DROP POLICY IF EXISTS "Admins can insert advertisements" ON advertisements;
DROP POLICY IF EXISTS "Admins can update advertisements" ON advertisements;

CREATE POLICY "Admins can delete advertisements" ON advertisements 
FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert advertisements" ON advertisements 
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update advertisements" ON advertisements 
FOR UPDATE USING (is_admin(auth.uid()));

-- Update user_queries policies
DROP POLICY IF EXISTS "Admins can delete user queries" ON user_queries;
DROP POLICY IF EXISTS "Admins can update user queries" ON user_queries;

CREATE POLICY "Admins can delete user queries" ON user_queries 
FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update user queries" ON user_queries 
FOR UPDATE USING (is_admin(auth.uid()));

-- Add admin view policy for user_queries
CREATE POLICY "Admins can view all user queries" ON user_queries 
FOR SELECT USING (is_admin(auth.uid()));

-- Ensure users table has proper admin policies
DROP POLICY IF EXISTS "Admins can delete users" ON users;
CREATE POLICY "Admins can delete users" ON users 
FOR DELETE USING (is_admin(auth.uid()));

-- Add admin view policy for marketplace_listings
CREATE POLICY "Admins can view all marketplace listings" ON marketplace_listings 
FOR SELECT USING (is_admin(auth.uid()));
