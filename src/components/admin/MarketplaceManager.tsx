import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, Heart, MapPin, Calendar, Check, X, Star, Trash2 } from 'lucide-react';
import { 
  updateMarketplaceListing, 
  deleteMarketplaceListing,
  MarketplaceListing 
} from '@/utils/marketplaceUtils';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

const MarketplaceManager: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');

  // Helper function to convert database row to MarketplaceListing
  const convertToMarketplaceListing = (dbRow: any): MarketplaceListing => ({
    id: dbRow.id,
    user_id: dbRow.user_id,
    title: dbRow.title,
    description: dbRow.description,
    category: dbRow.category as MarketplaceListing['category'],
    subject: dbRow.subject,
    university: dbRow.university,
    price: dbRow.price,
    is_free: dbRow.is_free,
    condition: dbRow.condition as MarketplaceListing['condition'],
    location: dbRow.location,
    contact_info: dbRow.contact_info,
    images: dbRow.images,
    status: dbRow.status as MarketplaceListing['status'],
    is_featured: dbRow.is_featured,
    is_approved: dbRow.is_approved,
    views_count: dbRow.views_count,
    interest_count: dbRow.interest_count,
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at
  });

  const { data: listings = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-marketplace-listings', searchTerm, statusFilter, approvalFilter],
    queryFn: async () => {
      // Admin query to get all listings regardless of approval status
      let query = supabase
        .from('marketplace_listings')
        .select('*');

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (approvalFilter !== 'all') {
        query = query.eq('is_approved', approvalFilter === 'approved');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin listings:', error);
        throw new Error('Failed to fetch listings');
      }

      return (data || []).map(convertToMarketplaceListing);
    }
  });

  const handleApprovalToggle = async (listing: MarketplaceListing) => {
    try {
      const newApprovalStatus = !listing.is_approved;
      await updateMarketplaceListing(listing.id, { is_approved: newApprovalStatus });
      
      toast({
        title: newApprovalStatus ? "Listing approved" : "Listing rejected",
        description: `The listing "${listing.title}" has been ${newApprovalStatus ? 'approved' : 'rejected'}.`
      });
      
      refetch();
    } catch (error) {
      console.error('Error updating approval status:', error);
      toast({
        title: "Error",
        description: "Failed to update listing approval status.",
        variant: "destructive"
      });
    }
  };

  const handleFeatureToggle = async (listing: MarketplaceListing) => {
    try {
      const newFeaturedStatus = !listing.is_featured;
      await updateMarketplaceListing(listing.id, { is_featured: newFeaturedStatus });
      
      toast({
        title: newFeaturedStatus ? "Listing featured" : "Listing unfeatured",
        description: `The listing "${listing.title}" has been ${newFeaturedStatus ? 'featured' : 'unfeatured'}.`
      });
      
      refetch();
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast({
        title: "Error",
        description: "Failed to update listing featured status.",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (listing: MarketplaceListing, newStatus: string) => {
    try {
      await updateMarketplaceListing(listing.id, { status: newStatus as MarketplaceListing['status'] });
      
      toast({
        title: "Status updated",
        description: `The listing status has been changed to ${newStatus}.`
      });
      
      refetch();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update listing status.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteListing = async (listing: MarketplaceListing) => {
    if (!confirm(`Are you sure you want to delete "${listing.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteMarketplaceListing(listing.id);
      
      toast({
        title: "Listing deleted",
        description: `The listing "${listing.title}" has been deleted.`
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'sold': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'exchanged': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      book: '📚',
      notes: '📝',
      pdf: '📄',
      question_bank: '❓',
      calculator: '🧮',
      device: '💻',
      other: '🔍'
    };
    return icons[category as keyof typeof icons] || '🔍';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace Management</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage and moderate marketplace listings</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="exchanged">Exchanged</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by approval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Listings</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <motion.div
              key={listing.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl opacity-50">
                        {getCategoryIcon(listing.category)}
                      </span>
                    </div>
                  )}
                  
                  {/* Status badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    <Badge className={getStatusColor(listing.status)}>
                      {listing.status}
                    </Badge>
                    {listing.is_featured && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Approval status */}
                  <div className="absolute top-2 right-2">
                    {listing.is_approved ? (
                      <Badge className="bg-green-500 text-white">
                        <Check className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500 text-white">
                        <X className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {listing.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {listing.is_free ? 'FREE' : `$${listing.price?.toFixed(2) || '0.00'}`}
                      </span>
                      <div className="flex items-center gap-3 text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {listing.views_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {listing.interest_count}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryIcon(listing.category)} {listing.category}
                      </Badge>
                      {listing.subject && (
                        <Badge variant="outline" className="text-xs">
                          {listing.subject}
                        </Badge>
                      )}
                    </div>

                    {listing.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {listing.location}
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        size="sm"
                        variant={listing.is_approved ? "destructive" : "default"}
                        onClick={() => handleApprovalToggle(listing)}
                        className="flex-1"
                      >
                        {listing.is_approved ? (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </>
                        ) : (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFeatureToggle(listing)}
                        className={listing.is_featured ? 'bg-purple-50 border-purple-200' : ''}
                      >
                        <Star className={`h-3 w-3 ${listing.is_featured ? 'fill-purple-500 text-purple-500' : ''}`} />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteListing(listing)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Status changer */}
                    <Select
                      value={listing.status}
                      onValueChange={(value) => handleStatusChange(listing, value)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="exchanged">Exchanged</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && listings.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">No listings found</h3>
          <p className="text-gray-600 dark:text-gray-300">
            No marketplace listings match your current filters.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MarketplaceManager;
