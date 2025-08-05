
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/StudentSidebar';
import DashboardCard from '@/components/dashboard/DashboardCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import LevelProgress from '@/components/dashboard/LevelProgress';
import AchievementCard from '@/components/dashboard/AchievementCard';
import { fetchDashboardStats, DashboardStats } from '@/utils/studentDashboardUtils';
import { useBookmarks } from '@/hooks/useBookmarks';
import {
  BookOpen,
  Download,
  ShoppingCart,
  Heart,
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react';

const DashboardOverview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { bookmarks } = useBookmarks();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const dashboardData = await fetchDashboardStats(user.id);
      setStats(dashboardData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: 'Total Uploads',
      value: stats?.totalUploads || 0,
      icon: BookOpen,
      description: 'Study materials shared',
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      title: 'Downloads',
      value: stats?.totalDownloads || 0,
      icon: Download,
      description: 'Materials downloaded',
      gradient: 'from-green-600 to-teal-600'
    },
    {
      title: 'Marketplace Items',
      value: stats?.totalSales || 0,
      icon: ShoppingCart,
      description: 'Items sold',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      title: 'Bookmarks',
      value: bookmarks.length,
      icon: Heart,
      description: 'Saved materials',
      gradient: 'from-red-600 to-rose-600'
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <StudentSidebar />
        
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 px-4 py-3">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Dashboard Overview
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome back, {user?.email?.split('@')[0] || 'Student'}!
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardCards.map((card, index) => (
                  <DashboardCard
                    key={index}
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    description={card.description}
                    gradient={card.gradient}
                    delay={index * 0.1}
                  />
                ))}
              </div>

              {/* Level Progress and Achievements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LevelProgress
                  level={stats?.profile?.level || 'Fresh Contributor'}
                  points={stats?.profile?.points || 0}
                  nextLevelPoints={1000}
                />
                <AchievementCard
                  achievements={stats?.achievements || []}
                />
              </div>

              {/* Recent Activity */}
              <RecentActivity activities={stats?.recentActivities || []} />

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Quick Upload</h3>
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Share your study materials with the community
                  </p>
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2 text-sm transition-colors">
                    Upload Material
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Upcoming Events</h3>
                    <Calendar className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Check out the latest educational events
                  </p>
                  <button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-md px-4 py-2 text-sm transition-colors">
                    View Events
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">AI Assistant</h3>
                    <Award className="h-5 w-5 text-purple-500" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Get help with your studies from AI
                  </p>
                  <button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-md px-4 py-2 text-sm transition-colors">
                    Ask AI
                  </button>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardOverview;
