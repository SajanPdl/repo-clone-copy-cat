import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const EmergencyAdminAccess = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'checking' | 'authenticated' | 'failed'>('idle');
  const [user, setUser] = useState<any>(null);
  const [adminStatus, setAdminStatus] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkCurrentAuth();
  }, []);

  const checkCurrentAuth = async () => {
    setAuthStatus('checking');
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user && !error) {
        setUser(user);
        setAuthStatus('authenticated');
        checkAdminStatus(user.id);
      } else {
        setAuthStatus('failed');
      }
    } catch (error) {
      setAuthStatus('failed');
    }
  };

  const checkAdminStatus = async (userId: string) => {
    try {
      // First check if user exists in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        // User doesn't exist in users table, create them
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: user?.email,
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (createError) {
          console.error('Error creating user:', createError);
          setAdminStatus({ isAdmin: false, error: createError.message });
        } else {
          setAdminStatus({ isAdmin: true, message: 'User created with admin role' });
        }
      } else {
        // Check if user is admin
        const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', {
          user_id: userId
        });

        if (adminError) {
          setAdminStatus({ isAdmin: false, error: adminError.message });
        } else {
          setAdminStatus({ isAdmin: isAdmin, message: `Admin status: ${isAdmin}` });
        }
      }
    } catch (error: any) {
      setAdminStatus({ isAdmin: false, error: error.message });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Sign In Failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Sign In Successful',
          description: 'Please wait while we check your admin status...',
          variant: 'default'
        });
        setUser(data.user);
        setAuthStatus('authenticated');
        checkAdminStatus(data.user.id);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        toast({
          title: 'Error',
          description: `Failed to set admin role: ${error.message}`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: 'Admin role set successfully! You can now access the admin panel.',
          variant: 'default'
        });
        checkAdminStatus(user.id);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to set admin role: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const goToAdminPanel = () => {
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Emergency Admin Access</CardTitle>
          <p className="text-gray-600 text-sm">
            Use this tool to diagnose and fix admin panel access issues
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authentication Status */}
          {authStatus === 'checking' && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Checking authentication...</span>
            </div>
          )}

          {authStatus === 'failed' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                Not currently authenticated. Please sign in below.
              </p>
            </div>
          )}

          {authStatus === 'authenticated' && user && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">
                  Authenticated as: {user.email}
                </span>
              </div>
            </div>
          )}

          {/* Admin Status */}
          {adminStatus && (
            <div className={`border rounded-md p-3 ${
              adminStatus.isAdmin 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {adminStatus.isAdmin ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`text-sm ${
                  adminStatus.isAdmin ? 'text-green-800' : 'text-red-800'
                }`}>
                  {adminStatus.message || `Admin status: ${adminStatus.isAdmin}`}
                </span>
              </div>
              {adminStatus.error && (
                <p className="text-xs text-red-600 mt-1">{adminStatus.error}</p>
              )}
            </div>
          )}

          {/* Sign In Form */}
          {authStatus === 'failed' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          )}

          {/* Admin Actions */}
          {authStatus === 'authenticated' && (
            <div className="space-y-3">
              {adminStatus && !adminStatus.isAdmin && (
                <Button 
                  onClick={makeAdmin} 
                  className="w-full" 
                  variant="outline"
                >
                  Make Me Admin
                </Button>
              )}
              
              {adminStatus && adminStatus.isAdmin && (
                <Button 
                  onClick={goToAdminPanel} 
                  className="w-full"
                >
                  Go to Admin Panel
                </Button>
              )}
            </div>
          )}

          {/* Diagnostic Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>Current URL: {window.location.href}</p>
            <p>User Agent: {navigator.userAgent.substring(0, 50)}...</p>
            <p>Timestamp: {new Date().toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyAdminAccess;
