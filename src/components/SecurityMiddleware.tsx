
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { securityUtils } from '@/utils/securityUtils';

interface SecurityMiddlewareProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  allowedRoles?: string[];
}

const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({
  children,
  requireAuth = false,
  requireAdmin = false,
  allowedRoles = []
}) => {
  const { toast } = useToast();

  // Set security headers (if possible in client-side)
  useEffect(() => {
    // Add security-related meta tags
    const addSecurityHeaders = () => {
      // Content Security Policy
      let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!cspMeta) {
        cspMeta = document.createElement('meta');
        cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
        document.head.appendChild(cspMeta);
      }
      cspMeta.setAttribute('content', 
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://ozodujwsonbbbiiuxjaj.supabase.co"
      );

      // X-Frame-Options
      let frameMeta = document.querySelector('meta[http-equiv="X-Frame-Options"]');
      if (!frameMeta) {
        frameMeta = document.createElement('meta');
        frameMeta.setAttribute('http-equiv', 'X-Frame-Options');
        frameMeta.setAttribute('content', 'DENY');
        document.head.appendChild(frameMeta);
      }

      // X-Content-Type-Options
      let nosniffMeta = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
      if (!nosniffMeta) {
        nosniffMeta = document.createElement('meta');
        nosniffMeta.setAttribute('http-equiv', 'X-Content-Type-Options');
        nosniffMeta.setAttribute('content', 'nosniff');
        document.head.appendChild(nosniffMeta);
      }
    };

    addSecurityHeaders();
  }, []);

  return <>{children}</>;
};

export default SecurityMiddleware;
