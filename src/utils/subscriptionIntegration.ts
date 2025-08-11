import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { SubscriptionPlan, PaymentRequest } from '@/types/subscription';

export interface SubscriptionIntegrationConfig {
  autoRefreshInterval?: number; // in milliseconds
  enableNotifications?: boolean;
  enableAutoRedirect?: boolean;
}

export class SubscriptionIntegration {
  private config: SubscriptionIntegrationConfig;
  private refreshInterval: NodeJS.Timeout | null = null;

  constructor(config: SubscriptionIntegrationConfig = {}) {
    this.config = {
      autoRefreshInterval: 30000, // 30 seconds
      enableNotifications: true,
      enableAutoRedirect: true,
      ...config
    };
  }

  // Initialize subscription integration
  async initialize() {
    try {
      // Set up real-time subscription for payment status updates
      this.setupRealtimeSubscription();
      
      // Start auto-refresh if enabled
      if (this.config.autoRefreshInterval) {
        this.startAutoRefresh();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize subscription integration:', error);
      return false;
    }
  }

  // Set up real-time subscription for payment status updates
  private setupRealtimeSubscription() {
    const { data: { user } } = supabase.auth.getUser();
    if (!user) return;

    // Subscribe to payment_requests changes for the current user
    supabase
      .channel('payment_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_requests',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          this.handlePaymentStatusChange(payload);
        }
      )
      .subscribe();

    // Subscribe to user_subscriptions changes for the current user
    supabase
      .channel('user_subscriptions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          this.handleSubscriptionChange(payload);
        }
      )
      .subscribe();
  }

  // Handle payment status changes
  private handlePaymentStatusChange(payload: any) {
    if (!this.config.enableNotifications) return;

    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'UPDATE' && newRecord.status !== oldRecord?.status) {
      const status = newRecord.status;
      const planType = newRecord.plan_type;

      switch (status) {
        case 'approved':
          toast({
            title: 'Payment Approved! 🎉',
            description: `Your ${planType} subscription is now active.`,
            duration: 5000
          });
          break;
        case 'rejected':
          toast({
            title: 'Payment Rejected',
            description: 'Please check the admin notes and submit a new payment if needed.',
            variant: 'destructive',
            duration: 5000
          });
          break;
      }
    }
  }

  // Handle subscription changes
  private handleSubscriptionChange(payload: any) {
    if (!this.config.enableNotifications) return;

    const { eventType, new: newRecord } = payload;

    if (eventType === 'INSERT') {
      toast({
        title: 'Subscription Activated! 🎉',
        description: 'Your subscription is now active and ready to use.',
        duration: 5000
      });
    }
  }

  // Start auto-refresh
  private startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      this.refreshSubscriptionData();
    }, this.config.autoRefreshInterval);
  }

  // Stop auto-refresh
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Refresh subscription data
  async refreshSubscriptionData() {
    try {
      // Trigger a custom event that components can listen to
      window.dispatchEvent(new CustomEvent('subscription-refresh'));
    } catch (error) {
      console.error('Failed to refresh subscription data:', error);
    }
  }

  // Check if user has active subscription
  async hasActiveSubscription(planCode?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('has_active_subscription', {
        user_id: user.id,
        plan_code: planCode || null
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  // Get user's current subscription
  async getCurrentSubscription() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.rpc('get_user_subscription', {
        user_id: user.id
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error getting current subscription:', error);
      return null;
    }
  }

  // Submit payment request
  async submitPaymentRequest(
    planCode: string,
    transactionId: string,
    senderName: string,
    receiptFile?: File
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get plan details
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('plan_code', planCode)
        .eq('is_active', true)
        .single();

      if (planError || !planData) throw new Error('Invalid subscription plan');

      let receiptPath = null;

      // Upload receipt file if provided
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-receipts')
          .upload(filePath, receiptFile);

        if (uploadError) throw uploadError;
        receiptPath = filePath;
      }

      // Create payment request
      const { error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          plan_type: planCode,
          amount: planData.price,
          currency: planData.currency || 'NPR',
          transaction_id: transactionId,
          sender_name: senderName,
          receipt_file_path: receiptPath,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Payment Request Submitted',
        description: 'We will verify your payment and activate your subscription soon.',
        duration: 5000
      });

      return true;
    } catch (error) {
      console.error('Error submitting payment request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit payment request. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  }

  // Get payment requests for current user
  async getPaymentRequests(): Promise<PaymentRequest[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      return [];
    }
  }

  // Get available subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  }

  // Cleanup
  destroy() {
    this.stopAutoRefresh();
    supabase.removeAllChannels();
  }
}

// Create a global instance
export const subscriptionIntegration = new SubscriptionIntegration();

// Export convenience functions
export const checkSubscriptionStatus = () => subscriptionIntegration.hasActiveSubscription();
export const getCurrentSubscription = () => subscriptionIntegration.getCurrentSubscription();
export const submitPayment = (planCode: string, transactionId: string, senderName: string, receiptFile?: File) => 
  subscriptionIntegration.submitPaymentRequest(planCode, transactionId, senderName, receiptFile);
export const getPaymentHistory = () => subscriptionIntegration.getPaymentRequests();
export const getAvailablePlans = () => subscriptionIntegration.getSubscriptionPlans();
