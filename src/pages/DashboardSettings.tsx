
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Bell, Eye, Lock, Globe } from 'lucide-react';

const DashboardSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <p className="text-gray-600">Manage your account preferences and privacy settings</p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch id="email-notifications" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive browser push notifications
              </p>
            </div>
            <Switch id="push-notifications" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="achievement-notifications">Achievement Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you earn achievements
              </p>
            </div>
            <Switch id="achievement-notifications" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="profile-visibility">Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to other users
              </p>
            </div>
            <Switch id="profile-visibility" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="activity-visibility">Activity Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Show your recent activities to others
              </p>
            </div>
            <Switch id="activity-visibility" />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">
            Change Password
          </Button>
          <Button variant="outline">
            Two-Factor Authentication
          </Button>
          <Button variant="outline">
            Download My Data
          </Button>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language & Region
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <select className="w-full p-2 border border-gray-300 rounded-md">
              <option value="en">English</option>
              <option value="ne">नेपाली</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label>Timezone</Label>
            <select className="w-full p-2 border border-gray-300 rounded-md">
              <option value="Asia/Kathmandu">Asia/Kathmandu (NPT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSettings;
