
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateAndSanitizeFormData } from '@/utils/inputValidation';
import { Plus, Edit, Trash2, Eye, MapPin, DollarSign } from 'lucide-react';

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  is_free: boolean;
  category: string;
  condition: string;
  location: string;
  images: string[];
  status: string;
  is_approved: boolean;
  views_count: number;
  interest_count: number;
  created_at: string;
}

const MarketplaceManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    is_free: false,
    category: 'books',
    condition: 'good',
    location: '',
    images: [] as string[]
  });

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user]);

  const fetchListings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch your listings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      const sanitizedData = validateAndSanitizeFormData(formData);
      
      if (!sanitizedData.title || !sanitizedData.description) {
        toast({
          title: 'Validation Error',
          description: 'Title and description are required',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('marketplace_listings')
        .insert({
          user_id: user.id,
          title: sanitizedData.title,
          description: sanitizedData.description,
          price: sanitizedData.is_free ? null : sanitizedData.price,
          is_free: sanitizedData.is_free,
          category: sanitizedData.category,
          condition: sanitizedData.condition,
          location: sanitizedData.location,
          images: sanitizedData.images,
          status: 'active',
          is_approved: false,
          views_count: 0,
          interest_count: 0
        });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your listing has been created and is pending approval.'
      });

      setFormData({
        title: '',
        description: '',
        price: 0,
        is_free: false,
        category: 'books',
        condition: 'good',
        location: '',
        images: []
      });
      setShowCreateForm(false);
      fetchListings();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to create listing. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (listingId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Listing has been removed successfully.'
      });
      
      fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete listing. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Loading your listings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Marketplace Listings</h2>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showCreateForm ? 'Cancel' : 'Create Listing'}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter listing title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="books">Books</option>
                    <option value="electronics">Electronics</option>
                    <option value="notes">Study Notes</option>
                    <option value="supplies">School Supplies</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your item in detail"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="is_free"
                      checked={formData.is_free}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Free Item</span>
                  </label>
                </div>

                {!formData.is_free && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (NPR)</label>
                    <Input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="new">New</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, District"
                />
              </div>

              <Button type="submit" className="w-full">
                Create Listing
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <Card key={listing.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg line-clamp-2">{listing.title}</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(listing.id, listing.title)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                {listing.description}
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="font-medium">
                    {listing.is_free ? 'Free' : `NPR ${listing.price}`}
                  </span>
                </div>
                <Badge variant={listing.is_approved ? 'default' : 'secondary'}>
                  {listing.is_approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{listing.views_count} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.location || 'Not specified'}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {listing.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {listing.condition}
                </Badge>
              </div>
              
              <div className="mt-3 text-xs text-gray-400">
                Created: {new Date(listing.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Create your first marketplace listing to start selling!
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Listing
          </Button>
        </div>
      )}
    </div>
  );
};

export default MarketplaceManager;
