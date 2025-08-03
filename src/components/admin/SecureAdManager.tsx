
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSecureAuth as useAuth } from '@/hooks/useSecureAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateAndSanitizeFormData } from '@/utils/inputValidation';
import { securityUtils } from '@/utils/securityUtils';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

interface Advertisement {
  id: number;
  title: string;
  content: string;
  image_url: string;
  link_url: string;
  position: string;
  ad_type: string;
  is_active: boolean;
  created_at: string;
}

const SecureAdManager = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    link_url: '',
    position: 'sidebar',
    ad_type: 'banner'
  });

  // Security check - only admins can access
  useEffect(() => {
    if (user && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this feature',
        variant: 'destructive'
      });
      return;
    }
  }, [user, isAdmin, toast]);

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

  useEffect(() => {
    if (user && isAdmin) {
      fetchAds();
    }
  }, [user, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Admin privileges required',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Enhanced security validation
      const sanitizedData = validateAndSanitizeFormData(formData);
      
      if (!sanitizedData.title || !sanitizedData.content) {
        toast({
          title: 'Validation Error',
          description: 'Title and content are required',
          variant: 'destructive'
        });
        return;
      }

      // Validate URLs
      if (sanitizedData.image_url && !isValidUrl(sanitizedData.image_url)) {
        toast({
          title: 'Validation Error',
          description: 'Invalid image URL',
          variant: 'destructive'
        });
        return;
      }

      if (sanitizedData.link_url && !isValidUrl(sanitizedData.link_url)) {
        toast({
          title: 'Validation Error',
          description: 'Invalid link URL',
          variant: 'destructive'
        });
        return;
      }

      // Strict content sanitization
      const sanitizedContent = securityUtils.sanitizeHTML(sanitizedData.content);
      const sanitizedTitle = securityUtils.validateInput(sanitizedData.title, 200);

      const { error } = await supabase
        .from('advertisements')
        .insert({
          title: sanitizedTitle,
          content: sanitizedContent,
          image_url: sanitizedData.image_url,
          link_url: sanitizedData.link_url,
          position: sanitizedData.position,
          ad_type: sanitizedData.ad_type,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Advertisement created successfully'
      });

      setFormData({
        title: '',
        content: '',
        image_url: '',
        link_url: '',
        position: 'sidebar',
        ad_type: 'banner'
      });
      
      fetchAds();
    } catch (error) {
      console.error('Error creating advertisement:', error);
      toast({
        title: 'Error',
        description: 'Failed to create advertisement',
        variant: 'destructive'
      });
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const toggleAdStatus = async (id: number, currentStatus: boolean) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Admin privileges required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Advertisement ${!currentStatus ? 'activated' : 'deactivated'}`
      });
      
      fetchAds();
    } catch (error) {
      console.error('Error updating advertisement:', error);
      toast({
        title: 'Error',
        description: 'Failed to update advertisement',
        variant: 'destructive'
      });
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Lock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Access Restricted</h3>
          <p className="text-gray-600">Admin privileges required to access this feature.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Secure Advertisement Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Security Enhanced</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              All content is strictly sanitized and validated. URLs are validated for security. Only admins can manage advertisements.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  title: securityUtils.validateInput(e.target.value, 200)
                }))}
                placeholder="Advertisement title"
                required
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content (HTML will be sanitized)</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  content: securityUtils.validateInput(e.target.value, 2000)
                }))}
                placeholder="Advertisement content (limited HTML allowed)"
                rows={4}
                required
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-1">
                Allowed tags: b, i, em, strong, p, br, ul, ol, li
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Link URL</label>
              <Input
                value={formData.link_url}
                onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                placeholder="https://example.com"
                type="url"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="sidebar">Sidebar</option>
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                  <option value="content">Content</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ad Type</label>
                <select
                  value={formData.ad_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, ad_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="banner">Banner</option>
                  <option value="popup">Popup</option>
                  <option value="native">Native</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Create Advertisement
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Advertisements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ads.map((ad) => (
              <div key={ad.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{ad.title}</h3>
                    <div className="text-gray-600 text-sm mt-1">
                      {securityUtils.sanitizeHTML(ad.content).substring(0, 100)}
                      {ad.content.length > 100 && '...'}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{ad.position}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{ad.ad_type}</span>
                    </div>
                  </div>
                  <Button
                    variant={ad.is_active ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleAdStatus(ad.id, ad.is_active)}
                  >
                    {ad.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureAdManager;
