
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

export interface DashboardStats {
  totalUploads: number;
  totalDownloads: number;
  totalSales: number;
  totalBookmarks: number;
  recentActivities: StudentActivity[];
  profile: StudentProfile | null;
}

export const fetchStudentProfile = async (userId: string): Promise<StudentProfile | null> => {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching student profile:', error);
    return null;
  }

  return data;
};

export const createStudentProfile = async (userId: string, profileData: Partial<StudentProfile>) => {
  const { data, error } = await supabase
    .from('student_profiles')
    .insert({
      user_id: userId,
      ...profileData
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating student profile:', error);
    throw error;
  }

  return data;
};

export const fetchDashboardStats = async (userId: string): Promise<DashboardStats> => {
  // Fetch profile
  const profile = await fetchStudentProfile(userId);
  
  // If no profile exists, create one
  if (!profile) {
    await createStudentProfile(userId, {});
  }

  // Fetch recent activities
  const { data: activities } = await supabase
    .from('student_activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch bookmarks count
  const { count: bookmarksCount } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    totalUploads: profile?.total_uploads || 0,
    totalDownloads: profile?.total_downloads || 0,
    totalSales: profile?.total_sales || 0,
    totalBookmarks: bookmarksCount || 0,
    recentActivities: activities || [],
    profile: profile
  };
};

export const addStudentActivity = async (
  userId: string,
  activityType: StudentActivity['activity_type'],
  points: number = 0,
  description?: string
) => {
  const { error } = await supabase.rpc('add_student_activity', {
    p_user_id: userId,
    p_activity_type: activityType,
    p_points: points,
    p_description: description
  });

  if (error) {
    console.error('Error adding student activity:', error);
    throw error;
  }
};

export const fetchUserBookmarks = async (userId: string) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }

  return data || [];
};

export const addBookmark = async (userId: string, contentType: string, contentId: string) => {
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
    console.error('Error adding bookmark:', error);
    throw error;
  }

  return data;
};

export const removeBookmark = async (userId: string, contentType: string, contentId: string) => {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('content_type', contentType)
    .eq('content_id', contentId);

  if (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
};
