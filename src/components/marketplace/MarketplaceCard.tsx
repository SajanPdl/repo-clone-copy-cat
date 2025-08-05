
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Eye, MapPin, Calendar, User } from 'lucide-react';
import { MarketplaceListing } from '@/utils/marketplaceUtils';
import { formatNepaliCurrency } from '@/utils/currencyUtils';
import { motion } from 'framer-motion';

interface MarketplaceCardProps {
  listing: MarketplaceListing;
  onView: (listing: MarketplaceListing) => void;
  onFavorite: (listingId: string) => void;
  isFavorited: boolean;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  listing,
  onView,
  onFavorite,
  isFavorited
}) => {
  const handleViewClick = () => {
    onView(listing);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite(listing.id);
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
        <div className="relative">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
          
          {/* Favorite button */}
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 h-8 w-8 p-0 backdrop-blur-sm ${
              isFavorited 
                ? 'bg-red-500/80 hover:bg-red-600/80' 
                : 'bg-white/80 hover:bg-white/90'
            }`}
            onClick={handleFavoriteClick}
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorited ? 'text-white fill-white' : 'text-gray-600'
              }`}
            />
          </Button>
          
          {/* Featured badge */}
          {listing.is_featured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
              Featured
            </Badge>
          )}
          
          {/* Free badge */}
          {listing.is_free && (
            <Badge className="absolute bottom-2 left-2 bg-green-500 text-white">
              Free
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Title and Category */}
            <div>
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                {listing.title}
              </h3>
              <Badge variant="outline" className="mt-1 text-xs">
                {listing.category}
              </Badge>
            </div>
            
            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">
                {listing.is_free ? 'Free' : formatNepaliCurrency(listing.price || 0)}
              </span>
              {listing.condition && (
                <Badge variant="secondary" className="text-xs">
                  {listing.condition}
                </Badge>
              )}
            </div>
            
            {/* Description */}
            {listing.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {listing.description}
              </p>
            )}
            
            {/* Subject and University */}
            <div className="flex flex-wrap gap-1">
              {listing.subject && (
                <Badge variant="outline" className="text-xs">
                  {listing.subject}
                </Badge>
              )}
              {listing.university && (
                <Badge variant="outline" className="text-xs">
                  {listing.university}
                </Badge>
              )}
            </div>
            
            {/* Location and Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{listing.location || 'Location not specified'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{listing.views_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{listing.interest_count || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Posted date */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Posted {new Date(listing.created_at).toLocaleDateString()}</span>
            </div>
            
            {/* Action button */}
            <Button
              onClick={handleViewClick}
              className="w-full mt-3"
              variant="outline"
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MarketplaceCard;
