
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, FolderPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import CategoryAdder from './CategoryAdder';

type Category = Tables<'categories'>;

const CategoriesManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Fetch categories from database
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      return data;
    }
  });
  
  // Mutations for CRUD operations
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: number }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating category:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category updated successfully"
      });
      setEditingCategory(null);
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting category:', error);
        throw error;
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  });
  
  const handleAddCategory = (newCategory: {name: string, description?: string}) => {
    // This is handled by CategoryAdder component
    console.log('Category added:', newCategory);
  };
  
  const handleUpdateCategory = () => {
    if (!editingCategory || !editingCategory.name?.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }
    
    updateMutation.mutate(editingCategory);
  };
  
  const handleDeleteCategory = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  if (error) {
    console.error('Categories query error:', error);
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-500 mb-4">Error loading categories</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" />
            <span>Add New Category</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryAdder onAddCategory={handleAddCategory} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
                <div className="col-span-4">Name</div>
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              <div className="divide-y">
                {categories && categories.length > 0 ? categories.map((category) => (
                  <div key={category.id} className="grid grid-cols-12 px-4 py-3 items-center">
                    <div className="col-span-4 font-medium">
                      {editingCategory?.id === category.id ? (
                        <Input
                          value={editingCategory.name || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        />
                      ) : (
                        category.name
                      )}
                    </div>
                    <div className="col-span-6 text-gray-600 dark:text-gray-400">
                      {editingCategory?.id === category.id ? (
                        <Input
                          value={editingCategory.description || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        />
                      ) : (
                        category.description || 'No description'
                      )}
                    </div>
                    <div className="col-span-2 flex justify-end space-x-2">
                      {editingCategory?.id === category.id ? (
                        <>
                          <Button size="sm" onClick={handleUpdateCategory} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? 'Saving...' : 'Save'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => setEditingCategory(category)}
                            disabled={updateMutation.isPending || deleteMutation.isPending}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={updateMutation.isPending || deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-500">
                    No categories found. Add your first category above.
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

export default CategoriesManager;
