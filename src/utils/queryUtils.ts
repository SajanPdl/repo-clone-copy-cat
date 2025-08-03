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

// Enhanced error logging
const logError = (context: string, error: any) => {
  console.error(`[QueryUtils] ${context}:`, error);
  if (error?.message) {
    console.error(`Error message: ${error.message}`);
  }
  if (error?.details) {
    console.error(`Error details: ${error.details}`);
  }
  if (error?.hint) {
    console.error(`Error hint: ${error.hint}`);
  }
};

// Test Supabase connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      logError('Connection test', error);
      return false;
    }
    console.log('[QueryUtils] Supabase connection successful');
    return true;
  } catch (error) {
    logError('Connection test failed', error);
    return false;
  }
};

// Fetch dashboard stats with better error handling
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  console.log('[QueryUtils] Fetching dashboard stats...');
  
  try {
    // Test connection first
    await testConnection();

    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (userError) {
      logError('User count fetch', userError);
    }

    // Get study materials count
    const { count: materialsCount, error: materialsError } = await supabase
      .from('study_materials')
      .select('*', { count: 'exact', head: true });
    
    if (materialsError) {
      logError('Materials count fetch', materialsError);
    }

    // Get total downloads from study materials
    const { data: studyDownloads, error: studyError } = await supabase
      .from('study_materials')
      .select('downloads');
    
    if (studyError) {
      logError('Study downloads fetch', studyError);
    }

    // Get total downloads from past papers
    const { data: pastDownloads, error: pastError } = await supabase
      .from('past_papers')
      .select('downloads');
    
    if (pastError) {
      logError('Past papers downloads fetch', pastError);
    }

    // Get queries count
    const { count: openQueries, error: queriesError } = await supabase
      .from('user_queries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');
    
    if (queriesError) {
      logError('Queries count fetch', queriesError);
    }

    // Calculate totals with null safety
    const totalStudyDownloads = studyDownloads?.reduce((sum, item) => sum + (item.downloads || 0), 0) || 0;
    const totalPastDownloads = pastDownloads?.reduce((sum, item) => sum + (item.downloads || 0), 0) || 0;
    const totalDownloads = totalStudyDownloads + totalPastDownloads;

    const stats = {
      totalUsers: userCount || 0,
      userGrowth: "+12%",
      totalDownloads,
      downloadGrowth: "+8%",
      totalStudyMaterials: materialsCount || 0,
      materialsGrowth: "+15%",
      openQueries: openQueries || 0,
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

    console.log('[QueryUtils] Dashboard stats fetched successfully:', stats);
    return stats;
  } catch (error) {
    logError('Dashboard stats fetch', error);
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

// Enhanced study materials fetch
export const fetchStudyMaterials = async (params?: {
  grade?: string;
  subject?: string;
  category?: string;
  search?: string;
}): Promise<StudyMaterial[]> => {
  console.log('[QueryUtils] Fetching study materials with params:', params);
  
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
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      logError('Study materials fetch', error);
      return [];
    }
    
    console.log(`[QueryUtils] Fetched ${data?.length || 0} study materials`);
    return data || [];
  } catch (error) {
    logError('Study materials fetch', error);
    return [];
  }
};

export const fetchRecentUploads = async (limit: number = 5): Promise<RecentUpload[]> => {
  console.log('[QueryUtils] Fetching recent uploads...');
  
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
    
    if (studyMaterials.error) {
      logError('Recent study materials fetch', studyMaterials.error);
    }
    
    if (pastPapers.error) {
      logError('Recent past papers fetch', pastPapers.error);
    }
    
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
    
    console.log(`[QueryUtils] Fetched ${recentUploads.length} recent uploads`);
    return recentUploads.slice(0, limit);
  } catch (error) {
    logError('Recent uploads fetch', error);
    return [];
  }
};

export const fetchRecentQueries = async (limit: number = 5): Promise<RecentQuery[]> => {
  console.log('[QueryUtils] Fetching recent queries...');
  
  try {
    const { data, error } = await supabase
      .from('user_queries')
      .select('id, name, message, status, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      logError('Recent queries fetch', error);
      return [];
    }
    
    const queries = data?.map(query => ({
      id: query.id.toString(),
      user_name: query.name,
      query_text: query.message,
      status: query.status || 'open',
      created_at: query.created_at || ''
    })) || [];
    
    console.log(`[QueryUtils] Fetched ${queries.length} recent queries`);
    return queries;
  } catch (error) {
    logError('Recent queries fetch', error);
    return [];
  }
};

export const fetchStudyMaterialById = async (id: number) => {
  console.log('[QueryUtils] Fetching study material by ID:', id);
  
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logError('Study material by ID fetch', error);
      throw new Error("Failed to fetch study material");
    }

    console.log('[QueryUtils] Study material fetched successfully');
    return data;
  } catch (error) {
    logError('Study material by ID fetch', error);
    throw error;
  }
};

export const fetchPastPaperById = async (id: number) => {
  console.log('[QueryUtils] Fetching past paper by ID:', id);
  
  try {
    const { data, error } = await supabase
      .from('past_papers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logError('Past paper by ID fetch', error);
      throw new Error("Failed to fetch past paper");
    }

    console.log('[QueryUtils] Past paper fetched successfully');
    return data;
  } catch (error) {
    logError('Past paper by ID fetch', error);
    throw error;
  }
};

export const fetchPastPapers = async (params?: {
  grade?: string;
  subject?: string;
  year?: number;
  search?: string;
}): Promise<PastPaper[]> => {
  console.log('[QueryUtils] Fetching past papers with params:', params);
  
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
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      logError('Past papers fetch', error);
      return [];
    }
    
    console.log(`[QueryUtils] Fetched ${data?.length || 0} past papers`);
    return data || [];
  } catch (error) {
    logError('Past papers fetch', error);
    return [];
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  console.log('[QueryUtils] Fetching categories...');
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      logError('Categories fetch', error);
      return [];
    }
    
    console.log(`[QueryUtils] Fetched ${data?.length || 0} categories`);
    return data || [];
  } catch (error) {
    logError('Categories fetch', error);
    return [];
  }
};

export const fetchGrades = async (): Promise<Grade[]> => {
  console.log('[QueryUtils] Fetching grades...');
  
  try {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .order('name');
    
    if (error) {
      logError('Grades fetch', error);
      return [];
    }
    
    console.log(`[QueryUtils] Fetched ${data?.length || 0} grades`);
    return data || [];
  } catch (error) {
    logError('Grades fetch', error);
    return [];
  }
};

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  console.log('[QueryUtils] Fetching blog posts...');
  
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      logError('Blog posts fetch', error);
      return [];
    }
    
    console.log(`[QueryUtils] Fetched ${data?.length || 0} blog posts`);
    return data || [];
  } catch (error) {
    logError('Blog posts fetch', error);
    return [];
  }
};

export const fetchBlogPostById = async (id: number): Promise<BlogPost | null> => {
  console.log('[QueryUtils] Fetching blog post by ID:', id);
  
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();
    
    if (error) {
      logError('Blog post by ID fetch', error);
      return null;
    }
    
    console.log('[QueryUtils] Blog post fetched successfully');
    return data;
  } catch (error) {
    logError('Blog post by ID fetch', error);
    return null;
  }
};

export const fetchUserQueries = async (): Promise<UserQuery[]> => {
  console.log('[QueryUtils] Fetching user queries...');
  
  try {
    const { data, error } = await supabase
      .from('user_queries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      logError('User queries fetch', error);
      return [];
    }
    
    console.log(`[QueryUtils] Fetched ${data?.length || 0} user queries`);
    return data || [];
  } catch (error) {
    logError('User queries fetch', error);
    return [];
  }
};

export const fetchMarketplaceStats = async () => {
  console.log('[QueryUtils] Fetching marketplace stats...');
  
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

    const stats = {
      totalListings: totalListings?.length || 0,
      activeListings: activeListings?.length || 0,
      pendingListings: pendingListings?.length || 0
    };
    
    console.log('[QueryUtils] Marketplace stats fetched successfully:', stats);
    return stats;
  } catch (error) {
    logError('Marketplace stats fetch', error);
    return {
      totalListings: 0,
      activeListings: 0,
      pendingListings: 0
    };
  }
};
