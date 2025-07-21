import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AdsterraScript = () => {
  const location = useLocation();

  useEffect(() => {
    // Only load adsterra script for non-admin pages
    if (!location.pathname.startsWith('/admin')) {
      const script = document.createElement('script');
      script.src = '//defiantexemplifytheme.com/29/69/42/29694258fa5594ca74300ab5064ba6f5.js';
      script.type = 'text/javascript';
      script.async = true;
      
      document.body.appendChild(script);
      
      return () => {
        // Clean up script when component unmounts
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [location.pathname]);

  return null;
};

export default AdsterraScript;