import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast';
import {
  uploadStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  toggleFeatured
} from '@/utils/studyMaterialsUtils';
import { StudyMaterial } from '@/utils/queryUtils';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const StudyMaterialsManager = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [materialData, setMaterialData] = useState({
    title: '',
    description: '',
    subject: '',
    category: '',
    grade: '',
    date: new Date().toISOString().split('T')[0],
    downloads: 0,
    is_featured: false,
    file_url: '',
    file_type: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStudyMaterials();
  }, []);

  const fetchStudyMaterials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching study materials:", error);
        toast({
          title: "Error",
          description: "Failed to fetch study materials. Please try again.",
          variant: "destructive"
        });
      } else {
        setMaterials(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMaterialData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!materialData.title || !materialData.description || !materialData.subject || !materialData.category || !materialData.grade || !materialData.file_url || !materialData.file_type) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

        const newMaterial = await uploadStudyMaterial({
          title: materialData.title,
          description: materialData.description,
          subject: materialData.subject,
          category: materialData.category,
          grade: materialData.grade,
          author_id: null,
          date: materialData.date,
          downloads: 0,
          views: 0,
          rating: 0.0,
          tags: [],
          is_featured: false,
          file_url: materialData.file_url,
          file_type: materialData.file_type
        });

      setMaterials(prevMaterials => [...prevMaterials, newMaterial]);
      setIsDialogOpen(false);
      setMaterialData({
        title: '',
        description: '',
        subject: '',
        category: '',
        grade: '',
        date: new Date().toISOString().split('T')[0],
        downloads: 0,
        is_featured: false,
        file_url: '',
        file_type: ''
      });
      toast({
        title: "Success",
        description: "Study material uploaded successfully.",
      });
      fetchStudyMaterials();
    } catch (error: any) {
      console.error("Error uploading study material:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload study material. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await deleteStudyMaterial(id);
        setMaterials(prevMaterials => prevMaterials.filter(material => material.id !== id));
        toast({
          title: "Success",
          description: "Study material deleted successfully.",
        });
        fetchStudyMaterials();
      } catch (error: any) {
        console.error("Error deleting study material:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete study material. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleToggleFeatured = async (id: number, isFeatured: boolean) => {
    try {
      await toggleFeatured(id, !isFeatured);
      setMaterials(prevMaterials =>
        prevMaterials.map(material =>
          material.id === id ? { ...material, is_featured: !isFeatured } : material
        )
      );
      toast({
        title: "Success",
        description: `Study material ${isFeatured ? 'unfeatured' : 'featured'} successfully.`,
      });
      fetchStudyMaterials();
    } catch (error: any) {
      console.error("Error toggling featured status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to toggle featured status. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Study Materials</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="primary">Add New Material</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Study Material</DialogTitle>
              <DialogDescription>
                Upload a new study material to the database.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={materialData.title}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={materialData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Subject
                </Label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  value={materialData.subject}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select onValueChange={(value) => setMaterialData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="grade" className="text-right">
                  Grade
                </Label>
                <Input
                  type="text"
                  id="grade"
                  name="grade"
                  value={materialData.grade}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  type="date"
                  id="date"
                  name="date"
                  value={materialData.date}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file_url" className="text-right">
                  File URL
                </Label>
                <Input
                  type="url"
                  id="file_url"
                  name="file_url"
                  value={materialData.file_url}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file_type" className="text-right">
                  File Type
                </Label>
                <Input
                  type="text"
                  id="file_type"
                  name="file_type"
                  value={materialData.file_type}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <Button type="submit">Upload Material</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.title}</TableCell>
                  <TableCell>{material.subject}</TableCell>
                  <TableCell>{material.category}</TableCell>
                  <TableCell>{material.grade}</TableCell>
                  <TableCell>{material.downloads}</TableCell>
                  <TableCell>
                    <Switch
                      checked={material.is_featured}
                      onCheckedChange={() => handleToggleFeatured(material.id, material.is_featured)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteMaterial(material.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default StudyMaterialsManager;
