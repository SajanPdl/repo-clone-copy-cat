
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/StudentSidebar';
import SellerWallet from '@/components/wallet/SellerWallet';
import Navbar from '@/components/Navbar';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';

const WalletPage = () => {
  const { user } = useAuth();
  const { notifyPaymentApproved } = useNotificationTrigger();

  useEffect(() => {
    if (user) {
      // Show wallet welcome notification
      notifyPaymentApproved(0, 'Welcome to your wallet!');
    }
  }, [user, notifyPaymentApproved]);

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
                  Seller Wallet
                </h1>
              </div>
            </header>
            <main className="p-6">
              <SellerWallet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default WalletPage;
