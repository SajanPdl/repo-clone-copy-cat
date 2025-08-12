import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import notificationService, {
  AppNotification,
  NotificationType,
  NotificationPreference
} from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

interface NotificationContextType {
  // State
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  connectionStatus: boolean;
  hasPermission: boolean;
  
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
  
  // Utility functions
  showToast: (notification: AppNotification) => void;
  createNotification: (typeName: string, title: string, message: string, data?: any, priority?: 'low' | 'normal' | 'high' | 'urgent') => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  
  const offsetRef = React.useRef(0);
  const hasMoreRef = React.useRef(true);
  const isLoadingMoreRef = React.useRef(false);

  // Auto-request notification permission on mount
  useEffect(() => {
    const autoRequestPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        try {
          const permission = await Notification.requestPermission();
          setHasPermission(permission === 'granted');
          
          if (permission === 'granted') {
            toast({
              title: "Notifications Enabled",
              description: "You'll now receive important updates and alerts.",
              variant: "default"
            });
          }
        } catch (error) {
          console.error('Failed to request notification permission:', error);
        }
      } else {
        setHasPermission(Notification.permission === 'granted');
      }
    };

    autoRequestPermission();
  }, [toast]);

  // Initialize notifications
  const initializeNotifications = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
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

  // Show toast notification
  const showToast = useCallback((notification: AppNotification) => {
    const variant = notification.priority === 'urgent' ? 'destructive' : 
                   notification.priority === 'high' ? 'default' : 'default';
    
    toast({
      title: notification.title,
      description: notification.message,
      variant,
      duration: notification.priority === 'urgent' ? 0 : 5000,
    });
  }, [toast]);

  // Create notification (for other parts of the app)
  const createNotification = useCallback(async (
    typeName: string, 
    title: string, 
    message: string, 
    data: any = {}, 
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ) => {
    if (!user) return;
    
    try {
      await notificationService.createNotification(
        user.id,
        typeName,
        title,
        message,
        data,
        priority
      );
    } catch (err) {
      console.error('Failed to create notification:', err);
    }
  }, [user]);

  // Real-time notification handlers
  const handleNewNotification = useCallback((notification: AppNotification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    showToast(notification);
    
    // Show browser notification if enabled
    if (hasPermission && notification.priority !== 'low') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        data: notification
      });
    }
  }, [hasPermission, showToast]);

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

  const value: NotificationContextType = {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    connectionStatus,
    hasPermission,
    
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
    
    // Utility functions
    showToast,
    createNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
