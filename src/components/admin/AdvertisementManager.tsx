
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BadgePercent, DollarSign, Megaphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Advertisement = Tables<'advertisements'>;

const AdvertisementManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newAdOpen, setNewAdOpen] = useState(false);
  const [previewAdOpen, setPreviewAdOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  
  // Fetch advertisements
  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['advertisements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
  
  // Mutations for CRUD operations
  const createMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      toast({
        title: "Success",
        description: "Advertisement created successfully"
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Advertisement> & { id: number }) => {
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
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      toast({
        title: "Success",
        description: "Advertisement deleted successfully"
      });
    }
  });
  
  const [formData, setFormData] = useState({
    title: '',
    position: 'sidebar' as 'sidebar' | 'content' | 'footer' | 'header',
    content: '',
    image_url: '',
    link_url: '',
    ad_type: 'banner'
  });
  
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = () => {
    if (!formData.title) {
      toast({
        title: "Error",
        description: "Title is required.",
        variant: "destructive"
      });
      return;
    }
    
    createMutation.mutate({
      title: formData.title,
      content: formData.content,
      image_url: formData.image_url,
      link_url: formData.link_url,
      position: formData.position,
      ad_type: formData.ad_type,
      is_active: true
    });
    
    setFormData({
      title: '',
      position: 'sidebar',
      content: '',
      image_url: '',
      link_url: '',
      ad_type: 'banner'
    });
    
    setNewAdOpen(false);
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this advertisement?")) {
      deleteMutation.mutate(id);
    }
  };
  
  const handleToggleActive = (id: number) => {
    const ad = ads.find(a => a.id === id);
    if (ad) {
      updateMutation.mutate({
        id,
        is_active: !ad.is_active
      });
    }
  };
  
  const handlePreview = (ad: Advertisement) => {
    setSelectedAd(ad);
    setPreviewAdOpen(true);
  };
  
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advertisement Manager</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage advertisements displayed across the website
          </p>
        </div>
        <Button onClick={() => setNewAdOpen(true)}>
          <Megaphone className="mr-2 h-4 w-4" /> Add New Advertisement
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {ads.length > 0 ? (
            ads.map((ad) => (
              <Card key={ad.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Megaphone className="h-5 w-5 text-indigo-600" />
                      <CardTitle className="text-lg">{ad.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`px-2 py-1 ${ad.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {ad.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge className="capitalize px-2 py-1 bg-blue-100 text-blue-800">
                        {ad.position}
                      </Badge>
                      <Badge className="capitalize px-2 py-1 bg-purple-100 text-purple-800">
                        {ad.ad_type}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{ad.content || 'No description provided'}</CardDescription>
                </CardHeader>
                <CardContent>
                  {ad.image_url && (
                    <div className="mb-2">
                      <img src={ad.image_url} alt={ad.title} className="w-full h-32 object-cover rounded" />
                    </div>
                  )}
                  {ad.link_url && (
                    <div className="text-xs text-blue-600 mb-2">
                      Link: {ad.link_url}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2">
                  <Button onClick={() => handleToggleActive(ad.id)} variant="outline" size="sm">
                    {ad.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button onClick={() => handlePreview(ad)} variant="outline" size="sm">
                    Preview
                  </Button>
                  <Button onClick={() => handleDelete(ad.id)} variant="destructive" size="sm">
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No advertisements found</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                You haven't created any advertisements yet. Click "Add New Advertisement" to get started.
              </p>
              <Button className="mt-4" onClick={() => setNewAdOpen(true)}>
                Add Advertisement
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* New Ad Dialog */}
      <Dialog open={newAdOpen} onOpenChange={setNewAdOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Advertisement</DialogTitle>
            <DialogDescription>
              Add a new advertisement to display on the website
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                placeholder="Advertisement Title" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <Select 
                value={formData.position} 
                onValueChange={(value) => handleSelectChange('position', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                  <SelectItem value="header">Header</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ad Type</label>
              <Select 
                value={formData.ad_type} 
                onValueChange={(value) => handleSelectChange('ad_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ad type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="adsterra">Adsterra</SelectItem>
                  <SelectItem value="adsense">Google AdSense</SelectItem>
                  <SelectItem value="popunder">Popunder</SelectItem>
                  <SelectItem value="native">Native Ad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea 
                name="content" 
                value={formData.content} 
                onChange={handleInputChange} 
                placeholder="Advertisement content or description" 
                className="h-24"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL (optional)</label>
              <Input 
                name="image_url" 
                value={formData.image_url} 
                onChange={handleInputChange} 
                placeholder="https://example.com/image.jpg" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Link URL (optional)</label>
              <Input 
                name="link_url" 
                value={formData.link_url} 
                onChange={handleInputChange} 
                placeholder="https://example.com" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewAdOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Advertisement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Ad Preview Dialog */}
      <Dialog open={previewAdOpen} onOpenChange={setPreviewAdOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Advertisement Preview</DialogTitle>
            <DialogDescription>
              Preview how the advertisement will appear on the website
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedAd && (
              <div className="border rounded-md p-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">{selectedAd.title}</h3>
                  {selectedAd.image_url && (
                    <img src={selectedAd.image_url} alt={selectedAd.title} className="w-full h-48 object-cover rounded" />
                  )}
                  <p className="text-gray-600">{selectedAd.content}</p>
                  {selectedAd.link_url && (
                    <a href={selectedAd.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {selectedAd.link_url}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setPreviewAdOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvertisementManager;
