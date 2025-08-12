import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { uploadFileToStorage } from '@/utils/fileUploadUtils';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const StudentMaterialUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    category: '',
    tags: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      console.log('File selected:', selectedFile.name, selectedFile.type, selectedFile.size);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to upload materials',
        variant: 'destructive'
      });
      return;
    }

    if (!file) {
      toast({
        title: 'File required',
        description: 'Please select a file to upload',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.title || !formData.subject || !formData.grade || !formData.category) {
      toast({
        title: 'Required fields missing',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('Starting file upload process...');
      setUploadProgress(10);

      // Upload file using new upload utility
      const { fileUrl, uploadId } = await uploadFileToStorage(file, 'study-materials');
      console.log('File uploaded successfully:', fileUrl);
      setUploadProgress(70);

      // Insert into pending_study_materials table
      const { error: dbError } = await supabase
        .from('pending_study_materials')
        .insert({
          title: formData.title,
          description: formData.description || null,
          subject: formData.subject,
          grade: formData.grade,
          category: formData.category,
          file_url: fileUrl,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
          author_id: user.id,
          status: 'pending'
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      setUploadProgress(100);

      toast({
        title: 'Upload successful!',
        description: 'Your material has been submitted for review. You will be notified once it is approved.',
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        grade: '',
        category: '',
        tags: ''
      });
      setFile(null);
      setUploadProgress(0);

      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      console.log('Upload process completed successfully');

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload your material. Please try again.',
        variant: 'destructive'
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Study Material</h1>
        <p className="text-gray-600 mt-2">Share your notes and materials with fellow students</p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Upload Guidelines:</p>
              <ul className="space-y-1 text-xs">
                <li>• File size must be less than 50MB</li>
                <li>• Accepted formats: PDF, Word, JPG, PNG, TXT</li>
                <li>• All uploads are reviewed before publishing</li>
                <li>• Earn points for approved uploads</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Mathematics Chapter 5 Notes"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Select 
                  value={formData.subject} 
                  onValueChange={(value) => handleInputChange('subject', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="computer-science">Computer Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="nepali">Nepali</SelectItem>
                    <SelectItem value="social-studies">Social Studies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">Grade *</Label>
                <Select 
                  value={formData.grade} 
                  onValueChange={(value) => handleInputChange('grade', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
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
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notes">Notes</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="lab-report">Lab Report</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="question-bank">Question Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your material (optional)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="Enter tags separated by commas (e.g., algebra, equations, formulas)"
              />
            </div>

            <div>
              <Label htmlFor="file-upload">File Upload *</Label>
              <div className="mt-1">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  required
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {file && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>{file.name} ({Math.round(file.size / 1024)} KB)</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>

            {isUploading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isUploading || !file}
              className="w-full"
            >
              {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Material'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMaterialUpload;
