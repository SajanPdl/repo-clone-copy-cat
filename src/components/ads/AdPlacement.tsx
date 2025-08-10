
import React from 'react';
import { useAds } from './AdsProvider';

interface AdPlacementProps {
  position: 'header' | 'sidebar' | 'content' | 'footer';
  className?: string;
}

const AdPlacement: React.FC<AdPlacementProps> = ({ position, className = '' }) => {
  const { ads, isUserPremium } = useAds();

  // Don't show ads for premium users
  if (isUserPremium) {
    return null;
  }

  // Filter ads for this position
  const positionAds = ads.filter(ad => ad.position === position && ad.active);

  if (positionAds.length === 0) {
    return null;
  }

  return (
    <div className={`ad-placement ad-${position} ${className}`}>
      {positionAds.map(ad => (
        <div key={ad.id} className="ad-container" dangerouslySetInnerHTML={{ __html: ad.adCode }} />
      ))}
    </div>
  );
};

export default AdPlacement;
