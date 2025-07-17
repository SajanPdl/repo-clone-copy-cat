
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Printer, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  fileUrl: string;
  title?: string;
  height?: number;
}

const PdfViewer = ({ fileUrl, title, height = 600 }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
  
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden" style={{ height: height ? `${height}px` : 'auto' }}>
      {/* PDF Viewer Header */}
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
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
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={zoomIn}
                  disabled={scale >= 2.0}
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
                  onClick={() => window.open(fileUrl, '_blank')}
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
                  onClick={() => navigator.share?.({
                    title: title || 'Shared Document',
                    url: window.location.href
                  }).catch(err => console.error('Error sharing:', err))}
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
              <Button onClick={() => window.open(fileUrl, '_blank')}>
                Download Instead
              </Button>
            </div>
          }
          className="w-full flex justify-center"
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg"
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
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Page {pageNumber} of {numPages || '?'}
        </p>
        
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
