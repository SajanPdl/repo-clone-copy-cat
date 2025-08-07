
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import GlobalHeader from '@/components/GlobalHeader';
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
      let query = supabase.from('study_materials').select('*');

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
      <GlobalHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Study Materials</h1>
          <p className="text-xl text-gray-600">
            Explore our comprehensive collection of study resources
          </p>
        </div>

        <AdPlacement id="study-materials-top" />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <MaterialsFilter 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            
            <AdPlacement id="study-materials-sidebar" />
          </div>
          
          <div className="lg:w-3/4">
            <StudyMaterials 
              materials={materials}
              loading={loading}
              showViewAll={false}
            />
          </div>
        </div>
        
        <AdPlacement id="study-materials-bottom" />
      </div>
      
      <Footer />
    </div>
  );
};

export default StudyMaterialsPage;
