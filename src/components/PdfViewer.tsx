
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Printer, Share, Heart, Eye, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { incrementDownloads } from '@/utils/studyMaterialsUtils';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  fileUrl: string;
  title?: string;
  height?: number;
  materialId?: number;
  materialType?: 'study_material' | 'past_paper';
}

const PdfViewer = ({ fileUrl, title, height = 600, materialId, materialType = 'study_material' }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasTrackedView, setHasTrackedView] = useState<boolean>(false);

  const { user } = useAuth();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { toast } = useToast();

  const materialIdStr = materialId?.toString() || '';
  const isCurrentlyBookmarked = isBookmarked(materialType, materialIdStr);

  // Track view on component mount
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

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const changePage = (offset: number) => {
    if (numPages) {
      const newPage = pageNumber + offset;
      if (newPage >= 1 && newPage <= numPages) {
        setPageNumber(newPage);
      }
    }
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);
  
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownload = async () => {
    if (materialId) {
      // Track download
      await incrementDownloads(materialId);
      
      // Add student activity if user is logged in
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
      
      // Add student activity for bookmarking
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
        // Fallback - copy to clipboard
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
                  onClick={() => window.print()}
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
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-4 flex flex-col items-center">
        {isLoading && (
          <div className="w-full max-w-2xl mx-auto">
            <Skeleton className="h-[600px] w-full rounded-md" />
          </div>
        )}
        
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<Skeleton className="h-[600px] w-full max-w-2xl mx-auto rounded-md" />}
          error={
            <div className="text-center p-10">
              <p className="text-red-500 mb-4">Failed to load PDF document</p>
              <Button onClick={handleDownload}>
                Download Instead
              </Button>
            </div>
          }
          className="w-full flex justify-center"
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            rotate={rotation}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg border border-gray-200 dark:border-gray-700"
            loading={<Skeleton className="h-[600px] w-[450px] rounded-md" />}
          />
        </Document>
      </div>
      
      {/* PDF Viewer Footer */}
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          size="sm"
          onClick={previousPage}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {pageNumber} of {numPages || '?'}
          </p>
          {materialId && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="h-3 w-3" />
              <span>Viewing</span>
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={nextPage}
          disabled={!numPages || pageNumber >= numPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default PdfViewer;
