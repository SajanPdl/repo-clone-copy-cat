
-- Create table for AI study sessions
CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for wallet transactions
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES seller_wallets(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  amount NUMERIC NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for withdrawal requests
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  esewa_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on new tables
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for study_sessions
CREATE POLICY "Users can manage their own study sessions" 
  ON public.study_sessions 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all study sessions" 
  ON public.study_sessions 
  FOR SELECT 
  USING (is_admin(auth.uid()));

-- Create RLS policies for wallet_transactions
CREATE POLICY "Users can view their own wallet transactions" 
  ON public.wallet_transactions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM seller_wallets 
    WHERE seller_wallets.id = wallet_transactions.wallet_id 
    AND seller_wallets.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all wallet transactions" 
  ON public.wallet_transactions 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Create RLS policies for withdrawal_requests
CREATE POLICY "Users can create their own withdrawal requests" 
  ON public.withdrawal_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own withdrawal requests" 
  ON public.withdrawal_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all withdrawal requests" 
  ON public.withdrawal_requests 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Create storage bucket for payment receipts (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for payment receipts
CREATE POLICY "Users can upload their own receipts" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own receipts" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all receipts" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'payment-receipts' AND is_admin(auth.uid()));
