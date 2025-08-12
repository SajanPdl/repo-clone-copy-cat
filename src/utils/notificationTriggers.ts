import notificationManager from '@/components/notifications/NotificationManager';
import { notificationService } from '@/services/notificationService';

// Notification trigger utilities for different app events

export class NotificationTriggers {
  // Study Material Notifications
  static async notifyNewStudyMaterial(
    userId: string,
    materialTitle: string,
    subject: string,
    grade: string,
    uploaderName: string
  ) {
    // Create database notification
    await notificationService.createNotification(
      userId,
      'study_alert',
      'New Study Material Available',
      `New ${subject} material for Grade ${grade} has been uploaded by ${uploaderName}`,
      {
        material_title: materialTitle,
        subject,
        grade,
        uploader: uploaderName
      },
      'normal'
    );

    // Show toast notification
    notificationManager.info(
      'New Study Material',
      `New ${subject} material for Grade ${grade} is now available!`,
      {
        priority: 'normal',
        actionLabel: 'View Material',
        onAction: () => {
          // Navigate to study materials page
          window.location.href = '/study-materials';
        }
      }
    );
  }

  // Marketplace Notifications
  static async notifyBookSold(
    userId: string,
    bookTitle: string,
    price: number,
    buyerName: string
  ) {
    // Create database notification
    await notificationService.createNotification(
      userId,
      'marketplace_update',
      'Book Sold!',
      `Congratulations! Your book "${bookTitle}" has been sold for ₹${price}`,
      {
        book_title: bookTitle,
        price,
        buyer: buyerName
      },
      'high'
    );

    // Show toast notification
    notificationManager.success(
      'Book Sold!',
      `Your book "${bookTitle}" has been sold for ₹${price}`,
      {
        priority: 'high',
        actionLabel: 'View Sale',
        onAction: () => {
          // Navigate to marketplace sales
          window.location.href = '/marketplace';
        }
      }
    );
  }

  static async notifyPurchaseRequest(
    userId: string,
    bookTitle: string,
    buyerName: string,
    offerPrice: number
  ) {
    // Create database notification
    await notificationService.createNotification(
      userId,
      'marketplace_update',
      'New Purchase Request',
      `${buyerName} wants to buy "${bookTitle}" for ₹${offerPrice}`,
      {
        book_title: bookTitle,
        buyer: buyerName,
        offer_price: offerPrice
      },
      'normal'
    );

    // Show toast notification
    notificationManager.info(
      'New Purchase Request',
      `${buyerName} wants to buy "${bookTitle}" for ₹${offerPrice}`,
      {
        priority: 'normal',
        actionLabel: 'Review Request',
        onAction: () => {
          // Navigate to purchase requests
          window.location.href = '/marketplace';
        }
      }
    );
  }

  // Payment Notifications
  static async notifyPaymentApproved(
    userId: string,
    amount: number,
    paymentMethod: string
  ) {
    // Create database notification
    await notificationService.createNotification(
      userId,
      'payment',
      'Payment Approved',
      `Your payment of ₹${amount} has been approved and credited to your wallet`,
      {
        amount,
        payment_method: paymentMethod
      },
      'high'
    );

    // Show toast notification
    notificationManager.success(
      'Payment Approved',
      `Your payment of ₹${amount} has been approved!`,
      {
        priority: 'high',
        actionLabel: 'View Wallet',
        onAction: () => {
          // Navigate to wallet
          window.location.href = '/wallet';
        }
      }
    );
  }

  static async notifyPaymentRejected(
    userId: string,
    amount: number,
    reason: string
  ) {
    // Create database notification
    await notificationService.createNotification(
      userId,
      'payment',
      'Payment Rejected',
      `Your payment of ₹${amount} was rejected: ${reason}`,
      {
        amount,
        reason
      },
      'high'
    );

    // Show toast notification
    notificationManager.error(
      'Payment Rejected',
      `Your payment of ₹${amount} was rejected: ${reason}`,
      {
        priority: 'high',
        actionLabel: 'Try Again',
        onAction: () => {
          // Navigate to checkout
          window.location.href = '/checkout';
        }
      }
    );
  }

  // Event Notifications
  static async notifyEventReminder(
    userId: string,
    eventName: string,
    eventTime: Date,
    eventLocation: string
  ) {
    const timeUntil = this.getTimeUntil(eventTime);
    
    // Create database notification
    await notificationService.createNotification(
      userId,
      'event_reminder',
      `Event Reminder: ${eventName}`,
      `Don't forget! ${eventName} is starting ${timeUntil} at ${eventLocation}`,
      {
        event_name: eventName,
        event_time: eventTime.toISOString(),
        event_location: eventLocation,
        time_until: timeUntil
      },
      'normal'
    );

    // Show toast notification
    notificationManager.warning(
      'Event Reminder',
      `${eventName} is starting ${timeUntil}`,
      {
        priority: 'normal',
        actionLabel: 'View Event',
        onAction: () => {
          // Navigate to events
          window.location.href = '/events';
        }
      }
    );
  }

  // Achievement Notifications
  static async notifyAchievementUnlocked(
    userId: string,
    achievementName: string,
    achievementDescription: string,
    pointsEarned: number
  ) {
    // Create database notification
    await notificationService.createNotification(
      userId,
      'achievement',
      `Achievement Unlocked: ${achievementName}`,
      `Congratulations! You've earned the ${achievementName} achievement and ${pointsEarned} points!`,
      {
        achievement_name: achievementName,
        achievement_description: achievementDescription,
        points_earned: pointsEarned
      },
      'high'
    );

    // Show toast notification
    notificationManager.success(
      'Achievement Unlocked!',
      `You've earned the ${achievementName} achievement!`,
      {
        priority: 'high',
        actionLabel: 'View Achievement',
        onAction: () => {
          // Navigate to achievements
          window.location.href = '/dashboard/achievements';
        }
      }
    );
  }

  // System Notifications
  static async notifyProPlanExpiry(
    userId: string,
    expiryDate: Date,
    daysUntilExpiry: number
  ) {
    const urgency = daysUntilExpiry <= 3 ? 'urgent' : daysUntilExpiry <= 7 ? 'high' : 'normal';
    
    // Create database notification
    await notificationService.createNotification(
      userId,
      'system_alert',
      'Pro Plan Expiring Soon',
      `Your Pro plan will expire on ${expiryDate.toLocaleDateString()}. Renew now to continue enjoying premium features!`,
      {
        expiry_date: expiryDate.toISOString(),
        days_until_expiry: daysUntilExpiry
      },
      urgency
    );

    // Show toast notification
    const notificationType = urgency === 'urgent' ? 'error' : urgency === 'high' ? 'warning' : 'info';
    const message = urgency === 'urgent' 
      ? `Your Pro plan expires in ${daysUntilExpiry} days!` 
      : `Your Pro plan expires on ${expiryDate.toLocaleDateString()}`;

    notificationManager[notificationType](
      'Pro Plan Expiring Soon',
      message,
      {
        priority: urgency,
        actionLabel: 'Renew Now',
        onAction: () => {
          // Navigate to subscription page
          window.location.href = '/subscription';
        }
      }
    );
  }

  // Promotion Notifications
  static async notifyPromoDiscount(
    userId: string,
    discountPercent: number,
    promoCode: string,
    validUntil: Date
  ) {
    // Create database notification
    await notificationService.createNotification(
      userId,
      'promotion',
      `Special Discount: ${discountPercent}% Off`,
      `Limited time offer! Get ${discountPercent}% off on Pro plan upgrade. Use code: ${promoCode}. Valid until ${validUntil.toLocaleDateString()}`,
      {
        discount_percent: discountPercent,
        promo_code: promoCode,
        valid_until: validUntil.toISOString()
      },
      'normal'
    );

    // Show toast notification
    notificationManager.info(
      'Special Discount!',
      `Get ${discountPercent}% off on Pro plan upgrade. Use code: ${promoCode}`,
      {
        priority: 'normal',
        actionLabel: 'Get Discount',
        onAction: () => {
          // Navigate to subscription page
          window.location.href = '/subscription';
        }
      }
    );
  }

  // Admin Announcements
  static async notifyAdminAnnouncement(
    userId: string,
    title: string,
    message: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ) {
    // Create database notification
    await notificationService.createNotification(
      userId,
      'admin_announcement',
      `Announcement: ${title}`,
      message,
      {
        title,
        message
      },
      priority
    );

    // Show toast notification based on priority
    const notificationType = priority === 'urgent' ? 'error' : 
                           priority === 'high' ? 'warning' : 'info';

    notificationManager[notificationType](
      `Announcement: ${title}`,
      message,
      {
        priority,
        actionLabel: 'View Details',
        onAction: () => {
          // Could navigate to announcements page or show modal
          console.log('Announcement clicked:', title);
        }
      }
    );
  }

  // Utility function to get time until event
  private static getTimeUntil(eventTime: Date): string {
    const now = new Date();
    const diff = eventTime.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `in ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return 'now';
    }
  }

  // Bulk notification for multiple users
  static async notifyMultipleUsers(
    userIds: string[],
    typeName: string,
    title: string,
    message: string,
    data: any = {},
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ) {
    const promises = userIds.map(userId =>
      notificationService.createNotification(userId, typeName, title, message, data, priority)
    );

    try {
      await Promise.all(promises);
      console.log(`Sent ${userIds.length} notifications`);
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
    }
  }

  // Test notification (for development)
  static testNotification(type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    notificationManager[type](
      'Test Notification',
      'This is a test notification to verify the system is working correctly.',
      {
        priority: 'normal',
        actionLabel: 'Test Action',
        onAction: () => {
          console.log('Test notification action clicked');
        }
      }
    );
  }
}

// Export for use in components
export default NotificationTriggers;
