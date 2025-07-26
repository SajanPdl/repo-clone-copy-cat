
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateAndSanitizeFormData, validateFileType, validateFileSize } from '@/utils/inputValidation';
import { addStudentActivity } from '@/utils/studentDashboardUtils';
import { Camera, Save, User, Mail, BookOpen, MapPin } from 'lucide-react';

interface StudentProfile {
  id: string;
  user_id: string;
  university: string;
  course: string;
  year_of_study: number;
  bio: string;
  profile_image: string;
  points: number;
  level: string;
}

const ProfileEditor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    university: '',
    course: '',
    year_of_study: 1,
    bio: '',
    profile_image: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      trackActivity();
    }
  }, [user]);

  const trackActivity = async () => {
    if (!user) return;
    try {
      await addStudentActivity(user.id, 'activity', 1, 'Profile page visit');
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();

      // Get student profile
      const { data: profileData } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFormData({
          username: userData?.username || '',
          university: profileData.university || '',
          course: profileData.course || '',
          year_of_study: profileData.year_of_study || 1,
          bio: profileData.bio || '',
          profile_image: profileData.profile_image || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validateFileType(file, allowedTypes)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a JPEG, PNG, or WebP image.',
        variant: 'destructive'
      });
      return;
    }

    if (!validateFileSize(file, 2)) {
      toast({
        title: 'File Too Large',
        description: 'Please upload an image smaller than 2MB.',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, profile_image: publicUrl }));
      
      toast({
        title: 'Avatar Uploaded!',
        description: 'Your profile image has been updated.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const sanitizedData = validateAndSanitizeFormData(formData);

      // Update username in users table
      if (sanitizedData.username) {
        const { error: userError } = await supabase
          .from('users')
          .update({ username: sanitizedData.username })
          .eq('id', user.id);
          
        if (userError) throw userError;
      }

      // Update or insert student profile
      const profileData = {
        user_id: user.id,
        university: sanitizedData.university,
        course: sanitizedData.course,
        year_of_study: sanitizedData.year_of_study,
        bio: sanitizedData.bio,
        profile_image: sanitizedData.profile_image
      };

      const { error: profileError } = await supabase
        .from('student_profiles')
        .upsert(profileData, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      // Track profile update activity
      await addStudentActivity(user.id, 'activity', 5, 'Profile updated');

      toast({
        title: 'Profile Updated!',
        description: 'Your profile has been saved successfully.',
      });
      
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading your profile...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={formData.profile_image} alt="Profile" />
                <AvatarFallback className="text-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  {(formData.username || user?.email)?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="sr-only"
                />
              </label>
            </div>
            {uploading && (
              <div className="text-sm text-gray-500">Uploading avatar...</div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email (Read-only)
              </label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Username
              </label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                University/College
              </label>
              <Input
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="Your university or college"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                <BookOpen className="h-4 w-4 inline mr-1" />
                Course/Major
              </label>
              <Input
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="Your field of study"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Year of Study</label>
            <select
              name="year_of_study"
              value={formData.year_of_study}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>1st Year</option>
              <option value={2}>2nd Year</option>
              <option value={3}>3rd Year</option>
              <option value={4}>4th Year</option>
              <option value={5}>5th Year</option>
              <option value={6}>Graduate/Masters</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <Textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.bio.length}/500 characters
            </div>
          </div>

          {/* Profile Stats (Read-only) */}
          {profile && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Your Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Current Level:</span>
                  <div className="font-medium">{profile.level}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">XP Points:</span>
                  <div className="font-medium">{profile.points}</div>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {saving ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileEditor;
