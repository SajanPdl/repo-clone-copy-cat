
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
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
  achievement: Achievement;
  index: number;
}

const rarityConfig = {
  common: { color: 'bg-gray-500', icon: Star },
  rare: { color: 'bg-blue-500', icon: Medal },
  epic: { color: 'bg-purple-500', icon: Award },
  legendary: { color: 'bg-yellow-500', icon: Trophy }
};

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, index }) => {
  const { color, icon: Icon } = rarityConfig[achievement.rarity];
  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
    >
      <Card className={`relative overflow-hidden ${achievement.earned ? 'ring-2 ring-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 'opacity-75'}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 ${color} rounded-lg`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{achievement.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {achievement.description}
                </p>
              </div>
            </div>
            {achievement.earned && (
              <Badge className="bg-yellow-500 text-white">
                Earned!
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{achievement.progress}/{achievement.maxProgress}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AchievementCard;
