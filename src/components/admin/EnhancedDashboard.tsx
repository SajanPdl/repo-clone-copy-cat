
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Users, BookOpen, FileText, MessageSquare, TrendingUp, Eye, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalUsers: number;
  totalMaterials: number;
  totalPapers: number;
  openQueries: number;
  totalDownloads: number;
  totalViews: number;
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
    totalViews: 0
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const [
        { count: usersCount },
        { count: materialsCount },
        { count: papersCount },
        { count: queriesCount },
        { data: materialsData },
        { data: papersData },
        { data: recentUsersData },
        { data: recentQueriesData }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('study_materials').select('*', { count: 'exact', head: true }),
        supabase.from('past_papers').select('*', { count: 'exact', head: true }),
        supabase.from('user_queries').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('study_materials').select('downloads, views'),
        supabase.from('past_papers').select('downloads, views'),
        supabase.from('users').select('id, email, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('user_queries').select('id, name, subject, message, status, created_at').order('created_at', { ascending: false }).limit(5)
      ]);

      // Calculate totals
      const totalMaterialDownloads = materialsData?.reduce((sum, item) => sum + (item.downloads || 0), 0) || 0;
      const totalPaperDownloads = papersData?.reduce((sum, item) => sum + (item.downloads || 0), 0) || 0;
      const totalMaterialViews = materialsData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;
      const totalPaperViews = papersData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalMaterials: materialsCount || 0,
        totalPapers: papersCount || 0,
        openQueries: queriesCount || 0,
        totalDownloads: totalMaterialDownloads + totalPaperDownloads,
        totalViews: totalMaterialViews + totalPaperViews
      });

      setRecentUsers(recentUsersData || []);
      setRecentQueries(recentQueriesData || []);

      // Generate recent activities
      const activities: RecentActivity[] = [
        ...((recentUsersData || []).slice(0, 3).map(user => ({
          id: user.id,
          type: 'user_joined',
          description: `New user registered: ${user.email}`,
          timestamp: user.created_at,
          user: user.email
        }))),
        ...((recentQueriesData || []).slice(0, 3).map(query => ({
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
        description: "Failed to fetch dashboard data",
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Materials</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalMaterials}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Past Papers</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalPapers}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Queries</p>
                <p className="text-3xl font-bold text-orange-600">{stats.openQueries}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.totalDownloads}</p>
              </div>
              <Download className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-teal-600">{stats.totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-sm text-gray-500">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              New Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p className="text-sm text-gray-500">No new users</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Queries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQueries.map((query) => (
                <div key={query.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{query.subject}</p>
                      <p className="text-xs text-gray-500">by {query.name}</p>
                    </div>
                    <Badge variant={query.status === 'open' ? 'default' : 'secondary'}>
                      {query.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">{query.message}</p>
                  <div className="flex gap-2">
                    {query.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQueryStatusUpdate(query.id, 'resolved')}
                      >
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {recentQueries.length === 0 && (
                <p className="text-sm text-gray-500">No recent queries</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
