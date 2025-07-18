import { supabase } from '@/integrations/supabase/client';

// Types
export interface Ad {
  id: string;
  title?: string;
  content?: string;
  image?: string;
  url?: string;
  type: 'sponsor' | 'adsterra' | 'adsense';
  adCode?: string;
  active: boolean;
  position?: 'sidebar' | 'content' | 'footer' | 'header';
  description?: string;
}

// Fetch ads by position from the database
export const fetchAdsByPosition = async (position: string): Promise<Ad[]> => {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .eq('position', position);
    
    if (error) {
      console.error('Failed to fetch ads:', error);
      return [];
    }
    
    // Convert database format to expected format
    return (data || []).map((ad): Ad => ({
      id: ad.id.toString(),
      title: ad.title,
      content: ad.content || '',
      image: ad.image_url || '',
      url: ad.link_url || '',
      type: 'sponsor' as const,
      position: ad.position as 'sidebar' | 'content' | 'footer' | 'header',
      adCode: '',
      active: ad.is_active
    }));
  } catch (error) {
    console.error('Failed to fetch ads:', error);
    return [];
  }
};

// Create a new ad in the database
export const createAd = async (ads: Omit<Ad, "id">[]): Promise<Ad[]> => {
  try {
    // Convert Ad format to database format
    const dbAds = ads.map(ad => ({
      title: ad.title || '',
      content: ad.content || '',
      image_url: ad.image || '',
      link_url: ad.url || '',
      position: 'banner',
      is_active: ad.active || true
    }));

    const { data, error } = await supabase
      .from('advertisements')
      .insert(dbAds)
      .select();
      
    if (error) {
      console.error('Failed to create ads:', error);
      return [];
    }
    
    // Convert back to Ad format
    return (data || []).map((ad): Ad => ({
      id: ad.id.toString(),
      title: ad.title,
      content: ad.content || '',
      image: ad.image_url || '',
      url: ad.link_url || '',
      type: 'sponsor' as const,
      position: ad.position as 'sidebar' | 'content' | 'footer' | 'header',
      adCode: '',
      active: ad.is_active
    }));
  } catch (error) {
    console.error('Failed to create ads:', error);
    return [];
  }
};

// Get a single ad by ID
export const getAdById = async (id: string): Promise<Ad | null> => {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('id', parseInt(id))
      .single();
      
    if (error) {
      console.error('Failed to get ad by ID:', error);
      return null;
    }
    
    // Convert database format to Ad format
    return {
      id: data.id.toString(),
      title: data.title,
      content: data.content || '',
      image: data.image_url || '',
      url: data.link_url || '',
      type: 'sponsor' as const,
      position: data.position as 'sidebar' | 'content' | 'footer' | 'header',
      adCode: '',
      active: data.is_active
    };
  } catch (error) {
    console.error('Failed to get ad by ID:', error);
    return null;
  }
};

// Update an existing ad
export const updateAd = async (id: string, updates: Partial<Ad>): Promise<Ad | null> => {
  try {
    // Convert Ad format to database format
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.image !== undefined) dbUpdates.image_url = updates.image;
    if (updates.url !== undefined) dbUpdates.link_url = updates.url;
    if (updates.active !== undefined) dbUpdates.is_active = updates.active;

    const { data, error } = await supabase
      .from('advertisements')
      .update(dbUpdates)
      .eq('id', parseInt(id))
      .select()
      .single();
      
    if (error) {
      console.error('Failed to update ad:', error);
      return null;
    }
    
    // Convert back to Ad format
    return {
      id: data.id.toString(),
      title: data.title,
      content: data.content || '',
      image: data.image_url || '',
      url: data.link_url || '',
      type: 'sponsor' as const,
      position: data.position as 'sidebar' | 'content' | 'footer' | 'header',
      adCode: '',
      active: data.is_active
    };
  } catch (error) {
    console.error('Failed to update ad:', error);
    return null;
  }
};

// Fetch all ads from the database
export const fetchAds = async (): Promise<Ad[]> => {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      console.error('Failed to fetch ads:', error);
      return [];
    }
    
    // Convert database format to expected format
    return (data || []).map((ad): Ad => ({
      id: ad.id.toString(),
      title: ad.title,
      content: ad.content || '',
      image: ad.image_url || '',
      url: ad.link_url || '',
      type: 'sponsor' as const,
      adCode: '',
      active: ad.is_active,
      position: ad.position as 'sidebar' | 'content' | 'footer' | 'header',
    }));
  } catch (error) {
    console.error('Failed to fetch ads:', error);
    return [];
  }
};

// Toggle ad status
export const toggleAdStatus = async (id: string): Promise<boolean> => {
  try {
    const current = await getAdById(id);
    if (!current) return false;
    
    const { error } = await supabase
      .from('advertisements')
      .update({ is_active: !current.active })
      .eq('id', parseInt(id));
      
    return !error;
  } catch (error) {
    console.error('Failed to toggle ad status:', error);
    return false;
  }
};

// Delete an ad from the database
export const deleteAd = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', parseInt(id));
      
    if (error) {
      console.error('Failed to delete ad:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete ad:', error);
    return false;
  }
};