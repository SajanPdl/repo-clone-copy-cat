
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { addStudentActivity } from '@/utils/studentDashboardUtils';
import { User, Camera } from 'lucide-react';

const ProfileEditor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    university: '',
    course: '',
    year_of_study: '',
    bio: '',
    profile_image: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      // Track profile visit activity
      addStudentActivity(user.id, 'share', 5, 'Profile visited');
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          university: data.university || '',
          course: data.course || '',
          year_of_study: data.year_of_study?.toString() || '',
          bio: data.bio || '',
          profile_image: data.profile_image || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your profile',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        university: profile.university,
        course: profile.course,
        year_of_study: profile.year_of_study ? parseInt(profile.year_of_study) : null,
        bio: profile.bio,
        profile_image: profile.profile_image,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('student_profiles')
        .upsert(profileData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      // Track profile update activity
      await addStudentActivity(user.id, 'share', 10, 'Profile updated');

      toast({
        title: 'Success',
        description: 'Profile updated successfully!'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Please Login</h3>
          <p className="text-gray-600">You need to be logged in to edit your profile.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              {profile.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600">
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div>
            <h3 className="font-semibold">{user.email?.split('@')[0]}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="university">University</Label>
            <Input
              id="university"
              value={profile.university}
              onChange={(e) => handleInputChange('university', e.target.value)}
              placeholder="Enter your university name"
            />
          </div>

          <div>
            <Label htmlFor="course">Course/Major</Label>
            <Input
              id="course"
              value={profile.course}
              onChange={(e) => handleInputChange('course', e.target.value)}
              placeholder="Enter your course or major"
            />
          </div>

          <div>
            <Label htmlFor="year_of_study">Year of Study</Label>
            <Input
              id="year_of_study"
              type="number"
              min="1"
              max="10"
              value={profile.year_of_study}
              onChange={(e) => handleInputChange('year_of_study', e.target.value)}
              placeholder="1"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="profile_image">Profile Image URL</Label>
            <Input
              id="profile_image"
              value={profile.profile_image}
              onChange={(e) => handleInputChange('profile_image', e.target.value)}
              placeholder="https://example.com/your-image.jpg"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileEditor;
