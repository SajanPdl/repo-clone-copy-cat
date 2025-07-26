
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, X } from 'lucide-react';

interface StudyMaterial {
  id?: number;
  title: string;
  description?: string;
  subject: string;
  grade: string;
  category: string;
  file_url?: string;
  file_type?: string;
  tags?: string[];
  author_id?: string;
}

interface StudyMaterialEditorProps {
  material?: StudyMaterial;
  onSave: (material: StudyMaterial) => void;
  onCancel: () => void;
}

const StudyMaterialEditor: React.FC<StudyMaterialEditorProps> = ({
  material,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [formData, setFormData] = useState<StudyMaterial>({
    title: '',
    description: '',
    subject: '',
    grade: '',
    category: '',
    file_url: '',
    file_type: 'pdf',
    tags: [],
    ...material
  });

  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (key: keyof StudyMaterial, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
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

    setUploadingPdf(true);

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `study-materials/${fileName}`;

      const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        file_url: urlData.publicUrl,
        file_type: 'pdf'
      }));

      toast({
        title: "PDF uploaded",
        description: "PDF file uploaded successfully."
      });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{material ? 'Edit' : 'Create'} Study Material</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter material title"
                className="mt-1"
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
              />
            </div>

            <div>
              <Label htmlFor="grade">Grade *</Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                placeholder="e.g., Grade 10, Class 12"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notes">Notes</SelectItem>
                  <SelectItem value="textbook">Textbook</SelectItem>
                  <SelectItem value="worksheet">Worksheet</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                  <SelectItem value="guide">Study Guide</SelectItem>
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
              placeholder="Describe the study material..."
              rows={4}
              className="mt-1"
            />
          </div>

          {/* PDF Upload */}
          <div>
            <Label>PDF File</Label>
            <div className="mt-2 space-y-4">
              {formData.file_url && (
                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-red-500" />
                    <span className="text-sm">PDF file attached</span>
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
              )}

              {!formData.file_url && (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handlePdfUpload(e.target.files)}
                    className="hidden"
                    id="pdf-upload"
                    disabled={uploadingPdf}
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {uploadingPdf ? 'Uploading PDF...' : 'Click to upload PDF file'}
                    </p>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>Add</Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadingPdf}>
              {loading ? 'Saving...' : 'Save Material'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudyMaterialEditor;
