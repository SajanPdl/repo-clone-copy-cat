
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, ShoppingCart, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: Users,
      path: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'Study Materials',
      description: 'Manage study materials and uploads',
      icon: FileText,
      path: '/admin/materials',
      color: 'bg-green-500'
    },
    {
      title: 'Marketplace',
      description: 'Manage marketplace listings',
      icon: ShoppingCart,
      path: '/admin/marketplace',
      color: 'bg-purple-500'
    },
    {
      title: 'Settings',
      description: 'System settings and configuration',
      icon: Settings,
      path: '/admin/settings',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Card key={section.path} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-lg ${section.color} flex items-center justify-center mb-3`}>
                <section.icon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
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
    </div>
  );
};

export default AdminPanel;
