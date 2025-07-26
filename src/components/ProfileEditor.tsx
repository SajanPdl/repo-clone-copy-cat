import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Edit3, 
  Upload, 
  GraduationCap, 
  MapPin, 
  Calendar,
  Trophy,
  BookOpen,
  Download,
  Share2,
  Bookmark,
  ShoppingCart
} from 'lucide-react';

// Define proper activity type
type ActivityType = "download" | "upload" | "sale" | "bookmark" | "share";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  date: string;
  description: string;
}

const ProfileEditor = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Passionate learner exploring the world of knowledge.',
    grade: 'grade-12',
    location: 'Kathmandu, Nepal',
    joinDate: '2023-01-15',
    avatar: '/placeholder.svg'
  });

  const [recentActivity] = useState<Activity[]>([
    {
      id: '1',
      type: 'download',
      title: 'Downloaded Mathematics Notes',
      date: '2024-01-20',
      description: 'Class 12 Advanced Mathematics'
    },
    {
      id: '2',
      type: 'upload',
      title: 'Uploaded Physics Project',
      date: '2024-01-18',
      description: 'Submitted final project on Quantum Physics'
    },
    {
      id: '3',
      type: 'bookmark',
      title: 'Bookmarked Chemistry Tutorial',
      date: '2024-01-15',
      description: 'Saved a helpful tutorial on Organic Chemistry'
    },
    {
      id: '4',
      type: 'share',
      title: 'Shared Biology Article',
      date: '2024-01-10',
      description: 'Shared an interesting article on Cell Biology'
    }
  ]);

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'download': return <Download className="h-4 w-4" />;
      case 'upload': return <Upload className="h-4 w-4" />;
      case 'sale': return <ShoppingCart className="h-4 w-4" />;
      case 'bookmark': return <Bookmark className="h-4 w-4" />;
      case 'share': return <Share2 className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'download': return 'bg-blue-100 text-blue-800';
      case 'upload': return 'bg-green-100 text-green-800';
      case 'sale': return 'bg-purple-100 text-purple-800';
      case 'bookmark': return 'bg-yellow-100 text-yellow-800';
      case 'share': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar} alt="Profile" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Change Avatar
              </Button>
            </div>

            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={profile.displayName}
                onChange={(e) => setProfile({...profile, displayName: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="grade">Grade/Level</Label>
              <Select value={profile.grade} onValueChange={(value) => setProfile({...profile, grade: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grade-9">Grade 9</SelectItem>
                  <SelectItem value="grade-10">Grade 10</SelectItem>
                  <SelectItem value="grade-11">Grade 11</SelectItem>
                  <SelectItem value="grade-12">Grade 12</SelectItem>
                  <SelectItem value="bachelor">Bachelor</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
              />
            </div>

            <Button onClick={handleSaveProfile} className="w-full">
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <BookOpen className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-gray-600">Materials Downloaded</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Upload className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-600">Materials Uploaded</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Trophy className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <div className="text-2xl font-bold text-purple-600">8</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Calendar className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                <div className="text-2xl font-bold text-orange-600">45</div>
                <div className="text-sm text-gray-600">Days Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{activity.title}</h4>
                    <Badge variant="secondary" className={getActivityColor(activity.type)}>
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEditor;
