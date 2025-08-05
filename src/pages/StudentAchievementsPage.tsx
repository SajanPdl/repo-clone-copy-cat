
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Award, Medal, Star, Lock } from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import Footer from '@/components/Footer';

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
  earned_at: string;
  achievement: Achievement;
}

const rarityColors = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-yellow-500 to-yellow-600'
};

const rarityIcons = {
  common: Star,
  rare: Medal,
  epic: Award,
  legendary: Trophy
};

const StudentAchievementsPage = () => {
  const { user } = useAuth();
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
      fetchUserProfile();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      // Fetch all achievements
      const { data: allAchievementsData, error: allError } = await supabase
        .from('achievements')
        .select('*')
        .order('points_required', { ascending: true });

      if (allError) throw allError;

      // Fetch user's earned achievements
      const { data: userAchievementsData, error: userError } = await supabase
        .from('user_achievements')
        .select(`
          id,
          earned_at,
          achievements (
            id,
            name,
            description,
            points_required,
            rarity,
            icon,
            is_system_generated
          )
        `)
        .eq('user_id', user?.id);

      if (userError) throw userError;

      setAllAchievements(allAchievementsData || []);
      setUserAchievements(userAchievementsData?.map(ua => ({
        ...ua,
        achievement: ua.achievements as any
      })) || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('points')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setUserPoints(data?.points || 0);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const isAchievementEarned = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement.id === achievementId);
  };

  const getProgressPercentage = (pointsRequired: number) => {
    return Math.min((userPoints / pointsRequired) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <GlobalHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <GlobalHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Your Achievements</h1>
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Total Points</h2>
                  <p className="text-blue-100">Keep earning to unlock more achievements!</p>
                </div>
                <div className="text-4xl font-bold">{userPoints}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allAchievements.map((achievement) => {
            const isEarned = isAchievementEarned(achievement.id);
            const progress = getProgressPercentage(achievement.points_required);
            const Icon = rarityIcons[achievement.rarity];

            return (
              <Card 
                key={achievement.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  isEarned ? 'ring-2 ring-yellow-400' : 'opacity-75'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[achievement.rarity]} opacity-10`} />
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-full bg-gradient-to-br ${rarityColors[achievement.rarity]}`}>
                      {isEarned ? (
                        <Icon className="h-6 w-6 text-white" />
                      ) : (
                        <Lock className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${isEarned ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {isEarned ? 'Earned' : 'Locked'}
                    </Badge>
                  </div>
                  <CardTitle className={`text-lg ${!isEarned && 'text-gray-600'}`}>
                    {achievement.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className={`text-sm mb-4 ${!isEarned && 'text-gray-500'}`}>
                    {achievement.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{userPoints} / {achievement.points_required} points</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <Badge variant="secondary" className="text-xs">
                      {achievement.rarity}
                    </Badge>
                    {isEarned && (
                      <span className="text-xs text-green-600 font-medium">
                        Earned {new Date(userAchievements.find(ua => ua.achievement.id === achievement.id)?.earned_at || '').toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {allAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No achievements available</h3>
            <p className="text-gray-600">Check back later for new achievements!</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StudentAchievementsPage;
