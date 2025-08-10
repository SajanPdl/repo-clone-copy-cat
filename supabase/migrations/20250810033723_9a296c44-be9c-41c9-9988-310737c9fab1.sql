
-- Fix wallet transactions table structure to match the component expectations
ALTER TABLE public.wallet_transactions 
ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS esewa_id text,
ADD COLUMN IF NOT EXISTS processed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS processed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS admin_notes text;

-- Create withdrawal_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  amount numeric NOT NULL,
  esewa_id text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  admin_notes text
);

-- Enable RLS on withdrawal_requests
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can create their own withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Users can view their own withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Admins can manage all withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Users can view their own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can insert their own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can update their own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Admins can view all payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.seller_wallets;
DROP POLICY IF EXISTS "Users can update their own wallet" ON public.seller_wallets;
DROP POLICY IF EXISTS "Admins can view all wallets" ON public.seller_wallets;

-- Create policies for withdrawal_requests
CREATE POLICY "Users can create their own withdrawal requests" ON public.withdrawal_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own withdrawal requests" ON public.withdrawal_requests
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all withdrawal requests" ON public.withdrawal_requests
FOR ALL USING (is_admin(auth.uid()));

-- Create payment_requests table for subscription payments
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  plan_type text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'NPR',
  payment_method text DEFAULT 'esewa',
  transaction_id text,
  sender_name text,
  receipt_file_path text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  verified_at timestamp with time zone,
  verified_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on payment_requests
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_requests
CREATE POLICY "Users can create their own payment requests" ON public.payment_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment requests" ON public.payment_requests
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payment requests" ON public.payment_requests
FOR ALL USING (is_admin(auth.uid()));

-- Update wallet_transactions policies to handle new columns
DROP POLICY IF EXISTS "Users can view their wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view their wallet transactions" ON public.wallet_transactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM seller_wallets 
    WHERE seller_wallets.id = wallet_transactions.wallet_id 
    AND seller_wallets.user_id = auth.uid()
  ) OR 
  wallet_transactions.seller_id = auth.uid()
);

-- Create or update seller_wallets table
CREATE TABLE IF NOT EXISTS public.seller_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  balance numeric DEFAULT 0,
  esewa_id text,
  total_earnings numeric DEFAULT 0,
  total_withdrawals numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on seller_wallets
ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;

-- Create policies for seller_wallets
CREATE POLICY "Users can view their own wallet" ON public.seller_wallets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON public.seller_wallets
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all wallets" ON public.seller_wallets
FOR ALL USING (is_admin(auth.uid()));

-- Create function to get wallet transactions with user profiles
CREATE OR REPLACE FUNCTION get_wallet_transactions_with_profiles()
RETURNS TABLE (
  id uuid,
  wallet_id uuid,
  seller_id uuid,
  amount numeric,
  status text,
  esewa_id text,
  processed_at timestamp with time zone,
  processed_by uuid,
  admin_notes text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  username text,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    wt.id,
    wt.wallet_id,
    wt.seller_id,
    wt.amount,
    wt.status,
    wt.esewa_id,
    wt.processed_at,
    wt.processed_by,
    wt.admin_notes,
    wt.created_at,
    wt.updated_at,
    u.username,
    u.email
  FROM wallet_transactions wt
  LEFT JOIN users u ON u.id = wt.seller_id
  ORDER BY wt.created_at DESC;
END;
$$;
