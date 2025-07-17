import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BookText, 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  Filter, 
  ArrowUpDown, 
  Download,
  Eye,
  Calendar,
  Tag
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStudyMaterials } from '@/utils/queryUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tables } from '@/integrations/supabase/types';

// Use the Supabase types directly
type StudyMaterial = Tables<'study_materials'>;

// Define type for form data
interface FormData {
  title: string;
  description: string;
  content: string;
  subject: string;
  category: string;
  author: string;
  tags: string;
  grade: string;
  file: File | null;
}

const StudyMaterialsManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    content: '',
    subject: '',
    category: '',
    author: '',
    tags: '',
    grade: '',
    file: null
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: studyMaterials, isLoading, isError } = useQuery({
    queryKey: ['study_materials', { category: selectedCategory, subject: selectedSubject, search: searchTerm }],
    queryFn: () => fetchStudyMaterials({ 
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      subject: selectedSubject !== 'All' ? selectedSubject : undefined,
      search: searchTerm || undefined
    })
  });
  
  const createMutation = useMutation({
    mutationFn: async (newMaterial: Omit<StudyMaterial, 'id'>) => {
      const { data, error } = await supabase
        .from('study_materials')
        .insert([newMaterial])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_materials'] });
      toast({
        title: "Success",
        description: "Study material created successfully.",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create study material.",
        variant: "destructive",
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async (updatedMaterial: Partial<StudyMaterial>) => {
      if (!selectedMaterial) throw new Error("No material selected for update");
      
      const { data, error } = await supabase
        .from('study_materials')
        .update(updatedMaterial)
        .eq('id', selectedMaterial.id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_materials'] });
      toast({
        title: "Success",
        description: "Study material updated successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update study material.",
        variant: "destructive",
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id; // Return the id to indicate successful deletion
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_materials'] });
      toast({
        title: "Success",
        description: "Study material deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete study material.",
        variant: "destructive",
      });
    }
  });
  
  const categories = ['All', 'Notes', 'Worksheets', 'Practice Tests', 'Guides'];
  const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography'];
  const grades = ['Grade 10', 'Grade 11', 'Grade 12', "Bachelor's"];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      subject: '',
      category: '',
      author: '',
      tags: '',
      grade: '',
      file: null
    });
  };
  
  const handleAddMaterial = () => {
    // In a real application, you would upload the file to storage
    // and get a URL back to store in the database
    const newMaterial: Omit<StudyMaterial, 'id'> = {
      title: formData.title,
      description: formData.description,
      content: formData.content,
      subject: formData.subject,
      category: formData.category,
      author: formData.author,
      tags: formData.tags.split(',').map(tag => tag.trim()),
      grade: formData.grade,
      date: new Date().toISOString().split('T')[0],
      downloads: 0,
      is_featured: false,
      download_url: formData.file ? URL.createObjectURL(formData.file) : null,
      image_url: null,
      updated_at: new Date().toISOString(),
      level: null,
      pages: null,
      rating: null,
      read_time: null,
      topics: null
    };
    
    createMutation.mutate(newMaterial);
  };
  
  const handleEditMaterial = () => {
    if (!selectedMaterial) return;
    
    const updatedMaterial: Partial<StudyMaterial> = {
      title: formData.title,
      description: formData.description,
      content: formData.content,
      subject: formData.subject,
      category: formData.category,
      author: formData.author,
      tags: formData.tags.split(',').map(tag => tag.trim()),
      grade: formData.grade,
      updated_at: new Date().toISOString()
    };
    
    updateMutation.mutate(updatedMaterial);
  };
  
  const handleDeleteMaterial = () => {
    if (selectedMaterial?.id) {
      deleteMutation.mutate(selectedMaterial.id);
    }
  };
  
  const handleEditClick = (material: StudyMaterial) => {
    setSelectedMaterial(material);
    setFormData({
      title: material.title,
      description: material.description || '',
      content: material.content || '',
      subject: material.subject,
      category: material.category,
      author: material.author,
      tags: material.tags ? material.tags.join(', ') : '',
      grade: material.grade || '',
      file: null
    });
    setIsEditDialogOpen(true);
  };
  
  const handleViewClick = (material: StudyMaterial) => {
    setSelectedMaterial(material);
    setIsViewDialogOpen(true);
  };
  
  const handleDeleteClick = (material: StudyMaterial) => {
    setSelectedMaterial(material);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDownloadClick = (material: StudyMaterial) => {
    // In a real application, you would increment download count
    // and redirect to the actual download URL
    toast({
      title: "Download Started",
      description: `Downloading ${material.title}`,
    });
    
    // Simulate download link click
    if (material.download_url) {
      window.open(material.download_url, '_blank');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              type="search" 
              placeholder="Search study materials..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4 text-gray-500" />
            <select 
              className="bg-white border border-gray-200 rounded p-2 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Subject Filter */}
          <div className="flex gap-2 items-center">
            <BookText className="h-4 w-4 text-gray-500" />
            <select 
              className="bg-white border border-gray-200 rounded p-2 text-sm"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Add new button */}
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Material
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-1">
          <CardTitle>Study Materials</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading study materials...</p>
            </div>
          ) : isError ? (
            <div className="py-10 text-center">
              <p className="text-red-500">Error loading study materials.</p>
              <Button variant="outline" className="mt-4">Retry</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Downloads <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studyMaterials?.length ? (
                  studyMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <BookText className="h-4 w-4 text-gray-400" />
                          <span className="line-clamp-1">{material.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{material.category}</TableCell>
                      <TableCell>{material.subject}</TableCell>
                      <TableCell>{material.downloads ?? 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{material.date ? new Date(material.date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewClick(material)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDownloadClick(material)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditClick(material)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteClick(material)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                      No study materials found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Add Material Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Study Material</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new study material to the database.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Advanced Calculus Notes"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">Subject</label>
              <Select 
                value={formData.subject} 
                onValueChange={handleSelectChange('subject')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.filter(s => s !== 'All').map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <Select 
                value={formData.category} 
                onValueChange={handleSelectChange('category')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c !== 'All').map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="grade" className="text-sm font-medium">Grade</label>
              <Select 
                value={formData.grade} 
                onValueChange={handleSelectChange('grade')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="author" className="text-sm font-medium">Author</label>
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="e.g., Dr. Jane Smith"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., calculus, mathematics, advanced"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the material"
                rows={2}
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label htmlFor="content" className="text-sm font-medium">Content</label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Full content or summary"
                rows={4}
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label htmlFor="file" className="text-sm font-medium">Upload PDF</label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file')?.click()}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {formData.file ? formData.file.name : 'Choose PDF File'}
                </Button>
                {formData.file && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                    className="text-red-500"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button 
              type="button" 
              onClick={handleAddMaterial}
              disabled={!formData.title || !formData.subject || !formData.category}
            >
              Add Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Material Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Study Material</DialogTitle>
            <DialogDescription>
              Update the details of this study material.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Same form fields as in Add Dialog */}
            <div className="space-y-2">
              <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Advanced Calculus Notes"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-subject" className="text-sm font-medium">Subject</label>
              <Select 
                value={formData.subject} 
                onValueChange={handleSelectChange('subject')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.filter(s => s !== 'All').map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-category" className="text-sm font-medium">Category</label>
              <Select 
                value={formData.category} 
                onValueChange={handleSelectChange('category')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c !== 'All').map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-grade" className="text-sm font-medium">Grade</label>
              <Select 
                value={formData.grade} 
                onValueChange={handleSelectChange('grade')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-author" className="text-sm font-medium">Author</label>
              <Input
                id="edit-author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="e.g., Dr. Jane Smith"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-tags" className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                id="edit-tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., calculus, mathematics, advanced"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the material"
                rows={2}
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label htmlFor="edit-content" className="text-sm font-medium">Content</label>
              <Textarea
                id="edit-content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Full content or summary"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button 
              type="button" 
              onClick={handleEditMaterial}
              disabled={!formData.title || !formData.subject || !formData.category}
            >
              Update Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Material Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedMaterial?.title}</DialogTitle>
            <DialogDescription>
              {selectedMaterial?.category} • {selectedMaterial?.subject}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                {selectedMaterial?.tags?.join(', ') || 'No tags'}
              </span>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm">{selectedMaterial?.description}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Content Preview</h4>
              <div className="bg-gray-50 p-4 rounded-md max-h-[200px] overflow-y-auto">
                <p className="text-sm whitespace-pre-line">{selectedMaterial?.content}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Author:</span> {selectedMaterial?.author}
              </div>
              <div>
                <span className="font-medium">Downloads:</span> {selectedMaterial?.downloads ?? 0}
              </div>
              <div>
                <span className="font-medium">Date Added:</span> {selectedMaterial?.date && new Date(selectedMaterial.date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Grade:</span> {selectedMaterial?.grade || 'Not specified'}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            <Button onClick={() => handleDownloadClick(selectedMaterial!)}>
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedMaterial?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteMaterial}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyMaterialsManager;
