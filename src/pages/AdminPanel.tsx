import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  FileText, 
  MessageSquare, 
  Megaphone, 
  GraduationCap,
  FolderPlus,
  BookOpen,
  ClipboardList
} from 'lucide-react';
import StudyMaterialsManager from '@/components/admin/StudyMaterialsManager';
import PastPapersManager from '@/components/admin/PastPapersManager';
import QueriesManager from '@/components/admin/QueriesManager';
import AdvertisementManager from '@/components/admin/AdvertisementManager';
import BlogEditor from '@/components/admin/BlogEditor';
import AnalyticsPage from '@/components/admin/AnalyticsPage';
import GradesManager from '@/components/admin/GradesManager';
import CategoriesManager from '@/components/admin/CategoriesManager';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'materials', label: 'Study Materials', icon: BookOpen },
    { id: 'pastpapers', label: 'Past Papers', icon: ClipboardList },
    { id: 'queries', label: 'User Queries', icon: MessageSquare },
    { id: 'ads', label: 'Advertisements', icon: Megaphone },
    { id: 'blogs', label: 'Blog Management', icon: FileText },
    { id: 'categories', label: 'Categories Management', icon: FolderPlus },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'grades', label: 'Grades Management', icon: GraduationCap }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome to the admin panel. Select a section from the sidebar to manage different aspects of the platform.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.slice(1).map((item) => (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
                  onClick={() => setActiveTab(item.id)}
                >
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-medium">{item.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage and configure {item.label.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'materials':
        return <StudyMaterialsManager />;
      case 'pastpapers':
        return <PastPapersManager />;
      case 'queries':
        return <QueriesManager />;
      case 'ads':
        return <AdvertisementManager />;
      case 'blogs':
        return <BlogEditor />;
      case 'categories':
        return <CategoriesManager />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'grades':
        return <GradesManager />;
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-sm min-h-screen">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          </div>
          
          <nav className="mt-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  activeTab === item.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600' : ''
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;