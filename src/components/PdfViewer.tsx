
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Printer, Share, Heart, Eye, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { incrementDownloads } from '@/utils/studyMaterialsUtils';

interface PdfViewerProps {
  fileUrl: string;
  title?: string;
  height?: number;
  materialId?: number;
  materialType?: 'study_material' | 'past_paper';
}

const PdfViewer = ({ fileUrl, title, height = 600, materialId, materialType = 'study_material' }: PdfViewerProps) => {
  const [scale, setScale] = useState<number>(1.0);
  const [hasTrackedView, setHasTrackedView] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { toast } = useToast();

  const materialIdStr = materialId?.toString() || '';
  const isCurrentlyBookmarked = isBookmarked(materialType, materialIdStr);

  useEffect(() => {
    if (materialId && !hasTrackedView) {
      trackView();
      setHasTrackedView(true);
    }
  }, [materialId, hasTrackedView]);

  const trackView = async () => {
    if (!materialId) return;

    try {
      await supabase.rpc('increment_material_views', {
        material_id: materialId,
        table_name: materialType === 'study_material' ? 'study_materials' : 'past_papers'
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  const handleDownload = async () => {
    if (materialId) {
      await incrementDownloads(materialId);
      
      if (user) {
        try {
          await supabase.rpc('add_student_activity', {
            p_user_id: user.id,
            p_activity_type: 'download',
            p_points: 2,
            p_description: `Downloaded: ${title || 'Document'}`
          });
        } catch (error) {
          console.error('Error tracking download activity:', error);
        }
      }
    }

    toast({
      title: "Download Started",
      description: `${title || 'Document'} is being downloaded.`,
    });
    
    window.open(fileUrl, '_blank');
  };

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to bookmark materials',
        variant: 'destructive'
      });
      return;
    }

    if (!materialId) return;

    if (isCurrentlyBookmarked) {
      await removeBookmark(materialType, materialIdStr);
    } else {
      await addBookmark(materialType, materialIdStr);
      
      try {
        await supabase.rpc('add_student_activity', {
          p_user_id: user.id,
          p_activity_type: 'bookmark',
          p_points: 1,
          p_description: `Bookmarked: ${title || 'Document'}`
        });
      } catch (error) {
        console.error('Error tracking bookmark activity:', error);
      }
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: title || 'Study Material',
      text: `Check out this study material: ${title}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link Copied',
          description: 'Material link copied to clipboard'
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: 'Error',
        description: 'Failed to share material',
        variant: 'destructive'
      });
    }
  };

  // Simple iframe-based PDF viewer
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden" style={{ height: height ? `${height}px` : 'auto' }}>
      {/* PDF Viewer Header */}
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate max-w-md">
          {title || 'Document Viewer'}
        </h2>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={zoomOut}
                  disabled={scale <= 0.5}
                  className="h-8 w-8"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[4rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={zoomIn}
                  disabled={scale >= 3.0}
                  className="h-8 w-8"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {user && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isCurrentlyBookmarked ? "default" : "outline"}
                    size="icon"
                    onClick={handleBookmark}
                    className={`h-8 w-8 ${isCurrentlyBookmarked ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  >
                    <Heart className={`h-4 w-4 ${isCurrentlyBookmarked ? 'fill-current text-white' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isCurrentlyBookmarked ? 'Remove Bookmark' : 'Bookmark'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDownload}
                  className="h-8 w-8"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  className="h-8 w-8"
                >
                  <Share className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* PDF Viewer Content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        {fileUrl ? (
          <iframe
            src={fileUrl}
            title={title || 'PDF Document'}
            className="w-full h-full border-0"
            style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError('Failed to load PDF');
              setIsLoading(false);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-10">
              <p className="text-red-500 mb-4">No PDF file available</p>
              <Button onClick={handleDownload}>
                Download Instead
              </Button>
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Skeleton className="h-[600px] w-full max-w-2xl mx-auto rounded-md" />
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-10">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={handleDownload}>
                Download Instead
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
