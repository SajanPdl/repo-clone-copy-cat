
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
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
import AdvertisementManager from '@/components/admin/AdvertisementManager';
import AdPlacementManager from '@/components/admin/AdPlacementManager';
import MarketplaceManager from '@/components/admin/MarketplaceManager';

const AdminPanel = () => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

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

  const renderContent = () => {
    const path = location.pathname;
    
    if (path === '/admin' || path === '/admin/dashboard') {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">1,234</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Study Materials</h3>
              <p className="text-3xl font-bold text-green-600">456</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Past Papers</h3>
              <p className="text-3xl font-bold text-purple-600">789</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Active Ads</h3>
              <p className="text-3xl font-bold text-orange-600">12</p>
            </div>
          </div>
        </div>
      );
    }
    
    if (path.includes('/materials')) return <StudyMaterialsManager />;
    if (path.includes('/papers')) return <PastPapersManager />;
    if (path.includes('/blog')) return <BlogEditor />;
    if (path.includes('/users')) return <UserManagement />;
    if (path.includes('/stats')) return <UserStatsManager />;
    if (path.includes('/achievements')) return <AchievementManager />;
    if (path.includes('/categories')) return <CategoriesManager />;
    if (path.includes('/grades')) return <GradesManager />;
    if (path.includes('/marketplace')) return <MarketplaceManager />;
    if (path.includes('/queries')) return <QueriesManager />;
    if (path.includes('/analytics')) return <AnalyticsPage />;
    if (path.includes('/ads')) return <AdvertisementManager />;
    if (path.includes('/ad-placements')) return <AdPlacementManager />;
    if (path.includes('/settings')) return <AdminSettings />;
    
    return <div className="p-6">Page not found</div>;
  };

  return <div className="w-full">{renderContent()}</div>;
};

export default AdminPanel;
