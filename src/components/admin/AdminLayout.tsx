
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen w-full flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`h-full ${sidebarCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 transition-all duration-300 ease-in-out`}>
        <AdminSidebar />
      </div>
      
      {/* Main content */}
      <main className="flex-1 w-full overflow-y-auto bg-white dark:bg-gray-800">
        <div className="p-6">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
