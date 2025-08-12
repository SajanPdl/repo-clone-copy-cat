
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/StudentSidebar';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { notifyAchievementUnlocked } = useNotificationTrigger();
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    // Personal Info
    fullName: 'John Doe',
    email: user?.email || '',
    phone: '+977 98XXXXXXXX',
    university: 'Kathmandu University',
    course: 'Computer Engineering',
    yearOfStudy: '3rd Year',
    bio: 'Student passionate about technology and learning.',
    
    // Privacy Settings
    profileVisibility: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    weeklyDigest: true,
    
    // Study Preferences
    preferredSubjects: ['Computer Science', 'Mathematics'],
    studyReminders: true,
    darkMode: false,
    language: 'en'
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, you would save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully."
      });
      
      // Send notification
      await notifyAchievementUnlocked('Settings Updated', 5);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <SidebarProvider>
        <div className="flex w-full">
          <StudentSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3 px-4 py-3">
                <SidebarTrigger className="lg:hidden" />
                <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
              </div>
            </header>
            <main className="p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={settings.fullName}
                          onChange={(e) => setSettings({...settings, fullName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={settings.email}
                          onChange={(e) => setSettings({...settings, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={settings.phone}
                          onChange={(e) => setSettings({...settings, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="university">University</Label>
                        <Input
                          id="university"
                          value={settings.university}
                          onChange={(e) => setSettings({...settings, university: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="course">Course</Label>
                        <Input
                          id="course"
                          value={settings.course}
                          onChange={(e) => setSettings({...settings, course: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Year of Study</Label>
                        <Select value={settings.yearOfStudy} onValueChange={(value) => setSettings({...settings, yearOfStudy: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1st Year">1st Year</SelectItem>
                            <SelectItem value="2nd Year">2nd Year</SelectItem>
                            <SelectItem value="3rd Year">3rd Year</SelectItem>
                            <SelectItem value="4th Year">4th Year</SelectItem>
                            <SelectItem value="Graduate">Graduate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={settings.bio}
                        onChange={(e) => setSettings({...settings, bio: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                      </div>
                      <Switch
                        checked={settings.profileVisibility}
                        onCheckedChange={(checked) => setSettings({...settings, profileVisibility: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Email</Label>
                        <p className="text-sm text-gray-500">Display email on your public profile</p>
                      </div>
                      <Switch
                        checked={settings.showEmail}
                        onCheckedChange={(checked) => setSettings({...settings, showEmail: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Phone</Label>
                        <p className="text-sm text-gray-500">Display phone number on your profile</p>
                      </div>
                      <Switch
                        checked={settings.showPhone}
                        onCheckedChange={(checked) => setSettings({...settings, showPhone: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Messages</Label>
                        <p className="text-sm text-gray-500">Let other users send you messages</p>
                      </div>
                      <Switch
                        checked={settings.allowMessages}
                        onCheckedChange={(checked) => setSettings({...settings, allowMessages: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-gray-500">Receive promotional and marketing emails</p>
                      </div>
                      <Switch
                        checked={settings.marketingEmails}
                        onCheckedChange={(checked) => setSettings({...settings, marketingEmails: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Weekly Digest</Label>
                        <p className="text-sm text-gray-500">Get a weekly summary of your activities</p>
                      </div>
                      <Switch
                        checked={settings.weeklyDigest}
                        onCheckedChange={(checked) => setSettings({...settings, weeklyDigest: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Study Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Study Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Language</Label>
                      <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ne">नेपाली</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Study Reminders</Label>
                        <p className="text-sm text-gray-500">Get reminders for your study schedule</p>
                      </div>
                      <Switch
                        checked={settings.studyReminders}
                        onCheckedChange={(checked) => setSettings({...settings, studyReminders: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Dark Mode</Label>
                        <p className="text-sm text-gray-500">Use dark theme for better night reading</p>
                      </div>
                      <Switch
                        checked={settings.darkMode}
                        onCheckedChange={(checked) => setSettings({...settings, darkMode: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default SettingsPage;
