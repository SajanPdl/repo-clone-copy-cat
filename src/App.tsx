
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
import StudyMaterialsPage from "./pages/StudyMaterialsPage";
import PastPapersPage from "./pages/PastPapersPage";
import LoginPage from "./pages/LoginPage";
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
              <Route path="/study-materials" element={<StudyMaterialsPage />} />
              <Route path="/past-papers" element={<PastPapersPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/merch" element={<MerchPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/login" element={<LoginPage />} />
              
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
              <Route path="/admin/login" element={<LoginPage />} />
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
