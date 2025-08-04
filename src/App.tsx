
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import HomePage from '@/pages/HomePage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import StudyMaterialPage from '@/pages/StudyMaterialPage';
import PastPapersPage from '@/pages/PastPapersPage';
import MarketplacePage from '@/pages/MarketplacePage';
import PremiumPage from '@/pages/PremiumPage';
import ContactPage from '@/pages/ContactPage';
import AboutUsPage from '@/pages/AboutUsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminPanel from '@/components/admin/AdminPanel';
import StudyMaterialsManager from '@/components/admin/StudyMaterialsManager';
import PastPapersManager from '@/components/admin/PastPapersManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import GradesManager from '@/components/admin/GradesManager';
import UserManagement from '@/components/admin/UserManagement';
import QueriesManager from '@/components/admin/QueriesManager';
import MarketplaceManager from '@/components/admin/MarketplaceManager';
import AdvertisementManager from '@/components/admin/AdvertisementManager';
import AdminSettings from '@/components/admin/AdminSettings';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import ESewaPaymentPage from '@/pages/ESewaPaymentPage';
import WalletPage from '@/pages/WalletPage';
import EventsPage from '@/pages/EventsPage';
import DailyPlannerPage from '@/pages/DailyPlannerPage';
import StudentMaterialUploadPage from '@/pages/StudentMaterialUploadPage';
import ReferralProgram from '@/components/admin/ReferralProgram';
import EventCalendar from '@/components/events/EventCalendar';
import PaymentVerificationManager from '@/components/admin/PaymentVerificationManager';
import WalletManagementPanel from '@/components/admin/WalletManagementPanel';
import StudyAssistantPage from '@/pages/StudyAssistantPage';
import PlannerPage from '@/pages/PlannerPage';
import ReferralPage from '@/pages/ReferralPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/study-materials" element={<StudyMaterialPage />} />
          <Route path="/past-papers" element={<PastPapersPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/esewa-payment" element={<ESewaPaymentPage />} />

          {/* Student Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/daily-planner" element={<DailyPlannerPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/upload-material" element={<StudentMaterialUploadPage />} />
            <Route path="/study-assistant" element={<StudyAssistantPage />} />
            <Route path="/referral" element={<ReferralPage />} />
          </Route>
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/materials" element={<EnhancedAdminLayout><StudyMaterialsManager /></EnhancedAdminLayout>} />
            <Route path="/admin/papers" element={<EnhancedAdminLayout><PastPapersManager /></EnhancedAdminLayout>} />
            <Route path="/admin/categories" element={<EnhancedAdminLayout><CategoriesManager /></EnhancedAdminLayout>} />
            <Route path="/admin/grades" element={<EnhancedAdminLayout><GradesManager /></EnhancedAdminLayout>} />
            <Route path="/admin/users" element={<EnhancedAdminLayout><UserManagement /></EnhancedAdminLayout>} />
            <Route path="/admin/queries" element={<EnhancedAdminLayout><QueriesManager /></EnhancedAdminLayout>} />
            <Route path="/admin/marketplace" element={<EnhancedAdminLayout><MarketplaceManager /></EnhancedAdminLayout>} />
            <Route path="/admin/ads" element={<EnhancedAdminLayout><AdvertisementManager /></EnhancedAdminLayout>} />
            <Route path="/admin/settings" element={<EnhancedAdminLayout><AdminSettings /></EnhancedAdminLayout>} />
            <Route path="/admin/payments" element={<EnhancedAdminLayout><PaymentVerificationManager /></EnhancedAdminLayout>} />
            <Route path="/admin/wallets" element={<EnhancedAdminLayout><WalletManagementPanel /></EnhancedAdminLayout>} />
            <Route path="/admin/events" element={<EnhancedAdminLayout><EventCalendar /></EnhancedAdminLayout>} />
            <Route path="/admin/referrals" element={<EnhancedAdminLayout><ReferralProgram /></EnhancedAdminLayout>} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
