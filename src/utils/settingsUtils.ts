// Upload a file to a storage bucket and update the setting with the public URL
export const uploadSettingFile = async (
  file: File,
  settingKey: string,
  bucket: string = 'site-assets',
  folder: string = ''
): Promise<string> => {
  // Generate a unique file path
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const fileName = `${settingKey}-${Date.now()}.${ext}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true
  });
  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
  const publicUrl = urlData?.publicUrl;
  if (!publicUrl) throw new Error('Failed to get public URL');

  // Update the setting in DB
  await upsertSetting({ setting_key: settingKey, setting_value: publicUrl });

  return publicUrl;
};
import { supabase } from '@/integrations/supabase/client';

export interface SiteSetting {
  id?: string;
  setting_key: string;
  setting_value: string;
  description?: string | null;
  updated_at?: string | null;
}

export const fetchAllSettings = async (): Promise<SiteSetting[]> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*');
  if (error) throw error;
  return data || [];
};

export const fetchSetting = async (key: string): Promise<SiteSetting | null> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('setting_key', key)
    .single();
  if (error) return null;
  return data;
};

export const upsertSetting = async (setting: SiteSetting): Promise<void> => {
  const { error } = await supabase
    .from('site_settings')
    .upsert({
      ...setting,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
};

export const upsertSettings = async (settings: SiteSetting[]): Promise<void> => {
  const { error } = await supabase
    .from('site_settings')
    .upsert(settings.map(s => ({ ...s, updated_at: new Date().toISOString() })));
  if (error) throw error;
};
