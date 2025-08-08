
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AdsProvider } from '@/components/ads/AdsProvider';
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import FloatingAIButton from '@/components/FloatingAIButton';
import SiteMeta from '@/components/SiteMeta';

// Pages
import Index from '@/pages/Index';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import StudyMaterialsPage from '@/pages/StudyMaterialsPage';
import StudyMaterialPage from '@/pages/StudyMaterialPage';
import PastPapersPage from '@/pages/PastPapersPage';
import PastPaperViewPage from '@/pages/PastPaperViewPage';
import ContentViewPage from '@/pages/ContentViewPage';
import BlogPage from '@/pages/BlogPage';
import BlogViewPage from '@/pages/BlogViewPage';
import ContactPage from '@/pages/ContactPage';
import AboutUsPage from '@/pages/AboutUsPage';
import PremiumPage from '@/pages/PremiumPage';
import ESewaPaymentPage from '@/pages/ESewaPaymentPage';
import EventsPage from '@/pages/EventsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ReferralPage from '@/pages/ReferralPage';

// Student Dashboard Pages
import StudentDashboard from '@/pages/StudentDashboard';
import DashboardOverview from '@/pages/DashboardOverview';
import ProfilePage from '@/pages/ProfilePage';
import StudentAchievementsPage from '@/pages/StudentAchievementsPage';
import RewardsPage from '@/pages/RewardsPage';
import SettingsPage from '@/pages/SettingsPage';
import WalletPage from '@/pages/WalletPage';
import DashboardInbox from '@/pages/DashboardInbox';
import StudentSavedPage from '@/pages/StudentSavedPage';
import DailyPlannerPage from '@/pages/DailyPlannerPage';
import PlannerPage from '@/pages/PlannerPage';
import UploadMaterialPage from '@/pages/UploadMaterialPage';
import StudentUploadPage from '@/pages/StudentUploadPage';
import StudentMaterialUploadPage from '@/pages/StudentMaterialUploadPage';


// Marketplace Pages
import MarketplacePage from '@/pages/MarketplacePage';
import MarketplaceProductViewPage from '@/pages/MarketplaceProductViewPage';

// Admin Pages
import AdminPanel from '@/pages/AdminPanel';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SiteSettingsProvider>
        <AdsProvider>
          <Router>
            <div className="App">
              <SiteMeta />
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/study-materials" element={<StudyMaterialsPage />} />
              <Route path="/study-material/:id" element={<StudyMaterialPage />} />
              <Route path="/past-papers" element={<PastPapersPage />} />
              <Route path="/past-paper/:id" element={<PastPaperViewPage />} />
              <Route path="/content/:slug" element={<ContentViewPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogViewPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/premium" element={<PremiumPage />} />
              <Route path="/esewa-payment" element={<ESewaPaymentPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/referral" element={<ReferralPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/marketplace/:id" element={<MarketplaceProductViewPage />} />

              {/* Protected Student Routes */}
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
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
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
              <Route path="/wallet" element={
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/messages" element={
                <ProtectedRoute>
                  <DashboardInbox />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/saved" element={
                <ProtectedRoute>
                  <StudentSavedPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/planner" element={
                <ProtectedRoute>
                  <DailyPlannerPage />
                </ProtectedRoute>
              } />
              <Route path="/planner" element={
                <ProtectedRoute>
                  <PlannerPage />
                </ProtectedRoute>
              } />
              <Route path="/upload" element={
                <ProtectedRoute>
                  <UploadMaterialPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/upload" element={
                <ProtectedRoute>
                  <StudentUploadPage />
                </ProtectedRoute>
              } />
              <Route path="/upload-material" element={
                <ProtectedRoute>
                  <StudentMaterialUploadPage />
                </ProtectedRoute>
              } />
              <Route path="/ai-assistant" element={
                <ProtectedRoute>
                  <AIAssistantPage />
                </ProtectedRoute>
              } />

              {/* Protected Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            
              <FloatingAIButton />
              <Toaster />
            </div>
          </Router>
        </AdsProvider>
      </SiteSettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
