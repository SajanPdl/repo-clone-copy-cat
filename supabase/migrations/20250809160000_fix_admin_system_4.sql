
-- First, let's fix the RLS policy issue for study_materials table
-- We need to ensure admins can insert data properly

-- Update the admin insertion policy for study_materials
DROP POLICY IF EXISTS "Admins can insert study materials" ON study_materials;

CREATE POLICY "Admins can insert study materials" 
ON study_materials 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create marketplace tables for the new module
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('book', 'notes', 'pdf', 'question_bank', 'calculator', 'device', 'other')),
  subject TEXT,
  university TEXT,
  price DECIMAL(10,2),
  is_free BOOLEAN DEFAULT FALSE,
  condition TEXT CHECK (condition IN ('new', 'used', 'fair', 'excellent')),
  location TEXT,
  contact_info JSONB,
  images TEXT[], -- Array of image URLs
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'exchanged', 'inactive')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  interest_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketplace inquiries table
CREATE TABLE public.marketplace_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  inquirer_id UUID REFERENCES auth.users NOT NULL,
  message TEXT NOT NULL,
  contact_info JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create favorites/wishlist table
CREATE TABLE public.marketplace_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Create seller ratings table
CREATE TABLE public.seller_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users NOT NULL,
  buyer_id UUID REFERENCES auth.users NOT NULL,
  listing_id UUID REFERENCES marketplace_listings(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(seller_id, buyer_id, listing_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for marketplace_listings
CREATE POLICY "Anyone can view approved listings" 
ON marketplace_listings 
FOR SELECT 
USING (is_approved = true AND status = 'active');

CREATE POLICY "Users can view their own listings" 
ON marketplace_listings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all listings" 
ON marketplace_listings 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Users can insert their own listings" 
ON marketplace_listings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" 
ON marketplace_listings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all listings" 
ON marketplace_listings 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Users can delete their own listings" 
ON marketplace_listings 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any listing" 
ON marketplace_listings 
FOR DELETE 
USING (is_admin(auth.uid()));

-- RLS policies for marketplace_inquiries
CREATE POLICY "Users can view inquiries for their listings" 
ON marketplace_inquiries 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM marketplace_listings 
    WHERE id = listing_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own inquiries" 
ON marketplace_inquiries 
FOR SELECT 
USING (auth.uid() = inquirer_id);

CREATE POLICY "Users can create inquiries" 
ON marketplace_inquiries 
FOR INSERT 
WITH CHECK (auth.uid() = inquirer_id);

-- RLS policies for marketplace_favorites
CREATE POLICY "Users can manage their own favorites" 
ON marketplace_favorites 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for seller_ratings
CREATE POLICY "Anyone can view ratings" 
ON seller_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create ratings" 
ON seller_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_listing_views(listing_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.marketplace_listings 
  SET views_count = views_count + 1 
  WHERE id = listing_uuid;
END;
$$;

-- Function to increment interest count
CREATE OR REPLACE FUNCTION public.increment_listing_interest(listing_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.marketplace_listings 
  SET interest_count = interest_count + 1 
  WHERE id = listing_uuid;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_marketplace_listings_updated_at
    BEFORE UPDATE ON public.marketplace_listings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
