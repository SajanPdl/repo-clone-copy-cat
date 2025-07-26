
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Medal, Award } from 'lucide-react';
import { UserAchievement } from '@/utils/studentDashboardUtils';

interface AchievementCardProps {
  achievements: UserAchievement[];
}

const rarityConfig = {
  common: { color: 'bg-gray-500', icon: Star },
  rare: { color: 'bg-blue-500', icon: Medal },
  epic: { color: 'bg-purple-500', icon: Award },
  legendary: { color: 'bg-yellow-500', icon: Trophy }
};

const AchievementCard: React.FC<AchievementCardProps> = ({ achievements = [] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {achievements.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No achievements yet</p>
          ) : (
            achievements.slice(0, 3).map((userAchievement, index) => {
              const achievement = userAchievement.achievement;
              const { color, icon: Icon } = rarityConfig[achievement.rarity];

              return (
                <motion.div
                  key={userAchievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-3 rounded-lg border bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 ${color} rounded`}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{achievement.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      ✓
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                      Earned {new Date(userAchievement.earned_at).toLocaleDateString()}
                    </span>
                    <Badge variant="outline" className={`text-xs ${color} text-white`}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
