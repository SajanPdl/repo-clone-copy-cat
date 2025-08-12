
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
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { fetchDashboardStats, DashboardStats } from '@/utils/studentDashboardUtils';
import { useBookmarks } from '@/hooks/useBookmarks';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
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
  LogOut,
  Home,
  FileText,
  Store,
  Menu
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const location = useLocation();

  // Bottom navigation items for mobile/tablet
  const bottomNavItems = [
    { title: 'Home', icon: Home, path: '/' },
    { title: 'Study Materials', icon: BookOpen, path: '/study-materials' },
    { title: 'Past Papers', icon: FileText, path: '/past-papers' },
    { title: 'Marketplace', icon: Store, path: '/marketplace' },
    { title: 'Events', icon: Calendar, path: '/events' },
    { title: 'Profile', icon: User, path: '/profile' },
  ];

  const isActiveBottomNav = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

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

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: 'Error',
          description: 'Failed to sign out. Please try again.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: 'You have been signed out successfully.'
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while signing out.',
        variant: 'destructive'
      });
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
          <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-3 sm:px-4 py-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Welcome back, {user.email?.split('@')[0] || 'Student'}!
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {stats?.profile?.level || 'Fresh Contributor'} • {stats?.profile?.points || 0} points
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <NotificationBell />
                <Button variant="ghost" size="icon" className="tap-target">
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="tap-target">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-6 pb-24 lg:pb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 sticky top-[56px] z-30 bg-white dark:bg-gray-800 border-b">
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

          {/* Bottom Navigation for Mobile/Tablet */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg pb-safe" role="navigation" aria-label="Bottom navigation">
            <div className="flex items-center justify-around py-2 px-1 max-w-md mx-auto">
              {bottomNavItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => navigate(item.path)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(item.path);
                    }
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-1 min-w-0 flex-1 transition-all duration-200 rounded-lg mx-1 group ${
                    isActiveBottomNav(item.path)
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                  aria-label={`Navigate to ${item.title}`}
                  aria-current={isActiveBottomNav(item.path) ? 'page' : undefined}
                >
                  <item.icon className={`h-5 w-5 mb-1 transition-transform duration-200 ${
                    isActiveBottomNav(item.path) ? 'scale-110' : 'group-hover:scale-105'
                  }`} />
                  <span className="text-xs font-medium truncate max-w-full leading-tight">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default StudentDashboard;
