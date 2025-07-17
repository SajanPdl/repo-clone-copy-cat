
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAds } from './AdsProvider';
import { Button } from '@/components/ui/button';

export const NepalAdsFloater = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { isUserPremium } = useAds();
  
  // Check if the ad was previously closed in this session
  useEffect(() => {
    const wasClosed = sessionStorage.getItem('floaterAdClosed') === 'true';
    if (wasClosed) {
      setIsVisible(false);
    }
  }, []);
  
  // Don't show the floating ad to premium users
  if (isUserPremium) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
    // Store in session storage so it stays closed during the session
    sessionStorage.setItem('floaterAdClosed', 'true');
  };

  // Nepal-themed sponsor ad
  return isVisible ? (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#DC143C] to-[#003893] p-2 flex justify-between items-center">
          <span className="text-white text-sm font-medium">Sponsored</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full hover:bg-white/20 text-white"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <div className="text-center">
            <img 
              src="https://placehold.co/300x200/f5f5f5/6A26A9?text=Nepal+Tourism" 
              alt="Nepal Tourism Ad" 
              className="mx-auto rounded mb-3"
            />
            <p className="text-sm font-medium mb-2">Experience the majestic beauty of Nepal</p>
            <Button size="sm" className="bg-[#DC143C] hover:bg-[#B01030] text-white">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default NepalAdsFloater;
