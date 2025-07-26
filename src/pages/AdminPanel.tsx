
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudyMaterialsManager from '@/components/admin/StudyMaterialsManager';
import PastPapersManager from '@/components/admin/PastPapersManager';
import BlogEditor from '@/components/admin/BlogEditor';
import UserManagement from '@/components/admin/UserManagement';
import CategoriesManager from '@/components/admin/CategoriesManager';
import GradesManager from '@/components/admin/GradesManager';
import QueriesManager from '@/components/admin/QueriesManager';
import MarketplaceManager from '@/components/admin/MarketplaceManager';
import AdvertisementManager from '@/components/admin/AdvertisementManager';
import AnalyticsPage from '@/components/admin/AnalyticsPage';
import AdminSettings from '@/components/admin/AdminSettings';
import UserStatsManager from '@/components/admin/UserStatsManager';
import AchievementManager from '@/components/admin/AchievementManager';

const AdminPanel = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-600">Manage your platform content and settings</p>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid grid-cols-6 lg:grid-cols-12 w-full">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="user-stats">User Stats</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="papers">Papers</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="queries">Queries</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsPage />
          </TabsContent>

          <TabsContent value="user-stats" className="mt-6">
            <UserStatsManager />
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <AchievementManager />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="materials" className="mt-6">
            <StudyMaterialsManager />
          </TabsContent>

          <TabsContent value="papers" className="mt-6">
            <PastPapersManager />
          </TabsContent>

          <TabsContent value="blog" className="mt-6">
            <BlogEditor />
          </TabsContent>

          <TabsContent value="marketplace" className="mt-6">
            <MarketplaceManager />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CategoriesManager />
          </TabsContent>

          <TabsContent value="grades" className="mt-6">
            <GradesManager />
          </TabsContent>

          <TabsContent value="queries" className="mt-6">
            <QueriesManager />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPanel;
