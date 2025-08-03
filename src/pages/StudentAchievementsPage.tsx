
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth as useAuth } from '@/hooks/useSecureAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/StudentSidebar';
import { Trophy, Award, Star, Target, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    points_required: number;
  };
}

const StudentAchievementsPage = () => {
  const { user } = useAuth();

  const { data: userAchievements = [] } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Error fetching achievements:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user
  });

  const { data: allAchievements = [] } = useQuery({
    queryKey: ['all-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points_required', { ascending: true });

      if (error) {
        console.error('Error fetching all achievements:', error);
        return [];
      }

      return data || [];
    }
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!user
  });

  const earnedAchievementIds = userAchievements.map(ua => ua.achievement_id);
  const unlockedAchievements = userAchievements.filter(ua => ua.achievement);
  const lockedAchievements = allAchievements.filter(a => !earnedAchievementIds.includes(a.id));

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SidebarProvider>
        <div className="flex w-full">
          <StudentSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
              <div className="flex items-center gap-4 px-6 py-4">
                <SidebarTrigger className="lg:hidden" />
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      Achievements
                    </h1>
                    <p className="text-gray-600 text-sm">Your learning milestones and rewards</p>
                  </div>
                </motion.div>
              </div>
            </header>

            <main className="p-6 space-y-8">
              {/* Progress Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-200/50"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {unlockedAchievements.length}
                    </div>
                    <p className="text-gray-600">Achievements Earned</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {userProfile?.points || 0}
                    </div>
                    <p className="text-gray-600">Total Points</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {Math.round((unlockedAchievements.length / allAchievements.length) * 100)}%
                    </div>
                    <p className="text-gray-600">Completion Rate</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-gray-500">
                      {unlockedAchievements.length} / {allAchievements.length}
                    </span>
                  </div>
                  <Progress 
                    value={(unlockedAchievements.length / allAchievements.length) * 100} 
                    className="h-2"
                  />
                </div>
              </motion.div>

              {/* Unlocked Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Award className="h-6 w-6 text-yellow-600" />
                  Earned Achievements
                </h2>
                
                {unlockedAchievements.length === 0 ? (
                  <Card className="text-center py-12 backdrop-blur-lg bg-white/80 border-0">
                    <CardContent>
                      <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No achievements yet</h3>
                      <p className="text-gray-600">Keep learning and engaging to earn your first achievement!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unlockedAchievements.map((userAchievement, index) => (
                      <motion.div
                        key={userAchievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-lg bg-white/80 border-2 ${getRarityColor(userAchievement.achievement.rarity)}`}>
                          <CardHeader className="text-center">
                            <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${getRarityGradient(userAchievement.achievement.rarity)} flex items-center justify-center mb-4`}>
                              <Trophy className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-lg">{userAchievement.achievement.name}</CardTitle>
                            <Badge className={getRarityColor(userAchievement.achievement.rarity)}>
                              {userAchievement.achievement.rarity}
                            </Badge>
                          </CardHeader>
                          <CardContent className="text-center space-y-3">
                            <p className="text-sm text-gray-600">
                              {userAchievement.achievement.description}
                            </p>
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                              <Star className="h-4 w-4 text-yellow-500" />
                              {userAchievement.achievement.points_required} points
                            </div>
                            <p className="text-xs text-green-600 font-medium">
                              Earned {new Date(userAchievement.earned_at).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Locked Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Target className="h-6 w-6 text-gray-600" />
                  Available Achievements
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lockedAchievements.map((achievement, index) => {
                    const canEarn = (userProfile?.points || 0) >= achievement.points_required;
                    
                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-lg bg-white/80 border-0 ${
                          canEarn ? 'bg-green-50' : 'opacity-75'
                        }`}>
                          <CardHeader className="text-center">
                            <div className={`w-16 h-16 mx-auto rounded-full ${
                              canEarn 
                                ? `bg-gradient-to-r ${getRarityGradient(achievement.rarity)}`
                                : 'bg-gray-300'
                            } flex items-center justify-center mb-4`}>
                              {canEarn ? (
                                <Trophy className="h-8 w-8 text-white" />
                              ) : (
                                <Lock className="h-8 w-8 text-gray-500" />
                              )}
                            </div>
                            <CardTitle className="text-lg">{achievement.name}</CardTitle>
                            <Badge className={getRarityColor(achievement.rarity)}>
                              {achievement.rarity}
                            </Badge>
                          </CardHeader>
                          <CardContent className="text-center space-y-3">
                            <p className="text-sm text-gray-600">
                              {achievement.description}
                            </p>
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                              <Star className="h-4 w-4 text-yellow-500" />
                              {achievement.points_required} points required
                            </div>
                            {canEarn && (
                              <Badge className="bg-green-500 text-white">
                                Ready to earn!
                              </Badge>
                            )}
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{Math.min(userProfile?.points || 0, achievement.points_required)} / {achievement.points_required}</span>
                              </div>
                              <Progress 
                                value={Math.min(((userProfile?.points || 0) / achievement.points_required) * 100, 100)} 
                                className="h-2"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default StudentAchievementsPage;
