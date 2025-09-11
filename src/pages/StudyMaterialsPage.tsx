
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import StudyMaterials from '@/components/StudyMaterials';
import AdPlacement from '@/components/ads/AdPlacement';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/layout/MainLayout';

const StudyMaterialsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Keep search params instance for potential deep-linking support in the future
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_sp, _setSp] = useSearchParams();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Materials</h1>
          <p className="text-gray-600">Explore our comprehensive collection of study resources</p>
        </div>

        <AdPlacement position="content" />

        <div className="flex flex-col gap-8">
          <StudyMaterials showHeader={false} />
        </div>
      </div>
    </MainLayout>
  );
};

export default StudyMaterialsPage;
