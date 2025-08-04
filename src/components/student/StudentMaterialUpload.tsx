
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateAndSanitizeFormData } from '@/utils/inputValidation';
import { Upload, FileText, CheckCircle, Clock, X } from 'lucide-react';

interface MaterialSubmission {
  id: number;
  title: string;
  category: string;
  grade: string;
  subject: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  admin_notes?: string;
}

const StudentMaterialUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<MaterialSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'notes',
    grade: '',
    subject: '',
    description: '',
    tags: [] as string[]
  });

  React.useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch your submissions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload PDF or Word documents only.',
          variant: 'destructive'
        });
        return;
      }
      
      // Check file size (max 10MB)
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

  const uploadFile = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `study-materials/${user!.id}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
      
    if (uploadError) {
      throw uploadError;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !file) {
      toast({
        title: 'Missing information',
        description: 'Please fill all fields and upload a file.',
        variant: 'destructive'
      });
      return;
    }

    setSubmissionLoading(true);
    
    try {
      const sanitizedData = validateAndSanitizeFormData(formData);
      
      if (!sanitizedData.title || !sanitizedData.category || !sanitizedData.grade || !sanitizedData.subject) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all required fields.',
          variant: 'destructive'
        });
        return;
      }

      // Upload file first
      const fileUrl = await uploadFile(file);
      
      // Create submission record
      const { error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: sanitizedData.title,
          document_type: sanitizedData.category,
          grade: sanitizedData.grade,
          subject: sanitizedData.subject,
          university: 'General',
          description: sanitizedData.description,
          file_path: fileUrl,
          is_approved: false,
          is_featured: false
        });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your material has been submitted for review.'
      });

      // Reset form
      setFormData({
        title: '',
        category: 'notes',
        grade: '',
        subject: '',
        description: '',
        tags: []
      });
      setFile(null);
      
      // Refresh submissions
      fetchSubmissions();
      
    } catch (error) {
      console.error('Error submitting material:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit material. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Upload Study Material</h2>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Submit New Material</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter material title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notes">Notes</SelectItem>
                    <SelectItem value="textbook">Textbook</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="reference">Reference Material</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Grade *</label>
                <Select value={formData.grade} onValueChange={(value) => handleChange('grade', value)}>
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
                <label className="block text-sm font-medium mb-1">Subject *</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="Enter subject name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the material"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Upload File *</label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
              />
              {file && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={submissionLoading}
            >
              {submissionLoading ? 'Uploading...' : 'Submit Material'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Your Submissions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading your submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
              <p className="text-gray-600">Upload your first study material to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{submission.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{submission.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{submission.document_type}</span>
                        <span>•</span>
                        <span>{submission.grade}</span>
                        <span>•</span>
                        <span>{submission.subject}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(submission.is_approved ? 'approved' : 'pending')}
                      <Badge variant="outline" className={getStatusColor(submission.is_approved ? 'approved' : 'pending')}>
                        {submission.is_approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    Submitted: {new Date(submission.created_at).toLocaleDateString()}
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
