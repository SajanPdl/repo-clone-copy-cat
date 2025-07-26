
import { supabase } from '@/integrations/supabase/client';

export interface StudentStats {
  totalUploads: number;
  totalDownloads: number;
  totalSales: number;
  points: number;
  level: string;
  achievements: string[];
}

export interface StudentActivity {
  id: string;
  activity_type: 'upload' | 'download' | 'sale' | 'bookmark' | 'share';
  description: string;
  created_at: string;
  points_earned: number;
}

export interface DashboardStats {
  totalUploads: number;
  totalDownloads: number;
  totalSales: number;
  totalBookmarks: number;
  profile: {
    level: string;
    points: number;
  };
  recentActivities: StudentActivity[];
}

export interface RecentActivity {
  id: string;
  type: 'upload' | 'download' | 'sale' | 'achievement';
  description: string;
  date: string;
  points?: number;
}

export const getStudentStats = async (userId: string): Promise<StudentStats> => {
  try {
    // Fetch student profile
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profile) {
      return {
        totalUploads: profile.total_uploads || 0,
        totalDownloads: profile.total_downloads || 0,
        totalSales: profile.total_sales || 0,
        points: profile.points || 0,
        level: profile.level || 'Fresh Contributor',
        achievements: Array.isArray(profile.achievements) ? profile.achievements.map(String) : []
      };
    }

    // Return default values if no profile found
    return {
      totalUploads: 0,
      totalDownloads: 0,
      totalSales: 0,
      points: 0,
      level: 'Fresh Contributor',
      achievements: []
    };
  } catch (error) {
    console.error('Error fetching student stats:', error);
    return {
      totalUploads: 0,
      totalDownloads: 0,
      totalSales: 0,
      points: 0,
      level: 'Fresh Contributor',
      achievements: []
    };
  }
};

export const getRecentActivities = async (userId: string): Promise<StudentActivity[]> => {
  try {
    const { data: activities } = await supabase
      .from('student_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (activities) {
      return activities.map(activity => ({
        id: activity.id,
        activity_type: activity.activity_type as 'upload' | 'download' | 'sale' | 'bookmark' | 'share',
        description: activity.description || 'Activity completed',
        created_at: activity.created_at,
        points_earned: activity.points_earned || 0
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};

export const fetchDashboardStats = async (userId: string): Promise<DashboardStats> => {
  try {
    // Fetch student profile
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch recent activities
    const recentActivities = await getRecentActivities(userId);

    return {
      totalUploads: profile?.total_uploads || 0,
      totalDownloads: profile?.total_downloads || 0,
      totalSales: profile?.total_sales || 0,
      totalBookmarks: 0, // This would need to be implemented based on your bookmarks table
      profile: {
        level: profile?.level || 'Fresh Contributor',
        points: profile?.points || 0,
      },
      recentActivities
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUploads: 0,
      totalDownloads: 0,
      totalSales: 0,
      totalBookmarks: 0,
      profile: {
        level: 'Fresh Contributor',
        points: 0,
      },
      recentActivities: []
    };
  }
};

export const calculateProgress = (points: number): number => {
  // Simple progress calculation based on points
  const maxPoints = 1000; // Adjust based on your system
  return Math.min((points / maxPoints) * 100, 100);
};

export const getLevelInfo = (level: string) => {
  const levels = {
    'Fresh Contributor': { color: 'bg-green-500', nextLevel: 'Active Learner', pointsNeeded: 100 },
    'Active Learner': { color: 'bg-blue-500', nextLevel: 'Knowledge Seeker', pointsNeeded: 250 },
    'Knowledge Seeker': { color: 'bg-purple-500', nextLevel: 'Academic Star', pointsNeeded: 500 },
    'Academic Star': { color: 'bg-yellow-500', nextLevel: 'Scholar', pointsNeeded: 750 },
    'Scholar': { color: 'bg-red-500', nextLevel: 'Master', pointsNeeded: 1000 },
    'Master': { color: 'bg-indigo-500', nextLevel: null, pointsNeeded: null }
  };

  return levels[level as keyof typeof levels] || levels['Fresh Contributor'];
};
