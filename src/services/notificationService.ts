import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

export interface AppNotification {
  id: string;
  type_name: string;
  title: string;
  message: string;
  data: any;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  icon: string;
  color: string;
  category: 'study' | 'payment' | 'marketplace' | 'ads' | 'ai' | 'events' | 'messages' | 'orders' | 'approvals';
  thumbnail_url?: string;
  action_url?: string;
  action_text?: string;
  expires_at?: string;
  group_id?: string;
  group_count?: number;
}

export interface NotificationType {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
  category: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  type_id: number;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  muted_until?: string;
}

export interface NotificationTemplate {
  id: number;
  name: string;
  type_id: number;
  title_template: string;
  message_template: string;
  variables: any;
}

export interface NotificationGroup {
  id: string;
  category: string;
  title: string;
  count: number;
  latest_notification: AppNotification;
  notifications: AppNotification[];
  is_expanded: boolean;
}

class NotificationService {
  private realtimeChannel: any = null;
  private listeners: Map<string, Function[]> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initializeRealtime();
    this.initializeServiceWorker();
  }

  // Initialize Service Worker for push notifications
  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered for push notifications');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Initialize real-time connection with enhanced error handling
  private async initializeRealtime() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      this.realtimeChannel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            this.handleNewNotification(payload.new);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            this.handleNotificationUpdate(payload.new);
          }
        )
        .subscribe((status) => {
          this.isConnected = status === 'SUBSCRIBED';
          if (this.isConnected) {
            this.reconnectAttempts = 0;
            console.log('Notification real-time connection established');
          } else {
            console.log('Notification real-time connection lost');
            this.scheduleReconnect();
          }
        });

    } catch (error) {
      console.error('Failed to initialize real-time notifications:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.initializeRealtime();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleNewNotification(notification: any) {
    this.notifyListeners('new', notification);
    
    // Show browser notification if enabled
    if (Notification.permission === 'granted') {
      this.showBrowserNotification(notification);
    }

    // Send push notification if service worker is available
    if (this.serviceWorkerRegistration) {
      this.sendPushNotification(notification);
    }

    // Play notification sound (if enabled)
    this.playNotificationSound(notification.priority);
  }

  private handleNotificationUpdate(notification: any) {
    this.notifyListeners('update', notification);
  }

  private showBrowserNotification(notification: any) {
    const options: NotificationOptions = {
      body: notification.message,
      icon: notification.thumbnail_url || '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      data: notification,
      actions: notification.action_text ? [
        {
          action: 'view',
          title: notification.action_text
        }
      ] : undefined
    };

    const browserNotification = new Notification(notification.title, options);
    
    browserNotification.onclick = () => {
      if (notification.action_url) {
        window.open(notification.action_url, '_blank');
      }
      browserNotification.close();
    };
  }

  private async sendPushNotification(notification: any) {
    if (!this.serviceWorkerRegistration) return;

    try {
      await this.serviceWorkerRegistration.showNotification(notification.title, {
        body: notification.message,
        icon: notification.thumbnail_url || '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        data: notification,
        actions: notification.action_text ? [
          {
            action: 'view',
            title: notification.action_text
          }
        ] : undefined
      });
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  private playNotificationSound(priority: string) {
    // Check if sound is enabled in user preferences
    const soundEnabled = localStorage.getItem('notification_sound_enabled') !== 'false';
    if (!soundEnabled) return;

    try {
      const audio = new Audio();
      switch (priority) {
        case 'urgent':
          audio.src = '/sounds/urgent-notification.mp3';
          break;
        case 'high':
          audio.src = '/sounds/high-notification.mp3';
          break;
        default:
          audio.src = '/sounds/notification.mp3';
      }
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback to system beep for browsers that don't support audio
        console.log('\u0007');
      });
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }

  // Event listener management
  public addListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public removeListener(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in notification listener:', error);
        }
      });
    }
  }

  // Get unread notification count
  async getUnreadCount(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_unread_notification_count');
      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Get recent notifications with grouping
  async getRecentNotifications(limit: number = 20, offset: number = 0, filter: 'all' | 'unread' | 'important' = 'all'): Promise<AppNotification[]> {
    try {
      const { data, error } = await supabase.rpc('get_recent_notifications', { 
        p_limit: limit, 
        p_offset: offset,
        p_filter: filter
      });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recent notifications:', error);
      return [];
    }
  }

  // Get grouped notifications
  async getGroupedNotifications(): Promise<NotificationGroup[]> {
    try {
      const notifications = await this.getRecentNotifications(50, 0);
      const groups = new Map<string, NotificationGroup>();

      notifications.forEach(notification => {
        const groupKey = notification.group_id || notification.category;
        
        if (!groups.has(groupKey)) {
          groups.set(groupKey, {
            id: groupKey,
            category: notification.category,
            title: notification.title,
            count: 1,
            latest_notification: notification,
            notifications: [notification],
            is_expanded: false
          });
        } else {
          const group = groups.get(groupKey)!;
          group.count++;
          group.notifications.push(notification);
          
          // Update latest notification if this one is newer
          if (new Date(notification.created_at) > new Date(group.latest_notification.created_at)) {
            group.latest_notification = notification;
          }
        }
      });

      return Array.from(groups.values()).sort((a, b) => 
        new Date(b.latest_notification.created_at).getTime() - 
        new Date(a.latest_notification.created_at).getTime()
      );
    } catch (error) {
      console.error('Error getting grouped notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('mark_notification_read', { p_notification_id: notificationId });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('mark_all_notifications_read');
      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }
  }

  // Get notification types with categories
  async getNotificationTypes(): Promise<NotificationType[]> {
    try {
      const { data, error } = await supabase
        .from('notification_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting notification types:', error);
      return [];
    }
  }

  // Get user notification preferences
  async getNotificationPreferences(): Promise<NotificationPreference[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return [];
    }
  }

  // Update notification preference
  async updateNotificationPreference(
    typeId: number, 
    preferences: Partial<Pick<NotificationPreference, 'email_enabled' | 'push_enabled' | 'in_app_enabled' | 'muted_until'>>
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          type_id: typeId,
          ...preferences
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating notification preference:', error);
      return false;
    }
  }

  // Mute notifications for a specific duration
  async muteNotifications(hours: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const mutedUntil = new Date();
      mutedUntil.setHours(mutedUntil.getHours() + hours);

      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          muted_until: mutedUntil.toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error muting notifications:', error);
      return false;
    }
  }

  // Create notification with enhanced data
  async createNotification(
    userId: string,
    typeName: string,
    title: string,
    message: string,
    data: any = {},
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
    category: string = 'messages',
    thumbnailUrl?: string,
    actionUrl?: string,
    actionText?: string,
    expiresAt?: Date,
    groupId?: string
  ): Promise<string | null> {
    try {
      const { data: result, error } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_type_name: typeName,
        p_title: title,
        p_message: message,
        p_data: data,
        p_priority: priority,
        p_category: category,
        p_thumbnail_url: thumbnailUrl,
        p_action_url: actionUrl,
        p_action_text: actionText,
        p_expires_at: expiresAt?.toISOString(),
        p_group_id: groupId
      });

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Archive old notifications
  async archiveOldNotifications(daysOld: number = 30): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('archive_old_notifications', { p_days_old: daysOld });
      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error archiving old notifications:', error);
      return 0;
    }
  }

  // Request browser notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications(): Promise<boolean> {
    if (!this.serviceWorkerRegistration) {
      console.log('Service Worker not available');
      return false;
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
      });

      // Send subscription to server
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          subscription: subscription
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  // Disconnect real-time connection
  public disconnect() {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
    this.isConnected = false;
  }

  // Check connection status
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Get notification category icon and color
  public getCategoryInfo(category: string): { icon: string; color: string } {
    const categoryMap: Record<string, { icon: string; color: string }> = {
      study: { icon: '📚', color: 'text-blue-600' },
      payment: { icon: '💰', color: 'text-green-600' },
      marketplace: { icon: '🛒', color: 'text-orange-600' },
      ads: { icon: '🎯', color: 'text-purple-600' },
      ai: { icon: '🤖', color: 'text-indigo-600' },
      events: { icon: '📅', color: 'text-red-600' },
      messages: { icon: '💬', color: 'text-gray-600' },
      orders: { icon: '📦', color: 'text-yellow-600' },
      approvals: { icon: '✅', color: 'text-green-600' }
    };

    return categoryMap[category] || { icon: '🔔', color: 'text-gray-600' };
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Export for use in components
export default notificationService;
