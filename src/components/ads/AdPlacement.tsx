
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAds } from './AdsProvider';
import AdManager from './AdManager';

interface AdPlacementProps {
  position: 'sidebar' | 'content' | 'footer' | 'header';
  className?: string;
}

const AdPlacement: React.FC<AdPlacementProps> = ({ position, className = '' }) => {
  const location = useLocation();
  const { getAdsByPosition, toggleAd } = useAds();
  const adsForPosition = getAdsByPosition(position);
  
  // Don't show ads on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  
  if (adsForPosition.length === 0) {
    return null;
  }
  
  // Apply fixed positioning for sidebar ads
  const getPositionClasses = () => {
    if (position === 'sidebar') {
      return 'fixed top-20 right-4 z-30 w-80';
    }
    return '';
  };
  
  return (
    <div className={`ad-placement ${getPositionClasses()} ${className}`}>
      {adsForPosition.map(ad => (
        <AdManager
          key={ad.id}
          position={ad.position}
          type={ad.type}
          adCode={ad.adCode}
          visible={ad.active}
          onClose={() => toggleAd(ad.id)}
          className="mb-4"
        />
      ))}
    </div>
  );
};

export default AdPlacement;
