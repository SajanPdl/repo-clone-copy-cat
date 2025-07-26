
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
import AdminPanel from '@/pages/AdminPanel';
import AdminLayout from '@/components/admin/AdminLayout';
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
            <div className="App">
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
                  path="/dashboard/*"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <AdminPanel />
                      </AdminLayout>
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
