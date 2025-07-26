
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';

const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Set active tab based on current route
    const path = location.pathname;
    if (path.includes('/materials')) setActiveTab('materials');
    else if (path.includes('/papers')) setActiveTab('papers');
    else if (path.includes('/blog')) setActiveTab('blog');
    else if (path.includes('/users')) setActiveTab('users');
    else if (path.includes('/stats')) setActiveTab('stats');
    else if (path.includes('/achievements')) setActiveTab('achievements');
    else if (path.includes('/categories')) setActiveTab('categories');
    else if (path.includes('/grades')) setActiveTab('grades');
    else if (path.includes('/marketplace')) setActiveTab('marketplace');
    else if (path.includes('/queries')) setActiveTab('queries');
    else if (path.includes('/analytics')) setActiveTab('analytics');
    else if (path.includes('/ads')) setActiveTab('ads');
    else if (path.includes('/ad-placements')) setActiveTab('ad-placements');
    else if (path.includes('/settings')) setActiveTab('settings');
    else setActiveTab('dashboard');
  }, [location.pathname]);

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`h-full ${sidebarCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 transition-all duration-300 ease-in-out`}>
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;
