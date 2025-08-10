import BlogEditor from '@/components/admin/BlogEditor';

import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EnhancedAdminSidebar from '@/components/admin/EnhancedAdminSidebar';
import AdminPanel from '@/components/admin/AdminPanel';
import StudyMaterialsManager from '@/components/admin/StudyMaterialsManager';
import PastPapersManager from '@/components/admin/PastPapersManager';
import MarketplaceManager from '@/components/admin/MarketplaceManager';
import MerchManager from '@/components/admin/MerchManager';
import PaymentVerificationManager from '@/components/admin/PaymentVerificationManager';
import WalletManagementPanel from '@/components/admin/WalletManagementPanel';
import CategoriesManager from '@/components/admin/CategoriesManager';
import GradesManager from '@/components/admin/GradesManager';
import UsersManagement from '@/components/admin/UsersManagement';
import EventsManager from '@/components/admin/EventsManager';
import QueriesManager from '@/components/admin/QueriesManager';
import ReferralProgram from '@/components/admin/ReferralProgram';
import AchievementsPage from '@/components/admin/AchievementsPage';
import AdvertisementManager from '@/components/admin/AdvertisementManager';
import AdPlacementManager from '@/components/admin/AdPlacementManager';
import AnalyticsPage from '@/components/admin/AnalyticsPage';
import AdminSettings from '@/components/admin/AdminSettings';

const EnhancedAdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen w-full flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`h-full ${sidebarCollapsed ? 'w-20' : 'w-72'} flex-shrink-0 transition-all duration-300 ease-in-out`}>
        <EnhancedAdminSidebar 
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>
      
      {/* Main content */}
      <main className="flex-1 w-full overflow-y-auto">
        <Routes>
          <Route index element={<AdminPanel />} />
          <Route path="materials" element={<StudyMaterialsManager />} />
          <Route path="papers" element={<PastPapersManager />} />
          <Route path="marketplace" element={<MarketplaceManager />} />
          <Route path="merch" element={<MerchManager />} />
          <Route path="payments" element={<PaymentVerificationManager />} />
          <Route path="wallets" element={<WalletManagementPanel />} />
          <Route path="categories" element={<CategoriesManager />} />
          <Route path="grades" element={<GradesManager />} />
          <Route path="blog" element={<BlogEditor />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="events" element={<EventsManager />} />
          <Route path="queries" element={<QueriesManager />} />
          <Route path="referrals" element={<ReferralProgram />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="ads" element={<AdvertisementManager />} />
          <Route path="ad-placements" element={<AdPlacementManager />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default EnhancedAdminLayout;
