-- One wallet per user: table, constraints, trigger, RPC, and RLS (idempotent)

-- 1) Table and unique(user_id)
CREATE TABLE IF NOT EXISTS public.seller_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  esewa_id TEXT,
  total_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_withdrawals NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.seller_wallets ADD CONSTRAINT unique_user_wallet UNIQUE (user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) updated_at trigger
CREATE OR REPLACE FUNCTION public.update_seller_wallets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_seller_wallets_timestamp ON public.seller_wallets;
CREATE TRIGGER update_seller_wallets_timestamp
  BEFORE UPDATE ON public.seller_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_seller_wallets_timestamp();

-- 3) Clean duplicates: keep highest balance + most recent
DELETE FROM public.seller_wallets w
USING public.seller_wallets d
WHERE w.user_id = d.user_id
  AND w.id <> d.id
  AND (w.balance < d.balance OR (w.balance = d.balance AND w.created_at < d.created_at));

-- 4) Auto-create wallet on new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Create platform user record if you use a separate users table
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;

  -- Ensure a wallet exists for every new auth user
  INSERT INTO public.seller_wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5) Safe RPC: get or create wallet and return id
CREATE OR REPLACE FUNCTION public.get_or_create_user_wallet(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE wallet_id uuid;
BEGIN
  SELECT id INTO wallet_id FROM public.seller_wallets WHERE user_id = get_or_create_user_wallet.user_id;
  IF wallet_id IS NULL THEN
    INSERT INTO public.seller_wallets (user_id) VALUES (get_or_create_user_wallet.user_id)
    RETURNING id INTO wallet_id;
  END IF;
  RETURN wallet_id;
END $$;

-- 6) RLS
ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallet_select_own" ON public.seller_wallets;
CREATE POLICY "wallet_select_own" ON public.seller_wallets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wallet_update_own" ON public.seller_wallets;
CREATE POLICY "wallet_update_own" ON public.seller_wallets
  FOR UPDATE USING (auth.uid() = user_id);


