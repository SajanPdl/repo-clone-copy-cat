
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface CategoryAdderProps {
  onAddCategory?: (category: Omit<Category, 'id'>) => void;
  buttonVariant?: 'default' | 'outline' | 'ghost';
  showForm?: boolean;
  className?: string;
}

const CategoryAdder: React.FC<CategoryAdderProps> = ({ 
  onAddCategory, 
  buttonVariant = 'default',
  showForm = false,
  className = ''
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormVisible, setIsFormVisible] = useState(showForm);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  
  const createMutation = useMutation({
    mutationFn: async (newCategory: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([newCategory])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating category:', error);
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category added successfully"
      });
      
      // Call the onAddCategory callback if provided
      if (onAddCategory) {
        onAddCategory({ name: data.name, description: data.description || undefined });
      }
      
      // Reset form
      setCategoryName('');
      setCategoryDescription('');
      setIsFormVisible(false);
    },
    onError: (error) => {
      console.error('Create mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive"
      });
    }
  });
  
  const handleToggleForm = () => {
    setIsFormVisible(!isFormVisible);
    if (!isFormVisible) {
      // Reset form when opening
      setCategoryName('');
      setCategoryDescription('');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }
    
    const newCategory = {
      name: categoryName.trim(),
      description: categoryDescription.trim() || undefined
    };
    
    createMutation.mutate(newCategory);
  };
  
  return (
    <div className={className}>
      {!isFormVisible ? (
        <Button 
          onClick={handleToggleForm}
          variant={buttonVariant}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Category
        </Button>
      ) : (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
            <CardDescription>
              Create a new category for organizing content
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="categoryName" className="text-sm font-medium">
                  Category Name*
                </label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Mathematics, Biology, etc."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="categoryDescription" className="text-sm font-medium">
                  Description (Optional)
                </label>
                <Textarea
                  id="categoryDescription"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Briefly describe this category"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleToggleForm}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || !categoryName.trim()}
              >
                {createMutation.isPending ? 'Adding...' : 'Add Category'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
};

export default CategoryAdder;
