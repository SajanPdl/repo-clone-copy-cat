
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Users, BookOpen, FileText, MessageSquare, TrendingUp, Eye, Download, DollarSign, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalUsers: number;
  totalMaterials: number;
  totalPapers: number;
  openQueries: number;
  totalDownloads: number;
  totalViews: number;
  totalRevenue: number;
  activeSubscriptions: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface RecentUser {
  id: string;
  email: string;
  created_at: string;
}

interface RecentQuery {
  id: number;
  name: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const EnhancedDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMaterials: 0,
    totalPapers: 0,
    openQueries: 0,
    totalDownloads: 0,
    totalViews: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time subscriptions
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'study_materials'
      }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users'
      }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_queries'
      }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_subscriptions'
      }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats with better error handling
      const [
        usersResult,
        materialsResult,
        papersResult,
        queriesResult,
        materialsData,
        papersData,
        recentUsersData,
        recentQueriesData,
        subscriptionStats,
        revenueResult
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('study_materials').select('*', { count: 'exact', head: true }),
        supabase.from('past_papers').select('*', { count: 'exact', head: true }),
        supabase.from('user_queries').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('study_materials').select('downloads, views'),
        supabase.from('past_papers').select('downloads, views'),
        supabase.from('users').select('id, email, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('user_queries').select('id, name, subject, message, status, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('payment_requests').select('amount').eq('status', 'approved')
      ]);

      // Handle errors gracefully
      if (usersResult.error) console.error('Error fetching users:', usersResult.error);
      if (materialsResult.error) console.error('Error fetching materials:', materialsResult.error);
      if (papersResult.error) console.error('Error fetching papers:', papersResult.error);
      if (queriesResult.error) console.error('Error fetching queries:', queriesResult.error);

      // Calculate totals with null checks
      const totalMaterialDownloads = materialsData?.data?.reduce((sum, item) => sum + (item.downloads || 0), 0) || 0;
      const totalPaperDownloads = papersData?.data?.reduce((sum, item) => sum + (item.downloads || 0), 0) || 0;
      const totalMaterialViews = materialsData?.data?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;
      const totalPaperViews = papersData?.data?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;

      // Calculate total revenue
      const totalRevenue = revenueResult?.data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalMaterials: materialsResult.count || 0,
        totalPapers: papersResult.count || 0,
        openQueries: queriesResult.count || 0,
        totalDownloads: totalMaterialDownloads + totalPaperDownloads,
        totalViews: totalMaterialViews + totalPaperViews,
        totalRevenue: totalRevenue,
        activeSubscriptions: subscriptionStats.count || 0
      });

      setRecentUsers(recentUsersData?.data || []);
      setRecentQueries(recentQueriesData?.data || []);

      // Generate recent activities
      const activities: RecentActivity[] = [
        ...((recentUsersData?.data || []).slice(0, 3).map(user => ({
          id: user.id,
          type: 'user_joined',
          description: `New user registered: ${user.email}`,
          timestamp: user.created_at,
          user: user.email
        }))),
        ...((recentQueriesData?.data || []).slice(0, 3).map(query => ({
          id: query.id.toString(),
          type: 'new_query',
          description: `New query: ${query.subject}`,
          timestamp: query.created_at,
          user: query.name
        })))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 6);

      setRecentActivities(activities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQueryStatusUpdate = async (queryId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('user_queries')
        .update({ status: newStatus })
        .eq('id', queryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Query status updated successfully"
      });
      fetchDashboardData();
    } catch (error: any) {
      console.error('Error updating query status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update query status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Button onClick={fetchDashboardData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Materials</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterials.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Available materials
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Papers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPapers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Available papers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Queries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openQueries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Pending support
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Material downloads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Page views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Premium users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Queries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Queries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Support Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQueries.length > 0 ? (
                recentQueries.map((query) => (
                  <div key={query.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{query.subject}</h4>
                      <Badge className={getStatusColor(query.status)}>
                        {query.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{query.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">From: {query.name}</span>
                      <div className="space-x-2">
                        {query.status === 'open' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQueryStatusUpdate(query.id, 'in_progress')}
                            >
                              Start
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQueryStatusUpdate(query.id, 'resolved')}
                            >
                              Resolve
                            </Button>
                          </>
                        )}
                        {query.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQueryStatusUpdate(query.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent queries</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">New User</Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent users</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;
