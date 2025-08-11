import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchActiveAds, logClick, logImpression, ActiveAdCreative } from '@/services/adsService';
import { useAuth } from '@/hooks/useAuth';

type AdSlotProps = {
  placement: 'header' | 'footer' | 'sidebar' | 'inline' | 'popup' | 'floater';
  category?: string | null;
  className?: string;
  rotateMs?: number;
  maxAds?: number;
};

const AdSlot: React.FC<AdSlotProps> = ({ placement, category = null, className = '', rotateMs = 7000, maxAds = 5 }) => {
  const { user } = useAuth();
  const [ads, setAds] = useState<ActiveAdCreative[]>([]);
  const [index, setIndex] = useState(0);
  const rotateRef = useRef<number | null>(null);

  const device = useMemo<'desktop' | 'mobile'>(() => (window.innerWidth < 768 ? 'mobile' : 'desktop'), []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchActiveAds({ placement, userRole: 'admin', category, device, limit: maxAds });
        if (!cancelled) setAds(data);
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [placement, category, device, maxAds]);

  useEffect(() => {
    if (ads.length <= 1) return;
    rotateRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % ads.length);
    }, rotateMs);
    return () => {
      if (rotateRef.current) window.clearInterval(rotateRef.current);
    };
  }, [ads, rotateMs]);

  useEffect(() => {
    const current = ads[index];
    if (!current) return;
    // fire-and-forget impression
    logImpression({ creativeId: current.creative_id, campaignId: current.campaign_id, userId: user?.id ?? null, device });
  }, [ads, index, user, device]);

  const current = ads[index];
  if (!current) return null;

  const onClick = () => {
    logClick({ creativeId: current.creative_id, campaignId: current.campaign_id, userId: user?.id ?? null, device });
    if (current.link_url) window.open(current.link_url, '_blank');
  };

  return (
    <div className={`relative overflow-hidden rounded border bg-white ${className}`}>
      {/* label */}
      <div className="absolute top-1 left-1 z-10 text-[10px] px-1.5 py-0.5 rounded bg-gray-900/80 text-white">Sponsored</div>
      <button onClick={onClick} className="block w-full text-left">
        {current.media_type === 'image' ? (
          <img src={current.media_url} alt={current.title ?? 'Ad'} className="w-full h-auto object-cover transition-opacity duration-500" loading="lazy" />
        ) : (
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-1">{current.title}</h4>
            <p className="text-sm text-gray-600">{current.description}</p>
          </div>
        )}
      </button>
    </div>
  );
};

export default AdSlot;


