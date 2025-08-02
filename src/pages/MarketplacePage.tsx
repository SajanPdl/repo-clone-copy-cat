
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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

  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    subject: 'all',
    university: 'all',
    condition: 'all',
    priceMin: 0,
    priceMax: 50000, // Updated to NPR range
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
      priceMax: 50000,
      freeOnly: false,
      sortBy: 'latest'
    });
  };

  const handleViewListing = async (listing: MarketplaceListing) => {
    await incrementListingViews(listing.id);
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

  // Extract unique values for filter options from database
  const categories = ['book', 'notes', 'pdf', 'question_bank', 'calculator', 'device', 'other'];
  const subjects = [...new Set(listings.map(l => l.subject).filter(Boolean))];
  const universities = [...new Set(listings.map(l => l.university).filter(Boolean))];

  const formatNPR = (amount?: number) => {
    if (!amount) return 'Free';
    return new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-24">
          <CreateListingForm
            onSuccess={handleListingCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            📚 Academic Marketplace
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Buy, sell, or exchange academic materials with fellow students across Nepal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Listing
            </Button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              💰 All prices in Nepali Rupees (NPR)
            </div>
          </div>
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
            currency="NPR"
          />
        </div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              {isLoading ? 'Loading...' : `${listings.length} listing${listings.length !== 1 ? 's' : ''} found`}
            </p>
            {!isLoading && listings.length > 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing results in Nepali Rupees (NPR)
              </div>
            )}
          </div>
        </motion.div>

        {/* Listings Grid */}
        <AnimatePresence>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse shadow-sm" />
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
                  whileHover={{ y: -5 }}
                  className="transform transition-all duration-200"
                >
                  <MarketplaceCard
                    listing={{
                      ...listing,
                      price: listing.price || 0,
                      formattedPrice: listing.is_free ? 'Free' : formatNPR(listing.price)
                    }}
                    onView={handleViewListing}
                    onFavorite={handleToggleFavorite}
                    isFavorited={userFavorites.includes(listing.id)}
                    currency="NPR"
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-sm"
            >
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-semibold mb-4">No listings found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                Try adjusting your filters or be the first to create a listing in this category!
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                className="border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Listing
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl mb-2">🔒</div>
              <h4 className="font-semibold mb-2">Safe & Secure</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                All listings are moderated for your safety
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-semibold mb-2">Local Currency</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                All prices in Nepali Rupees (NPR)
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">🤝</div>
              <h4 className="font-semibold mb-2">Student Community</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Connect with students from your university
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default MarketplacePage;
