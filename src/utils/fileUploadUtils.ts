
import { supabase } from '@/integrations/supabase/client';

export interface FileUpload {
  id: string;
  user_id: string;
  file_name: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  bucket_name: string;
  upload_status: 'pending' | 'completed' | 'failed';
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const uploadFileToStorage = async (
  file: File,
  folderPath: string = 'general'
): Promise<{ fileUrl: string; uploadId: string }> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  // Validate file size (50MB limit)
  if (file.size > 50 * 1024 * 1024) {
    throw new Error('File size must be less than 50MB');
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported');
  }

  try {
    // Create file upload record first
    const { data: uploadRecord, error: uploadError } = await supabase
      .from('file_uploads')
      .insert({
        user_id: user.id,
        file_name: `${Date.now()}-${file.name}`,
        original_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: '', // Will be updated after successful upload
        bucket_name: 'documents',
        upload_status: 'pending',
        metadata: {
          folder: folderPath,
          uploaded_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (uploadError) throw uploadError;

    // Create unique file path
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${user.id}/${folderPath}/${uploadRecord.id}.${fileExt}`;

    // Upload to Supabase storage
    const { error: storageError, data: storageData } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (storageError) {
      // Update upload status to failed
      await supabase
        .from('file_uploads')
        .update({ upload_status: 'failed' })
        .eq('id', uploadRecord.id);
      throw storageError;
    }

    // Update upload record with storage path
    await supabase
      .from('file_uploads')
      .update({
        storage_path: fileName,
        upload_status: 'completed'
      })
      .eq('id', uploadRecord.id);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return {
      fileUrl: urlData.publicUrl,
      uploadId: uploadRecord.id
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

export const deleteFile = async (uploadId: string): Promise<void> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  try {
    // Get file upload record
    const { data: uploadRecord, error: fetchError } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('id', uploadId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([uploadRecord.storage_path]);

    if (storageError) throw storageError;

    // Delete upload record
    const { error: deleteError } = await supabase
      .from('file_uploads')
      .delete()
      .eq('id', uploadId);

    if (deleteError) throw deleteError;
  } catch (error) {
    console.error('File deletion error:', error);
    throw error;
  }
};

export const getUserUploads = async (): Promise<FileUpload[]> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  try {
    const { data, error } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user uploads:', error);
    throw error;
  }
};
