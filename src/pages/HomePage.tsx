
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import StudyMaterials from '@/components/StudyMaterials';
import PastPapers from '@/components/PastPapers';
import BlogSection from '@/components/BlogSection';
import ContactSection from '@/components/ContactSection';
import MerchSection from '@/components/MerchSection';
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

interface PastPaper {
  id: number;
  title: string;
  subject: string;
  grade: string;
  year: number;
  board?: string;
  file_url?: string;
  downloads: number;
  views: number;
  rating: number;
  created_at: string;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [pastPapers, setPastPapers] = useState<PastPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomePageData();
  }, []);

  const fetchHomePageData = async () => {
    try {
      // Fetch featured study materials
      const { data: materials, error: materialsError } = await supabase
        .from('study_materials')
        .select('*')
        .eq('approval_status', 'approved')
        .order('downloads', { ascending: false })
        .limit(6);

      if (materialsError) throw materialsError;

      // Fetch featured past papers
      const { data: papers, error: papersError } = await supabase
        .from('past_papers')
        .select('*')
        .order('downloads', { ascending: false })
        .limit(6);

      if (papersError) throw papersError;

      setStudyMaterials(materials || []);
      setPastPapers(papers || []);
    } catch (error) {
      console.error('Error fetching homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <Hero />
      
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Featured Study Materials
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Access high-quality study resources from top contributors
            </p>
          </div>
          
          <StudyMaterials />
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Past Papers
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Practice with previous years' examination papers
            </p>
          </div>
          
          <PastPapers />
        </div>
      </section>

      <MerchSection />
      
      <BlogSection />
      
      <ContactSection />
      
      <Footer />
    </div>
  );
};

export default HomePage;
