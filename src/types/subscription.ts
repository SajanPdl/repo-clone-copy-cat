
import type { Json } from '@/integrations/supabase/types';

export interface SubscriptionPlan {
  id: string;
  plan_code: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  payment_request_id: string | null;
  status: 'active' | 'expired' | 'cancelled';
  starts_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  subscription_plans?: SubscriptionPlan;
}

export interface PaymentRequest {
  id: string;
  user_id: string;
  plan_type: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id: string | null;
  sender_name: string | null;
  receipt_file_path: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithPlan extends UserSubscription {
  plan_code: string;
  plan_name: string;
  days_remaining: number;
}

// Database plan interface for type safety
export interface DatabasePlan {
  id: string;
  plan_code: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number;
  features: Json;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Helper function to transform database types
export const transformSubscriptionPlan = (dbPlan: DatabasePlan): SubscriptionPlan => ({
  ...dbPlan,
  features: Array.isArray(dbPlan.features) ? dbPlan.features as string[] : 
            typeof dbPlan.features === 'string' ? JSON.parse(dbPlan.features as string) : []
});

// Alternative name for backward compatibility
export const transformDatabasePlan = transformSubscriptionPlan;

export const transformPaymentRequest = (dbPayment: Record<string, unknown>): PaymentRequest => ({
  ...dbPayment,
  id: dbPayment.id as string,
  user_id: dbPayment.user_id as string,
  plan_type: dbPayment.plan_type as string,
  amount: dbPayment.amount as number,
  currency: dbPayment.currency as string,
  payment_method: dbPayment.payment_method as string,
  transaction_id: dbPayment.transaction_id as string | null,
  sender_name: dbPayment.sender_name as string | null,
  receipt_file_path: dbPayment.receipt_file_path as string | null,
  status: dbPayment.status as 'pending' | 'approved' | 'rejected',
  admin_notes: dbPayment.admin_notes as string | null,
  verified_at: dbPayment.verified_at as string | null,
  verified_by: dbPayment.verified_by as string | null,
  created_at: dbPayment.created_at as string,
  updated_at: dbPayment.updated_at as string
});
