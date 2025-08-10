import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Star } from 'lucide-react';

interface ProBadgeProps {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const ProBadge: React.FC<ProBadgeProps> = ({ 
  variant = 'default', 
  size = 'md', 
  showIcon = true,
  className = ''
}) => {
  const getIcon = () => {
    if (!showIcon) return null;
    
    const iconClass = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    
    if (variant === 'default') {
      return <Crown className={`${iconClass} mr-1`} />;
    }
    return <Star className={`${iconClass} mr-1`} />;
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'lg':
        return 'text-sm px-3 py-1';
      default:
        return 'text-xs px-2 py-1';
    }
  };

  return (
    <Badge 
      variant={variant} 
      className={`${getSizeClass()} ${className} ${
        variant === 'default' 
          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0' 
          : ''
      }`}
    >
      {getIcon()}
      Pro
    </Badge>
  );
};

export default ProBadge;
