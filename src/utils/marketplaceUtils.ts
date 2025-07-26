
import { supabase } from '@/integrations/supabase/client';

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
  condition?: 'new' | 'used' | 'fair' | 'excellent';
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

export interface MarketplaceInquiry {
  id: string;
  listing_id?: string;
  inquirer_id: string;
  message: string;
  contact_info?: any;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
}

export interface MarketplaceFavorite {
  id: string;
  user_id: string;
  listing_id?: string;
  created_at: string;
}

export interface SellerRating {
  id: string;
  seller_id: string;
  buyer_id: string;
  listing_id?: string;
  rating: number;
  review?: string;
  created_at: string;
}

// Fetch marketplace listings with filters
export const fetchMarketplaceListings = async (params?: {
  category?: string;
  subject?: string;
  university?: string;
  condition?: string;
  priceMin?: number;
  priceMax?: number;
  freeOnly?: boolean;
  search?: string;
  sortBy?: 'latest' | 'price_asc' | 'price_desc' | 'views' | 'featured';
}): Promise<MarketplaceListing[]> => {
  try {
    let query = supabase
      .from('marketplace_listings')
      .select('*')
      .eq('is_approved', true)
      .eq('status', 'active');

    if (params) {
      if (params.category && params.category !== 'all') {
        query = query.eq('category', params.category);
      }

      if (params.subject && params.subject !== 'all') {
        query = query.eq('subject', params.subject);
      }

      if (params.university && params.university !== 'all') {
        query = query.eq('university', params.university);
      }

      if (params.condition && params.condition !== 'all') {
        query = query.eq('condition', params.condition);
      }

      if (params.freeOnly) {
        query = query.eq('is_free', true);
      } else {
        if (params.priceMin !== undefined) {
          query = query.gte('price', params.priceMin);
        }
        if (params.priceMax !== undefined) {
          query = query.lte('price', params.priceMax);
        }
      }

      if (params.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%,subject.ilike.%${params.search}%`);
      }

      // Sorting
      switch (params.sortBy) {
        case 'latest':
          query = query.order('created_at', { ascending: false });
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
        case 'featured':
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching marketplace listings:", error);
      throw new Error("Failed to fetch marketplace listings");
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchMarketplaceListings:", error);
    return [];
  }
};

// Fetch single marketplace listing
export const fetchMarketplaceListingById = async (id: string): Promise<MarketplaceListing | null> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching marketplace listing:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchMarketplaceListingById:", error);
    return null;
  }
};

// Create marketplace listing
export const createMarketplaceListing = async (listing: Omit<MarketplaceListing, 'id' | 'views_count' | 'interest_count' | 'created_at' | 'updated_at' | 'is_approved'>): Promise<MarketplaceListing | null> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .insert([listing])
      .select()
      .single();

    if (error) {
      console.error("Error creating marketplace listing:", error);
      throw new Error("Failed to create marketplace listing");
    }

    return data;
  } catch (error) {
    console.error("Error in createMarketplaceListing:", error);
    return null;
  }
};

// Update marketplace listing
export const updateMarketplaceListing = async (id: string, updates: Partial<MarketplaceListing>): Promise<MarketplaceListing | null> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating marketplace listing:", error);
      throw new Error("Failed to update marketplace listing");
    }

    return data;
  } catch (error) {
    console.error("Error in updateMarketplaceListing:", error);
    return null;
  }
};

// Delete marketplace listing
export const deleteMarketplaceListing = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('marketplace_listings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting marketplace listing:", error);
      throw new Error("Failed to delete marketplace listing");
    }

    return true;
  } catch (error) {
    console.error("Error in deleteMarketplaceListing:", error);
    return false;
  }
};

// Increment listing views
export const incrementListingViews = async (listingId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_listing_views', {
      listing_uuid: listingId
    });

    if (error) {
      console.error("Error incrementing listing views:", error);
    }
  } catch (error) {
    console.error("Error in incrementListingViews:", error);
  }
};

// Increment listing interest
export const incrementListingInterest = async (listingId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_listing_interest', {
      listing_uuid: listingId
    });

    if (error) {
      console.error("Error incrementing listing interest:", error);
    }
  } catch (error) {
    console.error("Error in incrementListingInterest:", error);
  }
};

// Fetch user's marketplace listings
export const fetchUserMarketplaceListings = async (userId: string): Promise<MarketplaceListing[]> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user marketplace listings:", error);
      throw new Error("Failed to fetch user marketplace listings");
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchUserMarketplaceListings:", error);
    return [];
  }
};

// Fetch marketplace inquiries
export const fetchMarketplaceInquiries = async (listingId?: string, userId?: string): Promise<MarketplaceInquiry[]> => {
  try {
    let query = supabase.from('marketplace_inquiries').select('*');

    if (listingId) {
      query = query.eq('listing_id', listingId);
    }

    if (userId) {
      query = query.eq('inquirer_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching marketplace inquiries:", error);
      throw new Error("Failed to fetch marketplace inquiries");
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchMarketplaceInquiries:", error);
    return [];
  }
};

// Create marketplace inquiry
export const createMarketplaceInquiry = async (inquiry: Omit<MarketplaceInquiry, 'id' | 'created_at'>): Promise<MarketplaceInquiry | null> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_inquiries')
      .insert([inquiry])
      .select()
      .single();

    if (error) {
      console.error("Error creating marketplace inquiry:", error);
      throw new Error("Failed to create marketplace inquiry");
    }

    return data;
  } catch (error) {
    console.error("Error in createMarketplaceInquiry:", error);
    return null;
  }
};

// Fetch user favorites
export const fetchUserFavorites = async (userId: string): Promise<MarketplaceFavorite[]> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user favorites:", error);
      throw new Error("Failed to fetch user favorites");
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchUserFavorites:", error);
    return [];
  }
};

// Add to favorites
export const addToFavorites = async (userId: string, listingId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('marketplace_favorites')
      .insert([{ user_id: userId, listing_id: listingId }]);

    if (error) {
      console.error("Error adding to favorites:", error);
      throw new Error("Failed to add to favorites");
    }

    return true;
  } catch (error) {
    console.error("Error in addToFavorites:", error);
    return false;
  }
};

// Remove from favorites
export const removeFromFavorites = async (userId: string, listingId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('marketplace_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId);

    if (error) {
      console.error("Error removing from favorites:", error);
      throw new Error("Failed to remove from favorites");
    }

    return true;
  } catch (error) {
    console.error("Error in removeFromFavorites:", error);
    return false;
  }
};

// Create seller rating
export const createSellerRating = async (rating: Omit<SellerRating, 'id' | 'created_at'>): Promise<SellerRating | null> => {
  try {
    const { data, error } = await supabase
      .from('seller_ratings')
      .insert([rating])
      .select()
      .single();

    if (error) {
      console.error("Error creating seller rating:", error);
      throw new Error("Failed to create seller rating");
    }

    return data;
  } catch (error) {
    console.error("Error in createSellerRating:", error);
    return null;
  }
};

// Fetch seller ratings
export const fetchSellerRatings = async (sellerId: string): Promise<SellerRating[]> => {
  try {
    const { data, error } = await supabase
      .from('seller_ratings')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching seller ratings:", error);
      throw new Error("Failed to fetch seller ratings");
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchSellerRatings:", error);
    return [];
  }
};
