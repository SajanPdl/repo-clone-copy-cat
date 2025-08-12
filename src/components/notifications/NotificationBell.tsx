import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Settings, Volume2, VolumeX, Check, CheckCheck, Filter, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useNotifications from '@/hooks/useNotifications';
import { AppNotification, NotificationGroup } from '@/services/notificationService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
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

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'important'>('all');
  const [groupedNotifications, setGroupedNotifications] = useState<NotificationGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('notification_sound_enabled') !== 'false');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Animate bell when new notification arrives
  useEffect(() => {
    if (unreadCount > 0 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [unreadCount, isAnimating]);

  // Group notifications
  useEffect(() => {
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
        
        if (new Date(notification.created_at) > new Date(group.latest_notification.created_at)) {
          group.latest_notification = notification;
        }
      }
    });

    setGroupedNotifications(Array.from(groups.values()).sort((a, b) => 
      new Date(b.latest_notification.created_at).getTime() - 
      new Date(a.latest_notification.created_at).getTime()
    ));
  }, [notifications]);

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

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem('notification_sound_enabled', newSoundEnabled.toString());
  };

  const getCategoryInfo = (category: string) => {
    const categoryMap: Record<string, { icon: string; color: string; bgColor: string }> = {
      study: { icon: '📚', color: 'text-blue-600', bgColor: 'bg-blue-50' },
      payment: { icon: '💰', color: 'text-green-600', bgColor: 'bg-green-50' },
      marketplace: { icon: '🛒', color: 'text-orange-600', bgColor: 'bg-orange-50' },
      ads: { icon: '🎯', color: 'text-purple-600', bgColor: 'bg-purple-50' },
      ai: { icon: '🤖', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
      events: { icon: '📅', color: 'text-red-600', bgColor: 'bg-red-50' },
      messages: { icon: '💬', color: 'text-gray-600', bgColor: 'bg-gray-50' },
      orders: { icon: '📦', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      approvals: { icon: '✅', color: 'text-green-600', bgColor: 'bg-green-50' }
    };

    return categoryMap[category] || { icon: '🔔', color: 'text-gray-600', bgColor: 'bg-gray-50' };
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'unread':
        return !notification.is_read;
      case 'important':
        return notification.priority === 'high' || notification.priority === 'urgent';
      default:
        return true;
    }
  });

  const filteredGroups = groupedNotifications.filter(group => {
    const hasUnread = group.notifications.some(n => !n.is_read);
    const hasImportant = group.notifications.some(n => n.priority === 'high' || n.priority === 'urgent');
    
    switch (activeTab) {
      case 'unread':
        return hasUnread;
      case 'important':
        return hasImportant;
      default:
        return true;
    }
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-8 h-8 sm:w-9 sm:h-9 transition-all duration-200",
          isAnimating && "animate-pulse",
          className
        )}
      >
        <motion.div
          animate={isAnimating ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        </motion.div>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}

        {/* Connection Status Indicator */}
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full",
          connectionStatus ? "bg-green-500" : "bg-red-500"
        )} />
      </Button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSound}
                  className="w-8 h-8"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleMarkAllAsRead}>
                      <CheckCheck className="mr-2 h-4 w-4" />
                      Mark all as read
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={refreshNotifications}>
                      <Settings className="mr-2 h-4 w-4" />
                      Refresh
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => requestPermission()}>
                      <Bell className="mr-2 h-4 w-4" />
                      {hasPermission ? 'Notifications enabled' : 'Enable notifications'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="important">Important</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <div className="max-h-64 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading notifications...
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center text-red-500">
                      Error loading notifications
                    </div>
                  ) : filteredGroups.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredGroups.map((group) => {
                        const categoryInfo = getCategoryInfo(group.category);
                        const isExpanded = expandedGroups.has(group.id);
                        const hasUnread = group.notifications.some(n => !n.is_read);
                        
                        return (
                          <motion.div
                            key={group.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer",
                              hasUnread && "bg-blue-50 dark:bg-blue-900/20"
                            )}
                            onClick={() => toggleGroupExpansion(group.id)}
                          >
                            {/* Group Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-lg",
                                  categoryInfo.bgColor
                                )}>
                                  {categoryInfo.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {group.latest_notification.title}
                                    </h4>
                                    {group.count > 1 && (
                                      <Badge variant="outline" className="text-xs">
                                        {group.count}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                    {group.latest_notification.message}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <span className="text-xs text-gray-400">
                                      {formatDistanceToNow(new Date(group.latest_notification.created_at), { addSuffix: true })}
                                    </span>
                                    {hasUnread && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center space-x-1">
                                {hasUnread && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-6 h-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      group.notifications.forEach(n => {
                                        if (!n.is_read) handleMarkAsRead(n.id);
                                      });
                                    }}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Expanded Notifications */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="mt-3 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3"
                                >
                                  {group.notifications.slice(0, 3).map((notification) => (
                                    <div
                                      key={notification.id}
                                      className={cn(
                                        "p-2 rounded border-l-2 transition-colors",
                                        notification.is_read 
                                          ? "border-gray-200 dark:border-gray-600" 
                                          : "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                      )}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm text-gray-900 dark:text-gray-100">
                                            {notification.title}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {notification.message}
                                          </p>
                                          {notification.thumbnail_url && (
                                            <img
                                              src={notification.thumbnail_url}
                                              alt=""
                                              className="w-8 h-8 rounded mt-2 object-cover"
                                            />
                                          )}
                                        </div>
                                        {!notification.is_read && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-6 h-6 ml-2"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleMarkAsRead(notification.id);
                                            }}
                                          >
                                            <Check className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                      {notification.action_url && notification.action_text && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="mt-2 w-full"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(notification.action_url, '_blank');
                                            handleMarkAsRead(notification.id);
                                          }}
                                        >
                                          {notification.action_text}
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                  {group.notifications.length > 3 && (
                                    <div className="text-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Load more notifications for this group
                                        }}
                                      >
                                        View {group.notifications.length - 3} more
                                      </Button>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      // Navigate to full notifications page
                      window.location.href = '/notifications';
                    }}
                  >
                    View All Notifications
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
