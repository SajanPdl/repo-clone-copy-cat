
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap } from 'lucide-react';

interface LevelProgressProps {
  level: string;
  points: number;
  nextLevelPoints: number;
}

const levelConfig = {
  'Fresh Contributor': { color: 'from-green-500 to-emerald-500', nextLevel: 'Active Learner', requiredPoints: 100 },
  'Active Learner': { color: 'from-blue-500 to-cyan-500', nextLevel: 'Knowledge Sharer', requiredPoints: 500 },
  'Knowledge Sharer': { color: 'from-purple-500 to-pink-500', nextLevel: 'Note Lord', requiredPoints: 1000 },
  'Note Lord': { color: 'from-orange-500 to-red-500', nextLevel: 'Top Seller', requiredPoints: 2000 },
  'Top Seller': { color: 'from-yellow-500 to-orange-500', nextLevel: 'Education Master', requiredPoints: 5000 },
  'Education Master': { color: 'from-gradient-to-r from-purple-600 to-pink-600', nextLevel: 'Max Level', requiredPoints: 5000 }
};

const LevelProgress: React.FC<LevelProgressProps> = ({ level, points }) => {
  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig['Fresh Contributor'];
  const progressToNext = Math.min((points / config.requiredPoints) * 100, 100);
  const pointsToNext = Math.max(config.requiredPoints - points, 0);

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-5`} />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Level Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={`bg-gradient-to-r ${config.color} text-white border-none`}>
            {level}
          </Badge>
          <div className="text-right">
            <p className="text-2xl font-bold">{points}</p>
            <p className="text-xs text-gray-500">XP Points</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to {config.nextLevel}</span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {pointsToNext} XP needed
            </span>
          </div>
          <Progress value={progressToNext} className="h-3" />
        </div>

        <motion.div 
          className="grid grid-cols-3 gap-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500">Upload</p>
            <p className="font-semibold">+10 XP</p>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500">Download</p>
            <p className="font-semibold">+2 XP</p>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500">Sale</p>
            <p className="font-semibold">+25 XP</p>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default LevelProgress;
