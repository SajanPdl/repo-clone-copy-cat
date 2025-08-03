
import React, { useEffect } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
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
  const { user, isAdmin, loading, validateSession } = useSecureAuth();
  const { toast } = useToast();

  // Security checks
  useEffect(() => {
    const runSecurityChecks = async () => {
      // Skip checks if still loading
      if (loading) return;

      // Check if authentication is required
      if (requireAuth && !user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to access this feature',
          variant: 'destructive'
        });
        return;
      }

      // Check admin requirements
      if (requireAdmin && (!user || !isAdmin)) {
        toast({
          title: 'Access Denied',
          description: 'Administrator privileges required',
          variant: 'destructive'
        });
        return;
      }

      // Validate session integrity
      if (user && !(await validateSession())) {
        toast({
          title: 'Session Expired',
          description: 'Please log in again',
          variant: 'destructive'
        });
        return;
      }

      // Check for suspicious activity
      if (user) {
        const storedSession = localStorage.getItem('secure_session');
        if (storedSession) {
          try {
            const decrypted = securityUtils.decryptSensitiveData(storedSession);
            const sessionData = JSON.parse(decrypted);
            
            if (sessionData.userId !== user.id) {
              console.warn('Session mismatch detected');
              toast({
                title: 'Security Alert',
                description: 'Session anomaly detected. Please log in again.',
                variant: 'destructive'
              });
            }
          } catch (error) {
            console.error('Session validation error:', error);
          }
        }
      }
    };

    runSecurityChecks();
  }, [user, isAdmin, loading, requireAuth, requireAdmin, validateSession, toast]);

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

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Check access requirements
  if (requireAuth && !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in to access this content.</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && (!user || !isAdmin)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-gray-600">Administrator privileges required.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SecurityMiddleware;
