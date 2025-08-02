
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
import PaymentVerificationManager from '@/components/admin/PaymentVerificationManager';
import WithdrawalManager from '@/components/admin/WithdrawalManager';
import EventsManager from '@/components/admin/EventsManager';
import JobsManager from '@/components/admin/JobsManager';

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
      return <EnhancedDashboard />;
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
    if (path.includes('/payments')) return <PaymentVerificationManager />;
    if (path.includes('/withdrawals')) return <WithdrawalManager />;
    if (path.includes('/events')) return <EventsManager />;
    if (path.includes('/jobs')) return <JobsManager />;
    if (path.includes('/settings')) return <AdminSettings />;
    
    return <EnhancedDashboard />;
  };

  return (
    <div className="w-full min-h-full">
      {renderContent()}
    </div>
  );
};

export default AdminPanel;
