import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GlobalHeader from '@/components/GlobalHeader';
import Footer from '@/components/Footer';
import StudyMaterialView from '@/components/StudyMaterialView';
import { fetchStudyMaterialBySlug } from '@/utils/queryUtils';
import { StudyMaterial, PastPaper } from '@/utils/queryUtils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const ContentViewPage = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<StudyMaterial | PastPaper | null>(null);
  const [contentType, setContentType] = useState<'study-material' | 'past-paper' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!type || !id) {
        setError("Content not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        if (type === 'study-material') {
          // Fetch study material by ID
          const { data, error: fetchError } = await supabase
            .from('study_materials')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError || !data) {
            setError("Study material not found");
            return;
          }

          setContent(data as StudyMaterial);
          setContentType('study-material');
        } else if (type === 'past-paper') {
          // Fetch past paper by ID
          const { data, error: fetchError } = await supabase
            .from('past_papers')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError || !data) {
            setError("Past paper not found");
            return;
          }

          setContent(data as PastPaper);
          setContentType('past-paper');
        } else {
          setError("Invalid content type");
        }
      } catch (err) {
        console.error('Error loading content:', err);
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [type, id]);

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
        
        {contentType === 'study-material' && (
          <StudyMaterialView material={content as StudyMaterial} />
        )}
        
        {contentType === 'past-paper' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">{(content as PastPaper).title}</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 mb-4">
                <strong>Subject:</strong> {(content as PastPaper).subject} | 
                <strong> Grade:</strong> {(content as PastPaper).grade} | 
                <strong> Year:</strong> {(content as PastPaper).year} | 
                <strong> Board:</strong> {(content as PastPaper).board}
              </p>
              <p className="text-gray-800">{(content as PastPaper).description}</p>
              {/* Add more past paper content display here */}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ContentViewPage;
