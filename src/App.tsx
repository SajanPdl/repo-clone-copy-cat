
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';
import { AdsProvider } from '@/components/ads/AdsProvider';

import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import StudyMaterialsPage from '@/pages/StudyMaterialsPage';
import PastPapersPage from '@/pages/PastPapersPage';
import PastPaperViewPage from '@/pages/PastPaperViewPage';
import ContentViewPage from '@/pages/ContentViewPage';
import BlogPage from '@/pages/BlogPage';
import BlogPostView from '@/components/BlogPostView';
import ContactPage from '@/pages/ContactPage';
import MarketplacePage from '@/pages/MarketplacePage';
import ProfilePage from '@/pages/ProfilePage';
import StudentDashboard from '@/pages/StudentDashboard';
import StudentUploadPage from '@/pages/StudentUploadPage';
import StudentSavedPage from '@/pages/StudentSavedPage';
import DashboardOverview from '@/pages/DashboardOverview';
import DashboardInbox from '@/pages/DashboardInbox';
import DashboardAchievements from '@/pages/DashboardAchievements';
import DashboardRewards from '@/pages/DashboardRewards';
import DashboardSettings from '@/pages/DashboardSettings';
import AdminPanel from '@/pages/AdminPanel';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AdsProvider>
            <div className="App min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/study-materials" element={<StudyMaterialsPage />} />
                <Route path="/past-papers" element={<PastPapersPage />} />
                <Route path="/past-paper/:id" element={<PastPaperViewPage />} />
                <Route path="/content/:id" element={<ContentViewPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:id" element={<BlogPostView />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/overview"
                  element={
                    <ProtectedRoute>
                      <DashboardOverview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/upload"
                  element={
                    <ProtectedRoute>
                      <StudentUploadPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/saved"
                  element={
                    <ProtectedRoute>
                      <StudentSavedPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/inbox"
                  element={
                    <ProtectedRoute>
                      <DashboardInbox />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/achievements"
                  element={
                    <ProtectedRoute>
                      <DashboardAchievements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/rewards"
                  element={
                    <ProtectedRoute>
                      <DashboardRewards />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/settings"
                  element={
                    <ProtectedRoute>
                      <DashboardSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute>
                      <EnhancedAdminLayout>
                        <AdminPanel />
                      </EnhancedAdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </AdsProvider>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
