
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalMaterials: number;
  totalPapers: number;
  totalMarketplaceItems: number;
  totalUsers: number;
  totalEvents: number;
  recentUploads: any[];
  recentMarketplace: any[];
  topCategories: { name: string; count: number }[];
  monthlyStats: { month: string; uploads: number; users: number }[];
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get total counts
    const [materialsRes, papersRes, marketplaceRes, usersRes, eventsRes] = await Promise.all([
      supabase.from('study_materials').select('id', { count: 'exact', head: true }),
      supabase.from('past_papers').select('id', { count: 'exact', head: true }),
      supabase.from('marketplace_listings').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true })
    ]);

    // Get recent uploads
    const { data: recentMaterials } = await supabase
      .from('study_materials')
      .select('id, title, created_at, category, subject')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent marketplace items
    const { data: recentMarketplace } = await supabase
      .from('marketplace_listings')
      .select('id, title, created_at, category, price')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get top categories
    const { data: categoriesData } = await supabase
      .from('study_materials')
      .select('category');

    const categoryCount = categoriesData?.reduce((acc: any, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {}) || {};

    const topCategories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalMaterials: materialsRes.count || 0,
      totalPapers: papersRes.count || 0,
      totalMarketplaceItems: marketplaceRes.count || 0,
      totalUsers: usersRes.count || 0,
      totalEvents: eventsRes.count || 0,
      recentUploads: recentMaterials || [],
      recentMarketplace: recentMarketplace || [],
      topCategories,
      monthlyStats: [] // Add monthly stats calculation if needed
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const fetchStudentDashboardData = async (userId: string) => {
  try {
    // Get student profile
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get student activities
    const { data: activities } = await supabase
      .from('student_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get user's marketplace listings
    const { data: listings } = await supabase
      .from('marketplace_listings')
      .select('id, title, price, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Get user's bookmarks
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId);

    // Get user achievements
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (
          name,
          description,
          icon,
          rarity
        )
      `)
      .eq('user_id', userId);

    return {
      profile: profile || {
        points: 0,
        level: 'Fresh Contributor',
        total_uploads: 0,
        total_downloads: 0,
        total_sales: 0
      },
      activities: activities || [],
      listings: listings || [],
      bookmarks: bookmarks || [],
      achievements: achievements || []
    };
  } catch (error) {
    console.error('Error fetching student dashboard data:', error);
    throw error;
  }
};
