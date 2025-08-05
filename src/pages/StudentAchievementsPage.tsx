
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Award, Medal, Star, Lock } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  points_required: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  is_system_generated: boolean;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement: Achievement;
}

const rarityColors = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500'
};

const rarityIcons = {
  common: Star,
  rare: Medal,
  epic: Award,
  legendary: Trophy
};

const StudentAchievementsPage = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
      fetchUserAchievements();
      fetchUserPoints();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points_required', { ascending: true });

      if (error) throw error;
      
      // Type cast the rarity field
      const typedAchievements = (data || []).map(achievement => ({
        ...achievement,
        rarity: achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary'
      }));
      
      setAchievements(typedAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchUserAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Type cast the nested achievement data
      const typedUserAchievements = (data || []).map(userAchievement => ({
        ...userAchievement,
        achievement: {
          ...userAchievement.achievement,
          rarity: userAchievement.achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary'
        }
      }));
      
      setUserAchievements(typedUserAchievements);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    }
  };

  const fetchUserPoints = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('points')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserPoints(data?.points || 0);
    } catch (error) {
      console.error('Error fetching user points:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAchievementEarned = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const canEarnAchievement = (achievement: Achievement) => {
    return userPoints >= achievement.points_required && !isAchievementEarned(achievement.id);
  };

  const getProgressPercentage = (achievement: Achievement) => {
    if (isAchievementEarned(achievement.id)) return 100;
    return Math.min((userPoints / achievement.points_required) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Achievements</h1>
          <p className="text-gray-600">Track your progress and unlock achievements</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Current Points</p>
          <p className="text-2xl font-bold text-blue-600">{userPoints}</p>
        </div>
      </div>

      {/* Earned Achievements */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Earned Achievements ({userAchievements.length})</h2>
        {userAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userAchievements.map((userAchievement) => {
              const achievement = userAchievement.achievement;
              const Icon = rarityIcons[achievement.rarity];
              return (
                <Card key={userAchievement.id} className="relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-16 h-16 ${rarityColors[achievement.rarity]} transform rotate-45 translate-x-4 -translate-y-4`} />
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 ${rarityColors[achievement.rarity]} rounded-full`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <Badge variant="outline" className={`${rarityColors[achievement.rarity]} text-white text-xs`}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span>Points Required: {achievement.points_required}</span>
                      <span className="text-green-600">Earned!</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Earned on {new Date(userAchievement.earned_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
              <p className="text-gray-600">Start earning points to unlock your first achievement!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Available Achievements */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements
            .filter(achievement => !isAchievementEarned(achievement.id))
            .map((achievement) => {
              const Icon = rarityIcons[achievement.rarity];
              const progress = getProgressPercentage(achievement);
              const canEarn = canEarnAchievement(achievement);
              
              return (
                <Card key={achievement.id} className={`relative ${canEarn ? 'border-green-300' : 'border-gray-200'}`}>
                  {canEarn && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500">Ready to Earn!</Badge>
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 ${progress < 100 ? 'bg-gray-400' : rarityColors[achievement.rarity]} rounded-full`}>
                        {progress < 100 ? (
                          <Lock className="h-6 w-6 text-white" />
                        ) : (
                          <Icon className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <Badge variant="outline" className={`${rarityColors[achievement.rarity]} text-white text-xs`}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span>Progress: {userPoints} / {achievement.points_required} points</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      {progress < 100 && (
                        <p className="text-xs text-gray-500">
                          {achievement.points_required - userPoints} more points needed
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default StudentAchievementsPage;
