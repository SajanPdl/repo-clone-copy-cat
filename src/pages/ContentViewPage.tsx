import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GlobalHeader from '@/components/GlobalHeader';
import Footer from '@/components/Footer';
import StudyMaterialView from '@/components/StudyMaterialView';
import { fetchStudyMaterialBySlug } from '@/utils/queryUtils';
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
        const studyMaterial = await fetchStudyMaterialBySlug(slug);
        if (studyMaterial) {
          setContent(studyMaterial);
          setContentType('study-material');
        } else {
          setError("Content not found");
        }
      } catch (err) {
        setError("Content not found");
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [slug]);



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
