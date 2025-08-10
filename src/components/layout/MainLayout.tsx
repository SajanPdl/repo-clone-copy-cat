
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdPlacement from '@/components/ads/AdPlacement';
import { AdsProvider } from '@/components/ads/AdsProvider';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <AdsProvider>
      <div className="min-h-screen flex flex-col">
        <AdPlacement position="header" />
        <Navbar />
        <main className="flex-1 flex">
          <div className="hidden lg:block w-64 p-4">
            <AdPlacement position="sidebar" />
          </div>
          <div className="flex-1">
            {children}
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
