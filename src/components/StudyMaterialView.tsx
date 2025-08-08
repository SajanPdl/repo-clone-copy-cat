
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuth } from '@/hooks/useAuth';
import { 
  Download, 
  Calendar, 
  Award, 
  FileText, 
  Book, 
  Clock, 
  User, 
  Info,
  Star,
  Heart,
  Eye
} from 'lucide-react';
import { StudyMaterial, PastPaper } from '@/utils/queryUtils';
import PdfViewer from './PdfViewer';
import { incrementDownloads } from '@/utils/studyMaterialsUtils';
import { supabase } from '@/integrations/supabase/client';

interface StudyMaterialViewProps {
  material: StudyMaterial | PastPaper;
  type?: 'study_material' | 'past_paper';
}

function isPastPaper(material: StudyMaterial | PastPaper): material is PastPaper {
  return 'year' in material && 'board' in material;
}

function isStudyMaterial(material: StudyMaterial | PastPaper): material is StudyMaterial {
  return 'category' in material && 'file_type' in material;
}

const StudyMaterialView = ({ material, type = 'study_material' }: StudyMaterialViewProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  
  if (!material) return null;
  
  const isPastPaperMaterial = type === 'past_paper' || isPastPaper(material);
  const materialIdStr = material.id.toString();
  const isCurrentlyBookmarked = isBookmarked(type, materialIdStr);
  
  const handleDownload = async () => {
    try {
      // Track download
      await incrementDownloads(material.id);
      
      // Add student activity if user is logged in
      if (user) {
        await supabase.rpc('add_student_activity', {
          p_user_id: user.id,
          p_activity_type: 'download',
          p_points: 2,
          p_description: `Downloaded: ${material.title}`
        });
      }
      
      toast({
        title: "Download Started",
        description: `${material.title} is being downloaded.`,
      });
      
      if (material.file_url) {
        window.open(material.file_url, '_blank');
      } else {
        window.open("https://www.africau.edu/images/default/sample.pdf", '_blank');
      }
    } catch (error) {
      console.error('Error downloading material:', error);
      toast({
        title: "Error",
        description: "Failed to download material. Please try again.",
        variant: "destructive"
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

    try {
      if (isCurrentlyBookmarked) {
        await removeBookmark(type, materialIdStr);
      } else {
        await addBookmark(type, materialIdStr);
        
        // Add student activity for bookmarking
        await supabase.rpc('add_student_activity', {
          p_user_id: user.id,
          p_activity_type: 'bookmark',
          p_points: 1,
          p_description: `Bookmarked: ${material.title}`
        });
      }
    } catch (error) {
      console.error('Error managing bookmark:', error);
    }
  };
  
  const handleSolutionDownload = () => {
    toast({
      title: "Solution Download Started",
      description: `Solution for ${material.title} is being downloaded.`,
    });
    
    window.open("https://www.africau.edu/images/default/sample.pdf", '_blank');
  };
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="mb-6">
        {isStudyMaterial(material) && (material as any).featured_image && (
          <img
            src={(material as any).featured_image}
            alt={material.title}
            className="w-full max-h-80 object-cover rounded-lg mb-6"
          />
        )}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{material.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {isPastPaperMaterial ? (
            isPastPaper(material) && (
              <>
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
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  <Award className="h-4 w-4 mr-2" />
                  {material.board}
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
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <Info className="h-4 w-4 mr-2" />
                  {material.grade}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                  <User className="h-4 w-4 mr-2" />
                  MeroAcademy Team
                </span>
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
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{material.downloads || 0} downloads</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{material.views || 0} views</span>
              </div>
              
              {isPastPaperMaterial && isPastPaper(material) && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Exam Duration: 3 hours</span>
                </div>
              )}
              
              {!isPastPaperMaterial && (
                <>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">PDF Document</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">{material.rating || 0}/5 rating</span>
                  </div>
                </>
              )}
              
              {isStudyMaterial(material) && material.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Published: {new Date(material.date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            {user && (
              <Button 
                onClick={handleBookmark}
                variant={isCurrentlyBookmarked ? "default" : "outline"}
                className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                  isCurrentlyBookmarked 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'border-red-500 text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`h-4 w-4 mr-2 ${isCurrentlyBookmarked ? 'fill-current' : ''}`} />
                {isCurrentlyBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
            )}
            
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
        
        {!isPastPaperMaterial && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {isStudyMaterial(material) && (
                <>
                  <span className="px-3 py-1 bg-edu-purple/10 text-edu-purple rounded-full text-sm">{material.subject}</span>
                  <span className="px-3 py-1 bg-edu-blue/10 text-edu-blue rounded-full text-sm">{material.category}</span>
                  <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm">{material.grade}</span>
                  {material.tags && material.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm">{tag}</span>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </Card>
      
      {/* Enhanced PDF Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Preview</h2>
          <div className="h-[800px]">
            <PdfViewer 
              fileUrl={material.file_url || "https://www.africau.edu/images/default/sample.pdf"}
              title={material.title}
              height={800}
              materialId={material.id}
              materialType={type}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyMaterialView;
