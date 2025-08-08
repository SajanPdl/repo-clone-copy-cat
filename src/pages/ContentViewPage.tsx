
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GlobalHeader from '@/components/GlobalHeader';
import Footer from '@/components/Footer';
import StudyMaterialView from '@/components/StudyMaterialView';
import { fetchStudyMaterialById, fetchPastPaperById } from '@/utils/queryUtils';
import { StudyMaterial, PastPaper } from '@/utils/queryUtils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContentViewPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<StudyMaterial | PastPaper | null>(null);
  const [contentType, setContentType] = useState<'study-material' | 'past-paper' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!slug) {
        setError("Content not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Import supabase client for slug-based queries
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Try to extract ID from slug format "title-id"
        const parts = slug.split('-');
        const id = parts[parts.length - 1];
        let contentId = null;
        
        if (id && !isNaN(parseInt(id))) {
          contentId = parseInt(id);
        }

        // First, try to fetch by ID if available
        if (contentId) {
          try {
            const studyMaterial = await fetchStudyMaterialById(contentId);
            setContent(studyMaterial);
            setContentType('study-material');
            setLoading(false);
            return;
          } catch {}
          
          try {
            const pastPaper = await fetchPastPaperById(contentId);
            setContent(pastPaper);
            setContentType('past-paper');
            setLoading(false);
            return;
          } catch {}
        }

        // Fallback: fetch by slug/title
        const titleSlug = slug.replace(/-/g, ' ');
        
        // Try to find in study materials by title
        const { data: studyMaterials } = await supabase
          .from('study_materials')
          .select('*')
          .ilike('title', `%${titleSlug}%`)
          .limit(1);
          
        if (studyMaterials && studyMaterials.length > 0) {
          setContent(studyMaterials[0]);
          setContentType('study-material');
          setLoading(false);
          return;
        }
        
        // Try to find in past papers by title
        const { data: pastPapers } = await supabase
          .from('past_papers')
          .select('*')
          .ilike('title', `%${titleSlug}%`)
          .limit(1);
          
        if (pastPapers && pastPapers.length > 0) {
          setContent(pastPapers[0]);
          setContentType('past-paper');
          setLoading(false);
          return;
        }
        
        // If still not found, try a more flexible search
        const flexibleTitle = titleSlug.replace(/\s+/g, '%');
        
        const { data: flexibleStudy } = await supabase
          .from('study_materials')
          .select('*')
          .ilike('title', `%${flexibleTitle}%`)
          .limit(1);
          
        if (flexibleStudy && flexibleStudy.length > 0) {
          setContent(flexibleStudy[0]);
          setContentType('study-material');
          setLoading(false);
          return;
        }
        
        const { data: flexiblePast } = await supabase
          .from('past_papers')
          .select('*')
          .ilike('title', `%${flexibleTitle}%`)
          .limit(1);
          
        if (flexiblePast && flexiblePast.length > 0) {
          setContent(flexiblePast[0]);
          setContentType('past-paper');
          setLoading(false);
          return;
        }

        // If nothing found
        setError("Content not found");
      } catch (err) {
        console.error("Error loading content:", err);
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [slug]);

  const createSlug = (title: string, id: number) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + id;
  };

  const handleBack = () => {
    if (contentType === 'study-material') {
      navigate('/study-materials');
    } else if (contentType === 'past-paper') {
      navigate('/past-papers');
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <GlobalHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex flex-col">
        <GlobalHeader />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Content Not Found</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{error || "The content you're looking for doesn't exist or has been removed."}</p>
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to {contentType === 'study-material' ? 'Study Materials' : contentType === 'past-paper' ? 'Past Papers' : 'Home'}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <GlobalHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to {contentType === 'study-material' ? 'Study Materials' : 'Past Papers'}
          </Button>
        </div>
        
        <StudyMaterialView 
          material={content}
          type={contentType === 'past-paper' ? 'past_paper' : 'study_material'}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ContentViewPage;
