
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/StudentSidebar';
import DashboardCard from '@/components/dashboard/DashboardCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import LevelProgress from '@/components/dashboard/LevelProgress';
import AchievementCard from '@/components/dashboard/AchievementCard';
import MarketplaceManager from '@/components/MarketplaceManager';
import ProfileEditor from '@/components/ProfileEditor';
import { fetchDashboardStats, DashboardStats } from '@/utils/studentDashboardUtils';
import { useBookmarks } from '@/hooks/useBookmarks';
import {
  BookOpen,
  Download,
  ShoppingCart,
  Heart,
  TrendingUp,
  Award,
  Star,
  Calendar,
  User,
  Settings,
  Bell
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to access the dashboard.</p>
        </div>
      </div>
    );
  }

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
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
                level={stats?.profile?.level || 'Beginner'}
                points={stats?.profile?.points || 0}
                nextLevelPoints={1000}
              />
              <AchievementCard
                achievements={stats?.profile?.achievements || []}
              />
            </div>

            {/* Recent Activity */}
            <RecentActivity activities={stats?.recentActivities || []} />
          </div>
        );
      case 'marketplace':
        return <MarketplaceManager />;
      case 'profile':
        return <ProfileEditor />;
      case 'saved':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Saved Materials</h2>
            {bookmarksLoading ? (
              <div className="text-center py-8">Loading bookmarks...</div>
            ) : bookmarks.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
                <p className="text-gray-600">Start bookmarking materials to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((bookmark) => (
                  <Card key={bookmark.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">
                        {bookmark.materialData?.title || 'Unknown Material'}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {bookmark.content_type}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-2">
                        Saved on {new Date(bookmark.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <StudentSidebar />
        
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="lg:hidden" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Welcome back, {user.email?.split('@')[0] || 'Student'}!
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {stats?.profile?.level || 'Student'} • {stats?.profile?.points || 0} points
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {renderTabContent()}
              </div>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default StudentDashboard;
