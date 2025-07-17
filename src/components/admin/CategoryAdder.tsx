
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

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
  const [isFormVisible, setIsFormVisible] = useState(showForm);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleToggleForm = () => {
    setIsFormVisible(!isFormVisible);
    if (!isFormVisible) {
      // Reset form when opening
      setCategoryName('');
      setCategoryDescription('');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Create the new category
    const newCategory = {
      name: categoryName.trim(),
      description: categoryDescription.trim() || undefined
    };
    
    // Call the onAddCategory callback if provided
    if (onAddCategory) {
      onAddCategory(newCategory);
    }
    
    // Show success toast
    toast({
      title: "Category Added",
      description: `${categoryName} has been added successfully.`
    });
    
    // Reset form
    setCategoryName('');
    setCategoryDescription('');
    setIsSubmitting(false);
    
    // Optionally close the form after submission
    setIsFormVisible(false);
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
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !categoryName.trim()}
              >
                {isSubmitting ? 'Adding...' : 'Add Category'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
};

export default CategoryAdder;
