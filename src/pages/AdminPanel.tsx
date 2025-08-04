
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
import EnhancedDashboard from '@/components/admin/EnhancedDashboard';

const AdminPanel = () => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
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
          <EnhancedDashboard />
        </div>
      );
    }
    
    if (path.includes('/materials')) return (
      <div className="p-6">
        <StudyMaterialsManager />
      </div>
    );
    if (path.includes('/papers')) return (
      <div className="p-6">
        <PastPapersManager />
      </div>
    );
    if (path.includes('/blog')) return (
      <div className="p-6">
        <BlogEditor />
      </div>
    );
    if (path.includes('/users')) return (
      <div className="p-6">
        <UserManagement />
      </div>
    );
    if (path.includes('/stats')) return (
      <div className="p-6">
        <UserStatsManager />
      </div>
    );
    if (path.includes('/achievements')) return (
      <div className="p-6">
        <AchievementManager />
      </div>
    );
    if (path.includes('/categories')) return (
      <div className="p-6">
        <CategoriesManager />
      </div>
    );
    if (path.includes('/grades')) return (
      <div className="p-6">
        <GradesManager />
      </div>
    );
    if (path.includes('/marketplace')) return (
      <div className="p-6">
        <MarketplaceManager />
      </div>
    );
    if (path.includes('/queries')) return (
      <div className="p-6">
        <QueriesManager />
      </div>
    );
    if (path.includes('/analytics')) return (
      <div className="p-6">
        <AnalyticsPage />
      </div>
    );
    if (path.includes('/ads')) return (
      <div className="p-6">
        <AdvertisementManager />
      </div>
    );
    if (path.includes('/ad-placements')) return (
      <div className="p-6">
        <AdPlacementManager />
      </div>
    );
    if (path.includes('/settings')) return (
      <div className="p-6">
        <AdminSettings />
      </div>
    );
    
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
          <p className="text-gray-600">The requested admin page could not be found.</p>
        </div>
      </div>
    );
  };

  return <div className="w-full min-h-screen bg-gray-50">{renderContent()}</div>;
};

export default AdminPanel;
