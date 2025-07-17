
import { supabase } from '@/integrations/supabase/client';
import { StudyMaterial } from '@/utils/queryUtils';

// Filter study materials based on various criteria
export const filterMaterials = (
  materials: StudyMaterial[],
  category: string,
  subject: string,
  searchTerm: string
) => {
  return materials.filter(material => {
    // Filter by category if specified
    if (category && category !== 'All' && material.category !== category) {
      return false;
    }
    
    // Filter by subject if specified
    if (subject && subject !== 'All' && material.subject !== subject) {
      return false;
    }
    
    // Filter by search term if specified
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      return (
        material.title.toLowerCase().includes(term) ||
        material.description.toLowerCase().includes(term) ||
        material.subject.toLowerCase().includes(term)
      );
    }
    
    return true;
  });
};

// Upload a new study material to the database
export const uploadStudyMaterial = async (material: Omit<StudyMaterial, 'id' | 'downloads' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .insert([{
        ...material,
        downloads: 0,
        date: new Date().toISOString().split('T')[0]
      }])
      .select();
    
    if (error) {
      console.error("Error uploading study material:", error);
      throw new Error("Failed to upload study material");
    }
    
    return data?.[0] as StudyMaterial;
  } catch (error) {
    console.error("Error in uploadStudyMaterial:", error);
    throw error;
  }
};

// Update an existing study material
export const updateStudyMaterial = async (id: number, updates: Partial<StudyMaterial>) => {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error("Error updating study material:", error);
      throw new Error("Failed to update study material");
    }
    
    return data?.[0] as StudyMaterial;
  } catch (error) {
    console.error("Error in updateStudyMaterial:", error);
    throw error;
  }
};

// Delete a study material
export const deleteStudyMaterial = async (id: number) => {
  try {
    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting study material:", error);
      throw new Error("Failed to delete study material");
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteStudyMaterial:", error);
    throw error;
  }
};

// Increment download count for a study material
export const incrementDownloads = async (id: number) => {
  try {
    const { error } = await supabase.rpc('increment_download_count', {
      material_id: id,
      table_name: 'study_materials'
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

// Get featured study materials
export const getFeaturedMaterials = async (limit: number = 6): Promise<StudyMaterial[]> => {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('is_featured', true)
      .order('downloads', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching featured materials:", error);
      return [];
    }
    
    return data as StudyMaterial[] || [];
  } catch (error) {
    console.error("Error in getFeaturedMaterials:", error);
    return [];
  }
};

// Toggle featured status for a study material
export const toggleFeatured = async (id: number, isFeatured: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('study_materials')
      .update({ is_featured: isFeatured })
      .eq('id', id);
    
    if (error) {
      console.error("Error toggling featured status:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in toggleFeatured:", error);
    return false;
  }
};
