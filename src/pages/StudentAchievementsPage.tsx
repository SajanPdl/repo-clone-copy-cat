
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Star, Medal, Award, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'study' | 'participation' | 'performance' | 'social';
  points: number;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const StudentAchievementsPage = () => {
  // Mock achievements data
  const mockAchievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first study session',
      icon: 'trophy',
      category: 'study',
      points: 50,
      unlockedAt: '2024-01-10',
      rarity: 'common'
    },
    {
      id: '2',
      title: 'Knowledge Seeker',
      description: 'Read 10 study materials',
      icon: 'star',
      category: 'study',
      points: 100,
      unlockedAt: '2024-01-15',
      rarity: 'common'
    },
    {
      id: '3',
      title: 'Exam Master',
      description: 'Score above 90% in 5 practice tests',
      icon: 'medal',
      category: 'performance',
      points: 500,
      progress: 3,
      maxProgress: 5,
      rarity: 'epic'
    },
    {
      id: '4',
      title: 'Community Helper',
      description: 'Help 20 fellow students with their queries',
      icon: 'award',
      category: 'social',
      points: 300,
      progress: 12,
      maxProgress: 20,
      rarity: 'rare'
    },
    {
      id: '5',
      title: 'Consistency King',
      description: 'Study for 30 consecutive days',
      icon: 'target',
      category: 'study',
      points: 1000,
      progress: 18,
      maxProgress: 30,
      rarity: 'legendary'
    }
  ];

  const { data: achievements = mockAchievements, isLoading } = useQuery({
    queryKey: ['student-achievements'],
    queryFn: async () => {
      return mockAchievements;
    }
  });

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return Trophy;
      case 'star': return Star;
      case 'medal': return Medal;
      case 'award': return Award;
      case 'target': return Target;
      default: return Trophy;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'study': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'participation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'performance': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'social': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your Achievements
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Track your progress and celebrate your learning milestones
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
              <CardTitle>{unlockedAchievements.length}</CardTitle>
              <CardDescription>Achievements Unlocked</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <Star className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <CardTitle>{totalPoints}</CardTitle>
              <CardDescription>Total Points Earned</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <Target className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <CardTitle>{Math.round((unlockedAchievements.length / achievements.length) * 100)}%</CardTitle>
              <CardDescription>Completion Rate</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Unlocked Achievements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unlockedAchievements.map((achievement) => {
                    const IconComponent = getIconComponent(achievement.icon);
                    return (
                      <Card key={achievement.id} className="hover:shadow-lg transition-shadow border-2 border-green-200 dark:border-green-800">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full mr-4">
                                <IconComponent className="h-6 w-6 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{achievement.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getRarityColor(achievement.rarity)}>
                                    {achievement.rarity}
                                  </Badge>
                                  <Badge className={getCategoryColor(achievement.category)}>
                                    {achievement.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <CardDescription>{achievement.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <Calendar className="h-4 w-4 mr-1" />
                              Unlocked: {new Date(achievement.unlockedAt!).toLocaleDateString()}
                            </div>
                            <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20">
                              +{achievement.points} points
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {/* In Progress / Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  In Progress
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lockedAchievements.map((achievement) => {
                    const IconComponent = getIconComponent(achievement.icon);
                    const progressPercentage = achievement.progress && achievement.maxProgress 
                      ? (achievement.progress / achievement.maxProgress) * 100 
                      : 0;
                    
                    return (
                      <Card key={achievement.id} className="hover:shadow-lg transition-shadow opacity-75">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full mr-4">
                                <IconComponent className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <CardTitle className="text-lg text-gray-700 dark:text-gray-300">
                                  {achievement.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getRarityColor(achievement.rarity)}>
                                    {achievement.rarity}
                                  </Badge>
                                  <Badge className={getCategoryColor(achievement.category)}>
                                    {achievement.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <CardDescription>{achievement.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Progress</span>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  {achievement.progress}/{achievement.maxProgress}
                                </span>
                              </div>
                              <Progress value={progressPercentage} className="h-2" />
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {achievement.progress !== undefined && achievement.maxProgress !== undefined
                                ? `${achievement.maxProgress - achievement.progress} more to go`
                                : 'Not started yet'
                              }
                            </span>
                            <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900">
                              +{achievement.points} points
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAchievementsPage;
