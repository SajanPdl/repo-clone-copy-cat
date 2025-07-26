
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, ShoppingCart, Bookmark, Share2, Clock } from 'lucide-react';
import { StudentActivity } from '@/utils/studentDashboardUtils';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  activities: StudentActivity[];
}

const activityIcons = {
  upload: Upload,
  download: Download,
  sale: ShoppingCart,
  bookmark: Bookmark,
  share: Share2
};

const activityColors = {
  upload: 'from-green-500 to-emerald-500',
  download: 'from-blue-500 to-cyan-500',
  sale: 'from-purple-500 to-pink-500',
  bookmark: 'from-orange-500 to-red-500',
  share: 'from-indigo-500 to-blue-500'
};

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No recent activity</p>
        ) : (
          activities.map((activity, index) => {
            const Icon = activityIcons[activity.activity_type];
            const gradient = activityColors[activity.activity_type];
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className={`p-2 bg-gradient-to-r ${gradient} rounded-lg`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.description || `${activity.activity_type} activity`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
                {activity.points_earned > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    +{activity.points_earned} XP
                  </Badge>
                )}
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
