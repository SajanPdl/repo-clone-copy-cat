
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters';
import { MarketplaceCard } from '@/components/marketplace/MarketplaceCard';
import { CreateListingForm } from '@/components/marketplace/CreateListingForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  subject: string;
  university: string;
  image_url: string;
  seller_id: string;
  created_at: string;
  seller?: {
    full_name: string;
    avatar_url?: string;
  };
}

const MarketplacePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subject: '',
    university: '',
    condition: '',
    priceMin: 0,
    priceMax: 10000,
    freeOnly: false,
    sortBy: 'created_at'
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch marketplace listings
  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ['marketplace-listings', filters],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_listings')
        .select(`
          *,
          seller:profiles(full_name, avatar_url)
        `)
        .eq('status', 'active');

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.subject) {
        query = query.eq('subject', filters.subject);
      }
      if (filters.university) {
        query = query.eq('university', filters.university);
      }
      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }
      if (filters.freeOnly) {
        query = query.eq('price', 0);
      } else {
        query = query.gte('price', filters.priceMin).lte('price', filters.priceMax);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data.map(listing => ({
        ...listing,
        // Format price with NPR currency
        formattedPrice: listing.price === 0 ? 'Free' : `NPR ${listing.price.toLocaleString()}`
      })) as MarketplaceListing[];
    }
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    handleFilterChange('search', term);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      subject: '',
      university: '',
      condition: '',
      priceMin: 0,
      priceMax: 10000,
      freeOnly: false,
      sortBy: 'created_at'
    });
    setSearchTerm('');
  };

  const handleCreateListing = async (listingData: any) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create a listing',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .insert([{
          ...listingData,
          seller_id: user.id,
          status: 'active'
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your listing has been created successfully'
      });

      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to create listing. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Marketplace</h1>
            <p className="text-gray-600">Buy and sell study materials, books, and more</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Listing</DialogTitle>
              </DialogHeader>
              <CreateListingForm onSubmit={handleCreateListing} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <MarketplaceFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                searchTerm={searchTerm}
                onSearch={handleSearch}
              />
            </div>
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            {/* Search Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {isLoading ? 'Loading...' : `${listings?.length || 0} items found`}
              </h2>
            </div>

            {/* Listings Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-md mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <MarketplaceCard
                    key={listing.id}
                    listing={{
                      ...listing,
                      formattedPrice: listing.price === 0 ? 'Free' : `NPR ${listing.price.toLocaleString()}`
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-500 mb-4">
                  {filters.search || filters.category || filters.subject
                    ? 'Try adjusting your filters or search terms'
                    : 'Be the first to create a listing!'}
                </p>
                {user && (
                  <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Listing
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
