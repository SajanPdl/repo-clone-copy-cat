import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle, Info, RefreshCw } from 'lucide-react';

const AdminDiagnostic = () => {
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Check 1: Supabase Client Connection
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        results.supabaseConnection = {
          success: !error,
          message: error ? `Connection failed: ${error.message}` : 'Connected successfully',
          error: error?.message
        };
      } catch (error: any) {
        results.supabaseConnection = {
          success: false,
          message: `Connection error: ${error.message}`,
          error: error.message
        };
      }

      // Check 2: Authentication Status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      setCurrentUser(user);
      results.authentication = {
        success: !!user && !authError,
        message: user ? `Authenticated as ${user.email}` : 'Not authenticated',
        error: authError?.message,
        userId: user?.id
      };

      // Check 3: User Table Access
      if (user) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          results.userTableAccess = {
            success: !userError,
            message: userError ? `Access failed: ${userError.message}` : 'Access successful',
            error: userError?.message,
            userData: userData
          };
        } catch (error: any) {
          results.userTableAccess = {
            success: false,
            message: `Access error: ${error.message}`,
            error: error.message
          };
        }
      } else {
        results.userTableAccess = {
          success: false,
          message: 'No user to check',
          error: 'User not authenticated'
        };
      }

      // Check 4: Admin Role Check
      if (user) {
        try {
          const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', {
            user_id: user.id
          });
          
          results.adminRole = {
            success: !adminError,
            message: adminError ? `Admin check failed: ${adminError.message}` : `Admin status: ${isAdmin}`,
            error: adminError?.message,
            isAdmin: isAdmin
          };
        } catch (error: any) {
          results.adminRole = {
            success: false,
            message: `Admin check error: ${error.message}`,
            error: error.message
          };
        }
      } else {
        results.adminRole = {
          success: false,
          message: 'No user to check',
          error: 'User not authenticated'
        };
      }

      // Check 5: Study Materials Table Access
      try {
        const { data: materialsData, error: materialsError } = await supabase
          .from('study_materials')
          .select('count')
          .limit(1);
        
        results.studyMaterialsAccess = {
          success: !materialsError,
          message: materialsError ? `Access failed: ${materialsError.message}` : 'Access successful',
          error: materialsError?.message
        };
      } catch (error: any) {
        results.studyMaterialsAccess = {
          success: false,
          message: `Access error: ${error.message}`,
          error: error.message
        };
      }

      // Check 6: Past Papers Table Access
      try {
        const { data: papersData, error: papersError } = await supabase
          .from('past_papers')
          .select('count')
          .limit(1);
        
        results.pastPapersAccess = {
          success: !papersError,
          message: papersError ? `Access failed: ${papersError.message}` : 'Access successful',
          error: papersError?.message
        };
      } catch (error: any) {
        results.pastPapersAccess = {
          success: false,
          message: `Access error: ${error.message}`,
          error: error.message
        };
      }

      // Check 7: Browser Console Errors
      results.browserConsole = {
        success: true,
        message: 'Check browser console for JavaScript errors',
        error: null
      };

    } catch (error: any) {
      console.error('Diagnostic error:', error);
      results.generalError = {
        success: false,
        message: `General error: ${error.message}`,
        error: error.message
      };
    }

    setDiagnostics(results);
    setLoading(false);
  };

  const fixAdminRole = async () => {
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'No user found to fix',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: currentUser.id,
          email: currentUser.email,
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
          description: 'Admin role set successfully. Please refresh the page.',
          variant: 'default'
        });
        // Refresh diagnostics
        setTimeout(runDiagnostics, 1000);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to set admin role: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (success: boolean) => {
    if (success) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel Diagnostic</h1>
        <p className="text-gray-600">
          This tool will help identify why your admin panel is showing a blank page.
        </p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={runDiagnostics} 
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Run Diagnostics</span>
        </Button>
      </div>

      {Object.keys(diagnostics).length > 0 && (
        <div className="space-y-4">
          {Object.entries(diagnostics).map(([key, check]: [string, any]) => (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(check.success)}
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <Badge className={getStatusColor(check.success)}>
                    {check.success ? 'PASS' : 'FAIL'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-2">{check.message}</p>
                {check.error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700 font-mono">{check.error}</p>
                  </div>
                )}
                {check.userData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                    <p className="text-sm text-blue-700">
                      <strong>User Data:</strong> {JSON.stringify(check.userData, null, 2)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {currentUser && diagnostics.adminRole && !diagnostics.adminRole.isAdmin && (
        <Card className="mt-6 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>Fix Admin Role</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">
              Your user account doesn't have admin privileges. Click the button below to set your role to admin.
            </p>
            <Button onClick={fixAdminRole} variant="outline">
              Set My Role to Admin
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-500" />
            <span>Next Steps</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-700">
            <p>1. Check the diagnostic results above to identify the issue</p>
            <p>2. If authentication fails, try logging out and back in</p>
            <p>3. If admin role check fails, use the "Fix Admin Role" button above</p>
            <p>4. Check your browser's developer console for JavaScript errors</p>
            <p>5. Ensure your Supabase project is running and accessible</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDiagnostic;
