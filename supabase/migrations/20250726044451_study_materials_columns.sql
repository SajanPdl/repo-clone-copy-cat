
-- Enable RLS on tables that currently have it disabled
ALTER TABLE study_materials ENABLE ROW LEVEL Security;
ALTER TABLE past_papers ENABLE ROW LEVEL Security;
ALTER TABLE documents ENABLE ROW LEVEL Security;

-- Add missing columns to study_materials for better functionality
ALTER TABLE study_materials 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);

-- Add missing columns to past_papers for better functionality  
ALTER TABLE past_papers
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);

-- Create a function to increment views
CREATE OR REPLACE FUNCTION increment_material_views(material_id INTEGER, table_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF table_name = 'study_materials' THEN
    UPDATE study_materials SET views = views + 1 WHERE id = material_id;
  ELSIF table_name = 'past_papers' THEN
    UPDATE past_papers SET views = views + 1 WHERE id = material_id;
  END IF;
END;
$$;

-- Create materialized view for dashboard stats (optional performance optimization)
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT 
  sp.user_id,
  sp.points,
  sp.level,
  sp.total_uploads,
  sp.total_downloads,
  sp.total_sales,
  COUNT(DISTINCT b.id) as total_bookmarks,
  COUNT(DISTINCT sa.id) as total_activities
FROM student_profiles sp
LEFT JOIN bookmarks b ON b.user_id = sp.user_id
LEFT JOIN student_activities sa ON sa.user_id = sp.user_id
GROUP BY sp.user_id, sp.points, sp.level, sp.total_uploads, sp.total_downloads, sp.total_sales;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_content ON bookmarks(user_id, content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_student_activities_user_date ON student_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_materials_featured ON study_materials(is_featured, downloads DESC);
CREATE INDEX IF NOT EXISTS idx_past_papers_year_subject ON past_papers(year, subject);
