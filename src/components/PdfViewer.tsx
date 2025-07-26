
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, RotateCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AdPlacement from '@/components/ads/AdPlacement';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  fileUrl: string;
  title?: string;
  height?: number;
  materialId?: number;
  materialType?: 'study_material' | 'past_paper';
}

const PdfViewer: React.FC<PdfViewerProps> = ({ 
  fileUrl, 
  title, 
  height = 600,
  materialId,
  materialType 
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
    toast({
      title: "Error",
      description: "Failed to load PDF file",
      variant: "destructive"
    });
  };

  const goToPrevPage = () => {
    setPageNumber(page => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setPageNumber(page => Math.min(numPages, page + 1));
  };

  const zoomIn = () => {
    setScale(scale => Math.min(3.0, scale + 0.2));
  };

  const zoomOut = () => {
    setScale(scale => Math.max(0.5, scale - 0.2));
  };

  const rotate = () => {
    setRotation(rotation => (rotation + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = title || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  return (
    <div className="pdf-viewer-container bg-white rounded-lg shadow-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-gray-50 border-b gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={pageNumber}
              onChange={(e) => goToPage(parseInt(e.target.value))}
              className="w-16 text-center"
              min={1}
              max={numPages}
            />
            <span className="text-sm text-gray-600">of {numPages}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={rotate}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search in document..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-48"
          />
        </div>
      </div>

      {/* Ad Placement */}
      <div className="p-2 bg-gray-100 border-b">
        <AdPlacement placement="pdf-viewer-top" />
      </div>

      {/* PDF Content */}
      <div 
        className="pdf-content overflow-auto bg-gray-100 flex justify-center p-4"
        style={{ height: `${height}px` }}
      >
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
        
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          }
          className="shadow-lg"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="border border-gray-300"
          />
        </Document>
      </div>

      {/* Bottom Ad Placement */}
      <div className="p-2 bg-gray-100 border-t">
        <AdPlacement placement="pdf-viewer-bottom" />
      </div>

      {/* Page Info */}
      <div className="p-2 text-center text-sm text-gray-600 bg-gray-50 border-t">
        {title && <span className="font-medium">{title}</span>}
        {title && <span className="mx-2">•</span>}
        <span>Page {pageNumber} of {numPages}</span>
      </div>
    </div>
  );
};

export default PdfViewer;
