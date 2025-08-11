import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FixedSidebar from '@/components/common/FixedSidebar';
import { Menu } from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ 
  children, 
  showSidebar = true 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Use existing Navbar component */}
      <Navbar />
      
      {/* Main content area with proper spacing */}
      <div className="flex flex-1 pt-16"> {/* pt-16 accounts for fixed navbar height */}
        {/* Sidebar */}
        {showSidebar && (
          <FixedSidebar 
            isOpen={sidebarOpen} 
            onToggle={toggleSidebar} 
          />
        )}
        
        {/* Main content */}
        <main className={`flex-1 transition-all duration-300 ${
          showSidebar ? 'lg:ml-64' : ''
        }`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SidebarLayout;
