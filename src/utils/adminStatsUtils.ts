
import { supabase } from '@/integrations/supabase/client';

export interface UserStatsUpdate {
  userId: string;
  points?: number;
  level?: string;
  totalUploads?: number;
  totalDownloads?: number;
  totalSales?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points_required: number;
  is_system_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  awarded_by_admin?: string;
  achievement?: Achievement;
}

export const updateUserStats = async (statsUpdate: UserStatsUpdate) => {
  const { userId, ...updates } = statsUpdate;
  
  const { error } = await supabase
    .from('student_profiles')
    .upsert({
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

export const fetchAllAchievements = async (): Promise<Achievement[]> => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('points_required', { ascending: true });

  if (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }

  return (data || []).map(achievement => ({
    ...achievement,
    rarity: achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary'
  }));
};

export const fetchUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching user achievements:', error);
    throw error;
  }

  return (data || []).map(userAchievement => ({
    ...userAchievement,
    achievement: userAchievement.achievement ? {
      ...userAchievement.achievement,
      rarity: userAchievement.achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary'
    } : undefined
  }));
};

export const grantAchievementToUser = async (userId: string, achievementId: string, adminId: string) => {
  const { error } = await supabase.rpc('admin_grant_achievement', {
    p_user_id: userId,
    p_achievement_id: achievementId,
    p_admin_id: adminId
  });

  if (error) {
    console.error('Error granting achievement:', error);
    throw error;
  }
};

export const fetchAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data || [];
};
