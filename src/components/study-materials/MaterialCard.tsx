import { Download, Star, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudyMaterial } from '@/data/studyMaterialsData';

interface MaterialCardProps {
  material: StudyMaterial;
  onDownload: (id: number, title: string) => void;
}

const MaterialCard = ({ material, onDownload }: MaterialCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {material.category}
          </Badge>
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm ml-1">{material.rating}</span>
          </div>
        </div>
        <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-edu-purple transition-colors">
          {material.title}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>{material.subject}</span>
          <span>•</span>
          <span>{material.grade}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3">
          {material.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {material.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{material.size}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span>{material.downloads} downloads</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={() => onDownload(material.id, material.title)}
          className="w-full btn-gradient"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MaterialCard;