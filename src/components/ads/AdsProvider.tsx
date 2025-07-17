
import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchAds, createAd, updateAd, deleteAd, toggleAdStatus, Ad } from '@/utils/adsUtils';
import { toast } from '@/components/ui/use-toast';

// Types for our ads configuration
type AdType = 'sponsor' | 'adsterra' | 'adsense';
type AdPosition = 'sidebar' | 'content' | 'footer' | 'header';

interface AdsContextType {
  ads: Ad[];
  toggleAd: (id: string) => void;
  addAd: (ad: Omit<Ad, 'id'>) => void;
  removeAd: (id: string) => void;
  getAdsByPosition: (position: AdPosition) => Ad[];
  isUserPremium: boolean;
  setIsUserPremium: (isPremium: boolean) => void;
  isLoading: boolean;
  refreshAds: () => Promise<void>;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

// Sample initial ads for fallback if database fetch fails
const initialAds: Ad[] = [
  {
    id: 'sidebar-sponsor-1',
    type: 'sponsor',
    position: 'sidebar',
    adCode: '<div class="text-center p-4"><img src="https://placehold.co/300x250/f5f5f5/6A26A9?text=Study+Material+Ad" alt="Study Material Ad" class="mx-auto" /><p class="mt-2 font-medium">Premium Study Materials</p><a href="/study-materials" class="text-indigo-600 text-sm">Explore Now</a></div>',
    active: true
  },
  {
    id: 'content-adsense-1',
    type: 'adsense',
    position: 'content',
    adCode: '<!-- Replace with actual AdSense code --><div class="p-4 border border-gray-200 dark:border-gray-700 rounded text-center"><span class="text-gray-500">Google AdSense Placeholder</span></div>',
    active: true
  },
  {
    id: 'footer-adsterra-1',
    type: 'adsterra',
    position: 'footer',
    adCode: '<!-- Replace with actual Adsterra code --><div class="p-4 border border-gray-200 dark:border-gray-700 rounded text-center"><span class="text-gray-500">Adsterra Placeholder</span></div>',
    active: true
  }
];

export const AdsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load ads from database on mount
  useEffect(() => {
    loadAdsFromDatabase();
    
    const premiumStatus = localStorage.getItem('user_premium') === 'true';
    setIsUserPremium(premiumStatus);
  }, []);

  // Load ads from the database
  const loadAdsFromDatabase = async () => {
    setIsLoading(true);
    try {
      const dbAds = await fetchAds();
      if (dbAds && dbAds.length > 0) {
        setAds(dbAds);
      } else {
        // If no ads in database, use initial ads
        setAds(initialAds);
      }
    } catch (err) {
      console.error("Failed to load ads from database:", err);
      setAds(initialAds);
      toast({
        title: "Warning",
        description: "Failed to load advertisements. Using default ads.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh ads from the database
  const refreshAds = async () => {
    await loadAdsFromDatabase();
  };

  // Toggle an ad's active status
  const toggleAd = async (id: string) => {
    const ad = ads.find(a => a.id === id);
    if (!ad) return;
    
    const newStatus = !ad.active;
    const success = await toggleAdStatus(id, newStatus);
    
    if (success) {
      setAds(currentAds => 
        currentAds.map(a => 
          a.id === id ? { ...a, active: newStatus } : a
        )
      );
    } else {
      toast({
        title: "Error",
        description: "Failed to update ad status.",
        variant: "destructive"
      });
    }
  };

  // Add a new ad
  const addAd = async (ad: Omit<Ad, 'id'>) => {
    const newAd = await createAd(ad);
    if (newAd) {
      setAds(currentAds => [...currentAds, newAd]);
      toast({
        title: "Success",
        description: "Advertisement created successfully."
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create advertisement.",
        variant: "destructive"
      });
    }
  };

  // Remove an ad
  const removeAd = async (id: string) => {
    const success = await deleteAd(id);
    if (success) {
      setAds(currentAds => currentAds.filter(ad => ad.id !== id));
      toast({
        title: "Success",
        description: "Advertisement removed successfully."
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to remove advertisement.",
        variant: "destructive"
      });
    }
  };

  // Get ads by position
  const getAdsByPosition = (position: AdPosition) => {
    // Don't show ads to premium users
    if (isUserPremium) return [];
    return ads.filter(ad => ad.position === position && ad.active);
  };

  // Set user premium status
  const handleSetPremium = (isPremium: boolean) => {
    setIsUserPremium(isPremium);
    localStorage.setItem('user_premium', isPremium.toString());
  };

  return (
    <AdsContext.Provider 
      value={{ 
        ads, 
        toggleAd, 
        addAd, 
        removeAd, 
        getAdsByPosition,
        isUserPremium,
        setIsUserPremium: handleSetPremium,
        isLoading,
        refreshAds
      }}
    >
      {children}
    </AdsContext.Provider>
  );
};

// Custom hook to use the ads context
export const useAds = () => {
  const context = useContext(AdsContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
};

export default AdsProvider;
