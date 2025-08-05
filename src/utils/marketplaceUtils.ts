
import { supabase } from '@/integrations/supabase/client';

export interface MarketplaceListing {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  subject: string | null;
  university: string | null;
  condition: string | null;
  price: number | null;
  is_free: boolean;
  location: string | null;
  images: string[] | null;
  contact_info: any;
  is_approved: boolean;
  is_featured: boolean;
  status: string;
  views_count: number;
  interest_count: number;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceFilters {
  category?: string;
  subject?: string;
  university?: string;
  condition?: string;
  priceMin?: number;
  priceMax?: number;
  freeOnly?: boolean;
  search?: string;
  sortBy?: 'latest' | 'price_low' | 'price_high' | 'popular';
}

export const fetchMarketplaceListings = async (filters: MarketplaceFilters = {}): Promise<MarketplaceListing[]> => {
  try {
    let query = supabase
      .from('marketplace_listings')
      .select('*')
      .eq('is_approved', true)
      .eq('status', 'active');

    // Apply filters
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
      if (filters.priceMin !== undefined && filters.priceMin > 0) {
        query = query.gte('price', filters.priceMin);
      }
      if (filters.priceMax !== undefined && filters.priceMax > 0) {
        query = query.lte('price', filters.priceMax);
      }
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_low':
        query = query.order('price', { ascending: true, nullsFirst: false });
        break;
      case 'price_high':
        query = query.order('price', { ascending: false, nullsFirst: false });
        break;
      case 'popular':
        query = query.order('views_count', { ascending: false });
        break;
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching marketplace listings:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchMarketplaceListings:', error);
    return [];
  }
};

export const incrementListingViews = async (listingId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_listing_views', {
      listing_uuid: listingId
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
};

export const addToFavorites = async (userId: string, listingId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('marketplace_favorites')
      .insert([
        {
          user_id: userId,
          listing_id: listingId
        }
      ]);

    if (error) throw error;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (userId: string, listingId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('marketplace_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const fetchUserFavorites = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('marketplace_favorites')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
};

export const createMarketplaceListing = async (listingData: Partial<MarketplaceListing>): Promise<MarketplaceListing> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .insert([listingData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating marketplace listing:', error);
    throw error;
  }
};
