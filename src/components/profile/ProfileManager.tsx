
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, Bookmark, Clock, Settings, Camera } from 'lucide-react';

const ProfileManager = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'Arun',
    lastName: 'Sharma',
    email: 'arun.sharma@example.com',
    phone: '+977 9812345678',
    address: 'Kathmandu, Nepal',
    bio: 'Mathematics teacher with over 10 years of experience in secondary education.',
    avatar: '/placeholder.svg',
    occupation: 'Teacher',
    website: 'www.myeducationportfolio.com'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Tabs defaultValue="profile">
        <TabsList className="mb-8 grid grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Saved
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileData.avatar} alt={`${profileData.firstName} ${profileData.lastName}`} />
                      <AvatarFallback>{profileData.firstName[0]}{profileData.lastName[0]}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="absolute -right-2 -bottom-2 bg-blue-500 hover:bg-blue-600 rounded-full p-2 text-white cursor-pointer">
                        <Camera size={16} />
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle>{profileData.firstName} {profileData.lastName}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Mail className="h-4 w-4" /> {profileData.email}
                    </CardDescription>
                    <CardDescription className="flex items-center gap-1">
                      <Phone className="h-4 w-4" /> {profileData.phone}
                    </CardDescription>
                  </div>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      value={profileData.occupation}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={profileData.website}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Occupation</h3>
                        <p>{profileData.occupation}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</h3>
                        <p>{profileData.website}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
                        <p className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {profileData.address}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</h3>
                      <p>{profileData.bio}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-800 p-2 rounded-full">
                          <Bookmark className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Saved a new study material</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> 2 days ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 text-green-800 p-2 rounded-full">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Completed Physics Quiz #3</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> 4 days ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            {isEditing && (
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSaveProfile}>Save Profile</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle>Saved Materials</CardTitle>
              <CardDescription>
                Study materials and past papers you've saved for later
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bookmark className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">No saved materials yet</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                  Start saving study materials and past papers to access them quickly from your profile.
                </p>
                <Button>Browse Materials</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <div className="space-y-2">
                    {['New study materials', 'Past paper updates', 'Account updates'].map(item => (
                      <div key={item} className="flex items-center gap-2">
                        <input type="checkbox" id={item.replace(/\s+/g, '-').toLowerCase()} className="h-4 w-4" />
                        <Label htmlFor={item.replace(/\s+/g, '-').toLowerCase()}>{item}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                  </div>
                  <Button className="mt-2">Change Password</Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Actions</h3>
                  <div className="flex gap-3">
                    <Button variant="destructive">Delete Account</Button>
                    <Button variant="outline">Export My Data</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileManager;
