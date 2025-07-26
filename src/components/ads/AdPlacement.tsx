
import React from 'react';
import { useAds } from './AdsProvider';
import AdManager from './AdManager';

interface AdPlacementProps {
  position: 'sidebar' | 'content' | 'footer' | 'header';
  className?: string;
}

const AdPlacement: React.FC<AdPlacementProps> = ({ position, className = '' }) => {
  const { getAdsByPosition, toggleAd } = useAds();
  const adsForPosition = getAdsByPosition(position);
  
  if (adsForPosition.length === 0) {
    return null;
  }
  
  return (
    <div className={`ad-placement ${className}`}>
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
