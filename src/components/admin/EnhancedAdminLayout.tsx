
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import EnhancedAdminSidebar from './EnhancedAdminSidebar';
import EnhancedDashboard from './EnhancedDashboard';
import AnalyticsPage from './AnalyticsPage';
import UsersManagement from './UsersManagement';
import StudyMaterialsManager from './StudyMaterialsManager';
import PastPapersManager from './PastPapersManager';
import CategoriesManager from './CategoriesManager';
import GradesManager from './GradesManager';
import BlogEditor from './BlogEditor';
import EventsManager from './EventsManager';
import MarketplaceManager from './MarketplaceManager';
import MerchManager from './MerchManager';
import PaymentVerificationManager from './PaymentVerificationManager';
import SubscriptionPlanManager from './SubscriptionPlanManager';
import SubscriptionManager from './SubscriptionManager';
import EnhancedWalletManagementPanel from './EnhancedWalletManagementPanel';
import AdvertisementManager from './AdvertisementManager';
import QueriesManager from './QueriesManager';
import AdminSettings from './AdminSettings';

const EnhancedAdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EnhancedAdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`flex-1 transition-all duration-300 ${
        collapsed ? 'ml-16' : 'ml-64'
      } p-6`}>
        <Routes>
          <Route path="/" element={<EnhancedDashboard />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/users" element={<UsersManagement />} />
          <Route path="/study-materials" element={<StudyMaterialsManager />} />
          <Route path="/past-papers" element={<PastPapersManager />} />
          <Route path="/categories" element={<CategoriesManager />} />
          <Route path="/grades" element={<GradesManager />} />
          <Route path="/blog" element={<BlogEditor />} />
          <Route path="/events" element={<EventsManager />} />
          <Route path="/marketplace" element={<MarketplaceManager />} />
          <Route path="/merch" element={<MerchManager />} />
          <Route path="/payment-verification" element={<PaymentVerificationManager />} />
          <Route path="/subscription-plans" element={<SubscriptionPlanManager />} />
          <Route path="/subscriptions" element={<SubscriptionManager />} />
          <Route path="/wallet-management" element={<EnhancedWalletManagementPanel />} />
          <Route path="/ads" element={<AdvertisementManager />} />
          <Route path="/queries" element={<QueriesManager />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
};

export default EnhancedAdminLayout;
