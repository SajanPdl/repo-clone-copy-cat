-- Migration: Add featured_image column to study_materials
ALTER TABLE public.study_materials ADD COLUMN featured_image TEXT;
