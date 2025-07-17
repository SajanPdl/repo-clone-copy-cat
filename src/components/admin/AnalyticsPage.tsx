
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/utils/queryUtils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { BookText, Users, FileText, MessageSquare } from 'lucide-react';

const AnalyticsPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: fetchDashboardStats
  });

  const pieChartData = [
    { name: 'Mathematics', value: 35 },
    { name: 'Physics', value: 20 },
    { name: 'Chemistry', value: 15 },
    { name: 'Biology', value: 10 },
    { name: 'Computer Science', value: 20 },
  ];
  
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      
      {isLoading ? (
        <div className="py-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading analytics data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-gray-800 border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                    <h3 className="text-3xl font-bold mt-1">{stats?.totalUsers.toLocaleString()}</h3>
                    <p className="text-xs font-medium text-green-600 mt-1">{stats?.userGrowth} this month</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Downloads</p>
                    <h3 className="text-3xl font-bold mt-1">{stats?.totalDownloads.toLocaleString()}</h3>
                    <p className="text-xs font-medium text-green-600 mt-1">{stats?.downloadGrowth} this month</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Study Materials</p>
                    <h3 className="text-3xl font-bold mt-1">{stats?.totalStudyMaterials.toLocaleString()}</h3>
                    <p className="text-xs font-medium text-green-600 mt-1">{stats?.materialsGrowth} this month</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <BookText className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Queries</p>
                    <h3 className="text-3xl font-bold mt-1">{stats?.openQueries}</h3>
                    <p className="text-xs font-medium text-red-600 mt-1">{stats?.queriesGrowth} this month</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-none shadow-sm">
              <CardHeader>
                <CardTitle>Website Traffic</CardTitle>
              </CardHeader>
              <CardContent>
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
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="visits" stroke="#8884d8" fillOpacity={1} fill="url(#colorVisits)" name="Visits" />
                      <Area type="monotone" dataKey="downloads" stroke="#82ca9d" fillOpacity={1} fill="url(#colorDownloads)" name="Downloads" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-none shadow-sm">
              <CardHeader>
                <CardTitle>Content Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-white dark:bg-gray-800 border-none shadow-sm">
            <CardHeader>
              <CardTitle>Monthly Downloads by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Jan', notes: 400, papers: 240, guides: 140 },
                      { name: 'Feb', notes: 300, papers: 139, guides: 221 },
                      { name: 'Mar', notes: 200, papers: 180, guides: 120 },
                      { name: 'Apr', notes: 278, papers: 390, guides: 110 },
                      { name: 'May', notes: 189, papers: 480, guides: 180 },
                      { name: 'Jun', notes: 239, papers: 380, guides: 250 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="notes" stackId="a" fill="#8884d8" name="Notes" />
                    <Bar dataKey="papers" stackId="a" fill="#82ca9d" name="Past Papers" />
                    <Bar dataKey="guides" stackId="a" fill="#ffc658" name="Study Guides" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
