
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Eye, MapPin, Star, Clock } from 'lucide-react';
import { MarketplaceListing } from '@/utils/marketplaceUtils';
import { formatDistanceToNow } from 'date-fns';

interface MarketplaceCardProps {
  listing: MarketplaceListing;
  onView: (listing: MarketplaceListing) => void;
  onFavorite?: (listingId: string) => void;
  isFavorited?: boolean;
  className?: string;
}

const categoryIcons = {
  book: '📚',
  notes: '📝',
  pdf: '📄',
  question_bank: '❓',
  calculator: '🧮',
  device: '💻',
  other: '🔍'
};

const conditionColors = {
  new: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  excellent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  used: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  fair: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
};

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  listing,
  onView,
  onFavorite,
  isFavorited = false,
  className = ''
}) => {
  const handleCardClick = () => {
    onView(listing);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(listing.id);
    }
  };

  const primaryImage = listing.images && listing.images.length > 0 ? listing.images[0] : null;

  return (
    <motion.div
      whileHover={{ 
        y: -8,
        scale: 1.02,
        rotateY: 2,
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative ${className}`}
    >
      <Card 
        className="cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300"
        onClick={handleCardClick}
      >
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              <span className="text-6xl opacity-50">
                {categoryIcons[listing.category]}
              </span>
            </div>
          )}
          
          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {listing.is_featured && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                ⭐ Featured
              </Badge>
            )}
            {listing.is_free && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                🎁 Free
              </Badge>
            )}
            {listing.condition && (
              <Badge className={conditionColors[listing.condition]}>
                {listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
            onClick={handleFavoriteClick}
          >
            <Heart 
              className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`}
            />
          </Button>

          {/* Stats */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 text-white text-xs">
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
              <Eye className="h-3 w-3" />
              {listing.views_count}
            </div>
          </div>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 dark:text-white">
              {listing.title}
            </h3>
            <div className="flex flex-col items-end gap-1">
              {listing.is_free ? (
                <span className="text-lg font-bold text-green-600 dark:text-green-400">FREE</span>
              ) : (
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ${listing.price?.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {listing.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {listing.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {categoryIcons[listing.category]} {listing.category}
              </Badge>
              {listing.subject && (
                <Badge variant="outline" className="text-xs">
                  {listing.subject}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {listing.location || 'Location not specified'}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
              </div>
            </div>

            {listing.university && (
              <div className="text-xs text-gray-600 dark:text-gray-300">
                🎓 {listing.university}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MarketplaceCard;
