
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserAchievements } from '@/utils/studentDashboardUtils';
import { Trophy, Award, Medal, Star } from 'lucide-react';

const rarityColors = {
  common: 'bg-gray-100 text-gray-800',
  rare: 'bg-blue-100 text-blue-800',
  epic: 'bg-purple-100 text-purple-800',
  legendary: 'bg-yellow-100 text-yellow-800'
};

const rarityIcons = {
  common: Star,
  rare: Medal,
  epic: Award,
  legendary: Trophy
};

const DashboardAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;
    
    try {
      const userAchievements = await fetchUserAchievements(user.id);
      setAchievements(userAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">My Achievements</h2>
        <p className="text-gray-600">Track your progress and accomplishments</p>
      </div>

      {achievements.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
            <p className="text-gray-600">
              Start using the platform to earn your first achievement!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const Icon = rarityIcons[achievement.achievement.rarity];
            return (
              <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className="h-8 w-8 text-yellow-600" />
                    <Badge className={rarityColors[achievement.achievement.rarity]}>
                      {achievement.achievement.rarity}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{achievement.achievement.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{achievement.achievement.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-600 font-medium">
                      {achievement.achievement.points_required} points
                    </span>
                    <span className="text-gray-500">
                      Earned {new Date(achievement.earned_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardAchievements;
