
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SecureAuthProvider } from "@/hooks/useSecureAuth";
import SecurityMiddleware from "@/components/SecurityMiddleware";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import StudyMaterials from "./pages/StudyMaterials";
import PastPapers from "./pages/PastPapers";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminPanel } from "./pages/AdminPanel";
import { AdminSidebar } from "./components/admin/AdminSidebar";
import StudentDashboard from "./pages/StudentDashboard";
import StudentUploadPage from "./pages/StudentUploadPage";
import MarketplacePage from "./pages/MarketplacePage";
import EventsPage from "./pages/EventsPage";
import JobsPage from "./pages/JobsPage";
import MerchPage from "./pages/MerchPage";
import BlogPage from "./pages/BlogPage";
import StudentAchievementsPage from "./pages/StudentAchievementsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SecureAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SecurityMiddleware>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/study-materials" element={<StudyMaterials />} />
              <Route path="/past-papers" element={<PastPapers />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/merch" element={<MerchPage />} />
              <Route path="/blog" element={<BlogPage />} />
              
              {/* Student Dashboard Routes */}
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
              <Route path="/dashboard/achievements" element={
                <ProtectedRoute>
                  <StudentAchievementsPage />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requireAdmin>
                  <div className="flex min-h-screen">
                    <AdminSidebar />
                    <AdminDashboard />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/admin/*" element={
                <ProtectedRoute requireAdmin>
                  <div className="flex min-h-screen">
                    <AdminSidebar />
                    <AdminPanel />
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </SecurityMiddleware>
        </BrowserRouter>
      </TooltipProvider>
    </SecureAuthProvider>
  </QueryClientProvider>
);

export default App;
