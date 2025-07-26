
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PastPaper } from '@/utils/queryUtils';
import { Download, Calendar, GraduationCap, BookOpen, ArrowLeft, Star } from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import Footer from '@/components/Footer';
import PdfViewer from '@/components/PdfViewer';

const PastPaperViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paper, setPaper] = useState<PastPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (id) {
      fetchPaper();
      incrementViews();
    }
  }, [id]);

  const fetchPaper = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('past_papers')
        .select('*')
        .eq('id', parseInt(id!))
        .single();

      if (error) throw error;
      setPaper(data);
      setRating(Math.round(data.rating || 0));
    } catch (error) {
      console.error('Error fetching paper:', error);
      toast({
        title: "Error",
        description: "Failed to load past paper",
        variant: "destructive"
      });
      navigate('/past-papers');
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      await supabase.rpc('increment_material_views', {
        material_id: parseInt(id!),
        table_name: 'past_papers'
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const handleDownload = async () => {
    if (!paper?.file_url) return;

    try {
      // Increment download count
      await supabase.rpc('increment_download_count', {
        material_id: paper.id,
        table_name: 'past_papers'
      });

      // Open file in new tab
      window.open(paper.file_url, '_blank');
      
      toast({
        title: "Download started",
        description: "The past paper is opening in a new tab"
      });
    } catch (error) {
      console.error('Error downloading paper:', error);
      toast({
        title: "Error",
        description: "Failed to download paper",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <GlobalHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen flex flex-col">
        <GlobalHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Past Paper Not Found</h2>
            <Button onClick={() => navigate('/past-papers')}>
              Back to Past Papers
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <GlobalHeader />
      
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/past-papers')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Past Papers
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Paper Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{paper.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {paper.subject}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {paper.grade}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {paper.year}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Board:</strong> {paper.board}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Downloads:</strong> {paper.downloads || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Views:</strong> {paper.views || 0}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      ({paper.rating?.toFixed(1) || '0.0'})
                    </span>
                  </div>

                  {paper.tags && paper.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {paper.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleDownload}
                    className="w-full flex items-center gap-2"
                    disabled={!paper.file_url}
                  >
                    <Download className="h-4 w-4" />
                    Download Paper
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* PDF Viewer */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Paper Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {paper.file_url ? (
                    <PdfViewer 
                      fileUrl={paper.file_url}
                      height="600px"
                      materialId={paper.id.toString()}
                      materialType="past_paper"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-500">No file available for preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PastPaperViewPage;
