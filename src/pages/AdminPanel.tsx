import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Users, 
  BookText, 
  FileText, 
  MessageSquare, 
  ChevronRight,
  ExternalLink,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats, fetchRecentUploads, fetchRecentQueries } from '@/utils/queryUtils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminPanel = () => {
  const navigate = useNavigate();
  
  // Queries for dashboard data
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: fetchDashboardStats
  });
  
  const { data: recentUploads, isLoading: isUploadsLoading } = useQuery({
    queryKey: ['recent_uploads'],
    queryFn: () => fetchRecentUploads(5)
  });
  
  const { data: recentQueries, isLoading: isQueriesLoading } = useQuery({
    queryKey: ['recent_queries'],
    queryFn: () => fetchRecentQueries(5)
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-500 dark:text-gray-400">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
            onClick={() => navigate('/admin/materials')}
          >
            <Plus className="h-4 w-4" />
            Add New Content
          </Button>
          <Button 
            variant="outline" 
            className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            onClick={() => navigate('/admin/analytics')}
          >
            View Analytics
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                <h3 className="text-3xl font-bold mt-1">{isStatsLoading ? "..." : stats?.totalUsers.toLocaleString()}</h3>
                <div className="flex items-center mt-1">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    +{stats?.userGrowth || '12%'} 
                  </Badge>
                  <span className="text-xs ml-2 text-gray-500">this month</span>
                </div>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <Progress value={78} className="h-1 mt-4" />
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Downloads</p>
                <h3 className="text-3xl font-bold mt-1">{isStatsLoading ? "..." : stats?.totalDownloads.toLocaleString()}</h3>
                <div className="flex items-center mt-1">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    +{stats?.downloadGrowth || '8%'} 
                  </Badge>
                  <span className="text-xs ml-2 text-gray-500">this month</span>
                </div>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <Progress value={65} className="h-1 mt-4" />
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Study Materials</p>
                <h3 className="text-3xl font-bold mt-1">{isStatsLoading ? "..." : stats?.totalStudyMaterials.toLocaleString()}</h3>
                <div className="flex items-center mt-1">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    +{stats?.materialsGrowth || '15%'} 
                  </Badge>
                  <span className="text-xs ml-2 text-gray-500">this month</span>
                </div>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <BookText className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <Progress value={85} className="h-1 mt-4" />
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Queries</p>
                <h3 className="text-3xl font-bold mt-1">{isStatsLoading ? "..." : stats?.openQueries}</h3>
                <div className="flex items-center mt-1">
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    +{stats?.queriesGrowth || '4%'} 
                  </Badge>
                  <span className="text-xs ml-2 text-gray-500">this month</span>
                </div>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <Progress value={40} className="h-1 mt-4" />
          </CardContent>
        </Card>
      </div>
      
      {/* Analytics Tabs */}
      <Card className="bg-white dark:bg-gray-800 border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Website Analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full max-w-md grid grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="downloads">Downloads</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              {isStatsLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.analytics || []}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }} />
                      <Legend />
                      <Area type="monotone" dataKey="visits" stroke="#8884d8" fillOpacity={1} fill="url(#colorVisits)" name="Visits" />
                      <Area type="monotone" dataKey="downloads" stroke="#82ca9d" fillOpacity={1} fill="url(#colorDownloads)" name="Downloads" />
                      <Area type="monotone" dataKey="queries" stroke="#ffc658" fillOpacity={1} fill="url(#colorQueries)" name="Queries" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </TabsContent>
            <TabsContent value="downloads" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.analytics || []}>
                    <defs>
                      <linearGradient id="colorDownloadStats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }} />
                    <Area type="monotone" dataKey="downloads" stroke="#82ca9d" fillOpacity={1} fill="url(#colorDownloadStats)" name="Downloads" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="users" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.analytics || []}>
                    <defs>
                      <linearGradient id="colorUserStats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }} />
                    <Area type="monotone" dataKey="visits" stroke="#8884d8" fillOpacity={1} fill="url(#colorUserStats)" name="Users" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Uploads */}
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Recent Uploads</CardTitle>
              <Button 
                variant="ghost" 
                className="text-indigo-600 hover:text-indigo-800 p-0 flex items-center"
                onClick={() => navigate('/admin/materials')}
              >
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {isUploadsLoading ? (
              <div className="py-10 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : recentUploads?.length ? (
              <div className="space-y-4">
                {recentUploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-100 rounded-md">
                        <BookText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-medium group-hover:text-indigo-600 transition-colors">{upload.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <Badge variant="outline" className="bg-gray-50 text-xs">
                            {upload.category}
                          </Badge>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" /> 
                            {upload.downloads} downloads
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => navigate(`/content/${upload.id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No recent uploads found.</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                  onClick={() => navigate('/admin/materials')}
                >
                  Add Study Material
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Queries */}
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Recent Queries</CardTitle>
              <Button 
                variant="ghost" 
                className="text-indigo-600 hover:text-indigo-800 p-0 flex items-center"
                onClick={() => navigate('/admin/queries')}
              >
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {isQueriesLoading ? (
              <div className="py-10 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : recentQueries?.length ? (
              <div className="space-y-4">
                {recentQueries.map((query) => (
                  <div key={query.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          {query.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium line-clamp-1 group-hover:text-indigo-600 transition-colors">{query.query_text}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <span>{query.user_name}</span>
                          <span>•</span>
                          <Badge className={query.status === 'Open' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}>
                            {query.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className={query.status === 'Open' ? "bg-indigo-600 hover:bg-indigo-700 text-xs py-1 px-3 h-auto" : "bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs py-1 px-3 h-auto"}
                      onClick={() => navigate('/admin/queries')}
                    >
                      {query.status === 'Open' ? 'Reply' : 'View'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No recent queries found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
