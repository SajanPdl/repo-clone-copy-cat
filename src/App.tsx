
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AdsProvider } from '@/components/ads/AdsProvider';
import { SecureAuthProvider } from '@/hooks/useSecureAuth';
import Index from '@/pages/Index';
import StudyMaterialsPage from '@/pages/StudyMaterialsPage';
import PastPapersPage from '@/pages/PastPapersPage';
import PastPaperViewPage from '@/pages/PastPaperViewPage';
import ContentViewPage from '@/pages/ContentViewPage';
import BlogPage from '@/pages/BlogPage';
import ContactPage from '@/pages/ContactPage';
import LoginPage from '@/pages/LoginPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import StudentDashboard from '@/pages/StudentDashboard';
import DashboardOverview from '@/pages/DashboardOverview';
import DashboardAchievements from '@/pages/DashboardAchievements';
import DashboardRewards from '@/pages/DashboardRewards';
import DashboardInbox from '@/pages/DashboardInbox';
import DashboardSettings from '@/pages/DashboardSettings';
import StudentUploadPage from '@/pages/StudentUploadPage';
import StudentSavedPage from '@/pages/StudentSavedPage';
import MarketplacePage from '@/pages/MarketplacePage';
import ProfilePage from '@/pages/ProfilePage';
import { AdminPanel } from '@/pages/AdminPanel';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import SecurityMiddleware from '@/components/SecurityMiddleware';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SecureAuthProvider>
          <AdsProvider>
            <SecurityMiddleware>
              <div className="min-h-screen bg-background">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/study-materials" element={<StudyMaterialsPage />} />
                  <Route path="/past-papers" element={<PastPapersPage />} />
                  <Route path="/past-paper/:id" element={<PastPaperViewPage />} />
                  <Route path="/content/:type/:id" element={<ContentViewPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />

                  {/* Protected Student Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/dashboard/overview" replace />} />
                    <Route path="overview" element={<DashboardOverview />} />
                    <Route path="achievements" element={<DashboardAchievements />} />
                    <Route path="rewards" element={<DashboardRewards />} />
                    <Route path="inbox" element={<DashboardInbox />} />
                    <Route path="settings" element={<DashboardSettings />} />
                  </Route>
                  <Route
                    path="/upload"
                    element={
                      <ProtectedRoute>
                        <StudentUploadPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/saved"
                    element={
                      <ProtectedRoute>
                        <StudentSavedPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminLayout>
                          <AdminPanel />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </div>
            </SecurityMiddleware>
          </AdsProvider>
        </SecureAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
