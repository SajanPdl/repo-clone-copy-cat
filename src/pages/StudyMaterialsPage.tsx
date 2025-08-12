
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StudyMaterials from '@/components/StudyMaterials';
import MaterialsFilter from '@/components/study-materials/MaterialsFilter';
import AdPlacement from '@/components/ads/AdPlacement';
import { supabase } from '@/integrations/supabase/client';

interface StudyMaterial {
  id: number;
  title: string;
  subject: string;
  grade: string;
  category: string;
  file_url?: string;
  rating: number;
  downloads: number;
  views: number;
  created_at: string;
  tags?: string[];
}

const StudyMaterialsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    grade: searchParams.get('grade') || '',
    subject: searchParams.get('subject') || '',
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || ''
  });

  useEffect(() => {
    fetchMaterials();
  }, [filters]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {

      let query = supabase.from('study_materials').select('*').eq('approval_status', 'approved');

      // Apply filters
      if (filters.grade) {
        query = query.eq('grade', filters.grade);
      }
      if (filters.subject) {
        query = query.eq('subject', filters.subject);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error fetching study materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Study Materials</h1>
          <p className="text-xl text-gray-600">
            Explore our comprehensive collection of study resources
          </p>
        </div>

        <AdPlacement position="header" />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <MaterialsFilter
              options={{
                grades: ['All', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Undergraduate'],
                subjects: ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'English', 'Computer Science'],
                categories: ['All', 'Notes', 'Question Banks', 'Lab Manuals', 'Reference Books', 'Worksheets']
              }}
              searchTerm={filters.search}
              selectedGrade={filters.grade}
              selectedSubject={filters.subject}
              selectedCategory={filters.category}
              onSearch={val => setFilters(f => ({ ...f, search: val }))}
              onGradeChange={val => setFilters(f => ({ ...f, grade: val }))}
              onSubjectChange={val => setFilters(f => ({ ...f, subject: val }))}
              onCategoryChange={val => setFilters(f => ({ ...f, category: val }))}
            />
            
            <AdPlacement position="sidebar" />
          </div>
          
          <div className="lg:w-3/4">
          {/* StudyMaterials manages its own data, just render the component */}
          <StudyMaterials />
          </div>
        </div>
        
        <AdPlacement position="footer" />
      </div>
      
      <Footer />
    </div>
  );
};

export default StudyMaterialsPage;
