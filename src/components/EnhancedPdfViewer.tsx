import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  RotateCw, 
  Search, 
  Maximize2, 
  Minimize2,
  Moon,
  Sun,
  BookOpen,
  Highlighter,
  StickyNote,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  List,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface Annotation {
  id: string;
  type: 'highlight' | 'note';
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text?: string;
  timestamp: Date;
}

interface EnhancedPdfViewerProps {
  fileUrl: string;
  title?: string;
  height?: number;
  materialId?: number;
  materialType?: 'study_material' | 'past_paper';
  allowDownload?: boolean;
  showAnnotations?: boolean;
}

const EnhancedPdfViewer: React.FC<EnhancedPdfViewerProps> = ({ 
  fileUrl, 
  title, 
  height = 600,
  materialId,
  materialType,
  allowDownload = true,
  showAnnotations = true
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [showAnnotationsPanel, setShowAnnotationsPanel] = useState<boolean>(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState<boolean>(false);
  const [annotationType, setAnnotationType] = useState<'highlight' | 'note'>('highlight');
  const [annotationColor, setAnnotationColor] = useState<string>('#ffeb3b');
  const [viewMode, setViewMode] = useState<'single' | 'continuous'>('single');
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasActiveSubscription, isPremiumUser } = useSubscription();
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Check if user can download based on subscription
  const canDownload = allowDownload && (hasActiveSubscription() || isPremiumUser());

  // Color options for annotations
  const annotationColors = [
    '#ffeb3b', // Yellow
    '#ff9800', // Orange
    '#4caf50', // Green
    '#2196f3', // Blue
    '#9c27b0', // Purple
    '#f44336', // Red
  ];

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    // Preload first few pages for better performance
    const pagesToPreload = Math.min(3, numPages);
    for (let i = 1; i <= pagesToPreload; i++) {
      setLoadedPages(prev => new Set([...prev, i]));
    }
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

  const onPageLoadSuccess = (pageNumber: number) => {
    setLoadedPages(prev => new Set([...prev, pageNumber]));
  };

  const goToPrevPage = () => {
    setPageNumber(page => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setPageNumber(page => Math.min(numPages, page + 1));
  };

  const zoomIn = () => {
    setScale(scale => Math.min(5.0, scale + 0.25));
  };

  const zoomOut = () => {
    setScale(scale => Math.max(0.25, scale - 0.25));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const rotate = () => {
    setRotation(rotation => (rotation + 90) % 360);
  };

  const handleDownload = () => {
    if (!canDownload) {
      toast({
        title: "Premium Feature",
        description: "Downloading is only available for premium users",
        variant: "destructive"
      });
      return;
    }

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = title || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your document is being downloaded",
    });
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleThumbnails = () => {
    setShowThumbnails(!showThumbnails);
  };

  const toggleAnnotationsPanel = () => {
    setShowAnnotationsPanel(!showAnnotationsPanel);
  };

  const addAnnotation = useCallback((type: 'highlight' | 'note', color: string, text?: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add annotations",
        variant: "destructive"
      });
      return;
    }

    const newAnnotation: Annotation = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      page: pageNumber,
      x: Math.random() * 100, // Simplified positioning
      y: Math.random() * 100,
      width: type === 'highlight' ? 100 : 50,
      height: type === 'highlight' ? 20 : 50,
      color,
      text,
      timestamp: new Date()
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    setIsAddingAnnotation(false);
    
    toast({
      title: "Annotation Added",
      description: `${type === 'highlight' ? 'Highlight' : 'Note'} added to page ${pageNumber}`,
    });
  }, [user, pageNumber, toast]);

  const removeAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    toast({
      title: "Annotation Removed",
      description: "Annotation has been removed",
    });
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    // Implement PDF text search functionality here
    if (text) {
      toast({
        title: "Search",
        description: `Searching for "${text}" in document...`,
      });
    }
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        goToPrevPage();
        break;
      case 'ArrowRight':
        event.preventDefault();
        goToNextPage();
        break;
      case '+':
      case '=':
        event.preventDefault();
        zoomIn();
        break;
      case '-':
        event.preventDefault();
        zoomOut();
        break;
      case '0':
        event.preventDefault();
        resetZoom();
        break;
      case 'r':
        event.preventDefault();
        rotate();
        break;
      case 'f':
        event.preventDefault();
        toggleFullscreen();
        break;
      case 'd':
        event.preventDefault();
        toggleDarkMode();
        break;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Apply dark mode to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderThumbnails = () => {
    if (!showThumbnails) return null;

    return (
      <div className="fixed left-4 top-20 bottom-20 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-y-auto z-50">
        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pages</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowThumbnails(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="h-full">
          <div className="p-2 space-y-2">
            {Array.from({ length: numPages }, (_, i) => (
              <div
                key={i + 1}
                className={`cursor-pointer border-2 rounded ${
                  pageNumber === i + 1
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => goToPage(i + 1)}
              >
                <Document file={fileUrl}>
                  <Page
                    pageNumber={i + 1}
                    scale={0.2}
                    className="pointer-events-none"
                  />
                </Document>
                <div className="text-center text-xs py-1 bg-gray-50 dark:bg-gray-700">
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderAnnotationsPanel = () => {
    if (!showAnnotationsPanel) return null;

    return (
      <div className="fixed right-4 top-20 bottom-20 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-y-auto z-50">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Annotations</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnnotationsPanel(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          {annotations.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No annotations yet. Start highlighting and adding notes!
            </p>
          ) : (
            <div className="space-y-3">
              {annotations
                .filter(ann => ann.page === pageNumber)
                .map(annotation => (
                  <div
                    key={annotation.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {annotation.type === 'highlight' ? 'Highlight' : 'Note'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAnnotation(annotation.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {annotation.text && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {annotation.text}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: annotation.color }}
                      />
                      <span>Page {annotation.page}</span>
                      <span>•</span>
                      <span>{annotation.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
          
          {user && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setIsAddingAnnotation(true)}
                className="w-full"
                size="sm"
              >
                <StickyNote className="h-4 w-4 mr-2" />
                Add Annotation
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAnnotationModal = () => {
    if (!isAddingAnnotation) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
          <h3 className="text-lg font-semibold mb-4">Add Annotation</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <div className="flex gap-2">
                <Button
                  variant={annotationType === 'highlight' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAnnotationType('highlight')}
                >
                  <Highlighter className="h-4 w-4 mr-2" />
                  Highlight
                </Button>
                <Button
                  variant={annotationType === 'note' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAnnotationType('note')}
                >
                  <StickyNote className="h-4 w-4 mr-2" />
                  Note
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {annotationColors.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      annotationColor === color ? 'border-gray-800 dark:border-white' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setAnnotationColor(color)}
                  />
                ))}
              </div>
            </div>
            
            {annotationType === 'note' && (
              <div>
                <label className="block text-sm font-medium mb-2">Note Text</label>
                <Input
                  placeholder="Enter your note..."
                  onChange={(e) => setAnnotationType(e.target.value as any)}
                />
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button
              onClick={() => addAnnotation(annotationType, annotationColor)}
              className="flex-1"
            >
              Add
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddingAnnotation(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={`enhanced-pdf-viewer ${isDarkMode ? 'dark' : ''} ${
          isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : 'bg-white dark:bg-gray-800 rounded-lg shadow-lg'
        }`}
      >
        {/* Enhanced Toolbar */}
        <div className="flex flex-wrap items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 gap-4">
          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Previous page (←)</TooltipContent>
            </Tooltip>
            
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={pageNumber}
                onChange={(e) => goToPage(parseInt(e.target.value))}
                className="w-16 text-center"
                min={1}
                max={numPages}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">of {numPages}</span>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Next page (→)</TooltipContent>
            </Tooltip>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom out (-)</TooltipContent>
            </Tooltip>
            
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom in (+)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={resetZoom}>
                  Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset zoom (0)</TooltipContent>
            </Tooltip>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={rotate}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rotate (R)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={toggleThumbnails}>
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle thumbnails</TooltipContent>
            </Tooltip>
            
            {showAnnotations && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={toggleAnnotationsPanel}>
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Annotations</TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={toggleDarkMode}>
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle dark mode (D)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle fullscreen (F)</TooltipContent>
            </Tooltip>
            
            {canDownload && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download PDF</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Search */}
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search in document..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-48"
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
            <Button
              variant={viewMode === 'single' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('single')}
              className="rounded-r-none"
            >
              Single
            </Button>
            <Button
              variant={viewMode === 'continuous' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('continuous')}
              className="rounded-l-none"
            >
              Continuous
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div 
          ref={pdfContainerRef}
          className="pdf-content overflow-auto bg-gray-100 dark:bg-gray-900 flex justify-center p-4"
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
            {viewMode === 'single' ? (
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="border border-gray-300 dark:border-gray-600"
                onLoadSuccess={() => onPageLoadSuccess(pageNumber)}
              />
            ) : (
              // Continuous view - render multiple pages
              Array.from({ length: numPages }, (_, i) => (
                <Page
                  key={i + 1}
                  pageNumber={i + 1}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="border border-gray-300 dark:border-gray-600 mb-4"
                  onLoadSuccess={() => onPageLoadSuccess(i + 1)}
                />
              ))
            )}
          </Document>
        </div>

        {/* Page Info */}
        <div className="p-2 text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          {title && <span className="font-medium">{title}</span>}
          {title && <span className="mx-2">•</span>}
          <span>Page {pageNumber} of {numPages}</span>
          {!canDownload && (
            <>
              <span className="mx-2">•</span>
              <span className="text-orange-600 dark:text-orange-400">
                Premium users can download
              </span>
            </>
          )}
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="p-2 text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <span>Keyboard shortcuts: ← → (pages), +/- (zoom), R (rotate), F (fullscreen), D (dark mode)</span>
        </div>

        {/* Thumbnails Panel */}
        {renderThumbnails()}

        {/* Annotations Panel */}
        {renderAnnotationsPanel()}

        {/* Annotation Modal */}
        {renderAnnotationModal()}
      </div>
    </TooltipProvider>
  );
};

export default EnhancedPdfViewer;
