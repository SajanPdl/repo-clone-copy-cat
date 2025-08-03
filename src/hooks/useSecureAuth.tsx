
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { securityUtils } from '@/utils/securityUtils';

interface SecureAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  validateSession: () => Promise<boolean>;
}

const SecureAuthContext = createContext<SecureAuthContextType | undefined>(undefined);

export const SecureAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Validate session integrity
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error || !currentSession) {
        await signOut();
        return false;
      }

      // Check if session is expired
      if (currentSession.expires_at && currentSession.expires_at * 1000 < Date.now()) {
        await signOut();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      await signOut();
      return false;
    }
  }, []);

  // Enhanced admin status check
  const checkAdminStatus = useCallback(async (userId: string) => {
    try {
      const { data: adminCheck } = await supabase.rpc('is_admin', {
        user_id: userId
      });
      
      setIsAdmin(adminCheck === true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  }, []);

  // Secure session management
  useEffect(() => {
    let sessionCheckInterval: NodeJS.Timeout;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          // Generate and store secure session token
          const token = securityUtils.generateSecureToken();
          setSessionToken(token);
          
          // Encrypt and store session info
          const encryptedSession = securityUtils.encryptSensitiveData(
            JSON.stringify({ userId: session.user.id, token })
          );
          localStorage.setItem('secure_session', encryptedSession);
          
          await checkAdminStatus(session.user.id);
          
          // Set up periodic session validation
          sessionCheckInterval = setInterval(validateSession, 5 * 60 * 1000); // Every 5 minutes
        } else {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setSessionToken(null);
          localStorage.removeItem('secure_session');
          
          if (sessionCheckInterval) {
            clearInterval(sessionCheckInterval);
          }
        }
        
        setLoading(false);
      }
    );

    // Initial session check
    validateSession();

    return () => {
      subscription.unsubscribe();
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, [validateSession, checkAdminStatus]);

  const signIn = async (email: string, password: string) => {
    try {
      // Validate input
      if (!email || !password) {
        return { error: { message: 'Email and password are required' } };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        // Log failed login attempts (in production, send to security monitoring)
        console.error('Failed login attempt for:', email);
      }

      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Enhanced validation
      if (!email || !password) {
        return { error: { message: 'Email and password are required' } };
      }

      if (password.length < 8) {
        return { error: { message: 'Password must be at least 8 characters long' } };
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Clear all local storage
      localStorage.removeItem('secure_session');
      localStorage.removeItem('eduUser');
      sessionStorage.clear();
      
      // Clear session state
      setSessionToken(null);
      
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      if (!newPassword || newPassword.length < 8) {
        return { error: { message: 'Password must be at least 8 characters long' } };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      return { error };
    } catch (error) {
      console.error('Password update error:', error);
      return { error };
    }
  };

  const value: SecureAuthContextType = {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updatePassword,
    validateSession,
  };

  return (
    <SecureAuthContext.Provider value={value}>
      {children}
    </SecureAuthContext.Provider>
  );
};

export const useSecureAuth = () => {
  const context = useContext(SecureAuthContext);
  if (context === undefined) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
};
