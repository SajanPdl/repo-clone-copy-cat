
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
import { fetchDashboardStats, DashboardStats } from '@/utils/studentDashboardUtils';
import { useBookmarks } from '@/hooks/useBookmarks';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  GraduationCap,
  Zap,
  Clock,
  Target
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <GraduationCap className="h-16 w-16 mx-auto text-blue-500 mb-4" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Please Login</h2>
          <p className="text-gray-600 text-lg">You need to be logged in to access the dashboard.</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: 'Total Uploads',
      value: stats?.totalUploads || 0,
      icon: BookOpen,
      description: 'Study materials shared',
      gradient: 'from-blue-500 to-cyan-500',
      trend: '+12%'
    },
    {
      title: 'Downloads',
      value: stats?.totalDownloads || 0,
      icon: Download,
      description: 'Materials downloaded',
      gradient: 'from-green-500 to-emerald-500',
      trend: '+8%'
    },
    {
      title: 'Marketplace Items',
      value: stats?.totalSales || 0,
      icon: ShoppingCart,
      description: 'Items sold',
      gradient: 'from-purple-500 to-pink-500',
      trend: '+15%'
    },
    {
      title: 'Bookmarks',
      value: bookmarks.length,
      icon: Heart,
      description: 'Saved materials',
      gradient: 'from-red-500 to-rose-500',
      trend: '+5%'
    }
  ];

  const motivationalQuotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Education is the most powerful weapon which you can use to change the world.",
    "The only way to do great work is to love what you do."
  ];

  const todaysQuote = motivationalQuotes[new Date().getDate() % motivationalQuotes.length];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-8 backdrop-blur-lg border border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      Hello, {user.email?.split('@')[0] || 'Student'}! 👋
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Ready to continue your learning journey today?
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="p-4 bg-white/80 rounded-full"
                  >
                    <Sparkles className="h-8 w-8 text-purple-500" />
                  </motion.div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/40">
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Daily Motivation
                  </h3>
                  <p className="text-gray-600 italic">"{todaysQuote}"</p>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardCards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden backdrop-blur-lg bg-white/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5`}></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} bg-opacity-10`}>
                          <card.icon className="h-6 w-6 text-white" style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.3))' }} />
                        </div>
                        <Badge variant="secondary" className="text-green-600 bg-green-100">
                          {card.trend}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-gray-800 mb-1">{card.value}</p>
                        <h3 className="font-semibold text-gray-700 mb-1">{card.title}</h3>
                        <p className="text-sm text-gray-500">{card.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Level Progress and Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
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
                transition={{ delay: 0.6 }}
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
              transition={{ delay: 0.7 }}
            >
              <RecentActivity activities={stats?.recentActivities || []} />
            </motion.div>
          </div>
        );
      case 'marketplace':
        return <MarketplaceManager />;
      case 'profile':
        return <ProfileEditor />;
      case 'saved':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Saved Materials</h2>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {bookmarks.length} items
              </Badge>
            </div>
            {bookmarksLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading bookmarks...</p>
              </div>
            ) : bookmarks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <Heart className="h-16 w-16 mx-auto text-gray-400 mb-6" />
                <h3 className="text-2xl font-semibold mb-3">No bookmarks yet</h3>
                <p className="text-gray-600 mb-8 text-lg">Start bookmarking materials to see them here.</p>
                <Button onClick={() => navigate('/study-materials')} className="bg-gradient-to-r from-blue-500 to-purple-500">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Browse Materials
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {bookmarks.map((bookmark, index) => (
                    <motion.div
                      key={bookmark.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-lg bg-white/80 border-0">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <Badge variant="outline" className="text-xs">
                              {bookmark.content_type === 'study_material' ? 'Study Material' : 'Past Paper'}
                            </Badge>
                            <Heart className="h-5 w-5 text-red-500 fill-current" />
                          </div>
                          <h3 className="font-semibold mb-3 line-clamp-2">
                            {bookmark.materialData?.title || 'Unknown Material'}
                          </h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            {bookmark.materialData?.subject && (
                              <p><span className="font-medium">Subject:</span> {bookmark.materialData.subject}</p>
                            )}
                            {bookmark.materialData?.grade && (
                              <p><span className="font-medium">Grade:</span> {bookmark.materialData.grade}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>Saved {new Date(bookmark.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Download className="h-3 w-3" />
                              <span>{bookmark.materialData?.downloads || 0}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="text-center py-16">
            <Clock className="h-16 w-16 mx-auto text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
            <p className="text-gray-600 text-lg">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SidebarProvider>
        <div className="flex w-full">
          <StudentSidebar />
          
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="lg:hidden" />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Welcome back, {user.email?.split('@')[0] || 'Student'}!
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="outline" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200">
                        {stats?.profile?.level || 'Fresh Contributor'}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span>{stats?.profile?.points || 0} points</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    title="Sign Out"
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </header>

            <main className="flex-1 p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 bg-white/80 backdrop-blur-lg border border-gray-200/50">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="marketplace" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    Marketplace
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="saved" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    Saved
                  </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderTabContent()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </Tabs>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default StudentDashboard;
