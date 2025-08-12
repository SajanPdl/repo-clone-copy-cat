
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/StudentSidebar';
import SubscriptionWorkflow from '@/components/subscription/SubscriptionWorkflow';
import Navbar from '@/components/Navbar';

const SubscriptionPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <SidebarProvider>
        <div className="flex w-full">
          <StudentSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3 px-4 py-3">
                <SidebarTrigger className="lg:hidden" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Subscription Plans
                </h1>
              </div>
            </header>
            <main className="p-6">
              <SubscriptionWorkflow />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default SubscriptionPage;
