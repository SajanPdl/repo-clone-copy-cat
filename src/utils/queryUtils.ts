
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// Dashboard Stats interfaces
export interface DashboardStats {
  totalUsers: number;
  userGrowth: string;
  totalDownloads: number;
  downloadGrowth: string;
  totalStudyMaterials: number;
  materialsGrowth: string;
  openQueries: number;
  queriesGrowth: string;
  analytics: AnalyticsData[];
}

interface AnalyticsData {
  month: string;
  visits: number;
  downloads: number;
  queries: number;
}

// Recent content interfaces
export interface RecentUpload {
  id: string;
  title: string;
  category: string;
  downloads: number;
  type: string;
}

export interface RecentQuery {
  id: string;
  user_name: string;
  query_text: string;
  status: string;
  created_at: string;
}

// Study material and past paper interfaces
export type StudyMaterial = Tables<'study_materials'>;
export type PastPaper = Tables<'past_papers'>;

// Fetch dashboard stats
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // This would typically come from your database
  // For now, we'll return mock data
  return {
    totalUsers: 1243,
    userGrowth: "+12%",
    totalDownloads: 8975,
    downloadGrowth: "+8%",
    totalStudyMaterials: 235,
    materialsGrowth: "+15%",
    openQueries: 24,
    queriesGrowth: "+4%",
    analytics: [
      { month: 'Jan', visits: 4000, downloads: 2400, queries: 240 },
      { month: 'Feb', visits: 3000, downloads: 1398, queries: 210 },
      { month: 'Mar', visits: 2000, downloads: 9800, queries: 290 },
      { month: 'Apr', visits: 2780, downloads: 3908, queries: 200 },
      { month: 'May', visits: 1890, downloads: 4800, queries: 181 },
      { month: 'Jun', visits: 2390, downloads: 3800, queries: 250 },
      { month: 'Jul', visits: 3490, downloads: 4300, queries: 210 },
    ]
  };
};

// Fetch recent uploads
export const fetchRecentUploads = async (limit: number = 5): Promise<RecentUpload[]> => {
  // This would typically come from your database
  // For now, we'll return mock data
  return [
    { id: '1', title: 'Mathematics Grade 10 Notes', category: 'Mathematics', downloads: 245, type: 'study_material' },
    { id: '2', title: 'Physics Exam 2023', category: 'Physics', downloads: 189, type: 'past_paper' },
    { id: '3', title: 'Chemistry Lab Guide', category: 'Chemistry', downloads: 156, type: 'study_material' },
    { id: '4', title: 'Biology CBSE Model Paper', category: 'Biology', downloads: 132, type: 'past_paper' },
    { id: '5', title: 'Computer Science Algorithms', category: 'Computer Science', downloads: 98, type: 'study_material' },
  ];
};

// Fetch recent queries
export const fetchRecentQueries = async (limit: number = 5): Promise<RecentQuery[]> => {
  // This would typically come from your database
  // For now, we'll return mock data
  return [
    { id: '1', user_name: 'John Doe', query_text: 'When will the Grade 12 Mathematics paper be available?', status: 'Open', created_at: '2023-05-01' },
    { id: '2', user_name: 'Jane Smith', query_text: 'I cannot download Physics notes, getting an error.', status: 'Closed', created_at: '2023-04-28' },
    { id: '3', user_name: 'Alex Johnson', query_text: 'Are there any more Chemistry revision materials?', status: 'Open', created_at: '2023-04-27' },
    { id: '4', user_name: 'Sam Wilson', query_text: 'The Biology diagram is missing on page 5.', status: 'Open', created_at: '2023-04-25' },
    { id: '5', user_name: 'Emily Davis', query_text: 'Thank you for the Computer Science resources!', status: 'Closed', created_at: '2023-04-22' },
  ];
};

// Fetch study material by ID
export const fetchStudyMaterialById = async (id: number) => {
  const { data, error } = await supabase
    .from('study_materials')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching study material:", error);
    throw new Error("Failed to fetch study material");
  }

  return data;
};

// Fetch past paper by ID
export const fetchPastPaperById = async (id: number) => {
  const { data, error } = await supabase
    .from('past_papers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching past paper:", error);
    throw new Error("Failed to fetch past paper");
  }

  return data;
};

// New function to fetch study materials with filters
export const fetchStudyMaterials = async (params?: {
  grade?: string;
  subject?: string;
  category?: string;
  search?: string;
}): Promise<StudyMaterial[]> => {
  try {
    let query = supabase.from('study_materials').select('*');
    
    if (params) {
      if (params.grade && params.grade !== 'All') {
        query = query.eq('grade', params.grade);
      }
      
      if (params.subject && params.subject !== 'All') {
        query = query.eq('subject', params.subject);
      }
      
      if (params.category && params.category !== 'All') {
        query = query.eq('category', params.category);
      }
      
      if (params.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching study materials:", error);
      throw new Error("Failed to fetch study materials");
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in fetchStudyMaterials:", error);
    return [];
  }
};

// New function to fetch past papers with filters
export const fetchPastPapers = async (params?: {
  grade?: string;
  subject?: string;
  year?: number;
  search?: string;
}): Promise<PastPaper[]> => {
  try {
    let query = supabase.from('past_papers').select('*');
    
    if (params) {
      if (params.grade && params.grade !== 'All') {
        query = query.eq('grade', params.grade);
      }
      
      if (params.subject && params.subject !== 'All') {
        query = query.eq('subject', params.subject);
      }
      
      if (params.year) {
        query = query.eq('year', params.year);
      }
      
      if (params.search) {
        query = query.or(`title.ilike.%${params.search}%,subject.ilike.%${params.search}%`);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching past papers:", error);
      throw new Error("Failed to fetch past papers");
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in fetchPastPapers:", error);
    return [];
  }
};
