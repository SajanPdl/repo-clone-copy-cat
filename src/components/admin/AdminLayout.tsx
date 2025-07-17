
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';

const AdminLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <AdminHeader />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed position sidebar with toggle */}
        <div className={`h-full ${sidebarCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 bg-indigo-900 transition-all duration-300 ease-in-out fixed md:relative z-30`}>
          <AdminSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </div>
        
        {/* Main content with padding to account for sidebar */}
        <main className={`flex-1 overflow-y-auto p-6 ${sidebarCollapsed ? 'md:pl-24' : 'md:pl-6'} transition-all duration-300`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
