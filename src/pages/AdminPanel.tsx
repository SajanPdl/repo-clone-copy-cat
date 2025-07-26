
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudyMaterialsManager from '@/components/admin/StudyMaterialsManager';
import PastPapersManager from '@/components/admin/PastPapersManager';
import BlogEditor from '@/components/admin/BlogEditor';
import UserManagement from '@/components/admin/UserManagement';
import CategoriesManager from '@/components/admin/CategoriesManager';
import GradesManager from '@/components/admin/GradesManager';
import QueriesManager from '@/components/admin/QueriesManager';
import AnalyticsPage from '@/components/admin/AnalyticsPage';
import AdminSettings from '@/components/admin/AdminSettings';
import UserStatsManager from '@/components/admin/UserStatsManager';
import AchievementManager from '@/components/admin/AchievementManager';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminPanel = () => {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('materials');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-10 mb-6">
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="papers">Papers</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="stats">User Stats</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="queries">Queries</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="materials">
            <StudyMaterialsManager />
          </TabsContent>

          <TabsContent value="papers">
            <PastPapersManager />
          </TabsContent>

          <TabsContent value="blog">
            <BlogEditor />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="stats">
            <UserStatsManager />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementManager />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesManager />
          </TabsContent>

          <TabsContent value="grades">
            <GradesManager />
          </TabsContent>

          <TabsContent value="queries">
            <QueriesManager />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsPage />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPanel;
