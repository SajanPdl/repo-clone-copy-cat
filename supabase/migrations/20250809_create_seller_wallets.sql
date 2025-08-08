-- Migration: Create seller_wallets table for wallet management
CREATE TABLE public.seller_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL DEFAULT 0,
  esewa_id TEXT,
  total_earnings NUMERIC DEFAULT 0,
  total_withdrawals NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own wallet
CREATE POLICY "Users can view their own wallet" ON public.seller_wallets FOR SELECT USING (auth.uid() = user_id);

-- RLS: Users can update their own wallet (for profile updates, not balance)
CREATE POLICY "Users can update their own wallet" ON public.seller_wallets FOR UPDATE USING (auth.uid() = user_id);

-- RLS: Admins can view/update all wallets
CREATE POLICY "Admins can view all wallets" ON public.seller_wallets FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update all wallets" ON public.seller_wallets FOR UPDATE USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_seller_wallets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seller_wallets_timestamp
    BEFORE UPDATE ON public.seller_wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_wallets_timestamp();
