
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, RotateCw, Search, Bookmark, Share2, Fullscreen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import AdPlacement from '@/components/ads/AdPlacement';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  fileUrl: string;
  title: string;
}

const PdfViewer = ({ fileUrl, title }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showOutline, setShowOutline] = useState<boolean>(false);
  const { toast } = useToast();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    toast({
      title: "Error",
      description: "Failed to load PDF file",
      variant: "destructive"
    });
  };

  const handlePageChange = (newPageNumber: number) => {
    if (newPageNumber >= 1 && newPageNumber <= numPages) {
      setPageNumber(newPageNumber);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      toast({
        title: "Search",
        description: `Searching for "${searchTerm}"...`,
      });
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Bookmark Removed" : "Bookmark Added",
      description: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "PDF link copied to clipboard",
      });
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "PDF download has started",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePageChange(pageNumber - 1);
    if (e.key === 'ArrowRight') handlePageChange(pageNumber + 1);
    if (e.key === '+') handleZoomIn();
    if (e.key === '-') handleZoomOut();
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Header with controls */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h2>
          
          <div className="flex items-center space-x-2 flex-wrap">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search in PDF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-40"
              />
            </div>
            
            {/* Zoom controls */}
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            {/* Rotate */}
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
            
            {/* Fullscreen */}
            <Button variant="outline" size="sm" onClick={handleFullscreen}>
              <Fullscreen className="h-4 w-4" />
            </Button>
            
            {/* Actions */}
            <Button variant="outline" size="sm" onClick={handleBookmark}>
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current text-yellow-500' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main PDF viewer */}
        <div className="flex-1 flex flex-col">
          {/* Navigation */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pageNumber - 1)}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm">Page</span>
                <Input
                  type="number"
                  value={pageNumber}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= numPages) {
                      handlePageChange(page);
                    }
                  }}
                  className="w-16 text-center"
                />
                <span className="text-sm">of {numPages}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pageNumber + 1)}
                disabled={pageNumber >= numPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Ad placement above PDF */}
          <AdPlacement position="content" className="p-4 bg-gray-50" />

          {/* PDF Document */}
          <div className="flex-1 p-6 bg-gray-100 dark:bg-gray-800 overflow-auto">
            <div className="flex justify-center">
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading PDF...</span>
                  </div>
                }
                error={
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="text-red-500 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load PDF</h3>
                    <p className="text-gray-600">The file could not be loaded. Please try again later.</p>
                    <Button className="mt-4" onClick={() => window.location.reload()}>
                      Retry
                    </Button>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            </div>
          </div>

          {/* Ad placement below PDF */}
          <AdPlacement position="footer" className="p-4 bg-gray-50" />
        </div>

        {/* Sidebar for bookmarks/outline */}
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOutline(!showOutline)}
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={handleBookmark}>
              <Bookmark className="h-4 w-4 mr-2" />
              {isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share PDF
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={handleFullscreen}>
              <Fullscreen className="h-4 w-4 mr-2" />
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
          </div>

          {/* Page thumbnails or outline */}
          {showOutline && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Pages</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {Array.from({ length: numPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-full text-left px-2 py-1 text-sm rounded ${
                      pageNumber === i + 1 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Page {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ad placement in sidebar */}
          <div className="mt-6">
            <AdPlacement position="sidebar" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
