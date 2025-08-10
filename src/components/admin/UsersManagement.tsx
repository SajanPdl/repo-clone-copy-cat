
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, UserCheck, UserX, Crown, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface User {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  role?: string;
  points?: number;
  level?: string;
  university?: string;
  course?: string;
  year_of_study?: number;
}

const UsersManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First, check if the current user is authenticated and has admin role
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Check if user has admin role using the is_admin function
      const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin', {
        user_id: user.id
      });
      
      if (isAdminError) {
        console.error('Error checking admin status:', isAdminError);
        throw new Error('Unable to verify admin access');
      }
      
      if (!isAdminData) {
        throw new Error('Admin access required. Please contact an administrator to grant you admin privileges.');
      }
      
      console.log('Admin access verified for user:', user.id, user.email);

      // Get users from both users table and student_profiles table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');

      const { data: profilesData, error: profilesError } = await supabase
        .from('student_profiles')
        .select('*');

      if (!usersError && !profilesError && usersData && profilesData) {
        // Create a map of profiles by user_id for quick lookup
        const profilesMap = new Map(profilesData.map((profile: any) => [profile.user_id, profile]));
        
        // Combine user data with profile data
        const combinedUsers = usersData.map((user: any) => {
          const profile = profilesMap.get(user.id);
          return {
            id: user.id,
            email: user.email,
            phone: null, // We don't have phone in users table
            created_at: user.created_at,
            last_sign_in_at: user.updated_at, // Using updated_at as last activity
            user_metadata: {},
            app_metadata: { role: user.role },
            role: user.role,
            points: profile?.points || 0,
            level: profile?.level || 'Fresh Contributor',
            university: profile?.university,
            course: profile?.course,
            year_of_study: profile?.year_of_study
          };
        });
        
        setUsers(combinedUsers);
        return;
      }

      // Fallback: if users table doesn't exist, use only profiles
      if (!profilesError && profilesData) {
        const usersFromProfiles = profilesData.map((profile: any) => ({
          id: profile.user_id,
          email: `user-${profile.user_id.slice(0, 8)}@example.com`, // Placeholder email
          phone: null,
          created_at: profile.created_at,
          last_sign_in_at: profile.updated_at,
          user_metadata: {},
          app_metadata: { role: 'user' },
          role: 'user',
          points: profile.points || 0,
          level: profile.level || 'Fresh Contributor',
          university: profile.university,
          course: profile.course,
          year_of_study: profile.year_of_study
        }));
        
        setUsers(usersFromProfiles);
        return;
      }

      // If no profiles found, show empty state
      setUsers([]);

    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Update user role in the public.users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Success',
        description: `User role updated to ${newRole}`,
      });

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive'
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getUserStats = () => {
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    // For active users, you may want to use last_sign_in_at or other logic
    const activeUsers = users.filter(u => u.last_sign_in_at).length;
    const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);
    const avgPoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;
    return { totalUsers, adminUsers, activeUsers, totalPoints, avgPoints };
  };

  const { totalUsers, adminUsers, activeUsers, totalPoints, avgPoints } = getUserStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admin Users</p>
                <p className="text-2xl font-bold">{adminUsers}</p>
              </div>
              <Crown className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{activeUsers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <Badge variant="outline">
                        {user.level || 'Fresh Contributor'}
                      </Badge>
                      {user.points !== undefined && (
                        <span className="text-sm text-gray-500">{user.points} pts</span>
                      )}
                      {user.phone && (
                        <span className="text-sm text-gray-500">{user.phone}</span>
                      )}
                    </div>
                    {(user.university || user.course) && (
                      <div className="text-sm text-gray-500 mt-1">
                        {user.university} {user.course && `• ${user.course}`} {user.year_of_study && `• Year ${user.year_of_study}`}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                      </DialogHeader>
                      {selectedUser && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Email</label>
                              <p className="font-medium">{selectedUser.email}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Role</label>
                              <p className="font-medium">{selectedUser.role}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Level</label>
                              <p className="font-medium">{selectedUser.level || 'Fresh Contributor'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Points</label>
                              <p className="font-medium">{selectedUser.points || 0}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Joined</label>
                              <p className="font-medium">{new Date(selectedUser.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Last Sign In</label>
                              <p className="font-medium">{selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString() : 'Never'}</p>
                            </div>
                            {selectedUser.phone && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Phone</label>
                                <p className="font-medium">{selectedUser.phone}</p>
                              </div>
                            )}
                            {selectedUser.university && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">University</label>
                                <p className="font-medium">{selectedUser.university}</p>
                              </div>
                            )}
                            {selectedUser.course && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Course</label>
                                <p className="font-medium">{selectedUser.course}</p>
                              </div>
                            )}
                            {selectedUser.year_of_study && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Year of Study</label>
                                <p className="font-medium">{selectedUser.year_of_study}</p>
                              </div>
                            )}
                          </div>
                          <div className="border-t pt-4">
                            <label className="text-sm font-medium text-gray-500">Change Role</label>
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant={selectedUser.role === 'user' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateUserRole(selectedUser.id, 'user')}
                              >
                                User
                              </Button>
                              <Button
                                variant={selectedUser.role === 'admin' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateUserRole(selectedUser.id, 'admin')}
                              >
                                Admin
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <UserX className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your search or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;
