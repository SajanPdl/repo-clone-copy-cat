
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Index from './pages/Index';
import StudyMaterialsPage from './pages/StudyMaterialsPage';
import PastPapersPage from './pages/PastPapersPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import ContentViewPage from './pages/ContentViewPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import ProfilePage from './pages/ProfilePage';
import MarketplacePage from './pages/MarketplacePage';
import AdminPanel from './pages/AdminPanel';
import AdminLayout from './components/admin/AdminLayout';
import NotFound from './pages/NotFound';
import AdsProvider from './components/ads/AdsProvider';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AdsProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/study-materials" element={<StudyMaterialsPage />} />
                <Route path="/past-papers" element={<PastPapersPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/content/:id" element={<ContentViewPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminPanel />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </div>
          </Router>
        </AdsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
