
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EnhancedDashboard from '@/components/admin/EnhancedDashboard';
import StudyMaterialsManager from '@/components/admin/StudyMaterialsManager';
import PastPapersManager from '@/components/admin/PastPapersManager';
import UserManagement from '@/components/admin/UserManagement';
import MarketplaceManager from '@/components/admin/MarketplaceManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import GradesManager from '@/components/admin/GradesManager';
import BlogEditor from '@/components/admin/BlogEditor';
import QueriesManager from '@/components/admin/QueriesManager';
import AdvertisementManager from '@/components/admin/AdvertisementManager';
import AchievementManager from '@/components/admin/AchievementManager';
import AdminSettings from '@/components/admin/AdminSettings';
import PaymentVerificationManager from '@/components/admin/PaymentVerificationManager';
import WithdrawalManager from '@/components/admin/WithdrawalManager';
import EventsManager from '@/components/admin/EventsManager';
import JobsManager from '@/components/admin/JobsManager';

export function AdminPanel() {
  return (
    <div className="flex-1">
      <Routes>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<EnhancedDashboard />} />
        <Route path="study-materials" element={<StudyMaterialsManager />} />
        <Route path="past-papers" element={<PastPapersManager />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="marketplace" element={<MarketplaceManager />} />
        <Route path="categories" element={<CategoriesManager />} />
        <Route path="grades" element={<GradesManager />} />
        <Route path="blog" element={<BlogEditor />} />
        <Route path="queries" element={<QueriesManager />} />
        <Route path="advertisements" element={<AdvertisementManager />} />
        <Route path="achievements" element={<AchievementManager />} />
        <Route path="payments" element={<PaymentVerificationManager />} />
        <Route path="withdrawals" element={<WithdrawalManager />} />
        <Route path="events" element={<EventsManager />} />
        <Route path="jobs" element={<JobsManager />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </div>
  );
}
