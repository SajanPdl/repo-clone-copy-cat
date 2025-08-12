import notificationService from '@/services/notificationService';
import { notificationManager } from '@/components/notifications/NotificationManager';

// Enhanced notification trigger functions with all requested features

export class NotificationTriggers {
  // Study Materials Notifications
  static async notifyNewStudyMaterial(
    userId: string,
    materialData: {
      id: string;
      title: string;
      subject: string;
      thumbnail_url?: string;
    }
  ) {
    const notificationId = await notificationService.createNotification(
      userId,
      'study_material_added',
      '📚 New Study Material Available',
      `"${materialData.title}" has been added to ${materialData.subject}`,
      materialData,
      'normal',
      'study',
      materialData.thumbnail_url,
      `/study-materials/${materialData.id}`,
      'View Material'
    );

    if (notificationId) {
      notificationManager.add({
        title: '📚 New Study Material',
        description: `"${materialData.title}" has been added to ${materialData.subject}`,
        variant: 'default',
        action: {
          label: 'View Material',
          onClick: () => window.open(`/study-materials/${materialData.id}`, '_blank')
        }
      });
    }
  }

  // Payment & Wallet Notifications
  static async notifyPaymentApproved(
    userId: string,
    paymentData: {
      id: string;
      amount: number;
      method: string;
      description: string;
    }
  ) {
    const notificationId = await notificationService.createNotification(
      userId,
      'payment_approved',
      '💰 Payment Approved',
      `Your payment of Rs. ${paymentData.amount} via ${paymentData.method} has been approved`,
      paymentData,
      'high',
      'payment',
      undefined,
      `/wallet/transactions/${paymentData.id}`,
      'View Transaction'
    );

    if (notificationId) {
      notificationManager.add({
        title: '💰 Payment Approved',
        description: `Your payment of Rs. ${paymentData.amount} via ${paymentData.method} has been approved`,
        variant: 'default',
        action: {
          label: 'View Transaction',
          onClick: () => window.open(`/wallet/transactions/${paymentData.id}`, '_blank')
        }
      });
    }
  }

  static async notifyWithdrawalApproved(
    userId: string,
    withdrawalData: {
      id: string;
      amount: number;
      account: string;
      method: string;
    }
  ) {
    const notificationId = await notificationService.createNotification(
      userId,
      'withdrawal_approved',
      '✅ Withdrawal Approved',
      `Your withdrawal request of Rs. ${withdrawalData.amount} has been approved and sent to your ${withdrawalData.method} account`,
      withdrawalData,
      'high',
      'payment',
      undefined,
      `/wallet/withdrawals/${withdrawalData.id}`,
      'View Wallet'
    );

    if (notificationId) {
      notificationManager.add({
        title: '✅ Withdrawal Approved',
        description: `Your withdrawal request of Rs. ${withdrawalData.amount} has been approved and sent to your ${withdrawalData.method} account`,
        variant: 'default',
        action: {
          label: 'View Wallet',
          onClick: () => window.open(`/wallet/withdrawals/${withdrawalData.id}`, '_blank')
        }
      });
    }
  }

  // Marketplace Notifications
  static async notifyBookSold(
    userId: string,
    saleData: {
      id: string;
      book_title: string;
      buyer_name: string;
      amount: number;
      product_image?: string;
    }
  ) {
    const notificationId = await notificationService.createNotification(
      userId,
      'book_sold',
      '🛒 Book Sold!',
      `"${saleData.book_title}" has been sold to ${saleData.buyer_name} for Rs. ${saleData.amount}`,
      saleData,
      'high',
      'marketplace',
      saleData.product_image,
      `/marketplace/sales/${saleData.id}`,
      'View Sale'
    );

    if (notificationId) {
      notificationManager.add({
        title: '🛒 Book Sold!',
        description: `"${saleData.book_title}" has been sold to ${saleData.buyer_name} for Rs. ${saleData.amount}`,
        variant: 'default',
        action: {
          label: 'View Sale',
          onClick: () => window.open(`/marketplace/sales/${saleData.id}`, '_blank')
        }
      });
    }
  }

  static async notifyOrderStatus(
    userId: string,
    orderData: {
      id: string;
      status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
      product_title: string;
      seller_name: string;
      product_image?: string;
    }
  ) {
    const statusMessages = {
      pending: 'Your order is being processed',
      confirmed: 'Your order has been confirmed',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled'
    };

    const statusIcons = {
      pending: '⏳',
      confirmed: '✅',
      shipped: '📦',
      delivered: '🎉',
      cancelled: '❌'
    };

    const notificationId = await notificationService.createNotification(
      userId,
      'order_status_update',
      `${statusIcons[orderData.status]} Order ${orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}`,
      `${statusMessages[orderData.status]} for "${orderData.product_title}" from ${orderData.seller_name}`,
      orderData,
      orderData.status === 'delivered' ? 'high' : 'normal',
      'orders',
      orderData.product_image,
      `/marketplace/orders/${orderData.id}`,
      'View Order'
    );

    if (notificationId) {
      notificationManager.add({
        title: `${statusIcons[orderData.status]} Order ${orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}`,
        description: `${statusMessages[orderData.status]} for "${orderData.product_title}" from ${orderData.seller_name}`,
        variant: orderData.status === 'cancelled' ? 'destructive' : 'default',
        action: {
          label: 'View Order',
          onClick: () => window.open(`/marketplace/orders/${orderData.id}`, '_blank')
        }
      });
    }
  }

  // Event Notifications
  static async notifyEventReminder(
    userId: string,
    eventData: {
      id: string;
      title: string;
      start_time: string;
      location?: string;
      event_image?: string;
    }
  ) {
    const startTime = new Date(eventData.start_time);
    const timeUntil = Math.floor((startTime.getTime() - Date.now()) / (1000 * 60)); // minutes

    const notificationId = await notificationService.createNotification(
      userId,
      'event_reminder',
      '📅 Event Reminder',
      `"${eventData.title}" starts in ${timeUntil} minutes${eventData.location ? ` at ${eventData.location}` : ''}`,
      eventData,
      'high',
      'events',
      eventData.event_image,
      `/events/${eventData.id}`,
      'Join Event'
    );

    if (notificationId) {
      notificationManager.add({
        title: '📅 Event Reminder',
        description: `"${eventData.title}" starts in ${timeUntil} minutes${eventData.location ? ` at ${eventData.location}` : ''}`,
        variant: 'default',
        action: {
          label: 'Join Event',
          onClick: () => window.open(`/events/${eventData.id}`, '_blank')
        }
      });
    }
  }

  // Achievement & Gamification Notifications
  static async notifyAchievementUnlocked(
    userId: string,
    achievementData: {
      id: string;
      title: string;
      description: string;
      points: number;
      badge_image?: string;
    }
  ) {
    const notificationId = await notificationService.createNotification(
      userId,
      'achievement_unlocked',
      '🏆 Achievement Unlocked!',
      `You've earned "${achievementData.title}" and ${achievementData.points} points!`,
      achievementData,
      'high',
      'ai',
      achievementData.badge_image,
      `/profile/achievements/${achievementData.id}`,
      'View Achievement'
    );

    if (notificationId) {
      notificationManager.add({
        title: '🏆 Achievement Unlocked!',
        description: `You've earned "${achievementData.title}" and ${achievementData.points} points!`,
        variant: 'default',
        action: {
          label: 'View Achievement',
          onClick: () => window.open(`/profile/achievements/${achievementData.id}`, '_blank')
        }
      });
    }
  }

  // Subscription Notifications
  static async notifyProPlanExpiry(
    userId: string,
    subscriptionData: {
      plan_name: string;
      expires_at: string;
      days_remaining: number;
    }
  ) {
    const notificationId = await notificationService.createNotification(
      userId,
      'pro_plan_expiry',
      '⚠️ Pro Plan Expiring Soon',
      `Your ${subscriptionData.plan_name} plan expires in ${subscriptionData.days_remaining} days`,
      subscriptionData,
      'urgent',
      'payment',
      undefined,
      '/subscription',
      'Renew Plan'
    );

    if (notificationId) {
      notificationManager.add({
        title: '⚠️ Pro Plan Expiring Soon',
        description: `Your ${subscriptionData.plan_name} plan expires in ${subscriptionData.days_remaining} days`,
        variant: 'destructive',
        action: {
          label: 'Renew Plan',
          onClick: () => window.open('/subscription', '_blank')
        }
      });
    }
  }

  // Promotional Notifications
  static async notifyPromoDiscount(
    userId: string,
    promoData: {
      code: string;
      discount_percent: number;
      valid_until: string;
      applicable_items?: string[];
    }
  ) {
    const notificationId = await notificationService.createNotification(
      userId,
      'promo_discount',
      '🎉 Special Discount!',
      `Use code "${promoData.code}" for ${promoData.discount_percent}% off${promoData.applicable_items ? ` on ${promoData.applicable_items.join(', ')}` : ''}`,
      promoData,
      'normal',
      'ads',
      undefined,
      '/marketplace',
      'Shop Now'
    );

    if (notificationId) {
      notificationManager.add({
        title: '🎉 Special Discount!',
        description: `Use code "${promoData.code}" for ${promoData.discount_percent}% off${promoData.applicable_items ? ` on ${promoData.applicable_items.join(', ')}` : ''}`,
        variant: 'default',
        action: {
          label: 'Shop Now',
          onClick: () => window.open('/marketplace', '_blank')
        }
      });
    }
  }

  // Admin Announcements
  static async notifyAdminAnnouncement(
    userId: string,
    announcementData: {
      title: string;
      message: string;
      priority: 'low' | 'normal' | 'high' | 'urgent';
      action_url?: string;
      action_text?: string;
    }
  ) {
    const notificationId = await notificationService.createNotification(
      userId,
      'admin_announcement',
      announcementData.title,
      announcementData.message,
      announcementData,
      announcementData.priority,
      'messages',
      undefined,
      announcementData.action_url,
      announcementData.action_text
    );

    if (notificationId) {
      notificationManager.add({
        title: announcementData.title,
        description: announcementData.message,
        variant: announcementData.priority === 'urgent' ? 'destructive' : 'default',
        action: announcementData.action_url && announcementData.action_text ? {
          label: announcementData.action_text,
          onClick: () => window.open(announcementData.action_url!, '_blank')
        } : undefined
      });
    }
  }

  // Bulk Notifications with Smart Grouping
  static async notifyMultipleUsers(
    userIds: string[],
    notificationData: {
      type: string;
      title: string;
      message: string;
      category: string;
      priority: 'low' | 'normal' | 'high' | 'urgent';
      group_id?: string;
      action_url?: string;
      action_text?: string;
    }
  ) {
    const promises = userIds.map(userId =>
      notificationService.createNotification(
        userId,
        notificationData.type,
        notificationData.title,
        notificationData.message,
        notificationData,
        notificationData.priority,
        notificationData.category,
        undefined,
        notificationData.action_url,
        notificationData.action_text,
        undefined,
        notificationData.group_id
      )
    );

    const results = await Promise.allSettled(promises);
    const successCount = results.filter(result => result.status === 'fulfilled').length;

    console.log(`Sent notifications to ${successCount}/${userIds.length} users`);
    return successCount;
  }

  // AI Assistant Notifications
  static async notifyAITip(
    userId: string,
    tipData: {
      tip_type: 'study' | 'productivity' | 'health' | 'motivation';
      title: string;
      content: string;
      related_content_url?: string;
    }
  ) {
    const tipIcons = {
      study: '📚',
      productivity: '⚡',
      health: '💪',
      motivation: '🔥'
    };

    const notificationId = await notificationService.createNotification(
      userId,
      'ai_tip',
      `${tipIcons[tipData.tip_type]} AI Study Tip`,
      tipData.title,
      tipData,
      'low',
      'ai',
      undefined,
      tipData.related_content_url,
      'Learn More'
    );

    if (notificationId) {
      notificationManager.add({
        title: `${tipIcons[tipData.tip_type]} AI Study Tip`,
        description: tipData.title,
        variant: 'default',
        action: tipData.related_content_url ? {
          label: 'Learn More',
          onClick: () => window.open(tipData.related_content_url!, '_blank')
        } : undefined
      });
    }
  }

  // Test Notification (for development)
  static async testNotification(userId: string) {
    const testData = {
      id: 'test-' + Date.now(),
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working correctly.',
      category: 'messages',
      priority: 'normal' as const
    };

    const notificationId = await notificationService.createNotification(
      userId,
      'test_notification',
      testData.title,
      testData.message,
      testData,
      testData.priority,
      testData.category,
      undefined,
      '/notifications',
      'View All'
    );

    if (notificationId) {
      notificationManager.add({
        title: testData.title,
        description: testData.message,
        variant: 'default',
        action: {
          label: 'View All',
          onClick: () => window.open('/notifications', '_blank')
        }
      });
    }

    return notificationId;
  }

  // Urgent System Notifications
  static async notifySystemAlert(
    userId: string,
    alertData: {
      type: 'maintenance' | 'security' | 'update' | 'error';
      title: string;
      message: string;
      action_url?: string;
      action_text?: string;
    }
  ) {
    const alertIcons = {
      maintenance: '🔧',
      security: '🔒',
      update: '🔄',
      error: '⚠️'
    };

    const notificationId = await notificationService.createNotification(
      userId,
      'system_alert',
      `${alertIcons[alertData.type]} ${alertData.title}`,
      alertData.message,
      alertData,
      'urgent',
      'messages',
      undefined,
      alertData.action_url,
      alertData.action_text
    );

    if (notificationId) {
      notificationManager.add({
        title: `${alertIcons[alertData.type]} ${alertData.title}`,
        description: alertData.message,
        variant: 'destructive',
        action: alertData.action_url && alertData.action_text ? {
          label: alertData.action_text,
          onClick: () => window.open(alertData.action_url!, '_blank')
        } : undefined
      });
    }
  }
}

// Export individual functions for backward compatibility
export const {
  notifyNewStudyMaterial,
  notifyPaymentApproved,
  notifyWithdrawalApproved,
  notifyBookSold,
  notifyOrderStatus,
  notifyEventReminder,
  notifyAchievementUnlocked,
  notifyProPlanExpiry,
  notifyPromoDiscount,
  notifyAdminAnnouncement,
  notifyMultipleUsers,
  notifyAITip,
  testNotification,
  notifySystemAlert
} = NotificationTriggers;
