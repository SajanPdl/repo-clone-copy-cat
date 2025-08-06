
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Share2, MessageCircle, MapPin, Calendar, Eye } from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import { MarketplaceListing, incrementListingViews, fetchMarketplaceListings } from '@/utils/marketplaceUtils';

const MarketplaceProductViewPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListing();
      incrementViews();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const listings = await fetchMarketplaceListings();
      const foundListing = listings.find(l => l.id === id);
      if (foundListing) {
        setListing(foundListing);
      } else {
        toast({
          title: 'Not Found',
          description: 'Listing not found',
          variant: 'destructive'
        });
        navigate('/marketplace');
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to load listing',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    if (id) {
      await incrementListingViews(id);
    }
  };

  const handleContact = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Implement contact functionality
    toast({
      title: 'Contact Feature',
      description: 'Contact functionality will be available soon'
    });
  };

  const handleFavorite = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? 'Removed from favorites' : 'Added to favorites'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GlobalHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GlobalHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Listing not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{listing.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary">{listing.category}</Badge>
                      {listing.condition && (
                        <Badge variant="outline">{listing.condition}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFavorite}
                    >
                      <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{listing.views_count} views</span>
                </div>

                {listing.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">{listing.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {listing.subject && (
                    <div>
                      <span className="font-medium">Subject:</span>
                      <span className="ml-2 text-gray-600">{listing.subject}</span>
                    </div>
                  )}
                  {listing.university && (
                    <div>
                      <span className="font-medium">University:</span>
                      <span className="ml-2 text-gray-600">{listing.university}</span>
                    </div>
                  )}
                </div>

                {listing.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{listing.location}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Posted on {new Date(listing.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {listing.is_free ? (
                    <div className="text-3xl font-bold text-green-600">FREE</div>
                  ) : (
                    <div className="text-3xl font-bold">Rs. {listing.price}</div>
                  )}
                  
                  <Button onClick={handleContact} className="w-full" size="lg">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      U
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Seller</p>
                    <p className="text-sm text-gray-600">Member since 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceProductViewPage;
