
-- Create wallet system tables
CREATE TABLE public.seller_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  esewa_id TEXT,
  esewa_qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wallet transactions table
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.seller_wallets(id) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'commission')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference_id UUID, -- Can reference orders, withdrawals, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table for purchases
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users NOT NULL,
  seller_id UUID REFERENCES auth.users NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('study_material', 'past_paper', 'marketplace_item')),
  item_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- Commission percentage
  commission_amount DECIMAL(10,2),
  seller_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'payment_pending', 'paid', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment verifications table
CREATE TABLE public.payment_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  buyer_id UUID REFERENCES auth.users NOT NULL,
  receipt_file_path TEXT,
  payment_amount DECIMAL(10,2),
  esewa_transaction_id TEXT,
  admin_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_by UUID REFERENCES auth.users,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create withdrawal requests table
CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users NOT NULL,
  wallet_id UUID REFERENCES public.seller_wallets(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  esewa_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create site settings table for configurable options
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  reference_type TEXT, -- 'order', 'payment', 'withdrawal', etc.
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seller_wallets
CREATE POLICY "Users can view their own wallet" 
  ON public.seller_wallets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" 
  ON public.seller_wallets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet" 
  ON public.seller_wallets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets" 
  ON public.seller_wallets 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- RLS Policies for wallet_transactions
CREATE POLICY "Users can view their wallet transactions" 
  ON public.wallet_transactions 
  FOR SELECT 
  USING (EXISTS(SELECT 1 FROM public.seller_wallets WHERE id = wallet_id AND user_id = auth.uid()));

CREATE POLICY "Admins can manage all wallet transactions" 
  ON public.wallet_transactions 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" 
  ON public.orders 
  FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create their own orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admins can manage all orders" 
  ON public.orders 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- RLS Policies for payment_verifications
CREATE POLICY "Users can view their payment verifications" 
  ON public.payment_verifications 
  FOR SELECT 
  USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create their payment verifications" 
  ON public.payment_verifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admins can manage all payment verifications" 
  ON public.payment_verifications 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- RLS Policies for withdrawal_requests
CREATE POLICY "Users can view their withdrawal requests" 
  ON public.withdrawal_requests 
  FOR SELECT 
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can create withdrawal requests" 
  ON public.withdrawal_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all withdrawal requests" 
  ON public.withdrawal_requests 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- RLS Policies for site_settings
CREATE POLICY "Admins can manage site settings" 
  ON public.site_settings 
  FOR ALL 
  USING (is_admin(auth.uid()));

CREATE POLICY "Everyone can view site settings" 
  ON public.site_settings 
  FOR SELECT 
  USING (true);

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all notifications" 
  ON public.notifications 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Add update triggers
CREATE TRIGGER update_seller_wallets_updated_at
  BEFORE UPDATE ON public.seller_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_verifications_updated_at
  BEFORE UPDATE ON public.payment_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value, description) VALUES
('commission_rate', '10.00', 'Default commission rate percentage'),
('admin_esewa_id', '9876543210', 'Admin eSewa ID for payments'),
('admin_esewa_qr', '/images/admin-esewa-qr.png', 'Admin eSewa QR code image path'),
('min_withdrawal_amount', '100.00', 'Minimum withdrawal amount'),
('max_withdrawal_amount', '50000.00', 'Maximum withdrawal amount per request');

-- Create function to automatically create seller wallet
CREATE OR REPLACE FUNCTION public.create_seller_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.seller_wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create wallet when user is created
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.create_seller_wallet();

-- Create function to update wallet balance
CREATE OR REPLACE FUNCTION public.update_wallet_balance(
  p_wallet_id UUID,
  p_amount DECIMAL(10,2),
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert transaction record
  INSERT INTO public.wallet_transactions (wallet_id, transaction_type, amount, description, reference_id)
  VALUES (p_wallet_id, p_transaction_type, p_amount, p_description, p_reference_id);
  
  -- Update wallet balance
  IF p_transaction_type = 'credit' THEN
    UPDATE public.seller_wallets 
    SET balance = balance + p_amount, updated_at = now()
    WHERE id = p_wallet_id;
  ELSIF p_transaction_type = 'debit' THEN
    UPDATE public.seller_wallets 
    SET balance = balance - p_amount, updated_at = now()
    WHERE id = p_wallet_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to process order payment
CREATE OR REPLACE FUNCTION public.process_order_payment(
  p_order_id UUID,
  p_admin_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_order RECORD;
  v_wallet_id UUID;
BEGIN
  -- Get order details
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Calculate commission and seller amount
  UPDATE public.orders 
  SET 
    commission_amount = (amount * commission_rate / 100),
    seller_amount = amount - (amount * commission_rate / 100),
    status = 'paid',
    updated_at = now()
  WHERE id = p_order_id;
  
  -- Get or create seller wallet
  SELECT id INTO v_wallet_id 
  FROM public.seller_wallets 
  WHERE user_id = v_order.seller_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.seller_wallets (user_id) 
    VALUES (v_order.seller_id) 
    RETURNING id INTO v_wallet_id;
  END IF;
  
  -- Credit seller wallet
  PERFORM public.update_wallet_balance(
    v_wallet_id,
    v_order.amount - (v_order.amount * v_order.commission_rate / 100),
    'credit',
    'Payment for order #' || p_order_id::TEXT,
    p_order_id
  );
  
  -- Create notification for seller
  INSERT INTO public.notifications (user_id, title, message, type, reference_type, reference_id)
  VALUES (
    v_order.seller_id,
    'Payment Received',
    'You have received payment for your order. Amount credited to your wallet.',
    'success',
    'order',
    p_order_id
  );
  
  -- Create notification for buyer
  INSERT INTO public.notifications (user_id, title, message, type, reference_type, reference_id)
  VALUES (
    v_order.buyer_id,
    'Payment Approved',
    'Your payment has been approved. You now have access to the purchased item.',
    'success',
    'order',
    p_order_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
