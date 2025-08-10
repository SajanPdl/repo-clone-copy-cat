
-- Update documents table to have proper file storage integration (commented out - table doesn't exist)
-- ALTER TABLE public.documents 
-- ADD COLUMN IF NOT EXISTS file_size BIGINT,
-- ADD COLUMN IF NOT EXISTS mime_type TEXT,
-- ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Create file_uploads table for better file management
CREATE TABLE IF NOT EXISTS public.file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    bucket_name TEXT NOT NULL DEFAULT 'documents',
    upload_status TEXT NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on file_uploads
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for file_uploads
CREATE POLICY "Users can upload their own files" ON public.file_uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own uploads" ON public.file_uploads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads" ON public.file_uploads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all uploads" ON public.file_uploads
    FOR ALL USING (is_admin(auth.uid()));

-- Create storage bucket policies for documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    52428800, -- 50MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
) ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];

-- Create storage policies for documents bucket
CREATE POLICY "Users can upload their own documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own documents" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Admins can manage all documents" ON storage.objects
    FOR ALL USING (
        bucket_id = 'documents' 
        AND is_admin(auth.uid())
    );

-- Update trigger for file_uploads
CREATE OR REPLACE FUNCTION update_file_upload_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_file_uploads_timestamp
    BEFORE UPDATE ON public.file_uploads
    FOR EACH ROW
    EXECUTE FUNCTION update_file_upload_timestamp();

-- Function to handle file upload completion
CREATE OR REPLACE FUNCTION complete_file_upload(
    p_upload_id UUID,
    p_storage_path TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.file_uploads 
    SET 
        upload_status = 'completed',
        storage_path = p_storage_path,
        updated_at = NOW()
    WHERE id = p_upload_id AND user_id = auth.uid();
END;
$$;
