
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, Award } from 'lucide-react';

const DashboardAchievements = () => {
  const achievements = [
    {
      id: 1,
      title: "First Upload",
      description: "Upload your first study material",
      icon: Trophy,
      earned: true,
      points: 100,
      earnedDate: "2024-01-15"
    },
    {
      id: 2,
      title: "Study Streak",
      description: "Study for 7 consecutive days",
      icon: Star,
      earned: true,
      points: 200,
      earnedDate: "2024-01-22"
    },
    {
      id: 3,
      title: "Popular Creator",
      description: "Get 100 downloads on your materials",
      icon: Target,
      earned: false,
      points: 500,
      earnedDate: null
    },
    {
      id: 4,
      title: "Knowledge Sharer",
      description: "Upload 10 study materials",
      icon: Award,
      earned: false,
      points: 300,
      earnedDate: null
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Achievements</h1>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Total Points: 300
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          return (
            <Card key={achievement.id} className={achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50'}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-8 w-8 ${achievement.earned ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  <Badge variant={achievement.earned ? 'default' : 'secondary'}>
                    {achievement.points} pts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {achievement.earned ? (
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-medium">✓ Earned</span>
                    <span className="text-sm text-gray-500">
                      {new Date(achievement.earnedDate!).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <span>Not earned yet</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Achievement Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Achievements Earned</span>
                <span>2/4 (50%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '50%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Total Points</span>
                <span>300/1100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '27%'}}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardAchievements;
