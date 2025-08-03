
import { supabase } from '@/integrations/supabase/client';

export interface StudentProfile {
  id: string;
  user_id: string;
  university?: string;
  course?: string;
  year_of_study?: number;
  profile_image?: string;
  bio?: string;
  points: number;
  level: string;
  total_uploads: number;
  total_downloads: number;
  total_sales: number;
  achievements: any[];
  created_at: string;
  updated_at: string;
}

export interface StudentActivity {
  id: string;
  user_id: string;
  activity_type: 'upload' | 'download' | 'sale' | 'bookmark' | 'share';
  points_earned: number;
  description?: string;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  awarded_by_admin?: string;
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    points_required: number;
  };
}

export interface DashboardStats {
  totalUploads: number;
  totalDownloads: number;
  totalSales: number;
  totalBookmarks: number;
  recentActivities: StudentActivity[];
  profile: StudentProfile | null;
  achievements: UserAchievement[];
}

// Enhanced logging
const logError = (context: string, error: any) => {
  console.error(`[StudentDashboardUtils] ${context}:`, error);
  if (error?.message) {
    console.error(`Error message: ${error.message}`);
  }
};

export const fetchStudentProfile = async (userId: string): Promise<StudentProfile | null> => {
  console.log('[StudentDashboardUtils] Fetching student profile for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      logError('Student profile fetch', error);
      return null;
    }

    if (data) {
      console.log('[StudentDashboardUtils] Student profile fetched successfully');
      return {
        ...data,
        achievements: Array.isArray(data.achievements) ? data.achievements : []
      } as StudentProfile;
    }

    console.log('[StudentDashboardUtils] No student profile found, will create one');
    return null;
  } catch (error) {
    logError('Student profile fetch', error);
    return null;
  }
};

export const createStudentProfile = async (userId: string, profileData: Partial<StudentProfile> = {}) => {
  console.log('[StudentDashboardUtils] Creating student profile for user:', userId);
  
  try {
    const defaultProfile = {
      user_id: userId,
      points: 0,
      level: 'Fresh Contributor',
      total_uploads: 0,
      total_downloads: 0,
      total_sales: 0,
      achievements: [],
      ...profileData
    };

    const { data, error } = await supabase
      .from('student_profiles')
      .insert(defaultProfile)
      .select()
      .single();

    if (error) {
      logError('Student profile creation', error);
      throw error;
    }

    console.log('[StudentDashboardUtils] Student profile created successfully');
    return data;
  } catch (error) {
    logError('Student profile creation', error);
    throw error;
  }
};

export const fetchUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  console.log('[StudentDashboardUtils] Fetching user achievements for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      logError('User achievements fetch', error);
      return [];
    }

    const achievements = (data || []).map(userAchievement => ({
      ...userAchievement,
      achievement: {
        ...userAchievement.achievement,
        rarity: userAchievement.achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary'
      }
    }));

    console.log(`[StudentDashboardUtils] Fetched ${achievements.length} user achievements`);
    return achievements;
  } catch (error) {
    logError('User achievements fetch', error);
    return [];
  }
};

export const fetchDashboardStats = async (userId: string): Promise<DashboardStats> => {
  console.log('[StudentDashboardUtils] Fetching dashboard stats for user:', userId);
  
  try {
    // Fetch profile first
    let profile = await fetchStudentProfile(userId);
    
    // If no profile exists, create one
    if (!profile) {
      console.log('[StudentDashboardUtils] Creating new profile...');
      try {
        await createStudentProfile(userId);
        profile = await fetchStudentProfile(userId);
      } catch (createError) {
        logError('Profile creation during stats fetch', createError);
        // Continue with null profile
      }
    }

    // Fetch recent activities
    const { data: activities, error: activitiesError } = await supabase
      .from('student_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (activitiesError) {
      logError('Recent activities fetch', activitiesError);
    }

    // Fetch bookmarks count
    const { count: bookmarksCount, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (bookmarksError) {
      logError('Bookmarks count fetch', bookmarksError);
    }

    // Fetch user achievements
    const achievements = await fetchUserAchievements(userId);

    // Type-cast activities to match our interface
    const typedActivities: StudentActivity[] = (activities || []).map(activity => ({
      ...activity,
      activity_type: activity.activity_type as StudentActivity['activity_type']
    }));

    const stats = {
      totalUploads: profile?.total_uploads || 0,
      totalDownloads: profile?.total_downloads || 0,
      totalSales: profile?.total_sales || 0,
      totalBookmarks: bookmarksCount || 0,
      recentActivities: typedActivities,
      profile: profile,
      achievements: achievements
    };

    console.log('[StudentDashboardUtils] Dashboard stats fetched successfully:', {
      ...stats,
      profile: stats.profile ? 'Profile loaded' : 'No profile',
      activitiesCount: stats.recentActivities.length,
      achievementsCount: stats.achievements.length
    });

    return stats;
  } catch (error) {
    logError('Dashboard stats fetch', error);
    
    // Return safe fallback data
    return {
      totalUploads: 0,
      totalDownloads: 0,
      totalSales: 0,
      totalBookmarks: 0,
      recentActivities: [],
      profile: null,
      achievements: []
    };
  }
};

export const addStudentActivity = async (
  userId: string,
  activityType: StudentActivity['activity_type'],
  points: number = 0,
  description?: string
) => {
  console.log('[StudentDashboardUtils] Adding student activity:', { userId, activityType, points, description });
  
  try {
    const { error } = await supabase.rpc('add_student_activity', {
      p_user_id: userId,
      p_activity_type: activityType,
      p_points: points,
      p_description: description
    });

    if (error) {
      logError('Add student activity', error);
      throw error;
    }

    console.log('[StudentDashboardUtils] Student activity added successfully');
  } catch (error) {
    logError('Add student activity', error);
    throw error;
  }
};

export const fetchUserBookmarks = async (userId: string) => {
  console.log('[StudentDashboardUtils] Fetching user bookmarks for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logError('User bookmarks fetch', error);
      return [];
    }

    console.log(`[StudentDashboardUtils] Fetched ${data?.length || 0} bookmarks`);
    return data || [];
  } catch (error) {
    logError('User bookmarks fetch', error);
    return [];
  }
};

export const addBookmark = async (userId: string, contentType: string, contentId: string) => {
  console.log('[StudentDashboardUtils] Adding bookmark:', { userId, contentType, contentId });
  
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        content_type: contentType,
        content_id: contentId
      })
      .select()
      .single();

    if (error) {
      logError('Add bookmark', error);
      throw error;
    }

    console.log('[StudentDashboardUtils] Bookmark added successfully');
    return data;
  } catch (error) {
    logError('Add bookmark', error);
    throw error;
  }
};

export const removeBookmark = async (userId: string, contentType: string, contentId: string) => {
  console.log('[StudentDashboardUtils] Removing bookmark:', { userId, contentType, contentId });
  
  try {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .eq('content_id', contentId);

    if (error) {
      logError('Remove bookmark', error);
      throw error;
    }

    console.log('[StudentDashboardUtils] Bookmark removed successfully');
  } catch (error) {
    logError('Remove bookmark', error);
    throw error;
  }
};
