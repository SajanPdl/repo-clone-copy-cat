
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSecureAuth as useAuth } from '@/hooks/useSecureAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { incrementDownloads } from '@/utils/studyMaterialsUtils';
import { addStudentActivity } from '@/utils/studentDashboardUtils';
import GlobalHeader from '@/components/GlobalHeader';
import Footer from '@/components/Footer';
import {
  Download,
  Eye,
  Share2,
  BookmarkPlus,
  ArrowLeft,
  Calendar,
  GraduationCap,
  FileText,
  User
} from 'lucide-react';

interface PastPaper {
  id: number;
  title: string;
  subject: string;
  grade: string;
  board: string;
  year: number;
  file_url: string;
  downloads: number;
  views: number;
  rating: number;
  author_id?: string;
  tags?: string[];
  created_at: string;
}

const PastPaperViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [paper, setPaper] = useState<PastPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPaper();
    }
  }, [id]);

  const fetchPaper = async () => {
    if (!id) return;

    try {
      const paperId = parseInt(id, 10);
      if (isNaN(paperId)) {
        toast({
          title: 'Error',
          description: 'Invalid paper ID',
          variant: 'destructive'
        });
        navigate('/past-papers');
        return;
      }

      const { data, error } = await supabase
        .from('past_papers')
        .select('*')
        .eq('id', paperId)
        .single();

      if (error) {
        console.error('Error fetching paper:', error);
        toast({
          title: 'Error',
          description: 'Failed to load past paper',
          variant: 'destructive'
        });
        navigate('/past-papers');
        return;
      }

      setPaper(data);
      
      // Increment view count
      await supabase.rpc('increment_material_views', {
        material_id: paperId,
        table_name: 'past_papers'
      });
    } catch (error) {
      console.error('Error fetching paper:', error);
      toast({
        title: 'Error',
        description: 'Failed to load past paper',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!paper || !paper.file_url) return;

    setDownloading(true);
    try {
      // Create download link
      const link = document.createElement('a');
      link.href = paper.file_url;
      link.download = `${paper.title}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Increment download count
      await incrementDownloads(paper.id);
      
      // Add activity if user is logged in
      if (user) {
        await addStudentActivity(user.id, 'download', 5, `Downloaded past paper: ${paper.title}`);
      }

      toast({
        title: 'Download Started',
        description: 'Past paper download has started'
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download the past paper',
        variant: 'destructive'
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share && paper) {
      navigator.share({
        title: paper.title,
        text: `Check out this past paper: ${paper.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Past paper link copied to clipboard'
      });
    }
  };

  const handleBookmark = async () => {
    if (!user || !paper) {
      toast({
        title: 'Login Required',
        description: 'Please login to bookmark papers',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          content_type: 'past_paper',
          content_id: paper.id.toString()
        });

      if (error) throw error;

      await addStudentActivity(user.id, 'bookmark', 1, `Bookmarked past paper: ${paper.title}`);

      toast({
        title: 'Bookmarked',
        description: 'Past paper added to your saved collection'
      });
    } catch (error) {
      console.error('Bookmark error:', error);
      toast({
        title: 'Error',
        description: 'Failed to bookmark paper',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GlobalHeader />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GlobalHeader />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Past Paper Not Found</h2>
            <p className="text-gray-600 mb-6">The past paper you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/past-papers')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Past Papers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/past-papers')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Past Papers
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{paper.title}</h1>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {paper.grade}
                      </Badge>
                      <Badge variant="outline">
                        <FileText className="h-3 w-3 mr-1" />
                        {paper.subject}
                      </Badge>
                      <Badge variant="outline">
                        {paper.board}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {paper.year}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Button onClick={handleDownload} disabled={downloading}>
                    <Download className="h-4 w-4 mr-2" />
                    {downloading ? 'Downloading...' : 'Download PDF'}
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" onClick={handleBookmark}>
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Bookmark
                  </Button>
                </div>

                {/* PDF Viewer */}
                {paper.file_url && (
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      src={`${paper.file_url}#toolbar=1`}
                      className="w-full h-[600px]"
                      title={`${paper.title} - PDF Viewer`}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Paper Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Paper Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Downloads</span>
                    <span className="font-medium">{paper.downloads || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium">{paper.views || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-medium">{paper.rating || 0}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {paper.tags && paper.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {paper.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PastPaperViewPage;
