import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Settings, X, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import { cn, formatDistanceToNow } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationBellProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className,
  variant = 'ghost',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    loadMoreNotifications,
    preferences,
    updatePreference,
    requestPermission,
    hasPermission
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    // TODO: Navigate to relevant page based on notification data
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleRefresh = async () => {
    await refreshNotifications();
  };

  const handleLoadMore = async () => {
    await loadMoreNotifications();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'High';
      case 'normal': return 'Normal';
      case 'low': return 'Low';
      default: return 'Normal';
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10'
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant={variant}
        size="icon"
        className={cn(
          sizeClasses[size],
          'relative',
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Badge 
              variant="destructive" 
              className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          </motion.div>
        )}
      </Button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 z-50"
          >
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <div className="flex items-center gap-2">
                    {/* Connection Status */}
                    <div className="flex items-center gap-1">
                      {connectionStatus ? (
                        <Wifi className="h-4 w-4 text-green-500" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    {/* Settings Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowSettings(!showSettings)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                    
                    {/* Close Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="text-xs"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    <RefreshCw className={cn("h-3 w-3 mr-1", { "animate-spin": isLoading })} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {showSettings ? (
                  <NotificationSettings
                    preferences={preferences}
                    updatePreference={updatePreference}
                    requestPermission={requestPermission}
                    hasPermission={hasPermission}
                  />
                ) : (
                  <NotificationList
                    notifications={notifications}
                    isLoading={isLoading}
                    error={error}
                    onNotificationClick={handleNotificationClick}
                    onLoadMore={handleLoadMore}
                    onMarkAsRead={markAsRead}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Notification List Component
interface NotificationListProps {
  notifications: any[];
  isLoading: boolean;
  error: string | null;
  onNotificationClick: (notification: any) => void;
  onLoadMore: () => void;
  onMarkAsRead: (id: string) => Promise<void>;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading,
  error,
  onNotificationClick,
  onLoadMore,
  onMarkAsRead
}) => {
  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p className="text-sm">Failed to load notifications</p>
        <Button variant="outline" size="sm" onClick={onLoadMore} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  if (notifications.length === 0 && !isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No notifications yet</p>
        <p className="text-xs">We'll notify you when something important happens</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-96">
      <div className="space-y-1">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={cn(
              "p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800",
              !notification.is_read && "bg-blue-50 dark:bg-blue-900/20"
            )}
            onClick={() => onNotificationClick(notification)}
          >
            <div className="flex items-start gap-3">
              {/* Priority Indicator */}
              <div className={cn(
                "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                getPriorityColor(notification.priority)
              )} />
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {notification.title}
                  </h4>
                  {!notification.is_read && (
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                  
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Load More Button */}
        {notifications.length >= 20 && (
          <div className="p-3 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

// Notification Settings Component
interface NotificationSettingsProps {
  preferences: any[];
  updatePreference: (typeId: number, preferences: any) => Promise<void>;
  requestPermission: () => Promise<boolean>;
  hasPermission: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  preferences,
  updatePreference,
  requestPermission,
  hasPermission
}) => {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        <h4 className="font-medium">Browser Notifications</h4>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {hasPermission ? 'Notifications enabled' : 'Notifications disabled'}
          </span>
          <Button
            variant={hasPermission ? 'outline' : 'default'}
            size="sm"
            onClick={requestPermission}
          >
            {hasPermission ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-3">
        <h4 className="font-medium">Notification Types</h4>
        <div className="space-y-2">
          {preferences.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between">
              <span className="text-sm">{pref.type_name}</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={pref.in_app_enabled}
                    onChange={(e) => updatePreference(pref.type_id, { in_app_enabled: e.target.checked })}
                    className="rounded"
                  />
                  In-app
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={pref.push_enabled}
                    onChange={(e) => updatePreference(pref.type_id, { push_enabled: e.target.checked })}
                    className="rounded"
                  />
                  Push
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;
