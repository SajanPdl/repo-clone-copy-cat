
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { 
  BookText, 
  Plus, 
  Trash2, 
  Upload,
  Save,
  FileText,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import LatexEditor from '@/components/admin/LatexEditor';

interface StudyMaterial {
  id?: number;
  title: string;
  category: string;
  subject: string;
  grade: string;
  description: string;
  detailedDescription: string;
  keyPoints: string[];
  importantFormulas: { text: string; isLatex: boolean }[];
  chapters: string[];
  author: string;
  publishDate: string;
  fileSize: string;
  pages: number;
  fileType: string;
  language: string;
  pdfUrl: string;
  isPublished: boolean;
}

const StudyMaterialEditor = () => {
  const [material, setMaterial] = useState<StudyMaterial>({
    title: '',
    category: 'High School',
    subject: '',
    grade: 'Grade 10',
    description: '',
    detailedDescription: '',
    keyPoints: [''],
    importantFormulas: [{ text: '', isLatex: true }],
    chapters: [''],
    author: '',
    publishDate: new Date().toISOString().split('T')[0],
    fileSize: '',
    pages: 0,
    fileType: 'PDF',
    language: 'English',
    pdfUrl: '',
    isPublished: false
  });
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState({
    basic: true,
    file: true,
    keyPoints: true,
    formulas: true,
    chapters: true
  });
  
  const form = useForm<StudyMaterial>({
    defaultValues: material
  });
  
  // Handlers for array fields (keyPoints, importantFormulas, chapters)
  const addArrayItem = (field: 'keyPoints' | 'chapters') => {
    setMaterial(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };
  
  const addFormulaItem = () => {
    setMaterial(prev => ({
      ...prev,
      importantFormulas: [...prev.importantFormulas, { text: '', isLatex: true }]
    }));
  };
  
  const removeArrayItem = (field: 'keyPoints' | 'chapters', index: number) => {
    setMaterial(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };
  
  const removeFormulaItem = (index: number) => {
    setMaterial(prev => ({
      ...prev,
      importantFormulas: prev.importantFormulas.filter((_, i) => i !== index)
    }));
  };
  
  const updateArrayItem = (field: 'keyPoints' | 'chapters', index: number, value: string) => {
    setMaterial(prev => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = value;
      return {
        ...prev,
        [field]: updatedArray
      };
    });
  };
  
  const updateFormulaItem = (index: number, value: string, isLatex: boolean) => {
    setMaterial(prev => {
      const updatedFormulas = [...prev.importantFormulas];
      updatedFormulas[index] = { text: value, isLatex };
      return {
        ...prev,
        importantFormulas: updatedFormulas
      };
    });
  };
  
  const toggleFormulaType = (index: number) => {
    setMaterial(prev => {
      const updatedFormulas = [...prev.importantFormulas];
      updatedFormulas[index] = { 
        ...updatedFormulas[index], 
        isLatex: !updatedFormulas[index].isLatex 
      };
      return {
        ...prev,
        importantFormulas: updatedFormulas
      };
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMaterial(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (field: string, value: string) => {
    setMaterial(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
      
      // Update file information
      setMaterial(prev => ({
        ...prev,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        fileType: file.type.split('/')[1].toUpperCase(),
        pdfUrl: URL.createObjectURL(file) // Temporary URL for preview
      }));
    }
  };
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Validate form
    if (!material.title || !material.subject || !material.description) {
      toast.error('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Study material saved successfully!');
      setIsSubmitting(false);
      
      // In a real application, you would make an API call here to save the data
      console.log('Saved material:', material);
    }, 1500);
  };
  
  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookText className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">
              {material.id ? 'Edit Study Material' : 'Create New Study Material'}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="gap-2"
            >
              <span>Preview</span>
            </Button>
            <Button 
              onClick={handleSubmit}
              className="gap-2"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Material'}
            </Button>
          </div>
        </div>
        
        <Form {...form}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Collapsible open={openSections.basic} onOpenChange={(open) => setOpenSections({...openSections, basic: open})}>
                <Card>
                  <CardHeader className="py-4">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer">
                        <CardTitle>Basic Information</CardTitle>
                        <ChevronDown className={`h-5 w-5 transform transition-transform ${openSections.basic ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <FormItem>
                            <FormLabel htmlFor="title">Title*</FormLabel>
                            <FormControl>
                              <Input 
                                id="title"
                                name="title"
                                value={material.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Mathematics for Grade 10"
                              />
                            </FormControl>
                          </FormItem>
                        </div>
                        
                        <div className="space-y-2">
                          <FormItem>
                            <FormLabel htmlFor="author">Author*</FormLabel>
                            <FormControl>
                              <Input 
                                id="author"
                                name="author"
                                value={material.author}
                                onChange={handleInputChange}
                                placeholder="e.g., Dr. John Smith"
                              />
                            </FormControl>
                          </FormItem>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <FormItem>
                            <FormLabel htmlFor="category">Category*</FormLabel>
                            <Select
                              value={material.category}
                              onValueChange={(value) => handleSelectChange('category', value)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="High School">High School</SelectItem>
                                <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                                <SelectItem value="Master's">Master's</SelectItem>
                                <SelectItem value="Engineering">Engineering</SelectItem>
                                <SelectItem value="Medical">Medical</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        </div>
                        
                        <div className="space-y-2">
                          <FormItem>
                            <FormLabel htmlFor="subject">Subject*</FormLabel>
                            <FormControl>
                              <Input 
                                id="subject"
                                name="subject"
                                value={material.subject}
                                onChange={handleInputChange}
                                placeholder="e.g., Mathematics, Physics, etc."
                              />
                            </FormControl>
                          </FormItem>
                        </div>
                        
                        <div className="space-y-2">
                          <FormItem>
                            <FormLabel htmlFor="grade">Grade/Level*</FormLabel>
                            <Select
                              value={material.grade}
                              onValueChange={(value) => handleSelectChange('grade', value)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Grade 7">Grade 7</SelectItem>
                                <SelectItem value="Grade 8">Grade 8</SelectItem>
                                <SelectItem value="Grade 9">Grade 9</SelectItem>
                                <SelectItem value="Grade 10">Grade 10</SelectItem>
                                <SelectItem value="Grade 11">Grade 11</SelectItem>
                                <SelectItem value="Grade 12">Grade 12</SelectItem>
                                <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                                <SelectItem value="Engineering">Engineering</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <FormItem>
                          <FormLabel htmlFor="description">Short Description*</FormLabel>
                          <FormControl>
                            <Textarea 
                              id="description"
                              name="description"
                              value={material.description}
                              onChange={handleInputChange}
                              placeholder="Brief description (100-150 characters)"
                              rows={2}
                            />
                          </FormControl>
                        </FormItem>
                      </div>
                      
                      <div className="space-y-2">
                        <FormItem>
                          <FormLabel htmlFor="detailedDescription">Detailed Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              id="detailedDescription"
                              name="detailedDescription"
                              value={material.detailedDescription}
                              onChange={handleInputChange}
                              placeholder="Comprehensive description of the material"
                              rows={6}
                            />
                          </FormControl>
                        </FormItem>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="isPublished" 
                          checked={material.isPublished}
                          onCheckedChange={(checked) => {
                            setMaterial(prev => ({
                              ...prev,
                              isPublished: checked as boolean
                            }));
                          }}
                        />
                        <label
                          htmlFor="isPublished"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Publish immediately (otherwise save as draft)
                        </label>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
              
              {/* File Upload */}
              <Collapsible open={openSections.file} onOpenChange={(open) => setOpenSections({...openSections, file: open})}>
                <Card>
                  <CardHeader className="py-4">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer">
                        <CardTitle>PDF Document</CardTitle>
                        <ChevronDown className={`h-5 w-5 transform transition-transform ${openSections.file ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                        <Input
                          id="pdf-upload"
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf"
                          className="hidden"
                        />
                        <label 
                          htmlFor="pdf-upload"
                          className="cursor-pointer flex flex-col items-center justify-center"
                        >
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm font-medium">
                            {pdfFile ? pdfFile.name : 'Click to upload PDF file'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Maximum file size: 50MB
                          </p>
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <FormItem>
                            <FormLabel htmlFor="fileSize">File Size</FormLabel>
                            <FormControl>
                              <Input 
                                id="fileSize"
                                name="fileSize"
                                value={material.fileSize}
                                onChange={handleInputChange}
                                placeholder="e.g., 4.2 MB"
                                disabled={!!pdfFile}
                              />
                            </FormControl>
                          </FormItem>
                        </div>
                        
                        <div className="space-y-2">
                          <FormItem>
                            <FormLabel htmlFor="pages">Pages</FormLabel>
                            <FormControl>
                              <Input 
                                id="pages"
                                name="pages"
                                type="number"
                                value={material.pages.toString()}
                                onChange={handleInputChange}
                                placeholder="e.g., 42"
                              />
                            </FormControl>
                          </FormItem>
                        </div>
                        
                        <div className="space-y-2">
                          <FormItem>
                            <FormLabel htmlFor="fileType">File Type</FormLabel>
                            <FormControl>
                              <Input 
                                id="fileType"
                                name="fileType"
                                value={material.fileType}
                                onChange={handleInputChange}
                                placeholder="e.g., PDF"
                                disabled={!!pdfFile}
                              />
                            </FormControl>
                          </FormItem>
                        </div>
                        
                        <div className="space-y-2">
                          <FormItem>
                            <FormLabel htmlFor="language">Language</FormLabel>
                            <Select
                              value={material.language}
                              onValueChange={(value) => handleSelectChange('language', value)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Spanish">Spanish</SelectItem>
                                <SelectItem value="French">French</SelectItem>
                                <SelectItem value="German">German</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
              
              {/* Key Points */}
              <Collapsible open={openSections.keyPoints} onOpenChange={(open) => setOpenSections({...openSections, keyPoints: open})}>
                <Card>
                  <CardHeader className="py-4">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer">
                        <CardTitle className="flex items-center justify-between">
                          <span>Key Points Covered</span>
                        </CardTitle>
                        <ChevronDown className={`h-5 w-5 transform transition-transform ${openSections.keyPoints ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      {material.keyPoints.map((point, index) => (
                        <div key={`key-point-${index}`} className="flex gap-2">
                          <Input 
                            value={point}
                            onChange={(e) => updateArrayItem('keyPoints', index, e.target.value)}
                            placeholder={`Key point ${index + 1}`}
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => removeArrayItem('keyPoints', index)}
                            disabled={material.keyPoints.length <= 1}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        onClick={() => addArrayItem('keyPoints')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Key Point
                      </Button>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
              
              {/* Important Formulas with LaTeX support */}
              <Collapsible open={openSections.formulas} onOpenChange={(open) => setOpenSections({...openSections, formulas: open})}>
                <Card>
                  <CardHeader className="py-4">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer">
                        <CardTitle className="flex items-center justify-between">
                          <span>Important Formulas</span>
                        </CardTitle>
                        <ChevronDown className={`h-5 w-5 transform transition-transform ${openSections.formulas ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      <CardDescription>
                        Use LaTeX for mathematical formulas or plain text for simple formulas.
                      </CardDescription>
                      
                      {material.importantFormulas.map((formula, index) => (
                        <div key={`formula-${index}`} className="space-y-2 p-4 border rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm font-medium">Formula {index + 1}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2 text-xs"
                                onClick={() => toggleFormulaType(index)}
                              >
                                {formula.isLatex ? 'Using LaTeX' : 'Using Plain Text'}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => removeFormulaItem(index)}
                                disabled={material.importantFormulas.length <= 1}
                                className="flex-shrink-0 h-7 w-7"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {formula.isLatex ? (
                            <LatexEditor 
                              value={formula.text}
                              onChange={(value) => updateFormulaItem(index, value, true)}
                            />
                          ) : (
                            <Input 
                              value={formula.text}
                              onChange={(e) => updateFormulaItem(index, e.target.value, false)}
                              placeholder={`Formula ${index + 1}`}
                            />
                          )}
                          
                          {formula.isLatex && formula.text && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                              <div className="text-sm font-medium mb-1">Preview:</div>
                              <div 
                                dangerouslySetInnerHTML={{ 
                                  __html: `$$${formula.text}$$`
                                }} 
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        onClick={addFormulaItem}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Formula
                      </Button>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
              
              {/* Chapters & Topics */}
              <Collapsible open={openSections.chapters} onOpenChange={(open) => setOpenSections({...openSections, chapters: open})}>
                <Card>
                  <CardHeader className="py-4">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer">
                        <CardTitle className="flex items-center justify-between">
                          <span>Chapters & Topics</span>
                        </CardTitle>
                        <ChevronDown className={`h-5 w-5 transform transition-transform ${openSections.chapters ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      {material.chapters.map((chapter, index) => (
                        <div key={`chapter-${index}`} className="flex gap-2">
                          <Input 
                            value={chapter}
                            onChange={(e) => updateArrayItem('chapters', index, e.target.value)}
                            placeholder={`Chapter ${index + 1}`}
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => removeArrayItem('chapters', index)}
                            disabled={material.chapters.length <= 1}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        onClick={() => addArrayItem('chapters')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Chapter
                      </Button>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>
            
            {/* Preview and Help */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                    <h3 className="font-bold">{material.title || 'Material Title'}</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>Category: {material.category}</p>
                      <p>Subject: {material.subject || 'Not specified'}</p>
                      <p>Grade: {material.grade || 'Not specified'}</p>
                      <p>Author: {material.author || 'Not specified'}</p>
                    </div>
                    <p className="text-sm">{material.description || 'No description provided.'}</p>
                    
                    {material.keyPoints.some(point => point) && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Key Points:</h4>
                        <ul className="list-disc pl-5 text-sm">
                          {material.keyPoints.map((point, i) => point && (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {material.importantFormulas.some(formula => formula.text) && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Important Formulas:</h4>
                        <div className="space-y-2">
                          {material.importantFormulas.map((formula, i) => formula.text && (
                            <div key={i} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              {formula.isLatex ? (
                                <div dangerouslySetInnerHTML={{ __html: `$$${formula.text}$$` }} />
                              ) : (
                                <p>{formula.text}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {pdfFile && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">PDF Preview</h4>
                      <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                        <p className="text-sm text-gray-500">
                          PDF preview will be available after saving
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Help</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-3">
                    <p><strong>Required fields:</strong> Title, Subject, Category, Grade, and Description.</p>
                    <p><strong>Key Points:</strong> Add important concepts covered in the material.</p>
                    <p><strong>Formulas:</strong> Add mathematical formulas using LaTeX for proper rendering.</p>
                    <p><strong>Chapters:</strong> List main topics or sections of the material.</p>
                    <p className="text-primary"><strong>Tip:</strong> Adding detailed descriptions and key points improves searchability and user engagement.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Form>
      </div>
    </FormProvider>
  );
};

export default StudyMaterialEditor;
