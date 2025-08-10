
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
