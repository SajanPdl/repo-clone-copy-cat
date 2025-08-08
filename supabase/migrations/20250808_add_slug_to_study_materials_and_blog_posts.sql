-- Add slug column to study_materials and make it unique
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS study_materials_slug_idx ON study_materials(slug);

-- Optionally, add slug to blog_posts as well
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);

-- Backfill slugs for existing study_materials
UPDATE study_materials SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL OR slug = '';

-- Backfill slugs for existing blog_posts
UPDATE blog_posts SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL OR slug = '';
