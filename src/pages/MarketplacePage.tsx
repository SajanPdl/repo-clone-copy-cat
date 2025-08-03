

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters';
import MarketplaceCard from '@/components/marketplace/MarketplaceCard';
import CreateListingForm from '@/components/marketplace/CreateListingForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { useSecureAuth as useAuth } from '@/hooks/useSecureAuth';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceListing as UtilsMarketplaceListing } from '@/utils/marketplaceUtils';

// Define the MarketplaceListing interface to match what we actually need for display
interface MarketplaceListing extends UtilsMarketplaceListing {
  image_url: string;
  seller_id: string;
  seller_name: string;
  formattedPrice: string;
}

const MarketplacePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    subject: 'all',
    university: 'all',
    condition: 'all',
    priceMin: 0,
    priceMax: 10000,
    freeOnly: false,
    sortBy: 'latest'
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data for filters
  const categories = ['book', 'notes', 'pdf', 'question_bank', 'calculator', 'device', 'other'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];
  const universities = ['Tribhuvan University', 'Kathmandu University', 'Pokhara University', 'Purbanchal University'];

  // Fetch marketplace listings
  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ['marketplace-listings', filters],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_listings')
        .select(`
          id,
          title,
          description,
          price,
          condition,
          category,
          subject,
          university,
          images,
          user_id,
          created_at,
          is_free
        `)
        .eq('status', 'active');

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.subject && filters.subject !== 'all') {
        query = query.eq('subject', filters.subject);
      }
      if (filters.university && filters.university !== 'all') {
        query = query.eq('university', filters.university);
      }
      if (filters.condition && filters.condition !== 'all') {
        query = query.eq('condition', filters.condition);
      }
      if (filters.freeOnly) {
        query = query.eq('is_free', true);
      } else {
        query = query.gte('price', filters.priceMin).lte('price', filters.priceMax);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'latest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform data to match MarketplaceListing interface
      return (data || []).map(listing => {
        // Create a new object with all required properties from UtilsMarketplaceListing
        const transformedListing: MarketplaceListing = {
          id: listing.id,
          user_id: listing.user_id || '',
          title: listing.title || '',
          description: listing.description || '',
          category: listing.category || 'other',
          subject: listing.subject || '',
          university: listing.university || '',
          price: listing.price,
          is_free: listing.is_free,
          condition: listing.condition || 'good',
          location: '',
          contact_info: {},
          images: listing.images || [],
          status: 'active',
          is_featured: false,
          is_approved: true,
          views_count: 0,
          interest_count: 0,
          created_at: listing.created_at || new Date().toISOString(),
          updated_at: listing.created_at || new Date().toISOString(),
          image_url: listing.images?.[0] || '/placeholder.svg',
          seller_id: listing.user_id || '',
          seller_name: 'Unknown', // Simplified for now
          formattedPrice: listing.is_free ? 'निःशुल्क' : `रू ${(listing.price || 0).toLocaleString()}`
        };
        return transformedListing;
      });
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
      category: 'all',
      subject: 'all',
      university: 'all',
      condition: 'all',
      priceMin: 0,
      priceMax: 10000,
      freeOnly: false,
      sortBy: 'latest'
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
          user_id: user.id,
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

  const handleViewListing = (listing: MarketplaceListing) => {
    // Placeholder for viewing listing details
    console.log('View listing:', listing);
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
              <CreateListingForm 
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  refetch();
                }} 
                onCancel={() => setIsCreateDialogOpen(false)} 
              />
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
                categories={categories}
                subjects={subjects}
                universities={universities}
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
                      id: listing.id,
                      user_id: listing.seller_id,
                      title: listing.title,
                      description: listing.description,
                      category: listing.category as 'book' | 'notes' | 'pdf' | 'question_bank' | 'calculator' | 'device' | 'other',
                      subject: listing.subject,
                      university: listing.university,
                      price: listing.price,
                      is_free: listing.is_free,
                      condition: listing.condition as 'new' | 'used' | 'fair' | 'excellent',
                      location: '',
                      contact_info: {},
                      images: listing.image_url ? [listing.image_url] : [],
                      status: listing.status,
                      is_featured: listing.is_featured,
                      is_approved: listing.is_approved,
                      views_count: listing.views_count,
                      interest_count: listing.interest_count,
                      created_at: listing.created_at,
                      updated_at: listing.updated_at
                    }}
                    onView={handleViewListing}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-500 mb-4">
                  {filters.search || filters.category !== 'all' || filters.subject !== 'all'
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
