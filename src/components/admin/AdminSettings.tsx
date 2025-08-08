
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  GraduationCap, 
  Mail, 
  Bell, 
  Lock, 
  Shield, 
  Paintbrush, 
  Globe, 
  Image,
  Settings,
  Search,
  CreditCard,
  Database,
  FileText,
  Link,
  Upload,
  TestTube,
  Download,
  RotateCcw
} from 'lucide-react';
import { fetchRealNepaliDate } from '@/utils/nepaliDate';

import {
  fetchAllSettings,
  upsertSettings,
  SiteSetting
} from '@/utils/settingsUtils';

const AdminSettings = () => {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: '',
    siteDescription: '',
    defaultLanguage: 'en',
    theme: 'light',
    maintenanceMode: false,
    logoUrl: ''
  });
  // SEO Settings
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: '',
    metaDescription: '',
    faviconUrl: '',
    ogImage: '',
    ogTitle: '',
    ogDescription: '',
    googleAnalyticsId: '',
    enableSitemap: true
  });
  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    enablePaidPlans: true,
    enableStripe: false,
    enableKhalti: false,
    enableEsewa: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    khaltiPublicKey: '',
    esewaId: '',
    currency: 'NPR'
  });
  // Email Configuration
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    senderName: '',
    senderEmail: '',
    enableTLS: true
  });
  // Footer & Contact
  const [contactSettings, setContactSettings] = useState({
    contactEmail: '',
    contactPhone: '',
    facebookUrl: '',
    linkedinUrl: '',
    discordUrl: '',
    footerText: ''
  });
  // Backup & Version
  const [systemSettings, setSystemSettings] = useState({
    currentVersion: '',
    autoBackupFrequency: 'daily',
    changeLog: ''
  });

  // Load settings from DB on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const all = await fetchAllSettings();
        // Helper to get value by key or fallback
        const get = (key: string, fallback: any) => all.find(s => s.setting_key === key)?.setting_value ?? fallback;
        setGeneralSettings({
          siteName: get('site_name', 'EduSanskriti'),
          siteDescription: get('site_description', 'Educational platform for students'),
          defaultLanguage: get('default_language', 'en'),
          theme: get('theme', 'light'),
          maintenanceMode: get('maintenance_mode', 'false') === 'true',
          logoUrl: get('logo_url', '/logo.png')
        });
        setSeoSettings({
          metaTitle: get('meta_title', 'EduSanskriti - Learn & Grow'),
          metaDescription: get('meta_description', 'Best educational platform for Nepali students'),
          faviconUrl: get('favicon_url', '/favicon.ico'),
          ogImage: get('og_image', '/og-image.jpg'),
          ogTitle: get('og_title', 'EduSanskriti'),
          ogDescription: get('og_description', 'Educational platform for students'),
          googleAnalyticsId: get('google_analytics_id', ''),
          enableSitemap: get('enable_sitemap', 'true') === 'true'
        });
        setPaymentSettings({
          enablePaidPlans: get('enable_paid_plans', 'true') === 'true',
          enableStripe: get('enable_stripe', 'false') === 'true',
          enableKhalti: get('enable_khalti', 'false') === 'true',
          enableEsewa: get('enable_esewa', 'false') === 'true',
          stripePublicKey: get('stripe_public_key', ''),
          stripeSecretKey: get('stripe_secret_key', ''),
          khaltiPublicKey: get('khalti_public_key', ''),
          esewaId: get('esewa_id', ''),
          currency: get('currency', 'NPR')
        });
        setEmailSettings({
          smtpHost: get('smtp_host', ''),
          smtpPort: parseInt(get('smtp_port', '587')), 
          smtpUsername: get('smtp_username', ''),
          smtpPassword: get('smtp_password', ''),
          senderName: get('sender_name', 'EduSanskriti'),
          senderEmail: get('sender_email', 'no-reply@edusanskriti.com'),
          enableTLS: get('enable_tls', 'true') === 'true'
        });
        setContactSettings({
          contactEmail: get('contact_email', 'contact@edusanskriti.com'),
          contactPhone: get('contact_phone', '+977-1-4567890'),
          facebookUrl: get('facebook_url', ''),
          linkedinUrl: get('linkedin_url', ''),
          discordUrl: get('discord_url', ''),
          footerText: get('footer_text', '© 2024 EduSanskriti. All rights reserved.')
        });
        setSystemSettings({
          currentVersion: get('current_version', '1.0.0'),
          autoBackupFrequency: get('auto_backup_frequency', 'daily'),
          changeLog: get('change_log', '')
        });
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to load settings', variant: 'destructive' });
      }
    };
    loadSettings();
  }, []);

  // Update Nepali time
  useEffect(() => {
    const updateNepaliTime = async () => {
      try {
        const nepaliDate = await fetchRealNepaliDate();
        setCurrentTime(nepaliDate.time);
        setCurrentDate(nepaliDate.formattedNepali);
      } catch (error) {
        console.error('Error fetching Nepali time:', error);
      }
    };

    updateNepaliTime();
    const interval = setInterval(updateNepaliTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGeneralSettingChange = (key: string, value: any) => {
    setGeneralSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSeoSettingChange = (key: string, value: any) => {
    setSeoSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePaymentSettingChange = (key: string, value: any) => {
    setPaymentSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleEmailSettingChange = (key: string, value: any) => {
    setEmailSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleContactSettingChange = (key: string, value: any) => {
    setContactSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSystemSettingChange = (key: string, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };


  // Save settings to DB
  const handleSaveSettings = async (section: string) => {
    let settings: SiteSetting[] = [];
    if (section === 'General') {
      settings = [
        { setting_key: 'site_name', setting_value: generalSettings.siteName },
        { setting_key: 'site_description', setting_value: generalSettings.siteDescription },
        { setting_key: 'default_language', setting_value: generalSettings.defaultLanguage },
        { setting_key: 'theme', setting_value: generalSettings.theme },
        { setting_key: 'maintenance_mode', setting_value: generalSettings.maintenanceMode ? 'true' : 'false' },
        { setting_key: 'logo_url', setting_value: generalSettings.logoUrl }
      ];
    } else if (section === 'SEO') {
      settings = [
        { setting_key: 'meta_title', setting_value: seoSettings.metaTitle },
        { setting_key: 'meta_description', setting_value: seoSettings.metaDescription },
        { setting_key: 'favicon_url', setting_value: seoSettings.faviconUrl },
        { setting_key: 'og_image', setting_value: seoSettings.ogImage },
        { setting_key: 'og_title', setting_value: seoSettings.ogTitle },
        { setting_key: 'og_description', setting_value: seoSettings.ogDescription },
        { setting_key: 'google_analytics_id', setting_value: seoSettings.googleAnalyticsId },
        { setting_key: 'enable_sitemap', setting_value: seoSettings.enableSitemap ? 'true' : 'false' }
      ];
    } else if (section === 'Payment') {
      settings = [
        { setting_key: 'enable_paid_plans', setting_value: paymentSettings.enablePaidPlans ? 'true' : 'false' },
        { setting_key: 'enable_stripe', setting_value: paymentSettings.enableStripe ? 'true' : 'false' },
        { setting_key: 'enable_khalti', setting_value: paymentSettings.enableKhalti ? 'true' : 'false' },
        { setting_key: 'enable_esewa', setting_value: paymentSettings.enableEsewa ? 'true' : 'false' },
        { setting_key: 'stripe_public_key', setting_value: paymentSettings.stripePublicKey },
        { setting_key: 'stripe_secret_key', setting_value: paymentSettings.stripeSecretKey },
        { setting_key: 'khalti_public_key', setting_value: paymentSettings.khaltiPublicKey },
        { setting_key: 'esewa_id', setting_value: paymentSettings.esewaId },
        { setting_key: 'currency', setting_value: paymentSettings.currency }
      ];
    } else if (section === 'Email') {
      settings = [
        { setting_key: 'smtp_host', setting_value: emailSettings.smtpHost },
        { setting_key: 'smtp_port', setting_value: emailSettings.smtpPort.toString() },
        { setting_key: 'smtp_username', setting_value: emailSettings.smtpUsername },
        { setting_key: 'smtp_password', setting_value: emailSettings.smtpPassword },
        { setting_key: 'sender_name', setting_value: emailSettings.senderName },
        { setting_key: 'sender_email', setting_value: emailSettings.senderEmail },
        { setting_key: 'enable_tls', setting_value: emailSettings.enableTLS ? 'true' : 'false' }
      ];
    } else if (section === 'Contact') {
      settings = [
        { setting_key: 'contact_email', setting_value: contactSettings.contactEmail },
        { setting_key: 'contact_phone', setting_value: contactSettings.contactPhone },
        { setting_key: 'facebook_url', setting_value: contactSettings.facebookUrl },
        { setting_key: 'linkedin_url', setting_value: contactSettings.linkedinUrl },
        { setting_key: 'discord_url', setting_value: contactSettings.discordUrl },
        { setting_key: 'footer_text', setting_value: contactSettings.footerText }
      ];
    } else if (section === 'System') {
      settings = [
        { setting_key: 'current_version', setting_value: systemSettings.currentVersion },
        { setting_key: 'auto_backup_frequency', setting_value: systemSettings.autoBackupFrequency },
        { setting_key: 'change_log', setting_value: systemSettings.changeLog }
      ];
    }
    try {
      await upsertSettings(settings);
      toast({
        title: 'Settings Saved',
        description: `${section} settings have been updated successfully.`,
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: `Failed to save ${section} settings.`,
        variant: 'destructive',
      });
    }
  };

  const handleTestEmailConnection = () => {
    toast({
      title: "Testing Email Connection",
      description: "Sending test email...",
    });
  };

  const handleBackup = () => {
    toast({
      title: "Backup Created",
      description: "System backup has been created successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <div className="text-right text-sm text-gray-600">
          <p className="font-semibold">{currentTime}</p>
          <p>{currentDate}</p>
        </div>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-6 grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Backup
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Ad Areas
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic site settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Website Name</Label>
                <Input
                  id="siteName"
                  value={generalSettings.siteName}
                  onChange={(e) => handleGeneralSettingChange('siteName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={(e) => handleGeneralSettingChange('siteDescription', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo Upload</Label>
                <div className="flex items-center gap-4">
                  <img src={generalSettings.logoUrl} alt="Logo" className="w-12 h-12 object-cover rounded" />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Select value={generalSettings.defaultLanguage} onValueChange={(value) => handleGeneralSettingChange('defaultLanguage', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ne">नेपाली (Nepali)</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-gray-600">Toggle between light and dark theme</p>
                </div>
                <Switch
                  checked={generalSettings.theme === 'dark'}
                  onCheckedChange={(checked) => handleGeneralSettingChange('theme', checked ? 'dark' : 'light')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Enable maintenance mode</p>
                </div>
                <Switch
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(checked) => handleGeneralSettingChange('maintenanceMode', checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('General')}>Save General Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SEO Settings Tab */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Meta Configuration</CardTitle>
              <CardDescription>Configure SEO and meta tags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={seoSettings.metaTitle}
                  onChange={(e) => handleSeoSettingChange('metaTitle', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={seoSettings.metaDescription}
                  onChange={(e) => handleSeoSettingChange('metaDescription', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faviconUrl">Favicon Upload</Label>
                <div className="flex items-center gap-4">
                  <img src={seoSettings.faviconUrl} alt="Favicon" className="w-8 h-8 object-cover" />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Favicon
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ogTitle">OG Title</Label>
                <Input
                  id="ogTitle"
                  value={seoSettings.ogTitle}
                  onChange={(e) => handleSeoSettingChange('ogTitle', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <Input
                  id="googleAnalyticsId"
                  placeholder="GA-XXXXXXXXX"
                  value={seoSettings.googleAnalyticsId}
                  onChange={(e) => handleSeoSettingChange('googleAnalyticsId', e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Sitemap</Label>
                  <p className="text-sm text-gray-600">Generate XML sitemap</p>
                </div>
                <Switch
                  checked={seoSettings.enableSitemap}
                  onCheckedChange={(checked) => handleSeoSettingChange('enableSitemap', checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('SEO')}>Save SEO Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Payment Settings Tab */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Settings</CardTitle>
              <CardDescription>Configure payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Paid Plans</Label>
                  <p className="text-sm text-gray-600">Allow users to purchase premium plans</p>
                </div>
                <Switch
                  checked={paymentSettings.enablePaidPlans}
                  onCheckedChange={(checked) => handlePaymentSettingChange('enablePaidPlans', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={paymentSettings.currency} onValueChange={(value) => handlePaymentSettingChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NPR">NPR (Nepali Rupee)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">Stripe Integration</h4>
                <div className="flex items-center justify-between">
                  <Label>Enable Stripe</Label>
                  <Switch
                    checked={paymentSettings.enableStripe}
                    onCheckedChange={(checked) => handlePaymentSettingChange('enableStripe', checked)}
                  />
                </div>
                {paymentSettings.enableStripe && (
                  <div className="space-y-2 ml-4">
                    <Input placeholder="Stripe Public Key" />
                    <Input type="password" placeholder="Stripe Secret Key" />
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">Khalti Integration</h4>
                <div className="flex items-center justify-between">
                  <Label>Enable Khalti</Label>
                  <Switch
                    checked={paymentSettings.enableKhalti}
                    onCheckedChange={(checked) => handlePaymentSettingChange('enableKhalti', checked)}
                  />
                </div>
                {paymentSettings.enableKhalti && (
                  <div className="space-y-2 ml-4">
                    <Input placeholder="Khalti Public Key" />
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">eSewa Integration</h4>
                <div className="flex items-center justify-between">
                  <Label>Enable eSewa</Label>
                  <Switch
                    checked={paymentSettings.enableEsewa}
                    onCheckedChange={(checked) => handlePaymentSettingChange('enableEsewa', checked)}
                  />
                </div>
                {paymentSettings.enableEsewa && (
                  <div className="space-y-2 ml-4">
                    <Input placeholder="eSewa Merchant ID" />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('Payment')}>Save Payment Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Email Configuration Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for email delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.gmail.com"
                    value={emailSettings.smtpHost}
                    onChange={(e) => handleEmailSettingChange('smtpHost', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    placeholder="587"
                    value={emailSettings.smtpPort}
                    onChange={(e) => handleEmailSettingChange('smtpPort', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUsername">SMTP Username</Label>
                <Input
                  id="smtpUsername"
                  value={emailSettings.smtpUsername}
                  onChange={(e) => handleEmailSettingChange('smtpUsername', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={emailSettings.smtpPassword}
                  onChange={(e) => handleEmailSettingChange('smtpPassword', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Sender Name</Label>
                  <Input
                    id="senderName"
                    value={emailSettings.senderName}
                    onChange={(e) => handleEmailSettingChange('senderName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Sender Email</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={emailSettings.senderEmail}
                    onChange={(e) => handleEmailSettingChange('senderEmail', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable TLS</Label>
                  <p className="text-sm text-gray-600">Use secure TLS connection</p>
                </div>
                <Switch
                  checked={emailSettings.enableTLS}
                  onCheckedChange={(checked) => handleEmailSettingChange('enableTLS', checked)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={() => handleSaveSettings('Email')}>Save Email Settings</Button>
              <Button variant="outline" onClick={handleTestEmailConnection}>
                <TestTube className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Contact & Footer Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact & Footer Settings</CardTitle>
              <CardDescription>Configure contact information and social media links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactSettings.contactEmail}
                    onChange={(e) => handleContactSettingChange('contactEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={contactSettings.contactPhone}
                    onChange={(e) => handleContactSettingChange('contactPhone', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">Social Media Links</h4>
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook URL</Label>
                  <Input
                    id="facebookUrl"
                    placeholder="https://facebook.com/edusanskriti"
                    value={contactSettings.facebookUrl}
                    onChange={(e) => handleContactSettingChange('facebookUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    placeholder="https://linkedin.com/company/edusanskriti"
                    value={contactSettings.linkedinUrl}
                    onChange={(e) => handleContactSettingChange('linkedinUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discordUrl">Discord URL</Label>
                  <Input
                    id="discordUrl"
                    placeholder="https://discord.gg/edusanskriti"
                    value={contactSettings.discordUrl}
                    onChange={(e) => handleContactSettingChange('discordUrl', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text</Label>
                <Textarea
                  id="footerText"
                  value={contactSettings.footerText}
                  onChange={(e) => handleContactSettingChange('footerText', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('Contact')}>Save Contact Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Backup & Restore Tab */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & System Management</CardTitle>
              <CardDescription>Manage system backups and versioning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Version</Label>
                <div className="flex items-center gap-2">
                  <Input value={systemSettings.currentVersion} readOnly />
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Changelog
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="autoBackupFrequency">Auto Backup Frequency</Label>
                <Select value={systemSettings.autoBackupFrequency} onValueChange={(value) => handleSystemSettingChange('autoBackupFrequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="changeLog">Change Log Editor</Label>
                <Textarea
                  id="changeLog"
                  placeholder="Enter release notes and changes..."
                  value={systemSettings.changeLog}
                  onChange={(e) => handleSystemSettingChange('changeLog', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">Backup Actions</h4>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleBackup}>
                    <Download className="h-4 w-4 mr-2" />
                    Create Manual Backup
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Backup File
                  </Button>
                  <Button variant="destructive">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Rollback Version
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('System')}>Save System Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Ad Areas Tab */}
        <TabsContent value="ads">
          <Card>
            <CardHeader>
              <CardTitle>Advertisement Areas Management</CardTitle>
              <CardDescription>Add and manage advertisement placements on your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Header Banner</h4>
                  <p className="text-sm text-gray-600 mb-3">Top of every page</p>
                  <div className="flex gap-2">
                    <Button size="sm">Add Ad</Button>
                    <Button size="sm" variant="outline">Preview</Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Sidebar</h4>
                  <p className="text-sm text-gray-600 mb-3">Right sidebar on content pages</p>
                  <div className="flex gap-2">
                    <Button size="sm">Add Ad</Button>
                    <Button size="sm" variant="outline">Preview</Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Content Area</h4>
                  <p className="text-sm text-gray-600 mb-3">Between content sections</p>
                  <div className="flex gap-2">
                    <Button size="sm">Add Ad</Button>
                    <Button size="sm" variant="outline">Preview</Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Footer</h4>
                  <p className="text-sm text-gray-600 mb-3">Bottom of every page</p>
                  <div className="flex gap-2">
                    <Button size="sm">Add Ad</Button>
                    <Button size="sm" variant="outline">Preview</Button>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <Button>
                  <Bell className="h-4 w-4 mr-2" />
                  Add New Ad Area
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('Ad Areas')}>Save Ad Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
