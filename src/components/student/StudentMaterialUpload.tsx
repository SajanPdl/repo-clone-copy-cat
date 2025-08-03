
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Category {
  id: number;
  name: string;
}

interface Grade {
  id: number;
  name: string;
}

const StudentMaterialUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    category: '',
    file_url: '',
    tags: [] as string[]
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchGrades();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setGrades(data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handlePdfUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file only.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 50MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadingPdf(true);

    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `study-materials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        file_url: urlData.publicUrl
      }));

      toast({
        title: "PDF uploaded",
        description: "PDF file uploaded successfully."
      });
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to upload materials.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.subject || !formData.grade || !formData.category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Insert as pending material (admin approval required)
      const { error } = await supabase
        .from('pending_study_materials')
        .insert({
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          grade: formData.grade,
          category: formData.category,
          file_url: formData.file_url,
          tags: formData.tags,
          author_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Material submitted!",
        description: "Your material has been submitted for admin approval."
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        grade: '',
        category: '',
        file_url: '',
        tags: []
      });
    } catch (error: any) {
      console.error('Error submitting material:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit material. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <h3 className="text-lg font-semibold mb-2">Login Required</h3>
          <p className="text-gray-600">Please login to upload study materials.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Study Material</CardTitle>
        <p className="text-sm text-gray-600">
          Share your notes and materials with other students. All uploads require admin approval.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter material title"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="e.g., Mathematics, Physics"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="grade">Grade *</Label>
              <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)} required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.name}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)} required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <div className="mt-2">
              <ReactQuill
                value={formData.description}
                onChange={(content) => handleInputChange('description', content)}
                placeholder="Describe your study material..."
                theme="snow"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link'],
                    ['clean']
                  ],
                }}
              />
            </div>
          </div>

          {/* PDF Upload */}
          <div>
            <Label>PDF File *</Label>
            <div className="mt-2 space-y-4">
              {formData.file_url ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium">PDF file attached</span>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleInputChange('file_url', '')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handlePdfUpload(e.target.files)}
                    className="hidden"
                    id="pdf-upload"
                    disabled={uploadingPdf}
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-600 mb-2">
                      {uploadingPdf ? 'Uploading PDF...' : 'Click to upload PDF file'}
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF files only, max 50MB
                    </p>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="mt-2 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button 
              type="submit" 
              disabled={loading || uploadingPdf || !formData.file_url}
              className="min-w-[120px]"
            >
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudentMaterialUpload;
