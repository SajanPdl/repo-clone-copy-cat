
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
import { Upload, FileText, X, Sparkles, BookOpen, GraduationCap } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion } from 'framer-motion';

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
      // Insert as pending material using direct SQL query
      const { error } = await supabase.rpc('exec_sql', {
        query: `
          INSERT INTO pending_study_materials (
            title, description, subject, grade, category, 
            file_url, tags, author_id, status
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
        `,
        params: [
          formData.title,
          formData.description,
          formData.subject,
          formData.grade,
          formData.category,
          formData.file_url,
          JSON.stringify(formData.tags),
          user.id,
          'pending'
        ]
      });

      if (error) throw error;

      toast({
        title: "Material submitted! ✨",
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
        description: "Failed to submit material. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50"
      >
        <Card className="max-w-md mx-auto backdrop-blur-lg bg-white/80 shadow-2xl border-0">
          <CardContent className="text-center py-12">
            <GraduationCap className="h-16 w-16 mx-auto text-blue-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Login Required</h3>
            <p className="text-gray-600">Please login to upload study materials and share your knowledge with the community.</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-lg px-6 py-3 rounded-full shadow-lg border mb-4"
          >
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Share Your Knowledge
            </span>
          </motion.div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Upload Study Material
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Share your notes and materials with fellow students. All uploads are reviewed by our admin team before being published.
          </p>
        </div>

        {/* Upload Form */}
        <Card className="backdrop-blur-lg bg-white/80 shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-100">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <BookOpen className="h-6 w-6 text-blue-500" />
              Material Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title and Subject Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="title" className="text-lg font-semibold text-gray-700 mb-2 block">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter material title"
                    className="h-12 text-lg border-2 border-gray-200 focus:border-blue-400 transition-colors"
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="subject" className="text-lg font-semibold text-gray-700 mb-2 block">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="e.g., Mathematics, Physics"
                    className="h-12 text-lg border-2 border-gray-200 focus:border-blue-400 transition-colors"
                    required
                  />
                </motion.div>
              </div>

              {/* Grade and Category Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label htmlFor="grade" className="text-lg font-semibold text-gray-700 mb-2 block">
                    Grade *
                  </Label>
                  <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)} required>
                    <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-blue-400">
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Label htmlFor="category" className="text-lg font-semibold text-gray-700 mb-2 block">
                    Category *
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)} required>
                    <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-blue-400">
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
                </motion.div>
              </div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Label htmlFor="description" className="text-lg font-semibold text-gray-700 mb-3 block">
                  Description
                </Label>
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
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
                    style={{ minHeight: '150px' }}
                  />
                </div>
              </motion.div>

              {/* PDF Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Label className="text-lg font-semibold text-gray-700 mb-3 block">
                  PDF File *
                </Label>
                <div className="space-y-4">
                  {formData.file_url ? (
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full">
                          <FileText className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <span className="text-lg font-semibold text-green-700">PDF file attached successfully!</span>
                          <p className="text-green-600">Ready to submit</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleInputChange('file_url', '')}
                        className="rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handlePdfUpload(e.target.files)}
                        className="hidden"
                        id="pdf-upload"
                        disabled={uploadingPdf}
                      />
                      <label htmlFor="pdf-upload" className="cursor-pointer">
                        <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-6">
                          <Upload className="h-12 w-12 text-blue-500" />
                        </div>
                        <p className="text-2xl font-semibold text-gray-700 mb-3">
                          {uploadingPdf ? 'Uploading PDF...' : 'Click to upload PDF file'}
                        </p>
                        <p className="text-gray-500 text-lg">
                          PDF files only, max 50MB
                        </p>
                      </label>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Tags */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Label htmlFor="tags" className="text-lg font-semibold text-gray-700 mb-3 block">
                  Tags
                </Label>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      className="h-12 text-lg border-2 border-gray-200 focus:border-blue-400"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline" className="h-12 px-8">
                      Add Tag
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm">
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
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex justify-end pt-8 border-t border-gray-200"
              >
                <Button 
                  type="submit" 
                  disabled={loading || uploadingPdf || !formData.file_url}
                  className="h-14 px-12 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Submit for Approval
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudentMaterialUpload;
