
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Calendar, Clock, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PastPaper } from '@/utils/queryUtils';

const PastPapersManager = () => {
  const { toast } = useToast();
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    year: new Date().getFullYear().toString(),
    grade: 'Grade 12',
    board: 'CBSE',
    file: null as File | null,
  });

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('past_papers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPapers(data || []);
    } catch (error) {
      console.error('Error fetching papers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch past papers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('past_papers')
        .insert([
          {
            title: formData.title,
            subject: formData.subject,
            year: parseInt(formData.year),
            grade: formData.grade,
            board: formData.board,
            downloads: 0
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: `Past paper "${formData.title}" has been added.`,
      });
      
      // Reset form and refresh data
      setFormData({
        title: '',
        subject: '',
        year: new Date().getFullYear().toString(),
        grade: 'Grade 12',
        board: 'CBSE',
        file: null,
      });
      
      fetchPapers();
    } catch (error) {
      console.error('Error adding paper:', error);
      toast({
        title: "Error",
        description: "Failed to add past paper",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('past_papers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Past paper deleted successfully",
      });
      
      fetchPapers();
    } catch (error) {
      console.error('Error deleting paper:', error);
      toast({
        title: "Error",
        description: "Failed to delete past paper",
        variant: "destructive"
      });
    }
  };

  // Sample data for dropdowns
  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());
  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History", "Geography"];
  const grades = ["Grade 10", "Grade 11", "Grade 12"];
  const boards = ["CBSE", "ICSE", "State Board"];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Past Paper</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics Final Exam 2023"
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
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="year" className="text-sm font-medium">Year</label>
                <Select 
                  value={formData.year} 
                  onValueChange={handleSelectChange('year')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
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
                <label htmlFor="board" className="text-sm font-medium">Board</label>
                <Select 
                  value={formData.board} 
                  onValueChange={handleSelectChange('board')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map(board => (
                      <SelectItem key={board} value={board}>{board}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
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
                  <Upload className="h-4 w-4" />
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
            
            <div className="pt-4">
              <Button type="submit" className="w-full">Add Past Paper</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Past Papers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading past papers...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left font-medium">Title</th>
                    <th className="px-4 py-3 text-left font-medium">Subject</th>
                    <th className="px-4 py-3 text-left font-medium">Year</th>
                    <th className="px-4 py-3 text-left font-medium">Grade</th>
                    <th className="px-4 py-3 text-left font-medium">Board</th>
                    <th className="px-4 py-3 text-left font-medium">Downloads</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {papers.length > 0 ? papers.map((paper, index) => (
                    <tr key={paper.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900/50' : 'bg-gray-50 dark:bg-gray-800/30'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>{paper.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{paper.subject}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{paper.year}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4 text-gray-400" />
                          <span>{paper.grade}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{paper.board}</td>
                      <td className="px-4 py-3">{paper.downloads || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500"
                            onClick={() => handleDelete(paper.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No past papers found. Add some papers to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PastPapersManager;
