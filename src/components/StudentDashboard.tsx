
import React, { useEffect, useState } from 'react';
import { useSecureAuth as useAuth } from '@/hooks/useSecureAuth';
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
import SellerWallet from '@/components/wallet/SellerWallet';
import { fetchDashboardStats, DashboardStats } from '@/utils/studentDashboardUtils';
import { useBookmarks } from '@/hooks/useBookmarks';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Bell,
  LogOut,
  Wallet
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [signingOut, setSigningOut] = useState(false);

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
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: 'Success',
        description: 'Signed out successfully'
      });
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSigningOut(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const dashboardCards = [
    {
      title: 'Total Uploads',
      value: stats?.totalUploads || 0,
      icon: BookOpen,
      description: 'Study materials shared',
      gradient: 'from-blue-600 via-blue-500 to-cyan-500'
    },
    {
      title: 'Downloads',
      value: stats?.totalDownloads || 0,
      icon: Download,
      description: 'Materials downloaded',
      gradient: 'from-green-600 via-green-500 to-emerald-500'
    },
    {
      title: 'Marketplace Items',
      value: stats?.totalSales || 0,
      icon: ShoppingCart,
      description: 'Items sold',
      gradient: 'from-purple-600 via-purple-500 to-pink-500'
    },
    {
      title: 'Bookmarks',
      value: bookmarks.length,
      icon: Heart,
      description: 'Saved materials',
      gradient: 'from-red-600 via-red-500 to-rose-500'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 p-8 text-white">
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl font-bold mb-2">
                    Hello, {user.email?.split('@')[0] || 'Student'}! 👋
                  </h2>
                  <p className="text-blue-100 mb-4">
                    Ready to continue your learning journey? Let's achieve great things together!
                  </p>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      Level: {stats?.profile?.level || 'Fresh Contributor'}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {stats?.profile?.points || 0} points
                    </Badge>
                  </div>
                </motion.div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardCards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <DashboardCard
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    description={card.description}
                    gradient={card.gradient}
                    delay={index * 0.1}
                  />
                </motion.div>
              ))}
            </div>

            {/* Level Progress and Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <LevelProgress
                  level={stats?.profile?.level || 'Fresh Contributor'}
                  points={stats?.profile?.points || 0}
                  nextLevelPoints={1000}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <AchievementCard
                  achievements={stats?.achievements || []}
                />
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <RecentActivity activities={stats?.recentActivities || []} />
            </motion.div>
          </motion.div>
        );
      case 'marketplace':
        return <MarketplaceManager />;
      case 'profile':
        return <ProfileEditor />;
      case 'wallet':
        return <SellerWallet />;
      case 'saved':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
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
                  <Card key={bookmark.id} className="hover:shadow-lg transition-shadow backdrop-blur-sm bg-white/80">
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
          </motion.div>
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <StudentSidebar />
        
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="lg:hidden" />
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xl font-semibold text-gray-900"
                  >
                    Welcome back, {user.email?.split('@')[0] || 'Student'}!
                  </motion.h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-purple-100 border-0">
                      {stats?.profile?.level || 'Fresh Contributor'}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {stats?.profile?.points || 0} points
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="hover:bg-white/80">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-white/80">
                  <User className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  title="Sign Out"
                  className="hover:bg-white/80"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                <TabsTrigger value="wallet">
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet
                </TabsTrigger>
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
