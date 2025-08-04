
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

interface MaterialSubmission {
  id: string;
  title: string;
  description: string;
  subject: string;
  category: string;
  grade: string;
  document_type: string;
  file_path: string;
  preview_image: string;
  is_approved: boolean;
  is_featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user_id: string;
  downloads_count: number;
  pages_count: number;
  university: string;
  rating: number;
}

const StudentMaterialUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [submissions, setSubmissions] = useState<MaterialSubmission[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    category: '',
    grade: '',
    document_type: 'notes',
    university: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserSubmissions();
    }
  }, [user]);

  const fetchUserSubmissions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the database fields to match our interface
      const mappedData: MaterialSubmission[] = (data || []).map(item => ({
        ...item,
        category: item.subject || 'General',
        grade: item.university || 'Not specified',
        status: item.is_approved ? 'approved' : 'pending'
      }));

      setSubmissions(mappedData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your submissions',
        variant: 'destructive'
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `documents/${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return { filePath, publicUrl };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadResult = await handleFileUpload(file);
      if (!uploadResult) throw new Error('File upload failed');

      const { error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          university: formData.university,
          document_type: formData.document_type,
          file_path: uploadResult.filePath,
          is_approved: false,
          is_featured: false,
          rating: 0,
          downloads_count: 0,
          pages_count: 1
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your material has been submitted for review',
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        category: '',
        grade: '',
        document_type: 'notes',
        university: ''
      });

      // Refresh submissions
      fetchUserSubmissions();

    } catch (error) {
      console.error('Error uploading material:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload material. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string, isApproved: boolean) => {
    if (isApproved) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'rejected') return <XCircle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-yellow-600" />;
  };

  const getStatusBadge = (status: string, isApproved: boolean) => {
    if (isApproved) return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    if (status === 'rejected') return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Upload Study Material</h1>
        <p className="text-gray-600 mt-2">Share your knowledge with fellow students</p>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload New Material</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter material title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Mathematics, Physics"
                  required
                />
              </div>

              <div>
                <Label htmlFor="university">University/Board</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  placeholder="e.g., Tribhuvan University"
                  required
                />
              </div>

              <div>
                <Label htmlFor="document_type">Document Type</Label>
                <Select value={formData.document_type} onValueChange={(value) => setFormData({ ...formData, document_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notes">Notes</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="textbook">Textbook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your material"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="file-upload">Upload File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX, PPT, PPTX (Max 10MB)
              </p>
            </div>

            <Button type="submit" disabled={isUploading} className="w-full">
              {isUploading ? 'Uploading...' : 'Upload Material'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Previous Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Your Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No submissions yet</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">{submission.title}</h3>
                      <p className="text-sm text-gray-500">{submission.subject} • {submission.document_type}</p>
                      <p className="text-xs text-gray-400">
                        Uploaded on {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(submission.status, submission.is_approved)}
                    {getStatusBadge(submission.status, submission.is_approved)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMaterialUpload;
