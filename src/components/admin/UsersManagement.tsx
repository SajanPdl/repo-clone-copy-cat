
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
// import { supabase } from '@/integrations/supabase/client';
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
      // Use explicit local URL in development, fallback to relative in production
      const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:54321/functions/v1/get-users'
        : '/functions/v1/get-users';
      const res = await fetch(apiUrl);
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        // Not JSON, likely HTML error page
        throw new Error('The server did not return valid JSON. The Edge Function may not be running or the URL is incorrect.');
      }
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }
      const { users } = data;
      setUsers((users || []).map((u: any) => ({ ...u, role: u.app_metadata?.role || 'user' })));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // In a real app, you'd need an edge function to update auth.users metadata
      // For now, we'll just show a success message
      toast({
        title: 'Success',
        description: `User role would be updated to ${newRole} (demo mode)`,
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
    return { totalUsers, adminUsers, activeUsers };
  };

  const { totalUsers, adminUsers, activeUsers } = getUserStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                      {user.phone && (
                        <span className="text-sm text-gray-500">{user.phone}</span>
                      )}
                      {user.user_metadata?.full_name && (
                        <span className="text-sm text-gray-500">{user.user_metadata.full_name}</span>
                      )}
                    </div>
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
                            {selectedUser.user_metadata?.full_name && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Name</label>
                                <p className="font-medium">{selectedUser.user_metadata.full_name}</p>
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
