
import React from 'react';
import { Search } from 'lucide-react';

interface MaterialsFilterProps {
  options: {
    grades: string[];
    subjects: string[];
    categories: string[];
  };
  searchTerm: string;
  selectedGrade: string;
  selectedSubject: string;
  selectedCategory: string;
  onSearch: (term: string) => void;
  onGradeChange: (grade: string) => void;
  onSubjectChange: (subject: string) => void;
  onCategoryChange: (category: string) => void;
}

const MaterialsFilter: React.FC<MaterialsFilterProps> = ({
  options,
  searchTerm,
  selectedGrade,
  selectedSubject,
  selectedCategory,
  onSearch,
  onGradeChange,
  onSubjectChange,
  onCategoryChange
}) => {
  // Make sure options is properly defined with defaults to prevent the error
  const safeOptions = {
    grades: options?.grades || ['All'],
    subjects: options?.subjects || ['All'],
    categories: options?.categories || ['All']
  };
  
  return (
    <div className="mb-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div className="w-full md:w-1/3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-edu-purple dark:focus:border-edu-purple focus:ring-1 focus:ring-edu-purple/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all duration-300 hover:shadow-md"
            />
          </div>
        </div>
        
        <div className="flex gap-4 flex-wrap justify-center">
          <select
            value={selectedGrade}
            onChange={(e) => onGradeChange(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-edu-purple dark:focus:border-edu-purple focus:ring-1 focus:ring-edu-purple/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all duration-300 hover:shadow-md"
          >
            {safeOptions.grades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
          
          <select
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-edu-purple dark:focus:border-edu-purple focus:ring-1 focus:ring-edu-purple/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all duration-300 hover:shadow-md"
          >
            {safeOptions.subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-edu-purple dark:focus:border-edu-purple focus:ring-1 focus:ring-edu-purple/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all duration-300 hover:shadow-md"
          >
            {safeOptions.categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default MaterialsFilter;
