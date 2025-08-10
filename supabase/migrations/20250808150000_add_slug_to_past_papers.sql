-- Migration: Add slug column to past_papers
ALTER TABLE public.past_papers ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
-- Optionally backfill slugs for existing rows (simple example)
UPDATE public.past_papers SET slug = lower(replace(title, ' ', '-')) || '-' || id WHERE slug IS NULL;
