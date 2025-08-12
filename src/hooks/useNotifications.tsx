import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import notificationService, {
  AppNotification,
  NotificationType,
  NotificationPreference
} from '@/services/notificationService';

export interface UseNotificationsReturn {
  // State
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  connectionStatus: boolean;
  
  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  
  // Preferences
  preferences: NotificationPreference[];
  updatePreference: (typeId: number, preferences: Partial<NotificationPreference>) => Promise<void>;
  
  // Browser notifications
  requestPermission: () => Promise<boolean>;
  hasPermission: boolean;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  
  const offsetRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isLoadingMoreRef = useRef(false);

  // Initialize notifications
  const initializeNotifications = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load initial notifications
      const [initialNotifications, count, userPreferences] = await Promise.all([
        notificationService.getRecentNotifications(20, 0),
        notificationService.getUnreadCount(),
        notificationService.getNotificationPreferences()
      ]);
      
      setNotifications(initialNotifications);
      setUnreadCount(count);
      setPreferences(userPreferences);
      offsetRef.current = 20;
      hasMoreRef.current = initialNotifications.length === 20;
      
      // Check browser notification permission
      setHasPermission(Notification.permission === 'granted');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load more notifications
  const loadMoreNotifications = useCallback(async () => {
    if (!user || isLoadingMoreRef.current || !hasMoreRef.current) return;
    
    isLoadingMoreRef.current = true;
    
    try {
      const moreNotifications = await notificationService.getRecentNotifications(20, offsetRef.current);
      
      if (moreNotifications.length > 0) {
        setNotifications(prev => [...prev, ...moreNotifications]);
        offsetRef.current += moreNotifications.length;
        hasMoreRef.current = moreNotifications.length === 20;
      } else {
        hasMoreRef.current = false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more notifications');
    } finally {
      isLoadingMoreRef.current = false;
    }
  }, [user]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const [refreshedNotifications, count] = await Promise.all([
        notificationService.getRecentNotifications(20, 0),
        notificationService.getUnreadCount()
      ]);
      
      setNotifications(refreshedNotifications);
      setUnreadCount(count);
      offsetRef.current = 20;
      hasMoreRef.current = refreshedNotifications.length === 20;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh notifications');
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await notificationService.markAsRead(notificationId);
      if (success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const count = await notificationService.markAllAsRead();
      if (count > 0) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  }, []);

  // Update notification preference
  const updatePreference = useCallback(async (
    typeId: number, 
    preferences: Partial<NotificationPreference>
  ) => {
    try {
      const success = await notificationService.updateNotificationPreference(typeId, preferences);
      if (success) {
        setPreferences(prev => 
          prev.map(pref => 
            pref.type_id === typeId 
              ? { ...pref, ...preferences }
              : pref
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification preference');
    }
  }, []);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    try {
      const granted = await notificationService.requestNotificationPermission();
      setHasPermission(granted);
      return granted;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request notification permission');
      return false;
    }
  }, []);

  // Real-time notification handlers
  const handleNewNotification = useCallback((notification: AppNotification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Note: Toast notifications should be handled by individual components
    // using the useToast hook when needed
  }, []);

  const handleNotificationUpdate = useCallback((updatedNotification: AppNotification) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === updatedNotification.id 
          ? updatedNotification
          : notification
      )
    );
    
    // Update unread count if needed
    if (updatedNotification.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  // Initialize on mount and user change
  useEffect(() => {
    if (user) {
      initializeNotifications();
      
      // Set up real-time listeners
      notificationService.addListener('new', handleNewNotification);
      notificationService.addListener('update', handleNotificationUpdate);
      
      // Update connection status
      const updateConnectionStatus = () => {
        setConnectionStatus(notificationService.getConnectionStatus());
      };
      
      updateConnectionStatus();
      const interval = setInterval(updateConnectionStatus, 5000);
      
      return () => {
        notificationService.removeListener('new', handleNewNotification);
        notificationService.removeListener('update', handleNotificationUpdate);
        clearInterval(interval);
      };
    } else {
      // Reset state when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setPreferences([]);
      setError(null);
      offsetRef.current = 0;
      hasMoreRef.current = true;
    }
  }, [user, initializeNotifications, handleNewNotification, handleNotificationUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      notificationService.removeListener('new', handleNewNotification);
      notificationService.removeListener('update', handleNotificationUpdate);
    };
  }, [handleNewNotification, handleNotificationUpdate]);

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    connectionStatus,
    
    // Actions
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    loadMoreNotifications,
    
    // Preferences
    preferences,
    updatePreference,
    
    // Browser notifications
    requestPermission,
    hasPermission
  };
};

export default useNotifications;
