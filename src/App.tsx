
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import FloatingAIButton from '@/components/FloatingAIButton';

// Pages
import HomePage from '@/pages/HomePage';
import StudyMaterialsPage from '@/pages/StudyMaterialsPage';
import PastPapersPage from '@/pages/PastPapersPage';
import BlogPage from '@/pages/BlogPage';
import MarketplacePage from '@/pages/MarketplacePage';
import EventsPage from '@/pages/EventsPage';
import LoginPage from '@/pages/LoginPage';
import AdminPanel from '@/pages/AdminPanel';

// Student Dashboard Pages
import DashboardOverview from '@/pages/DashboardOverview';
import UploadMaterialPage from '@/pages/UploadMaterialPage';
import ProfilePage from '@/pages/ProfilePage';
import StudentAchievementsPage from '@/pages/StudentAchievementsPage';
import RewardsPage from '@/pages/RewardsPage';
import SettingsPage from '@/pages/SettingsPage';
import WalletPage from '@/pages/WalletPage';
import AIAssistantPage from '@/pages/AIAssistantPage';
import DailyPlannerPage from '@/pages/DailyPlannerPage';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/study-materials" element={<StudyMaterialsPage />} />
              <Route path="/past-papers" element={<PastPapersPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Student Dashboard Routes */}
              <Route path="/dashboard/overview" element={<DashboardOverview />} />
              <Route path="/dashboard/upload" element={<UploadMaterialPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/dashboard/achievements" element={<StudentAchievementsPage />} />
              <Route path="/dashboard/rewards" element={<RewardsPage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              <Route path="/planner" element={<DailyPlannerPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin/*" element={<AdminPanel />} />
            </Routes>
            
            <FloatingAIButton />
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
