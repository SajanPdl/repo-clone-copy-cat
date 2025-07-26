
import { supabase } from '@/integrations/supabase/client';

export interface StudentProfile {
  id: string;
  user_id: string;
  university: string | null;
  course: string | null;
  year_of_study: number | null;
  profile_image: string | null;
  bio: string | null;
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
  description: string | null;
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

// Helper function to convert database profile to StudentProfile interface
const convertToStudentProfile = (data: any): StudentProfile => ({
  id: data.id,
  user_id: data.user_id,
  university: data.university,
  course: data.course,
  year_of_study: data.year_of_study,
  profile_image: data.profile_image,
  bio: data.bio,
  points: data.points || 0,
  level: data.level || 'Fresh Contributor',
  total_uploads: data.total_uploads || 0,
  total_downloads: data.total_downloads || 0,
  total_sales: data.total_sales || 0,
  achievements: Array.isArray(data.achievements) ? data.achievements : [],
  created_at: data.created_at,
  updated_at: data.updated_at
});

// Helper function to convert database activity to StudentActivity interface
const convertToStudentActivity = (data: any): StudentActivity => ({
  id: data.id,
  user_id: data.user_id,
  activity_type: data.activity_type as 'upload' | 'download' | 'sale' | 'bookmark' | 'share',
  points_earned: data.points_earned || 0,
  description: data.description,
  created_at: data.created_at
});

export const fetchStudentProfile = async (userId: string): Promise<StudentProfile | null> => {
  console.log('Fetching student profile for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching student profile:', error);
      
      // If profile doesn't exist, create one
      if (error.code === 'PGRST116') {
        console.log('Profile not found, creating new profile...');
        return await createStudentProfile(userId, {});
      }
      return null;
    }

    return data ? convertToStudentProfile(data) : null;
  } catch (error) {
    console.error('Error in fetchStudentProfile:', error);
    return null;
  }
};

export const createStudentProfile = async (userId: string, profileData: Partial<StudentProfile>) => {
  console.log('Creating student profile for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .insert([{
        user_id: userId,
        university: profileData.university || null,
        course: profileData.course || null,
        year_of_study: profileData.year_of_study || null,
        profile_image: profileData.profile_image || null,
        bio: profileData.bio || null,
        points: 0,
        level: 'Fresh Contributor',
        total_uploads: 0,
        total_downloads: 0,
        total_sales: 0,
        achievements: []
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating student profile:', error);
      throw error;
    }

    return convertToStudentProfile(data);
  } catch (error) {
    console.error('Error in createStudentProfile:', error);
    throw error;
  }
};

export const fetchDashboardStats = async (userId: string): Promise<DashboardStats> => {
  console.log('Fetching dashboard stats for user:', userId);
  
  try {
    // Fetch student profile
    const profile = await fetchStudentProfile(userId);
    
    // Fetch recent activities
    const { data: activities, error: activitiesError } = await supabase
      .from('student_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
    }

    // Fetch bookmarks count
    const { count: bookmarksCount, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (bookmarksError) {
      console.error('Error fetching bookmarks count:', bookmarksError);
    }

    // Get current date in Nepal timezone
    const currentDate = new Date().toLocaleDateString('en-US', {
      timeZone: 'Asia/Kathmandu',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    console.log('Current date in Nepal:', currentDate);

    return {
      totalUploads: profile?.total_uploads || 0,
      totalDownloads: profile?.total_downloads || 0,
      totalSales: profile?.total_sales || 0,
      totalBookmarks: bookmarksCount || 0,
      recentActivities: (activities || []).map(convertToStudentActivity),
      profile: profile
    };
  } catch (error) {
    console.error('Error in fetchDashboardStats:', error);
    
    // Return default stats if there's an error
    return {
      totalUploads: 0,
      totalDownloads: 0,
      totalSales: 0,
      totalBookmarks: 0,
      recentActivities: [],
      profile: null
    };
  }
};

export const addStudentActivity = async (
  userId: string, 
  activityType: 'upload' | 'download' | 'sale' | 'bookmark' | 'share',
  pointsEarned: number,
  description?: string
) => {
  console.log('Adding student activity:', { userId, activityType, pointsEarned, description });
  
  try {
    const { error } = await supabase.rpc('add_student_activity', {
      p_user_id: userId,
      p_activity_type: activityType,
      p_points: pointsEarned,
      p_description: description || null
    });

    if (error) {
      console.error('Error adding student activity:', error);
      throw error;
    }

    console.log('Student activity added successfully');
  } catch (error) {
    console.error('Error in addStudentActivity:', error);
    throw error;
  }
};

export const updateStudentProfile = async (userId: string, updates: Partial<StudentProfile>) => {
  console.log('Updating student profile:', { userId, updates });
  
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating student profile:', error);
      throw error;
    }

    return convertToStudentProfile(data);
  } catch (error) {
    console.error('Error in updateStudentProfile:', error);
    throw error;
  }
};

// Utility function to get Nepali date
export const getNepaliDate = () => {
  const date = new Date();
  return date.toLocaleDateString('ne-NP', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Utility function to get level progress
export const getLevelProgress = (points: number) => {
  const levels = [
    { name: 'Fresh Contributor', min: 0, max: 100 },
    { name: 'Active Learner', min: 100, max: 500 },
    { name: 'Knowledge Sharer', min: 500, max: 1000 },
    { name: 'Note Lord', min: 1000, max: 2000 },
    { name: 'Top Seller', min: 2000, max: 5000 },
    { name: 'Education Master', min: 5000, max: Infinity }
  ];

  const currentLevel = levels.find(level => points >= level.min && points < level.max) || levels[levels.length - 1];
  const nextLevel = levels.find(level => level.min > points);
  
  const progress = nextLevel 
    ? ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  return {
    currentLevel: currentLevel.name,
    nextLevel: nextLevel?.name || 'Max Level',
    progress: Math.min(progress, 100),
    pointsToNext: nextLevel ? nextLevel.min - points : 0
  };
};
