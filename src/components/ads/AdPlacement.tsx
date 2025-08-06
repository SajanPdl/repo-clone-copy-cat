
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAds } from './AdsProvider';

interface AdPlacementProps {
  position: 'sidebar' | 'content' | 'footer' | 'header';
  className?: string;
}

interface AdData {
  id: string;
  title: string;
  content?: string;
  image_url?: string;
  link_url?: string;
  position: string;
  ad_type: string;
  is_active: boolean;
}

const AdPlacement: React.FC<AdPlacementProps> = ({ position, className = '' }) => {
  const location = useLocation();
  const { isUserPremium } = useAds();
  const [ads, setAds] = useState<AdData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Don't show ads on admin routes or to premium users
  if (location.pathname.startsWith('/admin') || isUserPremium) {
    return null;
  }

  useEffect(() => {
    fetchAds();
  }, [position]);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('position', position)
        .eq('is_active', true);

      if (error) throw error;

      // Convert id to string to match our AdData interface
      const processedAds = (data || []).map(ad => ({
        ...ad,
        id: ad.id.toString()
      }));

      setAds(processedAds);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || ads.length === 0) {
    return null;
  }

  const renderAd = (ad: AdData) => {
    const handleAdClick = () => {
      if (ad.link_url) {
        window.open(ad.link_url, '_blank', 'noopener,noreferrer');
      }
    };

    switch (ad.ad_type) {
      case 'banner':
        return (
          <div 
            key={ad.id}
            className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow ${className}`}
            onClick={handleAdClick}
          >
            {ad.image_url && (
              <img 
                src={ad.image_url} 
                alt={ad.title}
                className="w-full h-auto rounded mb-2"
              />
            )}
            <h3 className="font-semibold text-gray-900">{ad.title}</h3>
            {ad.content && (
              <p className="text-sm text-gray-600 mt-1">{ad.content}</p>
            )}
            <div className="text-xs text-gray-400 mt-2">Advertisement</div>
          </div>
        );

      case 'text':
        return (
          <div 
            key={ad.id}
            className={`bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500 cursor-pointer hover:bg-blue-100 transition-colors ${className}`}
            onClick={handleAdClick}
          >
            <h3 className="font-semibold text-blue-900">{ad.title}</h3>
            {ad.content && (
              <p className="text-sm text-blue-700 mt-1">{ad.content}</p>
            )}
            <div className="text-xs text-blue-400 mt-2">Sponsored</div>
          </div>
        );

      default:
        return (
          <div 
            key={ad.id}
            className={`bg-gray-50 rounded-lg p-4 border cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
            onClick={handleAdClick}
          >
            <h3 className="font-medium text-gray-900">{ad.title}</h3>
            {ad.content && (
              <p className="text-sm text-gray-600 mt-1">{ad.content}</p>
            )}
            <div className="text-xs text-gray-400 mt-2">Advertisement</div>
          </div>
        );
    }
  };
  
  return (
    <div className={`ad-placement space-y-4 ${className}`}>
      {ads.map(ad => renderAd(ad))}
    </div>
  );
};

export default AdPlacement;
