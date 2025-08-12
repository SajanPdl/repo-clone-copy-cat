
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/StudentSidebar';
import ReferralProgram from '@/components/referral/ReferralProgram';
import Navbar from '@/components/Navbar';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';

const ReferralPage = () => {
  const { user } = useAuth();
  const { notifyPromoDiscount } = useNotificationTrigger();

  useEffect(() => {
    if (user) {
      // Show referral welcome notification
      notifyPromoDiscount('Referral Bonus', 'Earn rewards by inviting friends to join the platform!');
    }
  }, [user, notifyPromoDiscount]);

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
                  Referral Program
                </h1>
              </div>
            </header>
            <main className="p-6">
              <ReferralProgram />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ReferralPage;
