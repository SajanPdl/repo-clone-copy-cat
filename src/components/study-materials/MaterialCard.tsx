import React from 'react';
import { Calendar, Download, BookOpen } from 'lucide-react';
import { StudyMaterial } from '@/utils/queryUtils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface MaterialCardProps {
  material: StudyMaterial;
  linkTo?: string;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material, linkTo }) => {
  // Determine the link destination - either use provided linkTo or construct default path
  const contentLink = linkTo || `/content/${material.id}`;
  
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full">
      <div className="relative">
        <img 
          src="/placeholder.svg"
          alt={material.title} 
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-medium px-2 py-1 rounded">
          {material.category}
        </div>
        
        {material.is_featured && (
          <div className="absolute top-2 left-2">
            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
              Featured
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {material.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
          {material.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{material.date ? new Date(material.date).toLocaleDateString() : 'N/A'}</span>
          </div>
          
          <div className="flex items-center">
            <Download className="h-4 w-4 mr-1" />
            <span>{material.downloads} downloads</span>
          </div>
        </div>
        
        <Link to={contentLink} className="block mt-4 w-full">
          <Button 
            variant="outline" 
            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-indigo-400"
          >
            View Material
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MaterialCard;