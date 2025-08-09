
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserStatsUpdate, updateUserStats, fetchAllUsers } from '@/utils/adminStatsUtils';
import { Users, TrendingUp } from 'lucide-react';

const UserStatsManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [statsUpdate, setStatsUpdate] = useState<Partial<UserStatsUpdate>>({
    points: 0,
    level: '',
    totalUploads: 0,
    totalDownloads: 0,
    totalSales: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await fetchAllUsers();
      setUsers(usersData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    }
  };

  const handleStatsUpdate = async () => {
    if (!selectedUserId) {
      toast({
        title: 'Error',
        description: 'Please select a user',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await updateUserStats({
        userId: selectedUserId,
        ...statsUpdate
      } as UserStatsUpdate);

      toast({
        title: 'Success',
        description: 'User stats updated successfully'
      });

      // Reset form
      setSelectedUserId('');
      setStatsUpdate({
        points: 0,
        level: '',
        totalUploads: 0,
        totalDownloads: 0,
        totalSales: 0
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user stats',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          User Stats Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="user-select">Select User</Label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div>
                    <div><b>{user.email}</b></div>
                    {user.user_metadata?.full_name && <div>Name: {user.user_metadata.full_name}</div>}
                    {user.phone && <div>Phone: {user.phone}</div>}
                    <div>ID: {user.id}</div>
                    <div>Created: {user.created_at ? new Date(user.created_at).toLocaleString() : ''}</div>
                    {user.last_sign_in_at && <div>Last Sign In: {new Date(user.last_sign_in_at).toLocaleString()}</div>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              value={statsUpdate.points || 0}
              onChange={(e) => setStatsUpdate(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <Label htmlFor="level">Level</Label>
            <Select value={statsUpdate.level} onValueChange={(value) => setStatsUpdate(prev => ({ ...prev, level: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fresh Contributor">Fresh Contributor</SelectItem>
                <SelectItem value="Active Learner">Active Learner</SelectItem>
                <SelectItem value="Knowledge Sharer">Knowledge Sharer</SelectItem>
                <SelectItem value="Note Lord">Note Lord</SelectItem>
                <SelectItem value="Top Seller">Top Seller</SelectItem>
                <SelectItem value="Education Master">Education Master</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="uploads">Total Uploads</Label>
            <Input
              id="uploads"
              type="number"
              value={statsUpdate.totalUploads || 0}
              onChange={(e) => setStatsUpdate(prev => ({ ...prev, totalUploads: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <Label htmlFor="downloads">Total Downloads</Label>
            <Input
              id="downloads"
              type="number"
              value={statsUpdate.totalDownloads || 0}
              onChange={(e) => setStatsUpdate(prev => ({ ...prev, totalDownloads: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <Label htmlFor="sales">Total Sales</Label>
            <Input
              id="sales"
              type="number"
              value={statsUpdate.totalSales || 0}
              onChange={(e) => setStatsUpdate(prev => ({ ...prev, totalSales: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <Button onClick={handleStatsUpdate} disabled={loading} className="w-full">
          {loading ? 'Updating...' : 'Update User Stats'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserStatsManager;
