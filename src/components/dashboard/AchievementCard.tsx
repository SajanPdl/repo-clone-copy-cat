
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Medal, Award } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  earned: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementCardProps {
  achievements?: Achievement[];
}

const rarityConfig = {
  common: { color: 'bg-gray-500', icon: Star },
  rare: { color: 'bg-blue-500', icon: Medal },
  epic: { color: 'bg-purple-500', icon: Award },
  legendary: { color: 'bg-yellow-500', icon: Trophy }
};

const defaultAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Upload',
    description: 'Upload your first study material',
    progress: 0,
    maxProgress: 1,
    earned: false,
    rarity: 'common'
  },
  {
    id: '2',
    title: 'Knowledge Sharer',
    description: 'Upload 10 study materials',
    progress: 0,
    maxProgress: 10,
    earned: false,
    rarity: 'rare'
  },
  {
    id: '3',
    title: 'Popular Content',
    description: 'Get 100 downloads on your materials',
    progress: 0,
    maxProgress: 100,
    earned: false,
    rarity: 'epic'
  }
];

const AchievementCard: React.FC<AchievementCardProps> = ({ achievements = defaultAchievements }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {achievements.slice(0, 3).map((achievement, index) => {
            const { color, icon: Icon } = rarityConfig[achievement.rarity];
            const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-3 rounded-lg border ${achievement.earned ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 ${color} rounded`}>
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{achievement.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  {achievement.earned && (
                    <Badge variant="secondary" className="text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
