
import React, { useState } from 'react';
import { useAds } from '../ads/AdsProvider';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BadgeDollarSign, BadgePercent, DollarSign, Megaphone, MegaphoneOff, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const AdSettingsManager = () => {
  const { ads, toggleAd, addAd, removeAd, isUserPremium, setIsUserPremium } = useAds();
  
  const [newAd, setNewAd] = useState({
    type: 'sponsor',
    position: 'sidebar',
    adCode: '',
  });
  
  const handleAddAd = () => {
    if (!newAd.adCode.trim()) {
      toast.error('Please enter ad code or content');
      return;
    }
    
    addAd({
      type: newAd.type as any,
      position: newAd.position as any,
      adCode: newAd.adCode,
      active: true
    });
    
    // Reset form
    setNewAd({
      type: 'sponsor',
      position: 'sidebar',
      adCode: '',
    });
    
    toast.success('Advertisement added successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advertisement Settings</h2>
        <div className="flex items-center space-x-2">
          <Label htmlFor="premium-mode">Premium Mode (No Ads)</Label>
          <Switch 
            id="premium-mode" 
            checked={isUserPremium} 
            onCheckedChange={setIsUserPremium} 
          />
        </div>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Ads</TabsTrigger>
          <TabsTrigger value="add">Add New Ad</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-6">
          {ads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ads.map(ad => (
                <Card key={ad.id} className={!ad.active ? "opacity-70" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge 
                          variant="outline" 
                          className={
                            ad.type === 'sponsor' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' 
                              : ad.type === 'adsense' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                          }
                        >
                          {ad.type}
                        </Badge>
                        <Badge variant="outline" className="ml-2">
                          {ad.position}
                        </Badge>
                      </div>
                      
                      <Switch 
                        checked={ad.active} 
                        onCheckedChange={() => toggleAd(ad.id)} 
                      />
                    </div>
                    <CardTitle className="text-sm mt-2">{ad.id}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-2">
                    <div className="max-h-32 overflow-auto border border-gray-200 dark:border-gray-700 rounded p-2 text-xs bg-gray-50 dark:bg-gray-800">
                      {ad.adCode.length > 200 ? ad.adCode.substring(0, 200) + '...' : ad.adCode}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        removeAd(ad.id);
                        toast.success('Advertisement removed');
                      }}
                    >
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 border border-dashed rounded-lg">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Advertisements</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                You haven't added any advertisements yet.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Advertisement</CardTitle>
              <CardDescription>
                Create a new advertisement to show on your website
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ad-type">Ad Type</Label>
                  <Select
                    value={newAd.type}
                    onValueChange={(value) => setNewAd(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ad type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sponsor">Sponsor</SelectItem>
                      <SelectItem value="adsense">Google AdSense</SelectItem>
                      <SelectItem value="adsterra">Adsterra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="ad-position">Position</Label>
                  <Select
                    value={newAd.position}
                    onValueChange={(value) => setNewAd(prev => ({ ...prev, position: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="content">Content (Top)</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                      <SelectItem value="header">Header</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="ad-code">Ad Code / Content</Label>
                <Textarea
                  id="ad-code"
                  placeholder={newAd.type === 'sponsor' 
                    ? 'HTML content for your sponsor ad' 
                    : newAd.type === 'adsense' 
                      ? 'Paste your Google AdSense code here' 
                      : 'Paste your Adsterra code here'
                  }
                  rows={6}
                  value={newAd.adCode}
                  onChange={(e) => setNewAd(prev => ({ ...prev, adCode: e.target.value }))}
                />
              </div>
              
              {newAd.type === 'adsense' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center mb-2">
                    <BadgeDollarSign className="h-4 w-4 mr-1" />
                    Google AdSense Tips
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-400 list-disc list-inside space-y-1">
                    <li>Add the full AdSense code snippet including the &lt;script&gt; tags</li>
                    <li>Make sure your AdSense account is approved before displaying ads</li>
                    <li>Use responsive ad units for better display across devices</li>
                  </ul>
                </div>
              )}
              
              {newAd.type === 'adsterra' && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-md">
                  <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300 flex items-center mb-2">
                    <BadgePercent className="h-4 w-4 mr-1" />
                    Adsterra Tips
                  </h4>
                  <ul className="text-xs text-orange-700 dark:text-orange-400 list-disc list-inside space-y-1">
                    <li>Add the complete Adsterra code including all script tags</li>
                    <li>Social Bar and Native Banner ads typically have higher engagement</li>
                    <li>Review Adsterra's compliance policies to ensure your site meets requirements</li>
                  </ul>
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full"
                onClick={handleAddAd}
              >
                <Settings className="h-4 w-4 mr-2" />
                Add Advertisement
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdSettingsManager;
