import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import AdSlot from './AdSlot';
import LazyVisible from '@/components/LazyVisible';

interface AdPlacementProps {
  position: 'sidebar' | 'content' | 'footer' | 'header';
  className?: string;
}

// Bridge component: keeps old AdPlacement API but renders new campaign-based AdSlot
const AdPlacement: React.FC<AdPlacementProps> = ({ position, className = '' }) => {
  const location = useLocation();
  const { isPremiumUser } = useSubscription();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute || isPremiumUser()) return null;

  // Map legacy 'content' placement to new 'inline' slot type
  const slotPlacement = position === 'content' ? 'inline' : position;

  return (
    <LazyVisible className={className} rootMargin="400px 0px">
      <AdSlot placement={slotPlacement as any} />
    </LazyVisible>
  );
};

export default AdPlacement;
