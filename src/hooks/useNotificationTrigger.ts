import { useNotificationContext } from '@/contexts/NotificationContext';

export const useNotificationTrigger = () => {
  const { createNotification } = useNotificationContext();

  const triggerNotification = async (
    typeName: string,
    title: string,
    message: string,
    data?: any,
    priority?: 'low' | 'normal' | 'high' | 'urgent'
  ) => {
    await createNotification(typeName, title, message, data, priority);
  };

  // Predefined notification triggers
  const notifyNewStudyMaterial = async (materialTitle: string, subject: string) => {
    await triggerNotification(
      'study_alert',
      'New Study Material Available',
      `New material "${materialTitle}" has been added to ${subject}`,
      { materialTitle, subject },
      'normal'
    );
  };

  const notifyBookSold = async (bookTitle: string, price: number) => {
    await triggerNotification(
      'marketplace_update',
      'Book Sold!',
      `Congratulations! Your book "${bookTitle}" has been sold for $${price}`,
      { bookTitle, price },
      'high'
    );
  };

  const notifyPurchaseRequest = async (bookTitle: string, buyerName: string) => {
    await triggerNotification(
      'marketplace_update',
      'New Purchase Request',
      `${buyerName} wants to buy your book "${bookTitle}"`,
      { bookTitle, buyerName },
      'normal'
    );
  };

  const notifyPaymentApproved = async (amount: number, description: string) => {
    await triggerNotification(
      'payment',
      'Payment Approved',
      `Your payment of $${amount} for ${description} has been approved`,
      { amount, description },
      'high'
    );
  };

  const notifyPaymentRejected = async (amount: number, description: string, reason: string) => {
    await triggerNotification(
      'payment',
      'Payment Rejected',
      `Your payment of $${amount} for ${description} was rejected: ${reason}`,
      { amount, description, reason },
      'high'
    );
  };

  const notifyEventReminder = async (eventTitle: string, eventTime: string) => {
    await triggerNotification(
      'event_reminder',
      'Event Reminder',
      `Don't forget: ${eventTitle} starts in ${eventTime}`,
      { eventTitle, eventTime },
      'normal'
    );
  };

  const notifyAchievementUnlocked = async (achievementName: string, points: number) => {
    await triggerNotification(
      'achievement',
      'Achievement Unlocked!',
      `Congratulations! You've earned "${achievementName}" and ${points} points`,
      { achievementName, points },
      'high'
    );
  };

  const notifyProPlanExpiry = async (daysLeft: number) => {
    await triggerNotification(
      'system_alert',
      'Pro Plan Expiring Soon',
      `Your Pro plan expires in ${daysLeft} days. Renew to keep enjoying premium features.`,
      { daysLeft },
      'urgent'
    );
  };

  const notifyPromoDiscount = async (discount: string, validUntil: string) => {
    await triggerNotification(
      'promotion',
      'Special Discount Available',
      `Get ${discount} off! This offer is valid until ${validUntil}`,
      { discount, validUntil },
      'normal'
    );
  };

  const notifyAdminAnnouncement = async (title: string, message: string) => {
    await triggerNotification(
      'admin_announcement',
      title,
      message,
      {},
      'high'
    );
  };

  return {
    triggerNotification,
    notifyNewStudyMaterial,
    notifyBookSold,
    notifyPurchaseRequest,
    notifyPaymentApproved,
    notifyPaymentRejected,
    notifyEventReminder,
    notifyAchievementUnlocked,
    notifyProPlanExpiry,
    notifyPromoDiscount,
    notifyAdminAnnouncement
  };
};
