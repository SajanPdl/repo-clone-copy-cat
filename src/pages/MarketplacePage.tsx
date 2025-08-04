
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MarketplaceNavbar from '@/components/marketplace/MarketplaceNavbar';
import MarketplaceCard from '@/components/marketplace/MarketplaceCard';
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters';
import CreateListingForm from '@/components/marketplace/CreateListingForm';
import { 
  fetchMarketplaceListings, 
  MarketplaceListing,
  addToFavorites,
  removeFromFavorites,
  fetchUserFavorites,
  incrementListingViews
} from '@/utils/marketplaceUtils';
import { supabase } from '@/integrations/supabase/client';

const MarketplacePage: React.FC = () => {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);
    };
    getUser();
  }, []);

  // Update search filter when searchQuery changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: searchQuery }));
  }, [searchQuery]);

  // Fetch user favorites
  useEffect(() => {
    const loadUserFavorites = async () => {
      if (user) {
        try {
          const favorites = await fetchUserFavorites(user.id);
          setUserFavorites(favorites.map(f => f.listing_id!));
        } catch (error) {
          console.error('Error loading favorites:', error);
        }
      }
    };
    loadUserFavorites();
  }, [user]);

  const { data: listings = [], isLoading, refetch } = useQuery({
    queryKey: ['marketplace-listings', filters],
    queryFn: () => fetchMarketplaceListings({
      category: filters.category !== 'all' ? filters.category : undefined,
      subject: filters.subject !== 'all' ? filters.subject : undefined,
      university: filters.university !== 'all' ? filters.university : undefined,
      condition: filters.condition !== 'all' ? filters.condition : undefined,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      freeOnly: filters.freeOnly,
      search: filters.search,
      sortBy: filters.sortBy as any
    })
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
    setSearchQuery('');
  };

  const handleViewListing = async (listing: MarketplaceListing) => {
    // Increment view count
    await incrementListingViews(listing.id);
    // Navigate to listing detail (you can implement this)
    console.log('View listing:', listing);
  };

  const handleToggleFavorite = async (listingId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to favorites.",
        variant: "destructive"
      });
      return;
    }

    try {
      const isFavorited = userFavorites.includes(listingId);
      
      if (isFavorited) {
        await removeFromFavorites(user.id, listingId);
        setUserFavorites(prev => prev.filter(id => id !== listingId));
        toast({
          title: "Removed from favorites",
          description: "Item removed from your favorites."
        });
      } else {
        await addToFavorites(user.id, listingId);
        setUserFavorites(prev => [...prev, listingId]);
        toast({
          title: "Added to favorites",
          description: "Item added to your favorites."
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites.",
        variant: "destructive"
      });
    }
  };

  const handleListingCreated = (newListing: MarketplaceListing) => {
    setShowCreateForm(false);
    refetch();
    toast({
      title: "Success!",
      description: "Your listing has been created and is pending approval."
    });
  };

  // Extract unique values for filter options
  const categories = ['book', 'notes', 'pdf', 'question_bank', 'calculator', 'device', 'other'];
  const subjects = [...new Set(listings.map(l => l.subject).filter(Boolean))];
  const universities = [...new Set(listings.map(l => l.university).filter(Boolean))];

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <MarketplaceNavbar 
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateListing={() => setShowCreateForm(true)}
        />
        <div className="py-8 px-4">
          <CreateListingForm
            onSuccess={handleListingCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Marketplace Navbar */}
      <MarketplaceNavbar 
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateListing={() => setShowCreateForm(true)}
        cartItemCount={0}
        notificationCount={0}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            📚 Academic Marketplace
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Buy, sell, or exchange academic materials with fellow students
          </p>
          {user && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Listing
            </Button>
          )}
        </motion.div>

        {/* Filters */}
        <div className="mb-8">
          <MarketplaceFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            categories={categories}
            subjects={subjects}
            universities={universities}
          />
        </div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <p className="text-gray-600 dark:text-gray-300">
            {isLoading ? 'Loading...' : `${listings.length} listing${listings.length !== 1 ? 's' : ''} found`}
          </p>
        </motion.div>

        {/* Listings Grid */}
        <AnimatePresence>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {listings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MarketplaceCard
                    listing={listing}
                    onView={handleViewListing}
                    onFavorite={handleToggleFavorite}
                    isFavorited={userFavorites.includes(listing.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No listings found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Try adjusting your filters or create the first listing!
              </p>
              {user && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Listing
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MarketplacePage;
