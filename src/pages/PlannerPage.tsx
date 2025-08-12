
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/StudentSidebar';
import DailyPlanner from '@/components/planner/DailyPlanner';
import GlobalHeader from '@/components/GlobalHeader';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';

const PlannerPage = () => {
  const { user } = useAuth();
  const { notifyEventReminder } = useNotificationTrigger();

  useEffect(() => {
    if (user) {
      // Show planner welcome notification
      notifyEventReminder('Daily Planner', 'Plan your study sessions and track your progress!');
    }
  }, [user, notifyEventReminder]);

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
                <h1 className="text-xl font-semibold text-gray-900">
                  Daily Planner
                </h1>
              </div>
            </header>
            <main className="p-6">
              <DailyPlanner />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default PlannerPage;
