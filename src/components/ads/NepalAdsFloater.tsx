import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const NepalAdsFloater = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={18} />
        </button>
        
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            🇳🇵 Study in Nepal
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Discover top educational opportunities in Nepal with our comprehensive guides.
          </p>
        </div>
        
        <button className="w-full bg-gradient-to-r from-edu-purple to-edu-blue text-white text-sm py-2 rounded-md hover:opacity-90 transition-opacity">
          Learn More
        </button>
      </div>
    </div>
  );
};