
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import EnhancedAdminSidebar from './EnhancedAdminSidebar';
import AdminHeader from './AdminHeader';
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
import AdsManager from './AdsManager';
import QueriesManager from './QueriesManager';
import AdminSettings from './AdminSettings';
import EnhancedWalletManagementPanel from './EnhancedWalletManagementPanel';
import AdminSetupHelper from './AdminSetupHelper';
import AdminDiagnostic from './AdminDiagnostic';
import SubscriptionPlansManager from './SubscriptionPlansManager';

interface EnhancedAdminLayoutProps {
  children?: React.ReactNode;
}

const EnhancedAdminLayout: React.FC<EnhancedAdminLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <EnhancedAdminSidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
      />
      <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">
          {children || (
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
              <Route path="/subscription-plans" element={<SubscriptionPlansManager />} />
              <Route path="/wallet-management" element={<EnhancedWalletManagementPanel />} />
              <Route path="/ads" element={<AdsManager />} />
              <Route path="/queries" element={<QueriesManager />} />
              <Route path="/settings" element={<AdminSettings />} />
              <Route path="/setup-helper" element={<AdminSetupHelper />} />
              <Route path="/diagnostic" element={<AdminDiagnostic />} />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
};

export default EnhancedAdminLayout;
