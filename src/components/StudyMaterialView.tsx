
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Calendar, 
  Award, 
  FileText, 
  Book, 
  Clock, 
  User, 
  Tag, 
  Info
} from 'lucide-react';
import { StudyMaterial, PastPaper } from '@/utils/queryUtils';

interface StudyMaterialViewProps {
  material: StudyMaterial | PastPaper;
  type?: 'study_material' | 'past_paper';
}

// Type guards for narrowing types
function isPastPaper(material: StudyMaterial | PastPaper): material is PastPaper {
  return 'year' in material && 'difficulty' in material;
}

function isStudyMaterial(material: StudyMaterial | PastPaper): material is StudyMaterial {
  return 'category' in material && 'author' in material;
}

const StudyMaterialView = ({ material, type = 'study_material' }: StudyMaterialViewProps) => {
  const { toast } = useToast();
  
  if (!material) return null;
  
  // Determine the type from the material itself if not provided
  const isPastPaperMaterial = type === 'past_paper' || isPastPaper(material);
  
  const handleDownload = () => {
    // Track download count in Supabase (would implement in production)
    toast({
      title: "Download Started",
      description: `${material.title} is being downloaded.`,
    });
    
    // Open the file URL in a new tab
    if (isPastPaperMaterial && isPastPaper(material)) {
      window.open(material.file_url, '_blank');
    } else if (isStudyMaterial(material)) {
      window.open(material.download_url, '_blank');
    } else {
      // Fallback for demo
      window.open("https://www.africau.edu/images/default/sample.pdf", '_blank');
    }
  };
  
  const handleSolutionDownload = () => {
    toast({
      title: "Solution Download Started",
      description: `Solution for ${material.title} is being downloaded.`,
    });
    
    // In real app, this would be a separate URL
    window.open("https://www.africau.edu/images/default/sample.pdf", '_blank');
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{material.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {isPastPaperMaterial ? (
            isPastPaper(material) && (
              <>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  <Award className="h-4 w-4 mr-2" />
                  {material.difficulty}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  {material.year}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <FileText className="h-4 w-4 mr-2" />
                  {material.subject || 'General'}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                  <Info className="h-4 w-4 mr-2" />
                  {material.grade || 'All Grades'}
                </span>
              </>
            )
          ) : (
            isStudyMaterial(material) && (
              <>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  <Book className="h-4 w-4 mr-2" />
                  {material.category}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <FileText className="h-4 w-4 mr-2" />
                  {material.subject || 'General'}
                </span>
                {material.grade && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <Info className="h-4 w-4 mr-2" />
                    {material.grade}
                  </span>
                )}
                {material.author && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                    <User className="h-4 w-4 mr-2" />
                    {material.author}
                  </span>
                )}
                {material.read_time && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    <Clock className="h-4 w-4 mr-2" />
                    {material.read_time}
                  </span>
                )}
              </>
            )
          )}
        </div>
      </div>
      
      <Card className="p-6 mb-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-semibold mb-2">Document Information</h3>
            <div className="flex flex-col space-y-1 text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                <span>{material.downloads || 0} downloads</span>
              </div>
              {isPastPaperMaterial && isPastPaper(material) && material.duration ? (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Duration: {material.duration}</span>
                </div>
              ) : (
                isStudyMaterial(material) && (
                  <>
                    {material.pages && (
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>{material.pages} pages</span>
                      </div>
                    )}
                    {material.rating && (
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-2" />
                        <span>Rating: {material.rating}/5</span>
                      </div>
                    )}
                  </>
                )
              )}
              {isStudyMaterial(material) && material.date && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Published: {new Date(material.date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={handleDownload}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download {isPastPaperMaterial ? 'Paper' : 'Material'}
            </Button>
            
            {isPastPaperMaterial && (
              <Button 
                onClick={handleSolutionDownload}
                className="flex items-center justify-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download Solution
              </Button>
            )}
          </div>
        </div>
        
        {isStudyMaterial(material) && material.description && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Description</h3>
            <div className="prose dark:prose-invert max-w-none">
              <p>{material.description}</p>
            </div>
          </div>
        )}
        
        {isStudyMaterial(material) && material.content && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Content</h3>
            <div className="prose dark:prose-invert max-w-none">
              <p>{material.content}</p>
            </div>
          </div>
        )}
        
        {isStudyMaterial(material) && material.tags && material.tags.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {material.tags.map((tag: string, index: number) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
      
      {/* Add PDF preview component here if relevant */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Preview</h2>
        <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            PDF preview would be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudyMaterialView;
