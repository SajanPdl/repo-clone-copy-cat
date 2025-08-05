
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import HomePage from '@/pages/HomePage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import StudyMaterialsPage from '@/pages/StudyMaterialsPage';
import PastPapersPage from '@/pages/PastPapersPage';
import MarketplacePage from '@/pages/MarketplacePage';
import PremiumPage from '@/pages/PremiumPage';
import ContactPage from '@/pages/ContactPage';
import AboutUsPage from '@/pages/AboutUsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ContentViewPage from '@/pages/ContentViewPage';
import BlogViewPage from '@/pages/BlogViewPage';
import StudentAchievementsPage from '@/pages/StudentAchievementsPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminPanel from '@/pages/AdminPanel';
import ESewaPaymentPage from '@/pages/ESewaPaymentPage';
import WalletPage from '@/pages/WalletPage';
import EventsPage from '@/pages/EventsPage';
import DailyPlannerPage from '@/pages/DailyPlannerPage';
import StudentMaterialUploadPage from '@/pages/StudentMaterialUploadPage';
import StudyAssistantPage from '@/pages/StudyAssistantPage';
import PlannerPage from '@/pages/PlannerPage';
import ReferralPage from '@/pages/ReferralPage';
import StudentDashboard from '@/pages/StudentDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/study-materials" element={<StudyMaterialsPage />} />
          <Route path="/past-papers" element={<PastPapersPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/content/:slug" element={<ContentViewPage />} />
          <Route path="/blog/:slug" element={<BlogViewPage />} />
          <Route path="/esewa-payment" element={<ESewaPaymentPage />} />

          {/* Student Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/achievements" element={
            <ProtectedRoute>
              <StudentAchievementsPage />
            </ProtectedRoute>
          } />
          <Route path="/wallet" element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          } />
          <Route path="/daily-planner" element={
            <ProtectedRoute>
              <DailyPlannerPage />
            </ProtectedRoute>
          } />
          <Route path="/planner" element={
            <ProtectedRoute>
              <PlannerPage />
            </ProtectedRoute>
          } />
          <Route path="/upload-material" element={
            <ProtectedRoute>
              <StudentMaterialUploadPage />
            </ProtectedRoute>
          } />
          <Route path="/study-assistant" element={
            <ProtectedRoute>
              <StudyAssistantPage />
            </ProtectedRoute>
          } />
          <Route path="/referral" element={
            <ProtectedRoute>
              <ReferralPage />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          } />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
