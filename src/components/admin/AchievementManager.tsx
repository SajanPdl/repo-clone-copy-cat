
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSecureAuth as useAuth } from '@/hooks/useSecureAuth';
import { 
  fetchAllAchievements, 
  fetchAllUsers, 
  grantAchievementToUser,
  Achievement 
} from '@/utils/adminStatsUtils';
import { Trophy, Award, Medal, Star } from 'lucide-react';

const rarityColors = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500'
};

const rarityIcons = {
  common: Star,
  rare: Medal,
  epic: Award,
  legendary: Trophy
};

const AchievementManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedAchievementId, setSelectedAchievementId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [achievementsData, usersData] = await Promise.all([
        fetchAllAchievements(),
        fetchAllUsers()
      ]);
      setAchievements(achievementsData);
      setUsers(usersData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive'
      });
    }
  };

  const handleGrantAchievement = async () => {
    if (!selectedUserId || !selectedAchievementId || !user) {
      toast({
        title: 'Error',
        description: 'Please select both user and achievement',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await grantAchievementToUser(selectedUserId, selectedAchievementId, user.id);
      
      toast({
        title: 'Success',
        description: 'Achievement granted successfully'
      });

      setSelectedUserId('');
      setSelectedAchievementId('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to grant achievement',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Grant Achievement to User
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email} ({user.username || 'No username'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={selectedAchievementId} onValueChange={setSelectedAchievementId}>
              <SelectTrigger>
                <SelectValue placeholder="Select achievement" />
              </SelectTrigger>
              <SelectContent>
                {achievements.map((achievement) => (
                  <SelectItem key={achievement.id} value={achievement.id}>
                    {achievement.name} - {achievement.points_required} points
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGrantAchievement} disabled={loading} className="w-full">
            {loading ? 'Granting...' : 'Grant Achievement'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const Icon = rarityIcons[achievement.rarity];
              return (
                <div key={achievement.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 ${rarityColors[achievement.rarity]} rounded`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="font-semibold">{achievement.name}</h4>
                    </div>
                    <Badge variant={achievement.is_system_generated ? 'default' : 'secondary'}>
                      {achievement.is_system_generated ? 'Auto' : 'Manual'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Points: {achievement.points_required}</span>
                    <Badge variant="outline" className={`text-xs ${rarityColors[achievement.rarity]} text-white`}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementManager;
