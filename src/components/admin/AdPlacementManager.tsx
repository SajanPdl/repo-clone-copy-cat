
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AnimatedWrapper from '@/components/ui/animated-wrapper';

interface Advertisement {
  id: number;
  title: string;
  content: string | null;
  image_url: string | null;
  link_url: string | null;
  position: string;
  ad_type: string;
  is_active: boolean;
  created_at: string;
}

const AdPlacementManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    link_url: '',
    position: 'sidebar',
    ad_type: 'banner',
    is_active: true
  });
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch all advertisements
  const { data: advertisements = [], isLoading } = useQuery({
    queryKey: ['advertisements-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Advertisement[];
    }
  });

  // Create advertisement mutation
  const createAdMutation = useMutation({
    mutationFn: async (newAd: Omit<Advertisement, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('advertisements')
        .insert([newAd])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements-admin'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Advertisement created successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'Failed to create advertisement: ' + error.message,
        variant: 'destructive'
      });
    }
  });

  // Update advertisement mutation
  const updateAdMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<Advertisement>) => {
      const { data, error } = await supabase
        .from('advertisements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements-admin'] });
      setEditingAd(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Advertisement updated successfully'
      });
    }
  });

  // Delete advertisement mutation
  const deleteAdMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements-admin'] });
      toast({
        title: 'Success',
        description: 'Advertisement deleted successfully'
      });
    }
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements-admin'] });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image_url: '',
      link_url: '',
      position: 'sidebar',
      ad_type: 'banner',
      is_active: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAd) {
      updateAdMutation.mutate({ id: editingAd.id, ...formData });
    } else {
      createAdMutation.mutate(formData);
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      content: ad.content || '',
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      position: ad.position,
      ad_type: ad.ad_type,
      is_active: ad.is_active
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this advertisement?')) {
      deleteAdMutation.mutate(id);
    }
  };

  const positions = [
    { value: 'header', label: 'Header' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'content', label: 'Content Area' },
    { value: 'footer', label: 'Footer' },
    { value: 'popup', label: 'Popup' },
    { value: 'banner', label: 'Banner' }
  ];

  const adTypes = [
    { value: 'banner', label: 'Banner Ad' },
    { value: 'adsterra', label: 'Adsterra' },
    { value: 'adsense', label: 'Google AdSense' },
    { value: 'popunder', label: 'Popunder' },
    { value: 'native', label: 'Native Ad' }
  ];

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold">Ad Placement Manager</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage advertisement placements across the website
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => {
              resetForm();
              setEditingAd(null);
            }}>
              <Plus className="h-4 w-4" />
              Add New Advertisement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map(pos => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ad_type">Ad Type</Label>
                  <Select
                    value={formData.ad_type}
                    onValueChange={(value) => setFormData({ ...formData, ad_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {adTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content/Code</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="HTML content or ad code..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ad-image-upload">Ad Image (optional)</Label>
                  <Input
                    id="ad-image-upload"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setImageUploading(true);
                      try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `ad-${Date.now()}.${fileExt}`;
                        const { data, error } = await supabase.storage
                          .from('ad-images')
                          .upload(fileName, file, { upsert: true });
                        if (error) throw error;
                        const { data: urlData } = supabase.storage
                          .from('ad-images')
                          .getPublicUrl(fileName);
                        setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
                        toast({ title: 'Image uploaded', description: 'Ad image uploaded successfully.' });
                      } catch (err: any) {
                        toast({ title: 'Image upload failed', description: err.message, variant: 'destructive' });
                      } finally {
                        setImageUploading(false);
                      }
                    }}
                  />
                  {imageUploading && <div className="text-xs text-gray-500 mt-1">Uploading...</div>}
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Ad preview" className="mt-2 rounded max-h-32" />
                  )}
                </div>
                <div>
                  <Label htmlFor="link_url">Link URL (optional)</Label>
                  <Input
                    id="link_url"
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAdMutation.isPending || updateAdMutation.isPending}>
                  {editingAd ? 'Update' : 'Create'} Advertisement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Advertisements Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {advertisements.map((ad, index) => (
            <AnimatedWrapper
              key={ad.id}
              animation="slideUp"
              delay={index * 0.1}
              hover
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-medium truncate">
                        {ad.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {ad.position}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {ad.ad_type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleActiveMutation.mutate({ 
                          id: ad.id, 
                          is_active: !ad.is_active 
                        })}
                        className="h-8 w-8"
                      >
                        {ad.is_active ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {ad.image_url && (
                    <div className="aspect-video relative overflow-hidden rounded-md">
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {ad.content && (
                    <div className="max-h-20 overflow-hidden">
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {ad.content.length > 100 ? 
                          ad.content.substring(0, 100) + '...' : 
                          ad.content
                        }
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(ad)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedWrapper>
          ))}
        </motion.div>
      )}

      {advertisements.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="mx-auto max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No advertisements yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by creating your first advertisement placement.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Ad
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdPlacementManager;
