
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';

const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`h-full ${sidebarCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 transition-all duration-300 ease-in-out`}>
        <AdminSidebar 
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
