
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { NotificationManager } from "@/components/notifications/NotificationManager";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import StudyMaterialsPage from "./pages/StudyMaterialsPage";
import ContentViewPage from "./pages/ContentViewPage";
import PastPapersPage from "./pages/PastPapersPage";
import PastPaperViewPage from "./pages/PastPaperViewPage";
import StudentDashboard from "./pages/StudentDashboard";
import DashboardOverview from "./pages/DashboardOverview";
import DashboardInbox from "./pages/DashboardInbox";
import DashboardAchievements from "./pages/DashboardAchievements";
import DashboardRewards from "./pages/DashboardRewards";
import DashboardSettings from "./pages/DashboardSettings";
import StudentAchievementsPage from "./pages/StudentAchievementsPage";
import StudentSavedPage from "./pages/StudentSavedPage";
import StudentMaterialUploadPage from "./pages/StudentMaterialUploadPage";

import ProfilePage from "./pages/ProfilePage";
import AdminPanel from "./pages/AdminPanel";
import EmergencyAdminAccess from "./components/admin/EmergencyAdminAccess";
import MarketplacePage from "./pages/MarketplacePage";
import MarketplaceProductViewPage from "./pages/MarketplaceProductViewPage";
import EventsPage from "./pages/EventsPage";
import BlogPage from "./pages/BlogPage";
import BlogViewPage from "./pages/BlogViewPage";
import AboutUsPage from "./pages/AboutUsPage";
import ContactPage from "./pages/ContactPage";
import PremiumPage from "./pages/PremiumPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentStatusPage from "./pages/PaymentStatusPage";
import ESewaPaymentPage from "./pages/ESewaPaymentPage";
import ReferralPage from "./pages/ReferralPage";
import RewardsPage from "./pages/RewardsPage";
import WalletPage from "./pages/WalletPage";
import SettingsPage from "./pages/SettingsPage";
import StudyAssistantPage from "./pages/StudyAssistantPage";
import PlannerPage from "./pages/PlannerPage";
import NotFoundPage from "./pages/NotFoundPage";
import NotFound from "./pages/NotFound";
import SearchPage from "./pages/SearchPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SiteSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NotificationManager position="top-right" maxNotifications={5} />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/study-materials" element={<StudyMaterialsPage />} />
              <Route path="/content/:type/:slug" element={<ContentViewPage />} />
              <Route path="/past-papers" element={<PastPapersPage />} />
              <Route path="/past-paper/:id" element={<PastPaperViewPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/marketplace/:id" element={<MarketplaceProductViewPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogViewPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/premium" element={<PremiumPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment-status" element={<PaymentStatusPage />} />
              <Route path="/esewa-payment" element={<ESewaPaymentPage />} />
              <Route path="/referral" element={<ReferralPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/study-assistant" element={<StudyAssistantPage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/search" element={<SearchPage />} />
              
              {/* Protected Student Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardOverview />} />
                <Route path="inbox" element={<DashboardInbox />} />
                <Route path="achievements" element={<DashboardAchievements />} />
                <Route path="rewards" element={<DashboardRewards />} />
                <Route path="settings" element={<DashboardSettings />} />
                <Route path="saved" element={<StudentSavedPage />} />
                <Route path="upload-material" element={<StudentMaterialUploadPage />} />
              </Route>
              

              
              {/* Protected Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPanel />
                </ProtectedRoute>
              } />
              
              {/* Emergency Admin Access */}
              <Route path="/emergency-admin" element={<EmergencyAdminAccess />} />
              <Route path="/admin-emergency" element={<EmergencyAdminAccess />} />
              <Route path="/fix-admin" element={<EmergencyAdminAccess />} />
              
              {/* Simple Test Route */}
              <Route path="/test-admin" element={
                <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
                  <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <div className="text-6xl mb-4">🚨</div>
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Emergency Admin Access</h1>
                    <p className="text-gray-700 mb-6">
                      If you can see this page, routing is working! This is a simple test component.
                    </p>
                    <div className="bg-blue-50 p-3 rounded border">
                      <p className="text-sm text-blue-800">
                        <strong>Current URL:</strong> {window.location.href}
                      </p>
                    </div>
                  </div>
                </div>
              } />
              
              {/* 404 Routes */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SiteSettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
