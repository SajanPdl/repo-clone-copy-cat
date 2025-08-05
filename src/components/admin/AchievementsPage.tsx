
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Award, Medal, Star, Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Achievement {
  id: string;
  name: string;
  description: string;
  points_required: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  is_system_generated: boolean;
}

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

const AchievementsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: 0,
    rarity: 'common' as const,
    icon: 'trophy'
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch achievements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAchievement) {
        const { error } = await supabase
          .from('achievements')
          .update({
            name: formData.name,
            description: formData.description,
            points_required: formData.points_required,
            rarity: formData.rarity,
            icon: formData.icon
          })
          .eq('id', editingAchievement.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Achievement updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('achievements')
          .insert([{
            name: formData.name,
            description: formData.description,
            points_required: formData.points_required,
            rarity: formData.rarity,
            icon: formData.icon,
            is_system_generated: false
          }]);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Achievement created successfully'
        });
      }

      setShowCreateDialog(false);
      setEditingAchievement(null);
      setFormData({
        name: '',
        description: '',
        points_required: 0,
        rarity: 'common',
        icon: 'trophy'
      });
      fetchAchievements();
    } catch (error) {
      console.error('Error saving achievement:', error);
      toast({
        title: 'Error',
        description: 'Failed to save achievement',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      name: achievement.name,
      description: achievement.description,
      points_required: achievement.points_required,
      rarity: achievement.rarity,
      icon: achievement.icon
    });
    setShowCreateDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Achievement deleted successfully'
      });
      fetchAchievements();
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete achievement',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Achievement Management</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Achievement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAchievement ? 'Edit Achievement' : 'Create New Achievement'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Points Required</label>
                <Input
                  type="number"
                  value={formData.points_required}
                  onChange={(e) => setFormData({...formData, points_required: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rarity</label>
                <Select value={formData.rarity} onValueChange={(value: any) => setFormData({...formData, rarity: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAchievement ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => {
          const Icon = rarityIcons[achievement.rarity];
          return (
            <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 ${rarityColors[achievement.rarity]} rounded`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="font-semibold">{achievement.name}</h4>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(achievement)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(achievement.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                <div className="flex justify-between items-center text-xs">
                  <span>Points: {achievement.points_required}</span>
                  <Badge variant={achievement.is_system_generated ? 'default' : 'secondary'}>
                    {achievement.is_system_generated ? 'System' : 'Custom'}
                  </Badge>
                  <Badge variant="outline" className={`${rarityColors[achievement.rarity]} text-white`}>
                    {achievement.rarity}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
          <p className="text-gray-600 mb-4">Create your first achievement to get started.</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;
