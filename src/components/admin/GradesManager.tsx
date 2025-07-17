
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

interface Grade {
  id: number;
  name: string;
  ageRange: string;
  count: number;
}

const GradesManager = () => {
  const [grades, setGrades] = useState<Grade[]>([
    { id: 1, name: 'Grade 7', ageRange: '12-13 years', count: 28 },
    { id: 2, name: 'Grade 8', ageRange: '13-14 years', count: 35 },
    { id: 3, name: 'Grade 9', ageRange: '14-15 years', count: 42 },
    { id: 4, name: 'Grade 10', ageRange: '15-16 years', count: 38 },
    { id: 5, name: 'Grade 11', ageRange: '16-17 years', count: 31 },
    { id: 6, name: 'Grade 12', ageRange: '17-18 years', count: 27 },
    { id: 7, name: 'Bachelor\'s', ageRange: '18+ years', count: 45 },
    { id: 8, name: 'Engineering', ageRange: '18+ years', count: 39 }
  ]);
  
  const [newGrade, setNewGrade] = useState({ name: '', ageRange: '' });
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  
  const handleAddGrade = () => {
    if (!newGrade.name) {
      toast.error('Grade name is required');
      return;
    }
    
    const id = Math.max(0, ...grades.map(g => g.id)) + 1;
    setGrades([...grades, { ...newGrade, id, count: 0 }]);
    setNewGrade({ name: '', ageRange: '' });
    toast.success('Grade added successfully');
  };
  
  const handleUpdateGrade = () => {
    if (!editingGrade || !editingGrade.name) {
      toast.error('Grade name is required');
      return;
    }
    
    setGrades(grades.map(g => g.id === editingGrade.id ? editingGrade : g));
    setEditingGrade(null);
    toast.success('Grade updated successfully');
  };
  
  const handleDeleteGrade = (id: number) => {
    setGrades(grades.filter(g => g.id !== id));
    toast.success('Grade deleted successfully');
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
              <label className="block text-sm font-medium mb-1" htmlFor="age-range">
                Age Range
              </label>
              <Input
                id="age-range"
                value={newGrade.ageRange}
                onChange={(e) => setNewGrade({ ...newGrade, ageRange: e.target.value })}
                placeholder="e.g., 15-16 years, 18+ years"
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
          <div className="rounded-md border">
            <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
              <div className="col-span-5">Grade/Level</div>
              <div className="col-span-4">Age Range</div>
              <div className="col-span-1 text-center">Resources</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            <div className="divide-y">
              {grades.map((grade) => (
                <div key={grade.id} className="grid grid-cols-12 px-4 py-3 items-center">
                  <div className="col-span-5 font-medium">
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
                        value={editingGrade.ageRange}
                        onChange={(e) => setEditingGrade({ ...editingGrade, ageRange: e.target.value })}
                      />
                    ) : (
                      grade.ageRange
                    )}
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                      {grade.count}
                    </span>
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
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradesManager;
