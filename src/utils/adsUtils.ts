
import { supabase } from '@/integrations/supabase/client';

export interface Ad {
  id: string;
  type: 'sponsor' | 'adsterra' | 'adsense';
  position: 'sidebar' | 'content' | 'footer' | 'header';
  adCode: string;
  active: boolean;
  title?: string;
  description?: string;
  created_at?: string;
}

// Fetch all ads from the database
export const fetchAds = async (): Promise<Ad[]> => {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching ads:', error);
      return [];
    }
    
    return data as Ad[] || [];
  } catch (error) {
    console.error('Failed to fetch ads:', error);
    return [];
  }
};

// Create a new ad in the database
export const createAd = async (ad: Omit<Ad, 'id'>): Promise<Ad | null> => {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .insert([ad])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating ad:', error);
      return null;
    }
    
    return data as Ad;
  } catch (error) {
    console.error('Failed to create ad:', error);
    return null;
  }
};

// Update an existing ad
export const updateAd = async (id: string, updates: Partial<Ad>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('advertisements')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating ad:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update ad:', error);
    return false;
  }
};

// Delete an ad from the database
export const deleteAd = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting ad:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete ad:', error);
    return false;
  }
};

// Toggle ad active status
export const toggleAdStatus = async (id: string, active: boolean): Promise<boolean> => {
  return updateAd(id, { active });
};
