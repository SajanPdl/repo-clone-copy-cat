
import React from 'react';
import { useAds } from './AdsProvider';

export const NepalAdsFloater: React.FC = () => {
  const { isUserPremium } = useAds();
  
  // Don't show ads to premium users
  if (isUserPremium) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs border">
        <div className="text-center">
          <img 
            src="https://placehold.co/280x150/f5f5f5/6A26A9?text=Nepal+Study+Hub+Ad" 
            alt="Nepal Study Hub Advertisement" 
            className="w-full h-auto rounded mb-2"
          />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            Premium Study Materials
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Get access to exclusive content
          </p>
          <button 
            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
            onClick={() => window.open('/premium', '_blank')}
          >
            Learn More
          </button>
          <div className="text-xs text-gray-400 mt-2">Advertisement</div>
        </div>
      </div>
    </div>
  );
};
