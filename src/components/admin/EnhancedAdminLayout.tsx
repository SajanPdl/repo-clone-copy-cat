
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import EnhancedAdminSidebar from '@/components/admin/EnhancedAdminSidebar';

const EnhancedAdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen w-full flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Enhanced Sidebar */}
      <div className={`h-full ${sidebarCollapsed ? 'w-20' : 'w-72'} flex-shrink-0 transition-all duration-300 ease-in-out`}>
        <EnhancedAdminSidebar 
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>
      
      {/* Main content area */}
      <main className="flex-1 w-full overflow-y-auto bg-white dark:bg-gray-800">
        <div className="min-h-full">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default EnhancedAdminLayout;
