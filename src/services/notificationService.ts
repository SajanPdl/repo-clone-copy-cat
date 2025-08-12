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
}

export interface NotificationType {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  type_id: number;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
}

export interface NotificationTemplate {
  id: number;
  name: string;
  type_id: number;
  title_template: string;
  message_template: string;
  variables: any;
}

class NotificationService {
  private realtimeChannel: any = null;
  private listeners: Map<string, Function[]> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.initializeRealtime();
  }

  // Initialize real-time connection
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
  }

  private handleNotificationUpdate(notification: any) {
    this.notifyListeners('update', notification);
  }

  private showBrowserNotification(notification: any) {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      data: notification
    });
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

  // Get recent notifications
  async getRecentNotifications(limit: number = 20, offset: number = 0): Promise<AppNotification[]> {
    try {
      const { data, error } = await supabase.rpc('get_recent_notifications', { p_limit: limit, p_offset: offset });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recent notifications:', error);
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

  // Get notification types
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
    preferences: Partial<Pick<NotificationPreference, 'email_enabled' | 'push_enabled' | 'in_app_enabled'>>
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

  // Create notification (admin function)
  async createNotification(
    userId: string,
    typeName: string,
    title: string,
    message: string,
    data: any = {},
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
    expiresAt?: Date
  ): Promise<string | null> {
    try {
      const { data: result, error } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_type_name: typeName,
        p_title: title,
        p_message: message,
        p_data: data,
        p_priority: priority,
        p_expires_at: expiresAt?.toISOString()
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
}

// Create singleton instance
export const notificationService = new NotificationService();

// Export for use in components
export default notificationService;
