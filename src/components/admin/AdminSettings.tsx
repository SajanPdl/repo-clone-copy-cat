
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  GraduationCap, 
  Mail, 
  Bell, 
  Lock, 
  Shield, 
  Paintbrush, 
  Globe, 
  Image
} from 'lucide-react';

const AdminSettings = () => {
  const { toast } = useToast();
  const [siteSettings, setSiteSettings] = useState({
    siteTitle: 'EduSanskriti',
    siteDescription: 'Educational platform for students',
    contactEmail: 'contact@edusanskriti.com',
    footerText: '© 2023 EduSanskriti. All rights reserved.',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newsletterFrequency: 'weekly',
    adminAlerts: true
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    darkMode: false,
    primaryColor: '#6A26A9',
    secondaryColor: '#F97316',
    fontFamily: 'Inter, sans-serif',
    enableAnimations: true,
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordRequireSpecialChar: true,
    sessionTimeout: 30,
    ipRestriction: false
  });
  
  // Handle dark mode toggle
  useEffect(() => {
    // Apply dark mode to document based on the setting
    if (appearanceSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appearanceSettings.darkMode]);
  
  const handleSiteSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSiteSettings({
      ...siteSettings,
      [e.target.name]: e.target.value
    });
  };
  
  const handleNotificationSettingChange = (key: string, value: boolean | string) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: value
    });
  };
  
  const handleAppearanceSettingChange = (key: string, value: boolean | string) => {
    setAppearanceSettings({
      ...appearanceSettings,
      [key]: value
    });
  };
  
  const handleSecuritySettingChange = (key: string, value: boolean | number) => {
    setSecuritySettings({
      ...securitySettings,
      [key]: value
    });
  };
  
  const handleSaveSiteSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your site settings have been updated successfully.",
    });
  };
  
  const handleSaveNotificationSettings = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };
  
  const handleSaveAppearanceSettings = () => {
    toast({
      title: "Appearance Settings Updated",
      description: "Your appearance preferences have been saved.",
    });
    
    // In a real app, you'd store these settings in localStorage or a database
    localStorage.setItem('darkMode', appearanceSettings.darkMode.toString());
    localStorage.setItem('primaryColor', appearanceSettings.primaryColor);
  };
  
  const handleSaveSecuritySettings = () => {
    toast({
      title: "Security Settings Updated",
      description: "Your security settings have been saved.",
    });
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="site">
        <TabsList className="mb-6">
          <TabsTrigger value="site" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Site Settings
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Paintbrush className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Manage your website's general settings and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  name="siteTitle"
                  value={siteSettings.siteTitle}
                  onChange={handleSiteSettingChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={siteSettings.siteDescription}
                  onChange={handleSiteSettingChange}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={siteSettings.contactEmail}
                  onChange={handleSiteSettingChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text</Label>
                <Input
                  id="footerText"
                  name="footerText"
                  value={siteSettings.footerText}
                  onChange={handleSiteSettingChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  value={siteSettings.logoUrl}
                  onChange={handleSiteSettingChange}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSiteSettings}>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationSettingChange('emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications in your browser
                  </p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => handleNotificationSettingChange('pushNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="adminAlerts">Admin Alerts</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive alerts about important system events
                  </p>
                </div>
                <Switch
                  id="adminAlerts"
                  checked={notificationSettings.adminAlerts}
                  onCheckedChange={(checked) => handleNotificationSettingChange('adminAlerts', checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotificationSettings}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the admin dashboard looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enable dark mode for the admin interface
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={appearanceSettings.darkMode}
                  onCheckedChange={(checked) => handleAppearanceSettingChange('darkMode', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    id="primaryColor" 
                    value={appearanceSettings.primaryColor}
                    onChange={(e) => handleAppearanceSettingChange('primaryColor', e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border"
                  />
                  <Input
                    value={appearanceSettings.primaryColor}
                    onChange={(e) => handleAppearanceSettingChange('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    id="secondaryColor" 
                    value={appearanceSettings.secondaryColor}
                    onChange={(e) => handleAppearanceSettingChange('secondaryColor', e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border"
                  />
                  <Input
                    value={appearanceSettings.secondaryColor}
                    onChange={(e) => handleAppearanceSettingChange('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableAnimations">Enable Animations</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enable UI animations throughout the site
                  </p>
                </div>
                <Switch
                  id="enableAnimations"
                  checked={appearanceSettings.enableAnimations}
                  onCheckedChange={(checked) => handleAppearanceSettingChange('enableAnimations', checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAppearanceSettings}>Save Appearance</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Require a second form of authentication when signing in
                  </p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSecuritySettingChange('twoFactorAuth', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  max="120"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value) || 30)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="passwordRequireSpecialChar">Require Special Characters</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Passwords must contain at least one special character
                  </p>
                </div>
                <Switch
                  id="passwordRequireSpecialChar"
                  checked={securitySettings.passwordRequireSpecialChar}
                  onCheckedChange={(checked) => handleSecuritySettingChange('passwordRequireSpecialChar', checked)}
                />
              </div>
              <div className="space-y-2 pt-4">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSecuritySettings}>Update Security Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
