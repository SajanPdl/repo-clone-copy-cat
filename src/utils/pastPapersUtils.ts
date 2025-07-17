
import { supabase } from '@/integrations/supabase/client';
import { PastPaper } from '@/utils/queryUtils';

// Upload a new past paper to the database
export const uploadPastPaper = async (paper: Omit<PastPaper, 'id' | 'downloads' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('past_papers')
      .insert([{
        ...paper,
        downloads: 0
      }])
      .select();
    
    if (error) {
      console.error("Error uploading past paper:", error);
      throw new Error("Failed to upload past paper");
    }
    
    return data?.[0] as PastPaper;
  } catch (error) {
    console.error("Error in uploadPastPaper:", error);
    throw error;
  }
};

// Update an existing past paper
export const updatePastPaper = async (id: number, updates: Partial<PastPaper>) => {
  try {
    const { data, error } = await supabase
      .from('past_papers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error("Error updating past paper:", error);
      throw new Error("Failed to update past paper");
    }
    
    return data?.[0] as PastPaper;
  } catch (error) {
    console.error("Error in updatePastPaper:", error);
    throw error;
  }
};

// Delete a past paper
export const deletePastPaper = async (id: number) => {
  try {
    const { error } = await supabase
      .from('past_papers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting past paper:", error);
      throw new Error("Failed to delete past paper");
    }
    
    return true;
  } catch (error) {
    console.error("Error in deletePastPaper:", error);
    throw error;
  }
};

// Increment download count for a past paper
export const incrementDownloads = async (id: number) => {
  try {
    const { error } = await supabase.rpc('increment_download_count', {
      material_id: id,
      table_name: 'past_papers'
    });
    
    if (error) {
      console.error("Error incrementing download count:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in incrementDownloads:", error);
    return false;
  }
};

// Get recent past papers
export const getRecentPapers = async (limit: number = 5): Promise<PastPaper[]> => {
  try {
    const { data, error } = await supabase
      .from('past_papers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching recent papers:", error);
      return [];
    }
    
    return data as PastPaper[] || [];
  } catch (error) {
    console.error("Error in getRecentPapers:", error);
    return [];
  }
};

// Get popular past papers by download count
export const getPopularPapers = async (limit: number = 5): Promise<PastPaper[]> => {
  try {
    const { data, error } = await supabase
      .from('past_papers')
      .select('*')
      .order('downloads', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching popular papers:", error);
      return [];
    }
    
    return data as PastPaper[] || [];
  } catch (error) {
    console.error("Error in getPopularPapers:", error);
    return [];
  }
};
