
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Edit, Trash2, UserPlus, Eye, Shield, Mail } from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface UserQuery {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userQueries, setUserQueries] = useState<UserQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchUserQueries();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserQueries = async () => {
    try {
      const { data, error } = await supabase
        .from('user_queries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserQueries(data || []);
    } catch (error: any) {
      console.error('Error fetching user queries:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const updateUserRole = async (userId: string, newRole: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          role: newRole, 
          is_admin: isAdmin,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully"
      });

      fetchUsers();
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully"
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const getUserQueryCount = (userId: string) => {
    return userQueries.filter(query => query.email === users.find(u => u.id === userId)?.email).length;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAdminBadge = (isAdmin: boolean) => {
    return isAdmin ? (
      <Badge className="bg-purple-100 text-purple-800 ml-2">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    ) : null;
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Total Users: {users.length}
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by email or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="moderator">Moderators</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Queries</th>
                  <th className="text-left p-3 font-medium">Joined</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                        {getAdminBadge(user.is_admin)}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">
                        {getUserQueryCount(user.id)} queries
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setUserDetailsDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {user.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={selectedUser.email} disabled />
              </div>
              <div>
                <Label>Role</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value) => setSelectedUser({...selectedUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={selectedUser.is_admin}
                  onChange={(e) => setSelectedUser({...selectedUser, is_admin: e.target.checked})}
                />
                <Label htmlFor="isAdmin">Is Admin</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => updateUserRole(selectedUser.id, selectedUser.role, selectedUser.is_admin)}>
                  Update User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={userDetailsDialogOpen} onOpenChange={setUserDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">User ID</Label>
                  <p className="text-sm font-mono">{selectedUser.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Role</Label>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Admin Status</Label>
                  <Badge variant={selectedUser.is_admin ? "default" : "secondary"}>
                    {selectedUser.is_admin ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created</Label>
                  <p className="text-sm">{new Date(selectedUser.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                  <p className="text-sm">{new Date(selectedUser.updated_at).toLocaleString()}</p>
                </div>
              </div>

              {/* User Queries */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Support Queries</Label>
                <div className="mt-2 space-y-2">
                  {userQueries
                    .filter(query => query.email === selectedUser.email)
                    .slice(0, 5)
                    .map(query => (
                      <div key={query.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{query.subject}</h4>
                          <Badge className={getRoleColor(query.status)}>
                            {query.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{query.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(query.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  {userQueries.filter(query => query.email === selectedUser.email).length === 0 && (
                    <p className="text-sm text-gray-500">No support queries found</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
