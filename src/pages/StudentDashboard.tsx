import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { 
  BookOpen, 
  Upload,
  ShoppingCart,
  Heart,
  Bell,
  BarChart3,
  Calendar,
  Wallet,
  Trophy,
  Plus,
  Settings,
  Download,
  User,
  MessageSquare,
  ExternalLink,
  Menu
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useToast } from '@/hooks/use-toast';
import DashboardCard from '@/components/dashboard/DashboardCard';
import AchievementCard from '@/components/dashboard/AchievementCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import LevelProgress from '@/components/dashboard/LevelProgress';
import { StudentSidebar } from '@/components/StudentSidebar';
import { fetchDashboardStats } from '@/utils/studentDashboardUtils';
import { fetchRealNepaliDate, NepaliDateInfo } from '@/utils/nepaliDate';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { bookmarks } = useBookmarks();
  const { toast } = useToast();
  const [nepaliDate, setNepaliDate] = useState<NepaliDateInfo | null>(null);

  // Fetch real Nepali date
  useEffect(() => {
    const loadNepaliDate = async () => {
      try {
        const dateInfo = await fetchRealNepaliDate();
        setNepaliDate(dateInfo);
      } catch (error) {
        console.error('Error loading Nepali date:', error);
      }
    };

    loadNepaliDate();
    const interval = setInterval(loadNepaliDate, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['dashboardStats', user?.id],
    queryFn: () => fetchDashboardStats(user!.id),
    enabled: !!user
  });

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
    },
    {
      id: '4',
      title: 'Bookworm',
      description: 'Bookmark 25 materials',
      progress: bookmarks.length,
      maxProgress: 25,
      earned: bookmarks.length >= 25,
      rarity: 'rare' as const
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
          <Button asChild size="lg">
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider collapsedWidth={56}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        {/* Mobile header with trigger */}
        <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 flex items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b px-4">
          <SidebarTrigger className="mr-4" />
          <h1 className="text-lg font-semibold">Student Dashboard</h1>
        </header>

        <StudentSidebar />

        <main className="flex-1 overflow-auto">
          {/* Desktop header */}
          <div className="hidden md:block sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b p-4">
            <div className="flex items-center justify-between">
              <SidebarTrigger />
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-8 mt-16 md:mt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Header with greeting */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0]}! 
                  <span className="text-xl md:text-2xl ml-2">👋</span>
                </h1>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 flex items-center gap-2 md:gap-4">
                  <Calendar className="h-4 w-4" />
                  {nepaliDate ? (
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <span className="font-medium">{nepaliDate.formattedNepali}</span>
                      <span className="text-sm">({nepaliDate.dayOfWeek})</span>
                      <span className="text-sm">{nepaliDate.time}</span>
                    </div>
                  ) : (
                    <span>Loading date...</span>
                  )}
                </div>
              </motion.div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
                  title="Bookmarks"
                  value={bookmarks.length}
                  icon={Heart}
                  gradient="from-orange-500 to-red-600"
                  delay={0.4}
                  trend={{ value: 5, isPositive: true }}
                />
              </div>

              {/* Main Dashboard Content */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
                  <TabsTrigger value="overview" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                    <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                    <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Notes</span>
                  </TabsTrigger>
                  <TabsTrigger value="marketplace" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                    <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Market</span>
                  </TabsTrigger>
                  <TabsTrigger value="saved" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                    <Heart className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Saved</span>
                  </TabsTrigger>
                  <TabsTrigger value="inbox" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                    <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Inbox</span>
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                    <User className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <LevelProgress
                        level={dashboardStats?.profile?.level || 'Fresh Contributor'}
                        points={dashboardStats?.profile?.points || 0}
                        nextLevelPoints={500}
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <RecentActivity activities={dashboardStats?.recentActivities || []} />
                    </div>
                  </div>

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

                <TabsContent value="saved">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Saved Content ({bookmarks.length})
                      </CardTitle>
                      <Button asChild variant="outline">
                        <Link to="/study-materials">
                          <Plus className="h-4 w-4 mr-2" />
                          Browse Materials
                        </Link>
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {bookmarks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {bookmarks.map((bookmark) => (
                            <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-sm line-clamp-2">
                                    {bookmark.materialData?.title || 'Unknown Material'}
                                  </h4>
                                  <Badge variant="outline" className="text-xs ml-2">
                                    {bookmark.content_type.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">
                                  {bookmark.materialData?.subject} • {bookmark.materialData?.grade}
                                </p>
                                <Button asChild size="sm" className="w-full">
                                  <Link to={`/content/${bookmark.content_id}`}>
                                    <ExternalLink className="h-3 w-3 mr-2" />
                                    View Material
                                  </Link>
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-4xl md:text-6xl mb-4">💾</div>
                          <h3 className="text-lg md:text-xl font-semibold mb-2">No saved items</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base">
                            Bookmark notes, papers, and marketplace items for quick access!
                          </p>
                          <Button asChild>
                            <Link to="/study-materials">Browse Content</Link>
                          </Button>
                        </div>
                      )}
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
                        <span className="hidden sm:inline">Add New Note</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <div className="text-4xl md:text-6xl mb-4">📝</div>
                        <h3 className="text-lg md:text-xl font-semibold mb-2">No notes uploaded yet</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base">
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
                        <div className="text-4xl md:text-6xl mb-4">🛒</div>
                        <h3 className="text-lg md:text-xl font-semibold mb-2">No items listed</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base">
                          Start earning by selling or sharing your books and materials!
                        </p>
                        <Button variant="outline">
                          Create First Listing
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
                        <div className="text-4xl md:text-6xl mb-4">📬</div>
                        <h3 className="text-lg md:text-xl font-semibold mb-2">No new messages</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
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
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold text-white">
                            {(user?.user_metadata?.name || user?.email)?.[0]?.toUpperCase()}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">{user?.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Member Since</label>
                            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
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
                          <div className="text-3xl md:text-4xl font-bold text-purple-600">
                            {dashboardStats?.profile?.points || 0}
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">Total XP Points</p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-xs md:text-sm">Premium Content Access</span>
                            <Badge variant="outline">500 XP</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-xs md:text-sm">Free Book Giveaway</span>
                            <Badge variant="outline">1000 XP</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-xs md:text-sm">Custom Profile Theme</span>
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
        </main>
      </div>
    </SidebarProvider>
  );
};

export default StudentDashboard;
