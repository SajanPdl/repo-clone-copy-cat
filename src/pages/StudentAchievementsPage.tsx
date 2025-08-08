
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/StudentSidebar';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Award, Medal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
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

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement: Achievement;
}

const StudentAchievementsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      // Fetch all achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('points_required', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Type assertion to ensure proper typing
      const typedAchievements = (allAchievements || []).map(achievement => ({
        ...achievement,
        rarity: achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary'
      }));

      setAchievements(typedAchievements);

      // Fetch user achievements
      const { data: userAchievementsData, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user?.id);

      if (userAchievementsError) throw userAchievementsError;

      const typedUserAchievements = (userAchievementsData || []).map(userAchievement => ({
        ...userAchievement,
        achievement: {
          ...userAchievement.achievement,
          rarity: userAchievement.achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary'
        }
      }));

      setUserAchievements(typedUserAchievements);

    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load achievements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return Trophy;
      case 'star': return Star;
      case 'award': return Award;
      case 'medal': return Medal;
      default: return Trophy;
    }
  };

  const isAchievementEarned = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <SidebarProvider>
        <div className="flex w-full">
          <StudentSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3 px-4 py-3">
                <SidebarTrigger className="lg:hidden" />
                <h1 className="text-xl font-semibold text-gray-900">Achievements</h1>
              </div>
            </header>
            <main className="p-6">
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Earned</p>
                          <p className="text-2xl font-bold">{userAchievements.length}</p>
                        </div>
                        <Trophy className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Available</p>
                          <p className="text-2xl font-bold">{achievements.length}</p>
                        </div>
                        <Star className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <p className="text-2xl font-bold">
                            {Math.round((userAchievements.length / achievements.length) * 100)}%
                          </p>
                        </div>
                        <Award className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Achievements Grid */}
                <Card>
                  <CardHeader>
                    <CardTitle>All Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievements.map((achievement) => {
                        const IconComponent = getAchievementIcon(achievement.icon);
                        const earned = isAchievementEarned(achievement.id);
                        
                        return (
                          <div
                            key={achievement.id}
                            className={`p-4 rounded-lg border transition-all ${
                              earned 
                                ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-full ${earned ? 'bg-yellow-200' : 'bg-gray-200'}`}>
                                <IconComponent 
                                  className={`h-6 w-6 ${earned ? 'text-yellow-700' : 'text-gray-500'}`} 
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <Badge 
                                    variant="outline" 
                                    className={getRarityColor(achievement.rarity)}
                                  >
                                    {achievement.rarity}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {achievement.points_required} pts
                                  </span>
                                </div>
                                {earned && (
                                  <Badge className="mt-2 bg-green-100 text-green-800">
                                    Earned!
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default StudentAchievementsPage;
