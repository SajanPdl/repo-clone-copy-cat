
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Grade = Tables<'grades'>;

const GradesManager = () => {
  const queryClient = useQueryClient();
  const [newGrade, setNewGrade] = useState({ name: '', description: '' });
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  
  // Fetch grades from database
  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
  
  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: async (newGrade: Omit<Grade, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('grades')
        .insert([newGrade])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast.success('Grade added successfully');
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Grade> & { id: number }) => {
      const { data, error } = await supabase
        .from('grades')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast.success('Grade updated successfully');
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast.success('Grade deleted successfully');
    }
  });
  
  const handleAddGrade = () => {
    if (!newGrade.name.trim()) {
      toast.error('Grade name is required');
      return;
    }
    
    createMutation.mutate({
      name: newGrade.name.trim(),
      description: newGrade.description.trim() || null
    });
    
    setNewGrade({ name: '', description: '' });
  };
  
  const handleUpdateGrade = () => {
    if (!editingGrade || !editingGrade.name) {
      toast.error('Grade name is required');
      return;
    }
    
    updateMutation.mutate(editingGrade);
    setEditingGrade(null);
  };
  
  const handleDeleteGrade = (id: number) => {
    if (confirm('Are you sure you want to delete this grade?')) {
      deleteMutation.mutate(id);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span>Add New Grade/Level</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="grade-name">
                Grade/Level Name
              </label>
              <Input
                id="grade-name"
                value={newGrade.name}
                onChange={(e) => setNewGrade({ ...newGrade, name: e.target.value })}
                placeholder="e.g., Grade 10, Bachelor's"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="description">
                Description
              </label>
              <Input
                id="description"
                value={newGrade.description}
                onChange={(e) => setNewGrade({ ...newGrade, description: e.target.value })}
                placeholder="e.g., High school level, College level"
              />
            </div>
          </div>
          <Button className="mt-4" onClick={handleAddGrade}>
            <Plus className="h-4 w-4 mr-2" /> Add Grade
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Grades/Levels</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
                <div className="col-span-6">Grade/Level</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              <div className="divide-y">
                {grades.length > 0 ? grades.map((grade) => (
                  <div key={grade.id} className="grid grid-cols-12 px-4 py-3 items-center">
                    <div className="col-span-6 font-medium">
                      {editingGrade?.id === grade.id ? (
                        <Input
                          value={editingGrade.name}
                          onChange={(e) => setEditingGrade({ ...editingGrade, name: e.target.value })}
                        />
                      ) : (
                        grade.name
                      )}
                    </div>
                    <div className="col-span-4 text-gray-600 dark:text-gray-400">
                      {editingGrade?.id === grade.id ? (
                        <Input
                          value={editingGrade.description || ''}
                          onChange={(e) => setEditingGrade({ ...editingGrade, description: e.target.value })}
                        />
                      ) : (
                        grade.description || 'No description'
                      )}
                    </div>
                    <div className="col-span-2 flex justify-end space-x-2">
                      {editingGrade?.id === grade.id ? (
                        <Button size="sm" onClick={handleUpdateGrade}>
                          Save
                        </Button>
                      ) : (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => setEditingGrade(grade)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => handleDeleteGrade(grade.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-500">
                    No grades found. Add your first grade above.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GradesManager;
