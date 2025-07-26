
-- Create admin user record in the users table
INSERT INTO public.users (id, email, role, created_at, updated_at)
VALUES ('cb0fcbec-5a71-41bc-9845-595053ee186a', 'sajanpoudel351@gmail.com', 'admin', now(), now())
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  updated_at = now();

-- Create student profile for the admin user
INSERT INTO public.student_profiles (user_id, points, level, total_uploads, total_downloads, total_sales, achievements, created_at, updated_at)
VALUES ('cb0fcbec-5a71-41bc-9845-595053ee186a', 1000, 'Education Master', 0, 0, 0, '[]'::jsonb, now(), now())
ON CONFLICT (user_id) DO UPDATE SET 
  updated_at = now();
