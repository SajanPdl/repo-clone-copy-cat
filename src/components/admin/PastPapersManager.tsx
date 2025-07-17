
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Calendar, Clock, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PastPapersManager = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    year: new Date().getFullYear().toString(),
    grade: 'Grade 12',
    difficulty: 'Medium',
    duration: '3 hours',
    file: null as File | null,
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically upload the file to a server
    // For demo purposes, we'll just show a success message
    console.log('Past Paper Data:', formData);
    
    toast({
      title: "Success!",
      description: `Past paper "${formData.title}" has been added.`,
    });
    
    // Reset form
    setFormData({
      title: '',
      subject: '',
      year: new Date().getFullYear().toString(),
      grade: 'Grade 12',
      difficulty: 'Medium',
      duration: '3 hours',
      file: null,
    });
  };

  // Sample data for dropdowns
  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());
  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History", "Geography"];
  const grades = ["Grade 10", "Grade 11", "Grade 12", "Bachelor's"];
  const difficulties = ["Easy", "Medium", "Hard"];
  const durations = ["1 hour", "1.5 hours", "2 hours", "2.5 hours", "3 hours", "4 hours"];

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
                <label htmlFor="difficulty" className="text-sm font-medium">Difficulty</label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={handleSelectChange('difficulty')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="duration" className="text-sm font-medium">Duration</label>
                <Select 
                  value={formData.duration} 
                  onValueChange={handleSelectChange('duration')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map(duration => (
                      <SelectItem key={duration} value={duration}>{duration}</SelectItem>
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
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Subject</th>
                  <th className="px-4 py-3 text-left font-medium">Year</th>
                  <th className="px-4 py-3 text-left font-medium">Grade</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    id: 1,
                    title: "Mathematics Final Exam 2023",
                    subject: "Mathematics",
                    year: 2023,
                    grade: "Grade 12",
                  },
                  {
                    id: 2,
                    title: "Physics Mid-Term Exam 2023",
                    subject: "Physics",
                    year: 2023,
                    grade: "Grade 11",
                  },
                ].map((paper, index) => (
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
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PastPapersManager;
