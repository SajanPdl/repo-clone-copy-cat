
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdPlacement from '@/components/ads/AdPlacement';
import AdSlot from '@/components/ads/AdSlot';
import UpgradeCTA from '@/components/cta/UpgradeCTA';
import { AdsProvider } from '@/components/ads/AdsProvider';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <AdsProvider>
      <div className="min-h-screen flex flex-col">
        <AdPlacement position="header" />
        <div className="px-4 py-2">
          <UpgradeCTA variant="banner" dismissibleKey="main_header_banner" />
        </div>
        <Navbar />
        {/* Ad Slot below navbar */}
        <div className="w-full bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <div className="container mx-auto px-4 py-3">
            <AdSlot placement="header_below_nav" className="w-full h-20 bg-white dark:bg-gray-800 rounded-lg shadow-sm" />
          </div>
        </div>
        <main className="flex-1 flex flex-col lg:flex-row pt-16">
          <div className="hidden lg:block w-64 p-4 space-y-3 sticky top-44 self-start">
            <AdPlacement position="sidebar" />
            <UpgradeCTA variant="card" dismissibleKey="sidebar_card" />
          </div>
          <div className="flex-1 min-w-0">
            {children}
            <div className="px-4 py-4">
              <UpgradeCTA variant="card" dismissibleKey="content_card" />
            </div>
            <AdPlacement position="content" />
          </div>
        </main>
        <AdPlacement position="footer" />
        <Footer />
      </div>
    </AdsProvider>
  );
};

export default MainLayout;
