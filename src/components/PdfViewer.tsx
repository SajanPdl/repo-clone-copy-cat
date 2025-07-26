
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Printer, Share, Heart, Eye, RotateCw, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { incrementDownloads } from '@/utils/studyMaterialsUtils';
import { AdPlacement } from '@/components/ads/AdPlacement';

interface PdfViewerProps {
  fileUrl: string;
  title?: string;
  height?: number;
  materialId?: number;
  materialType?: 'study_material' | 'past_paper';
}

const PdfViewer = ({ fileUrl, title, height = 600, materialId, materialType = 'study_material' }: PdfViewerProps) => {
  const [scale, setScale] = useState<number>(1.0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
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

  useEffect(() => {
    // Simulate PDF loading and page detection
    if (fileUrl) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setTotalPages(Math.floor(Math.random() * 20) + 1); // Simulate random page count
      }, 1000);
    }
  }, [fileUrl]);

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
  const rotate = () => setRotation(prev => (prev + 90) % 360);
  const resetView = () => {
    setScale(1.0);
    setRotation(0);
  };

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

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

  const handlePrint = () => {
    if (fileUrl) {
      const printWindow = window.open(fileUrl);
      printWindow?.addEventListener('load', () => {
        printWindow.print();
      });
    }
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden" style={{ height: height ? `${height}px` : 'auto' }}>
      {/* PDF Viewer Header */}
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate max-w-md">
          {title || 'Document Viewer'}
        </h2>
        
        <div className="flex items-center gap-2">
          {/* Page Navigation */}
          <div className="flex items-center gap-2 mr-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={prevPage}
                    disabled={currentPage <= 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous Page</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[4rem] text-center">
              {currentPage} / {totalPages}
            </span>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={nextPage}
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next Page</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Zoom Controls */}
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

          {/* Rotate */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={rotate}
                  className="h-8 w-8"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rotate</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Fullscreen */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="h-8 w-8"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</TooltipContent>
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
                  onClick={handlePrint}
                  className="h-8 w-8"
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Print</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
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
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 relative">
        {/* Ad Placement - Top */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <AdPlacement position="pdf_viewer_top" />
        </div>

        {fileUrl ? (
          <div className="flex justify-center p-4">
            <iframe
              src={fileUrl}
              title={title || 'PDF Document'}
              className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
              style={{ 
                width: `${Math.min(100 * scale, 300)}%`,
                height: `${Math.min(height * scale, height * 2)}px`,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError('Failed to load PDF. The file may have been moved, edited, or deleted.');
                setIsLoading(false);
              }}
            />
          </div>
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
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 bg-opacity-75">
            <div className="text-center">
              <Skeleton className="h-[400px] w-[300px] mx-auto rounded-md mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Loading PDF...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-10">
              <p className="text-red-500 mb-4">{error}</p>
              <div className="space-x-2">
                <Button onClick={handleDownload} variant="outline">
                  Try Download
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Ad Placement - Bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <AdPlacement position="pdf_viewer_bottom" />
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
