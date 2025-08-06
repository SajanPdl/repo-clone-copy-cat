import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AdsProvider } from '@/components/ads/AdsProvider';
import FloatingAIButton from '@/components/FloatingAIButton';

// Import all pages
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import AboutUsPage from '@/pages/AboutUsPage';
import ContactPage from '@/pages/ContactPage';
import BlogPage from '@/pages/BlogPage';
import BlogViewPage from '@/pages/BlogViewPage';
import StudyMaterialsPage from '@/pages/StudyMaterialsPage';
import StudyMaterialPage from '@/pages/StudyMaterialPage';
import PastPapersPage from '@/pages/PastPapersPage';
import PastPaperViewPage from '@/pages/PastPaperViewPage';
import MarketplacePage from '@/pages/MarketplacePage';
import MarketplaceProductViewPage from '@/pages/MarketplaceProductViewPage';
import EventsPage from '@/pages/EventsPage';
import ContentViewPage from '@/pages/ContentViewPage';
import StudentDashboard from '@/pages/StudentDashboard';
import DashboardOverview from '@/pages/DashboardOverview';
import UploadMaterialPage from '@/pages/UploadMaterialPage';
import AIAssistantPage from '@/pages/AIAssistantPage';
import StudentSavedPage from '@/pages/StudentSavedPage';
import DashboardInbox from '@/pages/DashboardInbox';
import StudentAchievementsPage from '@/pages/StudentAchievementsPage';
import RewardsPage from '@/pages/RewardsPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';
import PremiumPage from '@/pages/PremiumPage';
import WalletPage from '@/pages/WalletPage';
import ReferralPage from '@/pages/ReferralPage';
import PlannerPage from '@/pages/PlannerPage';
import ESewaPaymentPage from '@/pages/ESewaPaymentPage';
import AdminPanel from '@/pages/AdminPanel';
import NotFoundPage from '@/pages/NotFoundPage';
import ProtectedRoute from '@/components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AdsProvider>
          <Toaster />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogViewPage />} />
            <Route path="/study-materials" element={<StudyMaterialsPage />} />
            <Route path="/study-materials/:id" element={<StudyMaterialPage />} />
            <Route path="/past-papers" element={<PastPapersPage />} />
            <Route path="/past-papers/:id" element={<PastPaperViewPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/marketplace/:id" element={<MarketplaceProductViewPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/content/:type/:id" element={<ContentViewPage />} />

            {/* Protected Student Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/overview" element={
              <ProtectedRoute>
                <DashboardOverview />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/upload" element={
              <ProtectedRoute>
                <UploadMaterialPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/ai-assistant" element={
              <ProtectedRoute>
                <AIAssistantPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/saved" element={
              <ProtectedRoute>
                <StudentSavedPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/messages" element={
              <ProtectedRoute>
                <DashboardInbox />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/achievements" element={
              <ProtectedRoute>
                <StudentAchievementsPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/rewards" element={
              <ProtectedRoute>
                <RewardsPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />

            {/* Other Protected Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/premium" element={
              <ProtectedRoute>
                <PremiumPage />
              </ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            } />
            <Route path="/referral" element={
              <ProtectedRoute>
                <ReferralPage />
              </ProtectedRoute>
            } />
            <Route path="/planner" element={
              <ProtectedRoute>
                <PlannerPage />
              </ProtectedRoute>
            } />
            <Route path="/esewa-payment" element={
              <ProtectedRoute>
                <ESewaPaymentPage />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminPanel />
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <FloatingAIButton />
        </AdsProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
