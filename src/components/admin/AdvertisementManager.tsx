
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Edit, Trash2, Plus, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Advertisement {
  id: number;
  title: string;
  content?: string;
  image_url?: string;
  link_url?: string;
  position: string;
  ad_type: string;
  is_active: boolean;
  created_at: string;
}

const AdvertisementManager = () => {
  const { toast } = useToast();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    link_url: '',
    position: 'sidebar',
    ad_type: 'banner',
    is_active: true
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch advertisements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAd) {
        const { error } = await supabase
          .from('advertisements')
          .update(formData)
          .eq('id', editingAd.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Advertisement updated successfully' });
      } else {
        const { error } = await supabase
          .from('advertisements')
          .insert([formData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Advertisement created successfully' });
      }

      resetForm();
      fetchAds();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast({
        title: 'Error',
        description: 'Failed to save advertisement',
        variant: 'destructive'
      });
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
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Advertisement deleted successfully' });
      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete advertisement',
        variant: 'destructive'
      });
    }
  };

  const toggleStatus = async (id: number, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
      fetchAds();
      toast({ 
        title: 'Success', 
        description: `Advertisement ${is_active ? 'activated' : 'deactivated'}` 
      });
    } catch (error) {
      console.error('Error updating ad status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update advertisement status',
        variant: 'destructive'
      });
    }
  };

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
    setEditingAd(null);
    setShowForm(false);
  };

  const AdPreview = ({ ad }: { ad: Advertisement }) => {
    if (ad.ad_type === 'banner' && ad.image_url) {
      return (
        <div className="border rounded-lg p-4 bg-white">
          <img 
            src={ad.image_url} 
            alt={ad.title}
            className="w-full h-32 object-cover rounded mb-2"
          />
          <h4 className="font-medium">{ad.title}</h4>
          {ad.content && <p className="text-sm text-gray-600 mt-1">{ad.content}</p>}
        </div>
      );
    }

    if (ad.ad_type === 'text') {
      return (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h4 className="font-medium text-blue-900">{ad.title}</h4>
          {ad.content && <p className="text-sm text-blue-700 mt-1">{ad.content}</p>}
        </div>
      );
    }

    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium">{ad.title}</h4>
        <p className="text-sm text-gray-600">Preview not available for this ad type</p>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading advertisements...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advertisement Management</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Advertisement
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingAd ? 'Edit' : 'Create'} Advertisement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ad_type">Ad Type</Label>
                  <Select value={formData.ad_type} onValueChange={(value) => setFormData(prev => ({ ...prev, ad_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ad type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="popup">Popup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="link_url">Link URL</Label>
                  <Input
                    id="link_url"
                    value={formData.link_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="pdf_viewer_top">PDF Viewer Top</SelectItem>
                      <SelectItem value="pdf_viewer_bottom">PDF Viewer Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAd ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Advertisements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <Card key={ad.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{ad.title}</h3>
                  <p className="text-sm text-gray-600">
                    {ad.position} • {ad.ad_type}
                  </p>
                </div>
                <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                  {ad.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {ad.content && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {ad.content}
                </p>
              )}

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Preview: {ad.title}</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <AdPreview ad={ad} />
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button size="sm" variant="outline" onClick={() => handleEdit(ad)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(ad.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <Switch
                  checked={ad.is_active}
                  onCheckedChange={(checked) => toggleStatus(ad.id, checked)}
                />
              </div>

              <div className="mt-3 text-xs text-gray-400">
                Created: {new Date(ad.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ads.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-xl font-semibold mb-2">No advertisements yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first advertisement to start displaying ads on your site.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Advertisement
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdvertisementManager;
