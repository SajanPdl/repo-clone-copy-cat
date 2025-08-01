import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sonner } from 'sonner';

import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import StudyMaterialsPage from '@/pages/StudyMaterialsPage';
import PastPapersPage from '@/pages/PastPapersPage';
import PastPaperViewPage from '@/pages/PastPaperViewPage';
import ContentViewPage from '@/pages/ContentViewPage';
import BlogPage from '@/pages/BlogPage';
import ContactPage from '@/pages/ContactPage';
import MarketplacePage from '@/pages/MarketplacePage';
import ProfilePage from '@/pages/ProfilePage';
import NotFound from '@/pages/NotFound';

import StudentDashboard from '@/pages/StudentDashboard';
import DashboardOverview from '@/components/student/DashboardOverview';
import StudentUploadPage from '@/pages/StudentUploadPage';
import StudentSavedPage from '@/pages/StudentSavedPage';
import DashboardAchievements from '@/components/student/DashboardAchievements';
import DashboardRewards from '@/components/student/DashboardRewards';
import DashboardInbox from '@/components/student/DashboardInbox';
import DashboardSettings from '@/components/student/DashboardSettings';

import AdminPanel from '@/pages/AdminPanel';
import AdminLayout from '@/components/admin/AdminLayout';

import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdsProvider } from '@/hooks/useAds';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/study-materials" element={<StudyMaterialsPage />} />
                <Route path="/past-papers" element={<PastPapersPage />} />
                <Route path="/past-paper/:id" element={<PastPaperViewPage />} />
                <Route path="/content/:id" element={<ContentViewPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                
                {/* Student Dashboard Routes */}
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
                    <StudentUploadPage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/saved" element={
                  <ProtectedRoute>
                    <StudentSavedPage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/achievements" element={
                  <ProtectedRoute>
                    <DashboardAchievements />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/rewards" element={
                  <ProtectedRoute>
                    <DashboardRewards />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/inbox" element={
                  <ProtectedRoute>
                    <DashboardInbox />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/settings" element={
                  <ProtectedRoute>
                    <DashboardSettings />
                  </ProtectedRoute>
                } />

                {/* Admin Routes with AdminLayout */}
                <Route path="/admin/*" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminLayout>
                      <Routes>
                        <Route index element={<AdminPanel />} />
                        <Route path="dashboard" element={<AdminPanel />} />
                        <Route path="materials" element={<AdminPanel />} />
                        <Route path="papers" element={<AdminPanel />} />
                        <Route path="marketplace" element={<AdminPanel />} />
                        <Route path="categories" element={<AdminPanel />} />
                        <Route path="grades" element={<AdminPanel />} />
                        <Route path="users" element={<AdminPanel />} />
                        <Route path="queries" element={<AdminPanel />} />
                        <Route path="ads" element={<AdminPanel />} />
                        <Route path="ad-placements" element={<AdminPanel />} />
                        <Route path="analytics" element={<AdminPanel />} />
                        <Route path="payments" element={<AdminPanel />} />
                        <Route path="withdrawals" element={<AdminPanel />} />
                        <Route path="settings" element={<AdminPanel />} />
                      </Routes>
                    </AdminLayout>
                  </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AdsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
