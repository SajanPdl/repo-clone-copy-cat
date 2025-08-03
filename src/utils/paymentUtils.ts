
import { supabase } from '@/integrations/supabase/client';

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  item_type: 'study_material' | 'past_paper' | 'marketplace_item';
  item_id: string;
  amount: number;
  commission_rate: number;
  commission_amount?: number;
  seller_amount?: number;
  status: 'pending' | 'payment_pending' | 'paid' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface PaymentVerification {
  id: string;
  order_id: string;
  buyer_id: string;
  receipt_file_path?: string;
  payment_amount?: number;
  esewa_transaction_id?: string;
  admin_notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SellerWallet {
  id: string;
  user_id: string;
  balance: number;
  esewa_id?: string;
  esewa_qr_code?: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequest {
  id: string;
  seller_id: string;
  wallet_id: string;
  amount: number;
  esewa_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  commission_rate: string;
  admin_esewa_id: string;
  admin_esewa_qr: string;
  min_withdrawal_amount: string;
  max_withdrawal_amount: string;
}

export const createOrder = async (
  sellerId: string,
  itemType: Order['item_type'],
  itemId: string,
  amount: number
) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('orders')
    .insert([{
      buyer_id: user.user.id,
      seller_id: sellerId,
      item_type: itemType,
      item_id: itemId,
      amount: amount,
      status: 'payment_pending'
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Order;
};

export const uploadPaymentReceipt = async (
  orderId: string,
  receiptFile: File,
  paymentAmount: number,
  esewaTransactionId: string
) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  // Upload receipt file
  const fileExt = receiptFile.name.split('.').pop();
  const fileName = `receipts/${orderId}_${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, receiptFile);

  if (uploadError) throw uploadError;

  // Create payment verification record
  const { data, error } = await supabase
    .from('payment_verifications')
    .insert([{
      order_id: orderId,
      buyer_id: user.user.id,
      receipt_file_path: fileName,
      payment_amount: paymentAmount,
      esewa_transaction_id: esewaTransactionId
    }])
    .select()
    .single();

  if (error) throw error;
  return data as PaymentVerification;
};

export const getSellerWallet = async (userId: string) => {
  const { data, error } = await supabase
    .from('seller_wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  // Create wallet if doesn't exist
  if (!data) {
    const { data: newWallet, error: createError } = await supabase
      .from('seller_wallets')
      .insert([{ user_id: userId }])
      .select()
      .single();
    
    if (createError) throw createError;
    return newWallet as SellerWallet;
  }
  
  return data as SellerWallet;
};

export const getUserOrders = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .or(`buyer_id.eq.${user.user.id},seller_id.eq.${user.user.id}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Order[];
};

export const getWalletTransactions = async (walletId: string) => {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createWithdrawalRequest = async (
  walletId: string,
  amount: number,
  esewaId: string
) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('withdrawal_requests')
    .insert([{
      seller_id: user.user.id,
      wallet_id: walletId,
      amount: amount,
      esewa_id: esewaId
    }])
    .select()
    .single();

  if (error) throw error;
  return data as WithdrawalRequest;
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('setting_key, setting_value');

  if (error) throw error;

  const settings: any = {};
  data.forEach((setting) => {
    settings[setting.setting_key] = setting.setting_value;
  });

  return settings as SiteSettings;
};

export const updateSellerEsewaInfo = async (esewaId: string, esewaQrFile?: File) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  let esewaQrPath = undefined;
  
  if (esewaQrFile) {
    const fileExt = esewaQrFile.name.split('.').pop();
    const fileName = `esewa_qr/${user.user.id}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, esewaQrFile);

    if (uploadError) throw uploadError;
    esewaQrPath = fileName;
  }

  const updateData: any = { esewa_id: esewaId };
  if (esewaQrPath) updateData.esewa_qr_code = esewaQrPath;

  const { data, error } = await supabase
    .from('seller_wallets')
    .update(updateData)
    .eq('user_id', user.user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
