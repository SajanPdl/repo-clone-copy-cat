
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EnhancedAdminLayout from './EnhancedAdminLayout';
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
import SubscriptionManager from './SubscriptionManager';
import AdvertisementManager from './AdvertisementManager';
import QueriesManager from './QueriesManager';
import AdminSettings from './AdminSettings';

const AdminPanel = () => {
  return (
    <EnhancedAdminLayout>
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
        <Route path="/subscriptions" element={<SubscriptionManager />} />
        <Route path="/ads" element={<AdvertisementManager />} />
        <Route path="/queries" element={<QueriesManager />} />
        <Route path="/settings" element={<AdminSettings />} />
      </Routes>
    </EnhancedAdminLayout>
  );
};

export default AdminPanel;
