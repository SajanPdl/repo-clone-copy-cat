
import { Toaster } from '@/components/ui/toaster';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import StudentDashboard from '@/pages/StudentDashboard';
import AdminPanel from '@/pages/AdminPanel';
import StudyMaterialsPage from '@/pages/StudyMaterialsPage';
import PastPapersPage from '@/pages/PastPapersPage';
import MarketplacePage from '@/pages/MarketplacePage';
import BlogPage from '@/pages/BlogPage';
import ProfilePage from '@/pages/ProfilePage';
import ContactPage from '@/pages/ContactPage';
import ContentViewPage from '@/pages/ContentViewPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import NotFound from '@/pages/NotFound';
import DashboardAchievements from '@/pages/DashboardAchievements';
import DashboardBookmarks from '@/pages/DashboardBookmarks';
import DashboardRewards from '@/pages/DashboardRewards';
import DashboardSettings from '@/pages/DashboardSettings';
import ProtectedRoute from '@/components/ProtectedRoute';
import GlobalHeader from '@/components/GlobalHeader';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-background">
            <GlobalHeader />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Public Routes */}
              <Route path="/study-materials" element={<StudyMaterialsPage />} />
              <Route path="/past-papers" element={<PastPapersPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/post/:id" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/content/:id" element={<ContentViewPage />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/achievements" element={
                <ProtectedRoute>
                  <DashboardAchievements />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/bookmarks" element={
                <ProtectedRoute>
                  <DashboardBookmarks />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/rewards" element={
                <ProtectedRoute>
                  <DashboardRewards />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/settings" element={
                <ProtectedRoute>
                  <DashboardSettings />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
