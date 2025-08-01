
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import StudyMaterialsPage from "./pages/StudyMaterialsPage";
import PastPapersPage from "./pages/PastPapersPage";
import ContentViewPage from "./pages/ContentViewPage";
import PastPaperViewPage from "./pages/PastPaperViewPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import AdminPanel from "./pages/AdminPanel";
import ProfilePage from "./pages/ProfilePage";
import MarketplacePage from "./pages/MarketplacePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import StudentDashboard from "./pages/StudentDashboard";
import StudentUploadPage from "./pages/StudentUploadPage";
import StudentSavedPage from "./pages/StudentSavedPage";
import DashboardOverview from "./pages/DashboardOverview";
import DashboardInbox from "./pages/DashboardInbox";
import DashboardAchievements from "./pages/DashboardAchievements";
import DashboardRewards from "./pages/DashboardRewards";
import DashboardSettings from "./pages/DashboardSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="w-full">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/study-materials" element={<StudyMaterialsPage />} />
                <Route path="/past-papers" element={<PastPapersPage />} />
                <Route path="/content/:id" element={<ContentViewPage />} />
                <Route path="/past-paper/:id" element={<PastPaperViewPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                
                {/* Protected Student Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <StudentDashboard />
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
                <Route path="/dashboard/overview" element={
                  <ProtectedRoute>
                    <DashboardOverview />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/inbox" element={
                  <ProtectedRoute>
                    <DashboardInbox />
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
                <Route path="/dashboard/settings" element={
                  <ProtectedRoute>
                    <DashboardSettings />
                  </ProtectedRoute>
                } />
                
                {/* Protected Profile Route */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                
                {/* Protected Admin Routes */}
                <Route path="/admin/*" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
