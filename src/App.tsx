
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import StudyMaterialsPage from "./pages/StudyMaterialsPage";
import PastPapersPage from "./pages/PastPapersPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import StudentDashboard from "./pages/StudentDashboard";
import ProfilePage from "./pages/ProfilePage";
import MarketplacePage from "./pages/MarketplacePage";
import ContentViewPage from "./pages/ContentViewPage";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import DashboardOverview from "./pages/DashboardOverview";
import DashboardAchievements from "./pages/DashboardAchievements";
import DashboardRewards from "./pages/DashboardRewards";
import DashboardInbox from "./pages/DashboardInbox";
import DashboardSettings from "./pages/DashboardSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AnalyticsPage from "./components/admin/AnalyticsPage";
import StudyMaterialsManager from "./components/admin/StudyMaterialsManager";
import PastPapersManager from "./components/admin/PastPapersManager";
import BlogEditor from "./components/admin/BlogEditor";
import UserManagement from "./components/admin/UserManagement";
import CategoriesManager from "./components/admin/CategoriesManager";
import GradesManager from "./components/admin/GradesManager";
import AdSettingsManager from "./components/admin/AdSettingsManager";
import QueriesManager from "./components/admin/QueriesManager";
import AdminSettings from "./components/admin/AdminSettings";
import MarketplaceManager from "./components/admin/MarketplaceManager";
import AdvertisementManager from "./components/admin/AdvertisementManager";
import AdPlacementManager from "./components/admin/AdPlacementManager";
import GlobalHeader from "./components/GlobalHeader";
import { AdsProvider } from "./components/ads/AdsProvider";
import { AuthProvider } from "@/hooks/useAuth";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <AdsProvider>
              <Toaster />
              <BrowserRouter>
                <GlobalHeader />
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/study-materials" element={<StudyMaterialsPage />} />
                    <Route path="/past-papers" element={<PastPapersPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/content/:id" element={<ContentViewPage />} />
                    
                    {/* Protected Routes */}
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
                      path="/dashboard/inbox" 
                      element={
                        <ProtectedRoute>
                          <DashboardInbox />
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
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Admin Routes */}
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute adminOnly>
                          <AdminLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<AdminPanel />} />
                      <Route path="analytics" element={<AnalyticsPage />} />
                      <Route path="study-materials" element={<StudyMaterialsManager />} />
                      <Route path="past-papers" element={<PastPapersManager />} />
                      <Route path="blog" element={<BlogEditor />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="categories" element={<CategoriesManager />} />
                      <Route path="grades" element={<GradesManager />} />
                      <Route path="ads" element={<AdSettingsManager />} />
                      <Route path="queries" element={<QueriesManager />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="marketplace" element={<MarketplaceManager />} />
                      <Route path="advertisements" element={<AdvertisementManager />} />
                      <Route path="ad-placements" element={<AdPlacementManager />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </AdsProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
