import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ToastNotificationProps {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'default';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  duration?: number;
  onClose: (id: string) => void;
  onAction?: () => void;
  actionLabel?: string;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  id,
  title,
  message,
  type = 'default',
  priority = 'normal',
  duration = 5000,
  onClose,
  onAction,
  actionLabel
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // Auto-hide timer
  useEffect(() => {
    if (priority === 'urgent') return; // Urgent notifications don't auto-hide

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) return 0;
        return prev - (100 / (duration / 100));
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [duration, priority]);

  // Handle close
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Wait for exit animation
  };

  // Handle action
  const handleAction = () => {
    if (onAction) {
      onAction();
      handleClose();
    }
  };

  // Get icon and colors based on type
  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-200',
          iconColor: 'text-green-500'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          iconColor: 'text-red-500'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          iconColor: 'text-yellow-500'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
          iconColor: 'text-blue-500'
        };
      default:
        return {
          icon: Bell,
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          textColor: 'text-gray-800 dark:text-gray-200',
          iconColor: 'text-gray-500'
        };
    }
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = getIconAndColors();

  // Priority-based styling
  const getPriorityStyles = () => {
    switch (priority) {
      case 'urgent':
        return 'ring-2 ring-red-500 ring-opacity-50 shadow-lg';
      case 'high':
        return 'ring-1 ring-orange-500 ring-opacity-30 shadow-md';
      case 'normal':
        return 'shadow-sm';
      case 'low':
        return 'shadow-sm opacity-90';
      default:
        return 'shadow-sm';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3
          }}
          className={cn(
            "relative w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg border p-4",
            bgColor,
            borderColor,
            getPriorityStyles()
          )}
        >
          {/* Progress bar for auto-hide */}
          {priority !== 'urgent' && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
              <motion.div
                className="h-full bg-current opacity-20"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          )}

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close notification"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>

          {/* Content */}
          <div className="flex gap-3 pr-6">
            {/* Icon */}
            <div className={cn("flex-shrink-0", iconColor)}>
              <Icon className="h-5 w-5" />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h4 className={cn("text-sm font-medium mb-1", textColor)}>
                {title}
              </h4>
              <p className={cn("text-sm", textColor)}>
                {message}
              </p>

              {/* Action button */}
              {onAction && actionLabel && (
                <button
                  onClick={handleAction}
                  className={cn(
                    "mt-2 text-xs font-medium underline hover:no-underline transition-all",
                    textColor
                  )}
                >
                  {actionLabel}
                </button>
              )}
            </div>
          </div>

          {/* Priority indicator */}
          {priority !== 'normal' && (
            <div className="absolute bottom-1 left-1">
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                priority === 'urgent' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                priority === 'high' && "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
                priority === 'low' && "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              )}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastNotification;
