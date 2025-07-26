
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import BlogPage from '@/pages/BlogPage';
import { AuthProvider } from '@/hooks/useAuth';
import ContactPage from '@/pages/ContactPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import StudyMaterialsPage from '@/pages/StudyMaterialsPage';
import ContentViewPage from '@/pages/ContentViewPage';
import PastPapersPage from '@/pages/PastPapersPage';
import MarketplacePage from '@/pages/MarketplacePage';

// Student Dashboard Pages
import StudentDashboard from '@/pages/StudentDashboard';
import DashboardOverview from '@/pages/DashboardOverview';
import DashboardAchievements from '@/pages/DashboardAchievements';
import DashboardRewards from '@/pages/DashboardRewards';
import DashboardInbox from '@/pages/DashboardInbox';
import DashboardSettings from '@/pages/DashboardSettings';
import ProfilePage from '@/pages/ProfilePage';

// Admin Panel
import AdminPanel from '@/pages/AdminPanel';
import AdminLayout from '@/components/admin/AdminLayout';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';
import { AdsProvider } from '@/components/ads/AdsProvider';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AdsProvider>
            <Toaster />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/study-materials" element={<StudyMaterialsPage />} />
              <Route path="/study-materials/:id" element={<ContentViewPage />} />
              <Route path="/past-papers" element={<PastPapersPage />} />
              <Route path="/past-papers/:id" element={<ContentViewPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              
              {/* Student Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/student/*" element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/" element={<StudentDashboard />} />
                    <Route path="/dashboard" element={<StudentDashboard />} />
                    <Route path="/overview" element={<DashboardOverview />} />
                    <Route path="/achievements" element={<DashboardAchievements />} />
                    <Route path="/rewards" element={<DashboardRewards />} />
                    <Route path="/inbox" element={<DashboardInbox />} />
                    <Route path="/settings" element={<DashboardSettings />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Routes>
                </ProtectedRoute>
              } />

              {/* Admin Routes with Layout */}
              <Route path="/admin/*" element={
                <ProtectedRoute adminOnly>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminPanel />} />
                      <Route path="/dashboard" element={<AdminPanel />} />
                      <Route path="/materials" element={<AdminPanel />} />
                      <Route path="/papers" element={<AdminPanel />} />
                      <Route path="/blog" element={<AdminPanel />} />
                      <Route path="/users" element={<AdminPanel />} />
                      <Route path="/stats" element={<AdminPanel />} />
                      <Route path="/achievements" element={<AdminPanel />} />
                      <Route path="/categories" element={<AdminPanel />} />
                      <Route path="/grades" element={<AdminPanel />} />
                      <Route path="/marketplace" element={<AdminPanel />} />
                      <Route path="/queries" element={<AdminPanel />} />
                      <Route path="/analytics" element={<AdminPanel />} />
                      <Route path="/ads" element={<AdminPanel />} />
                      <Route path="/ad-placements" element={<AdminPanel />} />
                      <Route path="/settings" element={<AdminPanel />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AdsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
