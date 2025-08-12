import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ToastNotification, { ToastNotificationProps } from './ToastNotification';

export interface NotificationItem extends Omit<ToastNotificationProps, 'onClose'> {
  id: string;
  timestamp: number;
}

interface NotificationManagerProps {
  maxNotifications?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

class NotificationManagerClass {
  private listeners: Set<(notifications: NotificationItem[]) => void> = new Set();
  private notifications: NotificationItem[] = [];
  private maxNotifications: number = 5;

  constructor(maxNotifications: number = 5) {
    this.maxNotifications = maxNotifications;
  }

  // Add a new notification
  add(notification: Omit<NotificationItem, 'id' | 'timestamp'>): string {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationItem = {
      ...notification,
      id,
      timestamp: Date.now()
    };

    this.notifications.unshift(newNotification);
    
    // Limit the number of notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    this.notifyListeners();
    return id;
  }

  // Remove a notification
  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  // Clear all notifications
  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  // Get current notifications
  getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  // Subscribe to notification changes
  subscribe(listener: (notifications: NotificationItem[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.notifications); // Initial call
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.notifications]);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // Convenience methods for different notification types
  success(title: string, message: string, options?: Partial<NotificationItem>): string {
    return this.add({
      title,
      message,
      type: 'success',
      ...options
    });
  }

  error(title: string, message: string, options?: Partial<NotificationItem>): string {
    return this.add({
      title,
      message,
      type: 'error',
      ...options
    });
  }

  warning(title: string, message: string, options?: Partial<NotificationItem>): string {
    return this.add({
      title,
      message,
      type: 'warning',
      ...options
    });
  }

  info(title: string, message: string, options?: Partial<NotificationItem>): string {
    return this.add({
      title,
      message,
      type: 'info',
      ...options
    });
  }

  default(title: string, message: string, options?: Partial<NotificationItem>): string {
    return this.add({
      title,
      message,
      type: 'default',
      ...options
    });
  }
}

// Create global instance
export const notificationManager = new NotificationManagerClass();

// React component for rendering notifications
export const NotificationManager: React.FC<NotificationManagerProps> = ({
  maxNotifications = 5,
  position = 'top-right'
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    notificationManager.maxNotifications = maxNotifications;
    return notificationManager.subscribe(setNotifications);
  }, [maxNotifications]);

  const handleClose = useCallback((id: string) => {
    notificationManager.remove(id);
  }, []);

  const handleAction = useCallback((notification: NotificationItem) => {
    // Handle notification actions here
    console.log('Notification action triggered:', notification);
  }, []);

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  // Don't render if no notifications
  if (notifications.length === 0) {
    return null;
  }

  // Render notifications
  return createPortal(
    <div className={`fixed z-50 space-y-3 ${getPositionClasses()}`}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3
            }}
            style={{
              zIndex: 1000 - index // Stack notifications properly
            }}
          >
            <ToastNotification
              {...notification}
              onClose={handleClose}
              onAction={() => handleAction(notification)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

// Export the manager instance for use in other components
export default notificationManager;

// Export types for use in other components
export type { NotificationItem };
