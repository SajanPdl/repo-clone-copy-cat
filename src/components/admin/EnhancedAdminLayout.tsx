
import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import EnhancedAdminSidebar from './EnhancedAdminSidebar';
import EnhancedDashboard from './EnhancedDashboard';
import StudyMaterialsManager from './StudyMaterialsManager';
import PastPapersManager from './PastPapersManager';
import CategoriesManager from './CategoriesManager';
import GradesManager from './GradesManager';
import UsersManagement from './UsersManagement';
import QueriesManager from './QueriesManager';
import MarketplaceManager from './MarketplaceManager';
import AdvertisementManager from './AdvertisementManager';
import AdminSettings from './AdminSettings';
import AchievementsPage from './AchievementsPage';
import PaymentVerificationManager from './PaymentVerificationManager';
import WalletManagementPanel from './WalletManagementPanel';
import EventsManager from './EventsManager';
import MerchManager from './MerchManager';
import ReferralProgram from './ReferralProgram';
import AnalyticsPage from './AnalyticsPage';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const EnhancedAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'Dashboard';
    if (path.includes('/materials')) return 'Study Materials';
    if (path.includes('/papers')) return 'Past Papers';
    if (path.includes('/categories')) return 'Categories';
    if (path.includes('/grades')) return 'Grades';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/queries')) return 'User Queries';
    if (path.includes('/marketplace')) return 'Marketplace Management';
    if (path.includes('/ads')) return 'Advertisements';
    if (path.includes('/achievements')) return 'Achievements';
    if (path.includes('/payments')) return 'Payment Verification';
    if (path.includes('/wallets')) return 'Wallet Management';
    if (path.includes('/events')) return 'Events Management';
    if (path.includes('/merch')) return 'Merchandise Management';
    if (path.includes('/referrals')) return 'Referral Program';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/settings')) return 'Settings';
    return 'Admin Panel';
  };

  return (
    <div className="h-screen w-full flex bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-50 h-full w-64 transition-transform duration-300 ease-in-out`}>
        <EnhancedAdminSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h1>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<EnhancedDashboard />} />
            <Route path="/materials" element={<StudyMaterialsManager />} />
            <Route path="/papers" element={<PastPapersManager />} />
            <Route path="/categories" element={<CategoriesManager />} />
            <Route path="/grades" element={<GradesManager />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/queries" element={<QueriesManager />} />
            <Route path="/marketplace" element={<MarketplaceManager />} />
            <Route path="/ads" element={<AdvertisementManager />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/payments" element={<PaymentVerificationManager />} />
            <Route path="/wallets" element={<WalletManagementPanel />} />
            <Route path="/events" element={<EventsManager />} />
            <Route path="/merch" element={<MerchManager />} />
            <Route path="/referrals" element={<ReferralProgram />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default EnhancedAdminLayout;
