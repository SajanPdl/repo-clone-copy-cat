
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

// Database types
export type StudyMaterial = Tables<'study_materials'>;
export type PastPaper = Tables<'past_papers'>;
export type BlogPost = Tables<'blog_posts'>;
export type Category = Tables<'categories'>;
export type Grade = Tables<'grades'>;
export type Advertisement = Tables<'advertisements'>;
export type UserQuery = Tables<'user_queries'>;

// Fetch dashboard stats
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get user count - assuming we have user tracking
    const userCountQuery = supabase.from('users').select('id', { count: 'exact' });
    
    // Get study materials count
    const materialsCountQuery = supabase.from('study_materials').select('id', { count: 'exact' });
    
    // Get total downloads from study materials and past papers
    const studyMaterialsDownloadsQuery = supabase.from('study_materials').select('downloads');
    const pastPapersDownloadsQuery = supabase.from('past_papers').select('downloads');
    
    // Get queries count with open status
    const openQueriesQuery = supabase.from('user_queries').select('id', { count: 'exact' }).eq('status', 'open');
    
    const [userCount, materialsCount, studyDownloads, pastDownloads, openQueries] = await Promise.all([
      userCountQuery,
      materialsCountQuery,
      studyMaterialsDownloadsQuery,
      pastPapersDownloadsQuery,
      openQueriesQuery
    ]);
    
    // Calculate total downloads
    const totalStudyDownloads = studyDownloads.data?.reduce((sum, item) => sum + (item.downloads || 0), 0) || 0;
    const totalPastDownloads = pastDownloads.data?.reduce((sum, item) => sum + (item.downloads || 0), 0) || 0;
    const totalDownloads = totalStudyDownloads + totalPastDownloads;
    
    return {
      totalUsers: userCount.count || 0,
      userGrowth: "+12%", // This would require historical data to calculate
      totalDownloads,
      downloadGrowth: "+8%", // This would require historical data to calculate
      totalStudyMaterials: materialsCount.count || 0,
      materialsGrowth: "+15%", // This would require historical data to calculate
      openQueries: openQueries.count || 0,
      queriesGrowth: "+4%", // This would require historical data to calculate
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
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Return fallback data
    return {
      totalUsers: 0,
      userGrowth: "0%",
      totalDownloads: 0,
      downloadGrowth: "0%",
      totalStudyMaterials: 0,
      materialsGrowth: "0%",
      openQueries: 0,
      queriesGrowth: "0%",
      analytics: []
    };
  }
};

// Fetch recent uploads
export const fetchRecentUploads = async (limit: number = 5): Promise<RecentUpload[]> => {
  try {
    // Get recent study materials
    const studyMaterialsQuery = supabase
      .from('study_materials')
      .select('id, title, category, downloads, created_at')
      .order('created_at', { ascending: false })
      .limit(Math.ceil(limit / 2));
    
    // Get recent past papers
    const pastPapersQuery = supabase
      .from('past_papers')
      .select('id, title, subject, downloads, created_at')
      .order('created_at', { ascending: false })
      .limit(Math.ceil(limit / 2));
    
    const [studyMaterials, pastPapers] = await Promise.all([
      studyMaterialsQuery,
      pastPapersQuery
    ]);
    
    const recentUploads: RecentUpload[] = [];
    
    // Add study materials
    studyMaterials.data?.forEach(material => {
      recentUploads.push({
        id: material.id.toString(),
        title: material.title,
        category: material.category,
        downloads: material.downloads || 0,
        type: 'study_material'
      });
    });
    
    // Add past papers
    pastPapers.data?.forEach(paper => {
      recentUploads.push({
        id: paper.id.toString(),
        title: paper.title,
        category: paper.subject,
        downloads: paper.downloads || 0,
        type: 'past_paper'
      });
    });
    
    // Sort by most recent and limit
    return recentUploads.slice(0, limit);
  } catch (error) {
    console.error("Error fetching recent uploads:", error);
    return [];
  }
};

// Fetch recent queries
export const fetchRecentQueries = async (limit: number = 5): Promise<RecentQuery[]> => {
  try {
    const { data, error } = await supabase
      .from('user_queries')
      .select('id, name, message, status, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching recent queries:", error);
      return [];
    }
    
    return data?.map(query => ({
      id: query.id.toString(),
      user_name: query.name,
      query_text: query.message,
      status: query.status || 'open',
      created_at: query.created_at || ''
    })) || [];
  } catch (error) {
    console.error("Error fetching recent queries:", error);
    return [];
  }
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

// Fetch all categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in fetchCategories:", error);
    return [];
  }
};

// Fetch all grades
export const fetchGrades = async (): Promise<Grade[]> => {
  try {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error fetching grades:", error);
      throw new Error("Failed to fetch grades");
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in fetchGrades:", error);
    return [];
  }
};

// Fetch all blog posts
export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching blog posts:", error);
      throw new Error("Failed to fetch blog posts");
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in fetchBlogPosts:", error);
    return [];
  }
};

// Fetch blog post by ID
export const fetchBlogPostById = async (id: number): Promise<BlogPost | null> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();
    
    if (error) {
      console.error("Error fetching blog post:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error in fetchBlogPostById:", error);
    return null;
  }
};

// Fetch all user queries
export const fetchUserQueries = async (): Promise<UserQuery[]> => {
  try {
    const { data, error } = await supabase
      .from('user_queries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching user queries:", error);
      throw new Error("Failed to fetch user queries");
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in fetchUserQueries:", error);
    return [];
  }
};

// Fetch marketplace stats for dashboard
export const fetchMarketplaceStats = async () => {
  try {
    const { data: totalListings } = await supabase
      .from('marketplace_listings')
      .select('id', { count: 'exact' });

    const { data: activeListings } = await supabase
      .from('marketplace_listings')
      .select('id', { count: 'exact' })
      .eq('status', 'active')
      .eq('is_approved', true);

    const { data: pendingListings } = await supabase
      .from('marketplace_listings')
      .select('id', { count: 'exact' })
      .eq('is_approved', false);

    return {
      totalListings: totalListings?.length || 0,
      activeListings: activeListings?.length || 0,
      pendingListings: pendingListings?.length || 0
    };
  } catch (error) {
    console.error("Error fetching marketplace stats:", error);
    return {
      totalListings: 0,
      activeListings: 0,
      pendingListings: 0
    };
  }
};
