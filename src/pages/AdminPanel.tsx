
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';

const AdminPanel = () => {
  const { user, isAdmin, loading } = useAuth();
  const { notifyAdminAnnouncement } = useNotificationTrigger();

  useEffect(() => {
    if (user && isAdmin) {
      // Show admin welcome notification
      notifyAdminAnnouncement(
        'Admin Panel Access',
        'Welcome to the admin panel. You have full access to manage the platform.'
      );
    }
  }, [user, isAdmin, notifyAdminAnnouncement]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <EnhancedAdminLayout />;
};

export default AdminPanel;
