
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NepalAd {
  id: number;
  title: string;
  content: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
}

export const NepalAdsFloater = () => {
  const [ad, setAd] = useState<NepalAd | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNepalAd();
  }, []);

  const fetchNepalAd = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('position', 'nepal_floater')
        .eq('is_active', true)
        .single();

      if (error) {
        console.log('No Nepal floater ad found or error:', error);
        setLoading(false);
        return;
      }

      setAd(data);
      setIsVisible(true);
    } catch (error) {
      console.error('Error fetching Nepal ad:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Store in localStorage to remember user closed it
    localStorage.setItem('nepal_ad_closed', Date.now().toString());
  };

  const handleAdClick = () => {
    if (ad?.link_url) {
      window.open(ad.link_url, '_blank');
    }
  };

  // Don't show if loading or no ad or user recently closed it
  if (loading || !ad || !isVisible) {
    return null;
  }

  // Check if user closed it recently (within 24 hours)
  const lastClosed = localStorage.getItem('nepal_ad_closed');
  if (lastClosed) {
    const timeDiff = Date.now() - parseInt(lastClosed);
    if (timeDiff < 24 * 60 * 60 * 1000) { // 24 hours
      return null;
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow-sm"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* Ad content */}
        <div 
          className="cursor-pointer group"
          onClick={handleAdClick}
        >
          {ad.image_url && (
            <div className="relative overflow-hidden">
              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
            </div>
          )}

          <div className="p-4">
            <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {ad.title}
            </h3>
            {ad.content && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {ad.content}
              </p>
            )}
            
            {ad.link_url && (
              <div className="mt-3">
                <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium group-hover:bg-blue-600 transition-colors">
                  Learn More →
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Nepal flag accent */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-red-500 to-blue-500"></div>
      </div>
    </div>
  );
};
