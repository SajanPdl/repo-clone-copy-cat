
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  gradient?: string;
  delay?: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  gradient = "from-blue-600 to-purple-600",
  delay = 0,
  trend
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group"
    >
      <Card className={`relative overflow-hidden bg-gradient-to-r ${gradient} text-white border-none shadow-lg hover:shadow-xl transition-all duration-300`}
        role="region" aria-label={`${title} card`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/90">
            {title}
          </CardTitle>
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="p-2 bg-white/10 rounded-lg backdrop-blur-sm"
          >
            <Icon className="h-4 w-4 text-white" />
          </motion.div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl sm:text-2xl font-bold text-white mb-2">
            {value}
          </div>
          {description && (
            <p className="text-xs text-white/70 mb-2">
              {description}
            </p>
          )}
          {trend && (
            <p className={`text-xs ${trend.isPositive ? 'text-green-200' : 'text-red-200'} flex items-center`}>
              <span className={`mr-1 ${trend.isPositive ? '↗' : '↘'}`}>
                {trend.isPositive ? '↗' : '↘'}
              </span>
              {Math.abs(trend.value)}% from last week
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardCard;
