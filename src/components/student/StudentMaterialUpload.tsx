
import React, { useState } from 'react';
import { useSecureAuth as useAuth } from '@/hooks/useSecureAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, X, Plus, Loader2 } from 'lucide-react';

const StudentMaterialUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    university: '',
    category: 'notes',
    tags: [] as string[],
    price: '',
    isFree: true
  });
  const [file, setFile] = useState<File | null>(null);
  const [newTag, setNewTag] = useState('');

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'English', 'History', 'Geography', 'Economics', 'Psychology'
  ];

  const categories = [
    { value: 'notes', label: 'Class Notes' },
    { value: 'assignments', label: 'Assignments' },
    { value: 'projects', label: 'Projects' },
    { value: 'presentations', label: 'Presentations' },
    { value: 'lab-reports', label: 'Lab Reports' },
    { value: 'research', label: 'Research Papers' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload PDF or Word documents only.',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload files smaller than 10MB.',
          variant: 'destructive'
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please login to upload materials.',
        variant: 'destructive'
      });
      return;
    }

    if (!file) {
      toast({
        title: 'File required',
        description: 'Please select a file to upload.',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Insert material record
      const materialData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        university: formData.university,
        document_type: formData.category,
        file_path: urlData.publicUrl,
        is_approved: false
      };

      const { error: insertError } = await supabase
        .from('documents')
        .insert([materialData]);

      if (insertError) {
        throw insertError;
      }

      // Add student activity points
      try {
        const { error: activityError } = await supabase.rpc('add_student_activity', {
          p_user_id: user.id,
          p_activity_type: 'upload',
          p_points: 10,
          p_description: `Uploaded: ${formData.title}`
        });

        if (activityError) {
          console.error('Error adding activity:', activityError);
        }
      } catch (activityError) {
        console.error('Activity tracking error:', activityError);
      }

      toast({
        title: 'Upload successful!',
        description: 'Your material has been uploaded and is pending approval.'
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        university: '',
        category: 'notes',
        tags: [],
        price: '',
        isFree: true
      });
      setFile(null);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your material. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="backdrop-blur-lg bg-white/80 border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Upload className="h-6 w-6" />
            Upload Study Material
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file" className="text-lg font-semibold">Select File*</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  {file ? (
                    <div className="flex items-center justify-center gap-3 text-green-600">
                      <FileText className="h-8 w-8" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>Click to select a file or drag and drop</p>
                      <p className="text-sm">PDF, DOC, DOCX (max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-semibold">Title*</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter material title"
                required
                className="text-lg p-3"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg font-semibold">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your study material"
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Subject and University */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-lg font-semibold">Subject*</Label>
                <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                  <SelectTrigger className="text-lg p-3">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="university" className="text-lg font-semibold">University/Institution</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  placeholder="Enter your university"
                  className="text-lg p-3"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-lg font-semibold">Category*</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="text-lg p-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm">
                    {tag}
                    <X
                      className="h-3 w-3 ml-2 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={uploading || !formData.title || !formData.subject || !file}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Material
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMaterialUpload;
