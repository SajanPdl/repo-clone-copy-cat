
import React, { useState, useEffect } from 'react';
import { useAds } from '../ads/AdsProvider';
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
import { Badge } from "lucide-react";
import { BadgePercent, DollarSign, Megaphone } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import AdManager from '../ads/AdManager';
import { Ad } from '@/utils/adsUtils';

const AdvertisementManager = () => {
  const { ads, addAd, removeAd, toggleAd, isLoading, refreshAds } = useAds();
  const [newAdOpen, setNewAdOpen] = useState(false);
  const [previewAdOpen, setPreviewAdOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'sponsor' as 'sponsor' | 'adsterra' | 'adsense',
    position: 'sidebar' as 'sidebar' | 'content' | 'footer' | 'header',
    adCode: '',
    description: ''
  });
  
  // Load ads on mount
  useEffect(() => {
    refreshAds();
  }, []);
  
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
    if (!formData.title || !formData.adCode) {
      toast({
        title: "Error",
        description: "Title and Ad Code are required.",
        variant: "destructive"
      });
      return;
    }
    
    addAd({
      ...formData,
      active: true
    });
    
    setFormData({
      title: '',
      type: 'sponsor',
      position: 'sidebar',
      adCode: '',
      description: ''
    });
    
    setNewAdOpen(false);
  };
  
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this advertisement?")) {
      removeAd(id);
    }
  };
  
  const handleToggleActive = (id: string) => {
    toggleAd(id);
  };
  
  const handlePreview = (ad: Ad) => {
    setSelectedAd(ad);
    setPreviewAdOpen(true);
  };
  
  const getAdTypeIcon = (type: string) => {
    switch (type) {
      case 'sponsor':
        return <Badge className="h-5 w-5 text-indigo-600" />;
      case 'adsense':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'adsterra':
        return <BadgePercent className="h-5 w-5 text-orange-600" />;
      default:
        return <Megaphone className="h-5 w-5 text-gray-600" />;
    }
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
        <div className="flex gap-2">
          <Button onClick={() => refreshAds()} variant="outline">
            Refresh
          </Button>
          <Button onClick={() => setNewAdOpen(true)}>
            <Megaphone className="mr-2 h-4 w-4" /> Add New Advertisement
          </Button>
        </div>
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
                      {getAdTypeIcon(ad.type)}
                      <CardTitle className="text-lg">{ad.title || `${ad.type} (${ad.position})`}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`px-2 py-1 ${ad.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {ad.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge className="capitalize px-2 py-1 bg-blue-100 text-blue-800">
                        {ad.position}
                      </Badge>
                      <Badge className="capitalize px-2 py-1 bg-purple-100 text-purple-800">
                        {ad.type}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{ad.description || 'No description provided'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs overflow-hidden text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                    <code className="line-clamp-2">{ad.adCode}</code>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2">
                  <Button onClick={() => handleToggleActive(ad.id)} variant="outline" size="sm">
                    {ad.active ? 'Deactivate' : 'Activate'}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sponsor">Sponsor</SelectItem>
                    <SelectItem value="adsense">Google AdSense</SelectItem>
                    <SelectItem value="adsterra">Adsterra</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Input 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Brief description of the advertisement" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ad Code</label>
              <Textarea 
                name="adCode" 
                value={formData.adCode} 
                onChange={handleInputChange} 
                placeholder="Paste HTML, JS or custom advertisement code here" 
                className="h-24 font-mono text-xs"
              />
              <p className="text-xs text-gray-500">
                For sponsor ads, you can use HTML. For third-party ads, paste their provided code.
              </p>
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
                <AdManager
                  position={selectedAd.position}
                  type={selectedAd.type}
                  adCode={selectedAd.adCode}
                  visible={true}
                />
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
