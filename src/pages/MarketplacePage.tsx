
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth as useAuth } from '@/hooks/useSecureAuth';
import { useToast } from '@/hooks/use-toast';
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters';
import MarketplaceCard from '@/components/marketplace/MarketplaceCard';
import CreateListingForm from '@/components/marketplace/CreateListingForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export interface MarketplaceListing {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'book' | 'notes' | 'pdf' | 'question_bank' | 'calculator' | 'device' | 'other';
  subject?: string;
  university?: string;
  price?: number;
  is_free: boolean;
  condition: 'new' | 'used' | 'excellent' | 'fair';
  location?: string;
  contact_info?: any;
  images?: string[];
  status: 'active' | 'sold' | 'exchanged' | 'inactive';
  is_featured: boolean;
  is_approved: boolean;
  views_count: number;
  interest_count: number;
  created_at: string;
  updated_at: string;
}

const MarketplacePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
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

  const { data: listings = [], isLoading, refetch } = useQuery({
    queryKey: ['marketplace-listings', filters],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_listings')
        .select('*')
        .eq('is_approved', true)
        .eq('status', 'active');

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters.condition !== 'all') {
        query = query.eq('condition', filters.condition);
      }

      if (filters.subject !== 'all') {
        query = query.eq('subject', filters.subject);
      }

      if (filters.university !== 'all') {
        query = query.eq('university', filters.university);
      }

      if (filters.freeOnly) {
        query = query.eq('is_free', true);
      } else {
        query = query
          .gte('price', filters.priceMin)
          .lte('price', filters.priceMax);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'featured':
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
          break;
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'views':
          query = query.order('views_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching listings:', error);
        throw new Error('Failed to fetch listings');
      }

      return (data || []) as MarketplaceListing[];
    }
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
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
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    refetch();
    toast({
      title: "Success",
      description: "Your listing has been created and is pending approval."
    });
  };

  const handleViewListing = (listing: MarketplaceListing) => {
    // Handle view listing - could open a modal or navigate to detail page
    console.log('View listing:', listing);
  };

  // Get unique values for filters
  const categories = ['book', 'notes', 'pdf', 'question_bank', 'calculator', 'device', 'other'];
  const subjects = [...new Set(listings.map(l => l.subject).filter(Boolean))] as string[];
  const universities = [...new Set(listings.map(l => l.university).filter(Boolean))] as string[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Student Marketplace
              </h1>
              <p className="text-gray-600 text-lg mt-2">Buy, sell, and exchange study materials</p>
            </div>
            
            {user && (
              <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Listing
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Listing</DialogTitle>
                  </DialogHeader>
                  <CreateListingForm 
                    onSuccess={handleCreateSuccess}
                    onCancel={() => setShowCreateForm(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <MarketplaceFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            categories={categories}
            subjects={subjects}
            universities={universities}
          />
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Search className="h-16 w-16 mx-auto text-gray-400 mb-6" />
            <h3 className="text-2xl font-semibold mb-3">No items found</h3>
            <p className="text-gray-600 mb-8">Try adjusting your filters or create a new listing</p>
            {user && (
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Listing
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MarketplaceCard 
                  listing={listing}
                  onView={handleViewListing}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;
