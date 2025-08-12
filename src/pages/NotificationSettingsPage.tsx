import React, { useState, useEffect } from 'react';
import useNotifications from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Volume2, VolumeX, Mail, Smartphone, Monitor, Settings, Clock, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const NotificationSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    preferences,
    updatePreference,
    requestPermission,
    hasPermission,
    connectionStatus
  } = useNotifications();

  const [isLoading, setIsLoading] = useState(false);
  const [muteDuration, setMuteDuration] = useState<string>('0');
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('notification_sound_enabled') !== 'false');

  // Notification categories with icons and descriptions
  const notificationCategories = [
    {
      id: 'study',
      name: 'Study Materials',
      icon: '📚',
      description: 'New study materials, notes, and educational content',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'payment',
      name: 'Payments & Wallet',
      icon: '💰',
      description: 'Payment confirmations, withdrawals, and wallet updates',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'marketplace',
      name: 'Marketplace',
      icon: '🛒',
      description: 'Book sales, purchase requests, and marketplace updates',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'ads',
      name: 'Advertisements',
      icon: '🎯',
      description: 'Promotional offers, discounts, and sponsored content',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'ai',
      name: 'AI Assistant',
      icon: '🤖',
      description: 'AI tips, study recommendations, and smart insights',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'events',
      name: 'Events',
      icon: '📅',
      description: 'Event reminders, webinars, and study sessions',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'messages',
      name: 'Messages',
      icon: '💬',
      description: 'Direct messages, comments, and communication',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      id: 'orders',
      name: 'Orders',
      icon: '📦',
      description: 'Order status updates, shipping, and delivery',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'approvals',
      name: 'Approvals',
      icon: '✅',
      description: 'Content approvals, account verifications, and admin actions',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  // Delivery methods
  const deliveryMethods = [
    {
      id: 'in_app',
      name: 'In-App Notifications',
      icon: Monitor,
      description: 'Show notifications within the application',
      enabled: true
    },
    {
      id: 'push',
      name: 'Push Notifications',
      icon: Smartphone,
      description: 'Receive notifications even when the app is closed',
      enabled: hasPermission
    },
    {
      id: 'email',
      name: 'Email Notifications',
      icon: Mail,
      description: 'Get notifications delivered to your email',
      enabled: false
    }
  ];

  const handleToggleCategory = async (categoryId: string, method: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      await updatePreference(parseInt(categoryId), { [`${method}_enabled`]: enabled });
      toast({
        title: 'Settings Updated',
        description: `${categoryId} notifications ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification settings',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem('notification_sound_enabled', newSoundEnabled.toString());
    toast({
      title: 'Sound Settings Updated',
      description: `Notification sounds ${newSoundEnabled ? 'enabled' : 'disabled'}`,
    });
  };

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive push notifications',
        });
      } else {
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications in your browser settings',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to request notification permission',
        variant: 'destructive'
      });
    }
  };

  const handleMuteNotifications = async () => {
    if (muteDuration === '0') return;
    
    setIsLoading(true);
    try {
      const hours = parseInt(muteDuration);
      await updatePreference(0, { muted_until: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString() });
      toast({
        title: 'Notifications Muted',
        description: `Notifications will be muted for ${hours} hour${hours > 1 ? 's' : ''}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mute notifications',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryPreference = (categoryId: string) => {
    return preferences.find(pref => pref.type_id.toString() === categoryId) || {
      in_app_enabled: true,
      push_enabled: hasPermission,
      email_enabled: false
    };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Notification Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage how and when you receive notifications
          </p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  connectionStatus ? "bg-green-500" : "bg-red-500"
                )} />
                <CardTitle className="text-lg">Connection Status</CardTitle>
              </div>
              <Badge variant={connectionStatus ? "default" : "destructive"}>
                {connectionStatus ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {connectionStatus 
                ? "Real-time notifications are active and working properly."
                : "Unable to connect to notification service. Please check your internet connection."
              }
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="delivery">Delivery Methods</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Categories</span>
                </CardTitle>
                <CardDescription>
                  Choose which types of notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notificationCategories.map((category) => {
                  const preference = getCategoryPreference(category.id);
                  
                  return (
                    <div key={category.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-xl",
                            category.bgColor
                          )}>
                            {category.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {category.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Monitor className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">In-App</span>
                          </div>
                          <Switch
                            checked={preference.in_app_enabled}
                            onCheckedChange={(enabled) => 
                              handleToggleCategory(category.id, 'in_app', enabled)
                            }
                            disabled={isLoading}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Smartphone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Push</span>
                          </div>
                          <Switch
                            checked={preference.push_enabled && hasPermission}
                            onCheckedChange={(enabled) => 
                              handleToggleCategory(category.id, 'push', enabled)
                            }
                            disabled={isLoading || !hasPermission}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Email</span>
                          </div>
                          <Switch
                            checked={preference.email_enabled}
                            onCheckedChange={(enabled) => 
                              handleToggleCategory(category.id, 'email', enabled)
                            }
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivery Methods Tab */}
          <TabsContent value="delivery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Delivery Methods</span>
                </CardTitle>
                <CardDescription>
                  Configure how notifications are delivered to you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {deliveryMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <method.icon className="h-5 w-5 text-gray-500" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {method.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {method.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant={method.enabled ? "default" : "secondary"}>
                      {method.enabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
                
                {!hasPermission && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800 dark:text-yellow-200">
                        Push Notifications Disabled
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Enable push notifications to receive alerts even when the app is closed.
                    </p>
                    <Button
                      onClick={handleRequestPermission}
                      className="mt-2"
                      size="sm"
                    >
                      Enable Push Notifications
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Advanced Settings</span>
                </CardTitle>
                <CardDescription>
                  Fine-tune your notification experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sound Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Sound & Audio
                  </h3>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {soundEnabled ? (
                        <Volume2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <VolumeX className="h-5 w-5 text-gray-500" />
                      )}
                      <div>
                        <h4 className="font-medium">Notification Sounds</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Play sounds for new notifications
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={soundEnabled}
                      onCheckedChange={handleToggleSound}
                    />
                  </div>
                </div>

                <Separator />

                {/* Mute Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Temporary Mute
                  </h3>
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <h4 className="font-medium">Mute Duration</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Temporarily mute all notifications
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Select value={muteDuration} onValueChange={setMuteDuration}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Don't mute</SelectItem>
                          <SelectItem value="1">1 hour</SelectItem>
                          <SelectItem value="4">4 hours</SelectItem>
                          <SelectItem value="8">8 hours</SelectItem>
                          <SelectItem value="24">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleMuteNotifications}
                        disabled={muteDuration === '0' || isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Mute Now
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Data & Privacy */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Data & Privacy
                  </h3>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium">Notification Data</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Your notification preferences are stored securely and are only used to deliver relevant notifications.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
