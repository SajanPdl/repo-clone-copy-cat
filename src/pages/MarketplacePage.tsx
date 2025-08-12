
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Heart, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters';
import CreateListingForm from '@/components/marketplace/CreateListingForm';
import { MarketplaceListing, fetchMarketplaceListings } from '@/utils/marketplaceUtils';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';

const MarketplacePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { notifyAdminAnnouncement } = useNotificationTrigger();

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    subject: '',
    university: '',
    condition: '',
    priceMin: 0,
    priceMax: 0,
    freeOnly: false,
    search: '',
    sortBy: 'latest' as 'latest' | 'price_low' | 'price_high' | 'popular'
  });

  // Real data from database
  const categories = ['textbooks', 'notes', 'electronics', 'stationery', 'other'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English'];
  const universities = ['Tribhuvan University', 'Kathmandu University', 'Pokhara University'];

  useEffect(() => {
    fetchListings();
    
    // Show marketplace welcome notification
    if (user) {
      notifyAdminAnnouncement(
        'Marketplace Open',
        'Welcome to the marketplace! Find great deals on textbooks, notes, and more.'
      );
    }
  }, [user, notifyAdminAnnouncement]);

  useEffect(() => {
    applyFilters();
  }, [listings, filters]);

  const fetchListings = async () => {
    try {
      const data = await fetchMarketplaceListings(filters);
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch marketplace listings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...listings];

    if (filters.search) {
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (listing.description && listing.description.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(listing => listing.category === filters.category);
    }

    if (filters.freeOnly) {
      filtered = filtered.filter(listing => listing.is_free);
    }

    setFilteredListings(filtered);
  };

  const handleCreateListing = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowCreateForm(true);
  };

  const handleListingClick = (listingId: string) => {
    navigate(`/marketplace/${listingId}`);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      subject: '',
      university: '',
      condition: '',
      priceMin: 0,
      priceMax: 0,
      freeOnly: false,
      search: '',
      sortBy: 'latest'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading marketplace listings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Marketplace</h1>
            <p className="text-gray-600 mt-2">Buy and sell study materials, books, and more</p>
          </div>
          <Button onClick={handleCreateListing}>
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <MarketplaceFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              categories={categories}
              subjects={subjects}
              universities={universities}
            />
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <Card 
                    key={listing.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleListingClick(listing.id)}
                  >
                    <CardContent className="p-0">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}
                    </CardContent>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
                        <Heart className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{listing.category}</Badge>
                        {listing.condition && (
                          <Badge variant="outline">{listing.condition}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {listing.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {listing.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {listing.is_free ? (
                          <div className="text-xl font-semibold text-green-600">FREE</div>
                        ) : (
                          <div className="text-xl font-semibold">Rs. {listing.price}</div>
                        )}
                      </div>

                      {listing.location && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{listing.location}</span>
                        </div>
                      )}

                      <Separator />

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{listing.views_count} views</span>
                        </div>
                        <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold mb-2">No listings found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or be the first to create a listing!
                </p>
                <Button onClick={handleCreateListing}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Listing
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Create Listing Modal */}
        {showCreateForm && (
          <CreateListingForm 
            onSuccess={() => {
              setShowCreateForm(false);
              fetchListings();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;
