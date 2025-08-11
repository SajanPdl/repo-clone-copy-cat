import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import AdSlot from '@/components/ads/AdSlot';
import { useSubscription } from '@/hooks/useSubscription';

export const NepalAdsFloater = () => {
  const { isPremiumUser } = useSubscription();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isPremiumUser()) return; // do not show for premium users
    const lastClosed = localStorage.getItem('nepal_ad_closed');
    if (!lastClosed) {
      setVisible(true);
      return;
    }
    const diff = Date.now() - parseInt(lastClosed);
    if (diff > 24 * 60 * 60 * 1000) setVisible(true);
  }, [isPremiumUser]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="relative bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => { localStorage.setItem('nepal_ad_closed', Date.now().toString()); setVisible(false); }}
          className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow-sm"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>
        <AdSlot placement="floater" className="max-w-sm" />
        <div className="h-1 bg-gradient-to-r from-blue-500 via-red-500 to-blue-500" />
      </div>
    </div>
  );
};
