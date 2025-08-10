-- Add admin insert/update/delete permissions for past_papers, study_materials, blog_posts, and advertisements

-- Grant admin permissions for past_papers table
CREATE POLICY "Admins can insert past papers" 
ON past_papers 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update past papers" 
ON past_papers 
FOR UPDATE 
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete past papers" 
ON past_papers 
FOR DELETE 
TO authenticated
USING (is_admin(auth.uid()));

-- Grant admin permissions for study_materials table  
CREATE POLICY "Admins can insert study materials" 
ON study_materials 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update study materials" 
ON study_materials 
FOR UPDATE 
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete study materials" 
ON study_materials 
FOR DELETE 
TO authenticated
USING (is_admin(auth.uid()));

-- Grant admin permissions for blog_posts table
CREATE POLICY "Admins can insert blog posts" 
ON blog_posts 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update blog posts" 
ON blog_posts 
FOR UPDATE 
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete blog posts" 
ON blog_posts 
FOR DELETE 
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all blog posts" 
ON blog_posts 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

-- Grant admin permissions for advertisements table
CREATE POLICY "Admins can insert advertisements" 
ON advertisements 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update advertisements" 
ON advertisements 
FOR UPDATE 
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete advertisements" 
ON advertisements 
FOR DELETE 
TO authenticated
USING (is_admin(auth.uid()));

-- Grant admin permissions for user_queries table
CREATE POLICY "Admins can update user queries" 
ON user_queries 
FOR UPDATE 
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete user queries" 
ON user_queries 
FOR DELETE 
TO authenticated
USING (is_admin(auth.uid()));

-- Grant admin permissions for categories table
CREATE POLICY "Admins can insert categories" 
ON categories 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update categories" 
ON categories 
FOR UPDATE 
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories" 
ON categories 
FOR DELETE 
TO authenticated
USING (is_admin(auth.uid()));

-- Grant admin permissions for grades table
CREATE POLICY "Admins can insert grades" 
ON grades 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update grades" 
ON grades 
FOR UPDATE 
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete grades" 
ON grades 
FOR DELETE 
TO authenticated
USING (is_admin(auth.uid()));