
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, ShoppingCart, Settings, TrendingUp, Calendar, DollarSign, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats, DashboardStats } from '@/utils/dashboardDataUtils';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminSections = [
    {
      title: 'Study Materials',
      description: 'Manage study materials and uploads',
      icon: FileText,
      path: '/admin/materials',
      color: 'bg-green-500',
      count: stats?.totalMaterials || 0
    },
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: Users,
      path: '/admin/users',
      color: 'bg-blue-500',
      count: stats?.totalUsers || 0
    },
    {
      title: 'Marketplace',
      description: 'Manage marketplace listings',
      icon: ShoppingCart,
      path: '/admin/marketplace',
      color: 'bg-purple-500',
      count: stats?.totalMarketplaceItems || 0
    },
    {
      title: 'Events Calendar',
      description: 'Manage events and schedules',
      icon: Calendar,
      path: '/admin/events',
      color: 'bg-orange-500',
      count: stats?.totalEvents || 0
    },
    {
      title: 'Payment Verification',
      description: 'Verify payments and transactions',
      icon: DollarSign,
      path: '/admin/payments',
      color: 'bg-red-500',
      count: 0
    },
    {
      title: 'Analytics',
      description: 'View site analytics and reports',
      icon: TrendingUp,
      path: '/admin/analytics',
      color: 'bg-indigo-500',
      count: 0
    },
    {
      title: 'Advertisements',
      description: 'Manage site advertisements',
      icon: Bell,
      path: '/admin/ads',
      color: 'bg-yellow-500',
      count: 0
    },
    {
      title: 'Settings',
      description: 'System settings and configuration',
      icon: Settings,
      path: '/admin/settings',
      color: 'bg-gray-500',
      count: 0
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">MeroAcademy Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your educational platform efficiently</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Materials</p>
                <p className="text-2xl font-bold">{stats?.totalMaterials || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Marketplace Items</p>
                <p className="text-2xl font-bold">{stats?.totalMarketplaceItems || 0}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Events</p>
                <p className="text-2xl font-bold">{stats?.totalEvents || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Card key={section.path} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-lg ${section.color} flex items-center justify-center mb-3`}>
                <section.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{section.title}</CardTitle>
                {section.count > 0 && (
                  <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {section.count}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{section.description}</p>
              <Button
                onClick={() => navigate(section.path)}
                className="w-full"
                variant="outline"
              >
                Manage
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recent Activity */}
      {stats?.recentUploads && stats.recentUploads.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Study Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentUploads.slice(0, 5).map((material: any) => (
                    <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{material.title}</p>
                        <p className="text-xs text-gray-500">{material.category} • {material.subject}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(material.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Marketplace</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentMarketplace.slice(0, 5).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">Rs. {item.price}</p>
                        <span className="text-xs text-gray-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
