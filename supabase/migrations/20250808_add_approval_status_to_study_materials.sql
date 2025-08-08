-- Add approval_status column to study_materials table
ALTER TABLE study_materials
ADD COLUMN approval_status VARCHAR(20) NOT NULL DEFAULT 'pending';

-- Optionally, backfill existing rows if needed
UPDATE study_materials SET approval_status = 'approved';
