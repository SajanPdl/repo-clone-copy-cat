
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdPlacement from '@/components/ads/AdPlacement';
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
        <main className="flex-1 flex flex-col lg:flex-row">
          <div className="hidden lg:block w-64 p-4 space-y-3 sticky top-16 self-start">
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
