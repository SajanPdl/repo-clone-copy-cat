
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
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/wallet" element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          } />
          <Route path="/daily-planner" element={
            <ProtectedRoute>
              <DailyPlannerPage />
            </ProtectedRoute>
          } />
          <Route path="/planner" element={
            <ProtectedRoute>
              <PlannerPage />
            </ProtectedRoute>
          } />
          <Route path="/upload-material" element={
            <ProtectedRoute>
              <StudentMaterialUploadPage />
            </ProtectedRoute>
          } />
          <Route path="/study-assistant" element={
            <ProtectedRoute>
              <StudyAssistantPage />
            </ProtectedRoute>
          } />
          <Route path="/referral" element={
            <ProtectedRoute>
              <ReferralPage />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/admin/materials" element={
            <ProtectedRoute adminOnly>
              <EnhancedAdminLayout><StudyMaterialsManager /></EnhancedAdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/papers" element={
            <ProtectedRoute adminOnly>
              <EnhancedAdminLayout><PastPapersManager /></EnhancedAdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute adminOnly>
              <EnhancedAdminLayout><CategoriesManager /></EnhancedAdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/grades" element={
            <ProtectedRoute adminOnly>
              <EnhancedAdminLayout><GradesManager /></EnhancedAdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly>
              <EnhancedAdminLayout><UserManagement /></EnhancedAdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/queries" element={
            <ProtectedRoute adminOnly>
              <EnhancedAdminLayout><QueriesManager /></EnhancedAdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/marketplace" element={
            <ProtectedRoute adminOnly>
              <EnhancedAdminLayout><MarketplaceManager /></EnhancedAdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/ads" element={
            <ProtectedRoute adminOnly>
              <EnhancedAdminLayout><AdvertisementManager /></EnhancedAdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute adminOnly>
              <EnhancedAdminLayout><AdminSettings /></EnhancedAdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/payments" element={
            <ProtectedRoute adminOnly>
              <EnhancedAdminLayout><PaymentVerificationManager /></EnhancedAdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/wallets" element={
            <ProtectedRoute adminOnly>
              <EnhancedAdminLayout><WalletManagementPanel /></EnhancedAdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <ProtectedRoute adminOnly>
              <EnhancedAdminLayout><EventCalendar /></EnhancedAdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/referrals" element={
            <ProtectedRoute adminOnly>
              <EnhancedAdminLayout><ReferralProgram /></EnhancedAdminLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
