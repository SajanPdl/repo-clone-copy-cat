import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const AdminSetupHelper = () => {
  const [loading, setLoading] = useState(false);
  const [checks, setChecks] = useState<any>({});
  const { toast } = useToast();

  const runAdminChecks = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Check 1: Authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      results.auth = {
        success: !!user && !authError,
        message: user ? `Authenticated as ${user.email}` : 'Not authenticated',
        error: authError?.message
      };

      if (user) {
        // Check 2: User exists in public.users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        results.userTable = {
          success: !!userData && !userError,
          message: userData ? `Role: ${userData.role}` : 'User not found in users table',
          error: userError?.message
        };

        // Check 3: Admin role
        results.adminRole = {
          success: userData?.role === 'admin',
          message: userData?.role === 'admin' ? 'User has admin role' : 'User does not have admin role',
          error: userData?.role !== 'admin' ? 'Role is not admin' : null
        };

        // Check 4: is_admin function
        const { data: isAdminResult, error: isAdminError } = await supabase.rpc('is_admin', {
          user_id: user.id
        });

        results.isAdminFunction = {
          success: isAdminResult === true,
          message: isAdminResult === true ? 'is_admin function returns true' : 'is_admin function returns false',
          error: isAdminError?.message
        };

        // Check 5: Database tables
        const { data: studyMaterials, error: smError } = await supabase
          .from('study_materials')
          .select('count', { count: 'exact', head: true });

        results.studyMaterialsTable = {
          success: !smError,
          message: smError ? 'Error accessing study_materials table' : 'study_materials table accessible',
          error: smError?.message
        };

        const { data: pastPapers, error: ppError } = await supabase
          .from('past_papers')
          .select('count', { count: 'exact', head: true });

        results.pastPapersTable = {
          success: !ppError,
          message: ppError ? 'Error accessing past_papers table' : 'past_papers table accessible',
          error: ppError?.message
        };
      }

      setChecks(results);
    } catch (error: any) {
      console.error('Error running admin checks:', error);
      toast({
        title: 'Error',
        description: 'Failed to run admin checks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const setupAdminRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'Please log in first',
          variant: 'destructive'
        });
        return;
      }

      // Insert or update user with admin role
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email || '',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Admin role has been set up. Please refresh the page.'
      });

      // Re-run checks
      setTimeout(() => runAdminChecks(), 1000);
    } catch (error: any) {
      console.error('Error setting up admin role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to set up admin role',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (success: boolean) => {
    if (success) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (success === false) return <XCircle className="h-5 w-5 text-red-500" />;
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusBadge = (success: boolean) => {
    if (success) return <Badge variant="secondary" className="bg-green-100 text-green-800">Pass</Badge>;
    if (success === false) return <Badge variant="destructive">Fail</Badge>;
    return <Badge variant="outline">Unknown</Badge>;
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Admin Panel Setup Helper
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-gray-600">
          <p>This helper will check your admin setup and guide you through fixing any issues.</p>
          <p className="mt-2">
            <strong>Note:</strong> You need to be logged in to use this helper.
          </p>
        </div>

        <div className="flex gap-4">
          <Button onClick={runAdminChecks} disabled={loading}>
            {loading ? 'Running Checks...' : 'Run Admin Checks'}
          </Button>
          
          {checks.adminRole?.success === false && (
            <Button onClick={setupAdminRole} variant="outline">
              Set Up Admin Role
            </Button>
          )}
        </div>

        {Object.keys(checks).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Check Results:</h3>
            
            {Object.entries(checks).map(([key, check]: [string, any]) => (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.success)}
                  <div>
                    <h4 className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-gray-600">{check.message}</p>
                    {check.error && (
                      <p className="text-sm text-red-600 mt-1">{check.error}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(check.success)}
              </div>
            ))}

            {checks.adminRole?.success === false && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Admin Role Not Set</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Your user account doesn't have admin privileges. Click "Set Up Admin Role" above to fix this.
                </p>
                <p className="text-xs text-yellow-600">
                  <strong>Note:</strong> This will only work if you're the first user or if you have database access.
                </p>
              </div>
            )}

            {Object.values(checks).every((check: any) => check.success === true) && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">All Checks Passed!</h4>
                <p className="text-sm text-green-700">
                  Your admin panel is properly configured and should work correctly.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 border-t pt-4">
          <p><strong>Troubleshooting Tips:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Make sure you're logged in with the correct account</li>
            <li>Check that the database migration has been run</li>
            <li>Verify that RLS policies are properly configured</li>
            <li>Ensure the is_admin function exists and works</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSetupHelper;
