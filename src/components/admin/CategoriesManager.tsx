
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import CategoryAdder from './CategoryAdder';

interface Category {
  id: number;
  name: string;
  description: string;
  count: number;
}

const CategoriesManager = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Mathematics', description: 'Math resources including algebra, calculus, and geometry', count: 45 },
    { id: 2, name: 'Science', description: 'Science materials covering physics, chemistry, and biology', count: 38 },
    { id: 3, name: 'Computer Science', description: 'Programming, algorithms, and computer fundamentals', count: 27 },
    { id: 4, name: 'History', description: 'Historical events, civilizations, and timelines', count: 19 }
  ]);
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const handleAddCategory = (newCategory: {name: string, description?: string}) => {
    const id = Math.max(0, ...categories.map(c => c.id)) + 1;
    setCategories([...categories, { 
      ...newCategory, 
      id, 
      count: 0,
      description: newCategory.description || ''
    }]);
    toast.success('Category added successfully');
  };
  
  const handleUpdateCategory = () => {
    if (!editingCategory || !editingCategory.name) {
      toast.error('Category name is required');
      return;
    }
    
    setCategories(categories.map(c => c.id === editingCategory.id ? editingCategory : c));
    setEditingCategory(null);
    toast.success('Category updated successfully');
  };
  
  const handleDeleteCategory = (id: number) => {
    setCategories(categories.filter(c => c.id !== id));
    toast.success('Category deleted successfully');
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            <span>Category Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryAdder 
            onAddCategory={handleAddCategory}
            className="mb-6" 
          />
          
          <div className="rounded-md border mt-8">
            <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
              <div className="col-span-4">Name</div>
              <div className="col-span-5">Description</div>
              <div className="col-span-1 text-center">Count</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            <div className="divide-y">
              {categories.map((category) => (
                <div key={category.id} className="grid grid-cols-12 px-4 py-3 items-center">
                  <div className="col-span-4 font-medium">
                    {editingCategory?.id === category.id ? (
                      <Input
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      />
                    ) : (
                      category.name
                    )}
                  </div>
                  <div className="col-span-5 text-gray-600 dark:text-gray-400">
                    {editingCategory?.id === category.id ? (
                      <Input
                        value={editingCategory.description}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                      />
                    ) : (
                      category.description
                    )}
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                      {category.count}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end space-x-2">
                    {editingCategory?.id === category.id ? (
                      <Button size="sm" onClick={handleUpdateCategory}>
                        Save
                      </Button>
                    ) : (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => setEditingCategory(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesManager;
