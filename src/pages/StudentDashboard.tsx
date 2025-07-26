
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  FileText, 
  Download, 
  User, 
  Settings,
  Upload,
  ShoppingCart,
  Heart,
  Bell,
  BarChart3,
  Calendar,
  Wallet,
  Trophy,
  Plus,
  Edit,
  Trash2,
  Share2,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AnimatedWrapper from '@/components/ui/animated-wrapper';
import { useToast } from '@/hooks/use-toast';
import DashboardCard from '@/components/dashboard/DashboardCard';
import AchievementCard from '@/components/dashboard/AchievementCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import LevelProgress from '@/components/dashboard/LevelProgress';
import { fetchDashboardStats, DashboardStats } from '@/utils/studentDashboardUtils';
import { getNepaliDate, getNepaliTime } from '@/utils/nepaliDate';

const StudentDashboard = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Update time every second
    const updateTime = () => setCurrentTime(getNepaliTime());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['dashboardStats', user?.id],
    queryFn: () => fetchDashboardStats(user.id),
    enabled: !!user
  });

  // Mock achievements data
  const achievements = [
    {
      id: '1',
      title: 'First Upload',
      description: 'Upload your first study material',
      progress: dashboardStats?.totalUploads || 0,
      maxProgress: 1,
      earned: (dashboardStats?.totalUploads || 0) >= 1,
      rarity: 'common' as const
    },
    {
      id: '2',
      title: 'Knowledge Sharer',
      description: 'Upload 10 study materials',
      progress: dashboardStats?.totalUploads || 0,
      maxProgress: 10,
      earned: (dashboardStats?.totalUploads || 0) >= 10,
      rarity: 'rare' as const
    },
    {
      id: '3',
      title: 'Bestseller',
      description: 'Complete 5 marketplace sales',
      progress: dashboardStats?.totalSales || 0,
      maxProgress: 5,
      earned: (dashboardStats?.totalSales || 0) >= 5,
      rarity: 'epic' as const
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl mb-4"
          >
            🔐
          </motion.div>
          <h2 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h2>
          <Button onClick={() => window.location.href = '/login'} size="lg">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Header with greeting and time */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0]}! 
                <span className="text-2xl ml-2">👋</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {getNepaliDate()} • {currentTime}
              </p>
            </div>
            <Button variant="outline" className="flex items-center gap-2 hover:scale-105 transition-transform">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Notes Uploaded"
              value={dashboardStats?.totalUploads || 0}
              icon={Upload}
              gradient="from-green-500 to-emerald-600"
              delay={0.1}
              trend={{ value: 12, isPositive: true }}
            />
            <DashboardCard
              title="Downloads"
              value={dashboardStats?.totalDownloads || 0}
              icon={Download}
              gradient="from-blue-500 to-cyan-600"
              delay={0.2}
              trend={{ value: 8, isPositive: true }}
            />
            <DashboardCard
              title="Items Sold"
              value={dashboardStats?.totalSales || 0}
              icon={ShoppingCart}
              gradient="from-purple-500 to-pink-600"
              delay={0.3}
              trend={{ value: 25, isPositive: true }}
            />
            <DashboardCard
              title="Saved Items"
              value={dashboardStats?.totalBookmarks || 0}
              icon={Heart}
              gradient="from-orange-500 to-red-600"
              delay={0.4}
              trend={{ value: 5, isPositive: false }}
            />
          </div>

          {/* Main Dashboard Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                My Notes
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Saved
              </TabsTrigger>
              <TabsTrigger value="inbox" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Inbox
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Level Progress */}
                <div className="lg:col-span-1">
                  <LevelProgress
                    level={dashboardStats?.profile?.level || 'Fresh Contributor'}
                    points={dashboardStats?.profile?.points || 0}
                    nextLevelPoints={500}
                  />
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2">
                  <RecentActivity activities={dashboardStats?.recentActivities || []} />
                </div>
              </div>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement, index) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        index={index}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    My Notes Manager
                  </CardTitle>
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Note
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold mb-2">No notes uploaded yet</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Start sharing your knowledge by uploading your first study material!
                    </p>
                    <Button variant="outline">
                      Upload Your First Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="marketplace">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    My Marketplace Listings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛒</div>
                    <h3 className="text-xl font-semibold mb-2">No items listed</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Start earning by selling or sharing your books and materials!
                    </p>
                    <Button variant="outline">
                      Create First Listing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saved">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Saved Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💾</div>
                    <h3 className="text-xl font-semibold mb-2">No saved items</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Bookmark notes, papers, and marketplace items for quick access!
                    </p>
                    <Button variant="outline">
                      Browse Content
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inbox">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications & Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📬</div>
                    <h3 className="text-xl font-semibold mb-2">No new messages</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      You're all caught up! Messages from buyers and admin announcements will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                        {(user?.user_metadata?.name || user?.email)?.[0]?.toUpperCase()}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Member Since</label>
                        <p className="text-gray-600 dark:text-gray-300">
                          {new Date(user?.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Current Level</label>
                        <Badge className="bg-gradient-to-r from-purple-500 to-blue-500">
                          {dashboardStats?.profile?.level || 'Fresh Contributor'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Rewards & Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-purple-600">
                        {dashboardStats?.profile?.points || 0}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">Total XP Points</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm">Premium Content Access</span>
                        <Badge variant="outline">500 XP</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm">Free Book Giveaway</span>
                        <Badge variant="outline">1000 XP</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm">Custom Profile Theme</span>
                        <Badge variant="outline">250 XP</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
