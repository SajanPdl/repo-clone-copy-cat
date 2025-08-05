import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AdsProvider from "@/components/ads/AdsProvider";
import GlobalHeader from "@/components/GlobalHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import FloatingAIButton from "@/components/FloatingAIButton";

// Pages
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import StudyMaterialsPage from "./pages/StudyMaterialsPage";
import StudyMaterialPage from "./pages/StudyMaterialPage";
import PastPapersPage from "./pages/PastPapersPage";
import PastPaperViewPage from "./pages/PastPaperViewPage";
import ContentViewPage from "./pages/ContentViewPage";
import BlogPage from "./pages/BlogPage";
import BlogViewPage from "./pages/BlogViewPage";
import ContactPage from "./pages/ContactPage";
import AboutUsPage from "./pages/AboutUsPage";
import MarketplacePage from "./pages/MarketplacePage";
import EventsPage from "./pages/EventsPage";
import StudyAssistantPage from "./pages/StudyAssistantPage";
import DailyPlannerPage from "./pages/DailyPlannerPage";
import PlannerPage from "./pages/PlannerPage";
import ProfilePage from "./pages/ProfilePage";
import WalletPage from "./pages/WalletPage";
import ReferralPage from "./pages/ReferralPage";
import PremiumPage from "./pages/PremiumPage";
import ESewaPaymentPage from "./pages/ESewaPaymentPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

// Student Dashboard Pages
import StudentDashboard from "./pages/StudentDashboard";
import DashboardOverview from "./pages/DashboardOverview";
import StudentUploadPage from "./pages/StudentUploadPage";
import StudentSavedPage from "./pages/StudentSavedPage";
import DashboardInbox from "./pages/DashboardInbox";
import StudentAchievementsPage from "./pages/StudentAchievementsPage";
import DashboardRewards from "./pages/DashboardRewards";
import DashboardSettings from "./pages/DashboardSettings";

// Admin Pages
import AdminPanel from "./pages/AdminPanel";
import EnhancedAdminLayout from "./components/admin/EnhancedAdminLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public routes without global header */}
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                
                {/* Public routes with global header */}
                <Route path="/study-materials" element={
                  <div>
                    <GlobalHeader />
                    <StudyMaterialsPage />
                  </div>
                } />
                <Route path="/study-material/:id" element={
                  <div>
                    <GlobalHeader />
                    <StudyMaterialPage />
                  </div>
                } />
                <Route path="/past-papers" element={
                  <div>
                    <GlobalHeader />
                    <PastPapersPage />
                  </div>
                } />
                <Route path="/past-paper/:id" element={
                  <div>
                    <GlobalHeader />
                    <PastPaperViewPage />
                  </div>
                } />
                <Route path="/content/:slug" element={
                  <div>
                    <GlobalHeader />
                    <ContentViewPage />
                  </div>
                } />
                <Route path="/blog" element={
                  <div>
                    <GlobalHeader />
                    <BlogPage />
                  </div>
                } />
                <Route path="/blog/:slug" element={
                  <div>
                    <GlobalHeader />
                    <BlogViewPage />
                  </div>
                } />
                <Route path="/contact" element={
                  <div>
                    <GlobalHeader />
                    <ContactPage />
                  </div>
                } />
                <Route path="/about" element={
                  <div>
                    <GlobalHeader />
                    <AboutUsPage />
                  </div>
                } />
                <Route path="/marketplace" element={
                  <div>
                    <GlobalHeader />
                    <MarketplacePage />
                  </div>
                } />
                <Route path="/events" element={
                  <div>
                    <GlobalHeader />
                    <EventsPage />
                  </div>
                } />
                
                {/* Protected routes */}
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
                <Route path="/dashboard/inbox" element={
                  <ProtectedRoute>
                    <DashboardInbox />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/achievements" element={
                  <ProtectedRoute>
                    <StudentAchievementsPage />
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
                
                <Route path="/ai-assistant" element={
                  <ProtectedRoute>
                    <div>
                      <GlobalHeader />
                      <StudyAssistantPage />
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/planner" element={
                  <ProtectedRoute>
                    <div>
                      <GlobalHeader />
                      <DailyPlannerPage />
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <div>
                      <GlobalHeader />
                      <ProfilePage />
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/wallet" element={
                  <ProtectedRoute>
                    <div>
                      <GlobalHeader />
                      <WalletPage />
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/referral" element={
                  <ProtectedRoute>
                    <div>
                      <GlobalHeader />
                      <ReferralPage />
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/premium" element={
                  <ProtectedRoute>
                    <div>
                      <GlobalHeader />
                      <PremiumPage />
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/esewa-payment" element={
                  <ProtectedRoute>
                    <ESewaPaymentPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <div>
                      <GlobalHeader />
                      <SettingsPage />
                    </div>
                  </ProtectedRoute>
                } />
                
                {/* Admin routes */}
                <Route path="/admin/*" element={
                  <ProtectedRoute>
                    <EnhancedAdminLayout />
                  </ProtectedRoute>
                } />
                
                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              
              {/* Floating AI Button - Available on all pages */}
              <FloatingAIButton />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AdsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
