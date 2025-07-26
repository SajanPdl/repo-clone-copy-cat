
import { supabase } from '@/integrations/supabase/client';

export interface StudentActivity {
  id: string;
  activity_type: 'upload' | 'download' | 'sale' | 'bookmark' | 'share';
  description: string;
  points_earned: number;
  created_at: string;
}

export interface StudentProfile {
  level: string;
  points: number;
}

export interface DashboardStats {
  totalUploads: number;
  totalDownloads: number;
  totalSales: number;
  totalBookmarks: number;
  profile: StudentProfile;
  recentActivities: StudentActivity[];
}

export const fetchDashboardStats = async (userId: string): Promise<DashboardStats> => {
  try {
    // Fetch student profile
    const { data: profileData } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch recent activities
    const { data: activitiesData } = await supabase
      .from('student_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Parse achievements safely
    const achievements = profileData?.achievements ? 
      (Array.isArray(profileData.achievements) ? profileData.achievements as string[] : []) : [];

    return {
      totalUploads: profileData?.total_uploads || 0,
      totalDownloads: profileData?.total_downloads || 0,
      totalSales: profileData?.total_sales || 0,
      totalBookmarks: achievements.length,
      profile: {
        level: profileData?.level || 'Fresh Contributor',
        points: profileData?.points || 0
      },
      recentActivities: activitiesData?.map(activity => ({
        id: activity.id,
        activity_type: activity.activity_type as StudentActivity['activity_type'],
        description: activity.description || '',
        points_earned: activity.points_earned || 0,
        created_at: activity.created_at
      })) || []
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
        points: 0
      },
      recentActivities: []
    };
  }
};
