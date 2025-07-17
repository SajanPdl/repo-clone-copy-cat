
import React from 'react';
import { Badge, BadgePercent, DollarSign, Megaphone, MegaphoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdManagerProps {
  position?: 'sidebar' | 'content' | 'footer' | 'header';
  type?: 'sponsor' | 'adsterra' | 'adsense';
  adCode?: string;
  visible?: boolean;
  className?: string;
  onClose?: () => void;
}

export const AdManager: React.FC<AdManagerProps> = ({
  position = 'sidebar',
  type = 'sponsor',
  adCode = '',
  visible = true,
  className = '',
  onClose
}) => {
  if (!visible) return null;
  
  // Render different ad types
  const renderAdContent = () => {
    switch (type) {
      case 'adsterra':
        // For Adsterra ads, we render the ad code in an iframe or dangerouslySetInnerHTML
        return (
          <div 
            className="ad-container w-full h-full"
            dangerouslySetInnerHTML={{ __html: adCode }}
          />
        );
        
      case 'adsense':
        // For AdSense ads, we render the ad code
        return (
          <div 
            className="ad-container w-full h-full"
            dangerouslySetInnerHTML={{ __html: adCode }}
          />
        );
        
      case 'sponsor':
      default:
        // For sponsor ads, we show a custom banner
        return (
          <div className="sponsor-ad bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Badge className="h-5 w-5 mr-2 text-indigo-600" />
                <span className="font-medium text-indigo-600 dark:text-indigo-400">Sponsored</span>
              </div>
              {onClose && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={onClose}
                >
                  <MegaphoneOff className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Render custom sponsor content or HTML from adCode */}
            {adCode ? (
              <div dangerouslySetInnerHTML={{ __html: adCode }} />
            ) : (
              <div className="text-center">
                <div className="mb-3 font-medium">Advertise Your Product Here</div>
                <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
                  Contact Us
                </Button>
              </div>
            )}
          </div>
        );
    }
  };
  
  // Position classes based on position prop
  const positionClasses = {
    sidebar: 'w-full mb-6',
    content: 'my-8 w-full',
    header: 'mb-6 w-full',
    footer: 'mt-8 w-full'
  };
  
  return (
    <div className={`ad-wrapper ${positionClasses[position]} ${className}`}>
      {renderAdContent()}
    </div>
  );
};

export default AdManager;
