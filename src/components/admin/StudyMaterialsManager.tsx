
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StudyMaterial } from '@/utils/queryUtils';
import { Edit, Trash2, Eye, Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StudyMaterialEditor from './StudyMaterialEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const StudyMaterialsManager = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [showEditor, setShowEditor] = useState(false);
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

  const handleSaveMaterial = async (materialData: StudyMaterial) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (editingMaterial?.id) {
        // Update existing material
        const { error } = await supabase
          .from('study_materials')
          .update({
            title: materialData.title,
            description: materialData.description,
            subject: materialData.subject,
            grade: materialData.grade,
            category: materialData.category,
            file_url: materialData.file_url,
            file_type: materialData.file_type,
            tags: materialData.tags,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMaterial.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Study material updated successfully."
        });
      } else {
        // Create new material
        const { error } = await supabase
          .from('study_materials')
          .insert([{
            title: materialData.title,
            description: materialData.description,
            subject: materialData.subject,
            grade: materialData.grade,
            category: materialData.category,
            file_url: materialData.file_url,
            file_type: materialData.file_type,
            tags: materialData.tags,
            author_id: userData?.user?.id,
            downloads: 0,
            views: 0,
            rating: 0.0,
            is_featured: false
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Study material created successfully."
        });
      }

      setShowEditor(false);
      setEditingMaterial(null);
      fetchStudyMaterials();
    } catch (error: any) {
      console.error("Error saving material:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save material. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;

    try {
      const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Study material deleted successfully."
      });
      fetchStudyMaterials();
    } catch (error: any) {
      console.error("Error deleting material:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete material. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleFeatured = async (id: number, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('study_materials')
        .update({ is_featured: !isFeatured })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Material ${!isFeatured ? 'featured' : 'unfeatured'} successfully.`
      });
      fetchStudyMaterials();
    } catch (error: any) {
      console.error("Error toggling featured:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update material. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showEditor) {
    return (
      <StudyMaterialEditor
        material={editingMaterial || undefined}
        onSave={handleSaveMaterial}
        onCancel={() => {
          setShowEditor(false);
          setEditingMaterial(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Study Materials Management
            <Button
              onClick={() => {
                setEditingMaterial(null);
                setShowEditor(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Material
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg line-clamp-2">{material.title}</h3>
                        <div className="flex items-center">
                          <Switch
                            checked={material.is_featured}
                            onCheckedChange={() => handleToggleFeatured(material.id, material.is_featured)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{material.subject}</Badge>
                        <Badge variant="outline">{material.grade}</Badge>
                        <Badge variant="outline">{material.category}</Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Downloads: {material.downloads || 0}</p>
                        <p>Views: {material.views || 0}</p>
                        <p>Created: {new Date(material.created_at || '').toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 border-t">
                        <div className="flex gap-2">
                          {material.file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(material.file_url, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingMaterial(material);
                              setShowEditor(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMaterial(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredMaterials.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No study materials found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyMaterialsManager;
