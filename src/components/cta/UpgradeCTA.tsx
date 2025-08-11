import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';

type UpgradeCTAVariant = 'banner' | 'card' | 'inline';

interface UpgradeCTAProps {
  variant?: UpgradeCTAVariant;
  className?: string;
  title?: string;
  message?: string;
  ctaText?: string;
  dismissibleKey?: string; // localStorage key for dismiss state
}

const defaultCopyByVariant: Record<UpgradeCTAVariant, { title: string; message: string; cta: string }> = {
  banner: {
    title: 'Upgrade to Pro',
    message: 'No ads, faster downloads, and powerful study tools. Go Pro in seconds.',
    cta: 'Upgrade',
  },
  card: {
    title: 'Go Pro — Study Better',
    message: 'Unlock ad-free experience, priority downloads, and advanced features like highlights & notes.',
    cta: 'Upgrade to Pro',
  },
  inline: {
    title: 'Go Pro',
    message: 'Unlock more features',
    cta: 'Upgrade',
  },
};

const UpgradeCTA: React.FC<UpgradeCTAProps> = ({
  variant = 'card',
  className = '',
  title,
  message,
  ctaText,
  dismissibleKey,
}) => {
  const navigate = useNavigate();
  const { hasActiveSubscription } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  const copy = useMemo(() => defaultCopyByVariant[variant], [variant]);

  useEffect(() => {
    if (!dismissibleKey) return;
    const v = localStorage.getItem(`cta_dismissed:${dismissibleKey}`);
    setDismissed(v === '1');
  }, [dismissibleKey]);

  if (hasActiveSubscription()) return null;
  if (dismissed) return null;

  const handleUpgrade = () => {
     navigate('/subscription');
  };

  const handleDismiss = () => {
    if (!dismissibleKey) return;
    localStorage.setItem(`cta_dismissed:${dismissibleKey}`, '1');
    setDismissed(true);
  };

  if (variant === 'banner') {
    return (
      <div className={`w-full rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 flex items-center justify-between gap-2 ${className}`}>
        <div className="flex items-center gap-2 truncate">
          <Crown className="w-4 h-4" />
          <span className="font-medium truncate">{title || copy.title}</span>
          <span className="opacity-90 hidden md:inline">•</span>
          <span className="opacity-90 text-sm hidden md:inline">{message || copy.message}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="secondary" className="text-indigo-700" onClick={handleUpgrade}>
            {ctaText || copy.cta}
          </Button>
          {dismissibleKey && (
            <button onClick={handleDismiss} className="text-white/80 hover:text-white text-xs">Hide</button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-2 text-sm ${className}`}>
        <Crown className="w-4 h-4 text-yellow-500" />
        <span>{title || copy.title}:</span>
        <button onClick={handleUpgrade} className="underline text-indigo-600 hover:text-indigo-700">
          {ctaText || copy.cta}
        </button>
      </span>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Crown className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">{title || copy.title}</div>
            <div className="text-sm text-gray-600 mt-1">{message || copy.message}</div>
            <div className="mt-3">
              <Button size="sm" onClick={handleUpgrade}>{ctaText || copy.cta}</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradeCTA;



