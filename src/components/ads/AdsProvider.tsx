import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Ad {
  id: string;
  type: 'sponsor' | 'adsense' | 'adsterra';
  position: 'sidebar' | 'content' | 'footer' | 'header';
  adCode: string;
  active: boolean;
}

interface AdsContextType {
  ads: Ad[];
  isUserPremium: boolean;
  setIsUserPremium: (premium: boolean) => void;
  addAd: (ad: Omit<Ad, 'id'>) => void;
  removeAd: (id: string) => void;
  toggleAd: (id: string) => void;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

interface AdsProviderProps {
  children: ReactNode;
  adType?: 'hero' | 'content' | 'sidebar' | 'footer';
  className?: string;
}

export const AdsProvider: React.FC<AdsProviderProps> = ({ 
  children, 
  adType, 
  className = '' 
}) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isUserPremium, setIsUserPremium] = useState(false);

  const addAd = (ad: Omit<Ad, 'id'>) => {
    const newAd: Ad = {
      ...ad,
      id: Date.now().toString(),
    };
    setAds(prev => [...prev, newAd]);
  };

  const removeAd = (id: string) => {
    setAds(prev => prev.filter(ad => ad.id !== id));
  };

  const toggleAd = (id: string) => {
    setAds(prev => prev.map(ad => 
      ad.id === id ? { ...ad, active: !ad.active } : ad
    ));
  };

  const contextValue: AdsContextType = {
    ads,
    isUserPremium,
    setIsUserPremium,
    addAd,
    removeAd,
    toggleAd,
  };

  // If adType is provided, render as placement component
  if (adType) {
    return (
      <div className={`ads-container ${adType} ${className}`}>
        {/* Ad content will be dynamically loaded based on admin settings */}
        <div className="ad-placeholder">
          {/* Placeholder for ad content */}
        </div>
      </div>
    );
  }

  // Otherwise render as context provider
  return (
    <AdsContext.Provider value={contextValue}>
      {children}
    </AdsContext.Provider>
  );
};

export const useAds = (): AdsContextType => {
  const context = useContext(AdsContext);
  if (!context) {
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
};
