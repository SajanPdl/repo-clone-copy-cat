
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/StudentSidebar';
import GlobalHeader from '@/components/GlobalHeader';
import UserProfile from '@/components/UserProfile';

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader />
      <SidebarProvider>
        <div className="flex w-full">
          <StudentSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3 px-4 py-3">
                <SidebarTrigger className="lg:hidden" />
                <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
              </div>
            </header>
            <main className="p-6">
              <UserProfile />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProfilePage;
