
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MaterialCard from './study-materials/MaterialCard';
import MaterialsFilter from './study-materials/MaterialsFilter';
import ContentPagination from './common/ContentPagination';
import { fetchStudyMaterials, StudyMaterial } from '@/utils/queryUtils';
import { filterMaterials } from '@/utils/studyMaterialsUtils';
import AdPlacement from './ads/AdPlacement';

const StudyMaterials = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8;

  // Load materials from database
  useEffect(() => {
    const loadMaterials = async () => {
      setLoading(true);
      try {
        const data = await fetchStudyMaterials();
        setMaterials(data);
      } catch (error) {
        console.error('Error loading study materials:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMaterials();
  }, []);

  // Filter options
  const filterOptions = {
    grades: ['All', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', "Undergraduate"],
    subjects: ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'English', 'Computer Science'],
    categories: ['All', 'Notes', 'Question Banks', 'Lab Manuals', 'Reference Books', 'Worksheets']
  };

  // Get filtered materials
  const filteredMaterials = filterMaterials(
    materials,
    selectedCategory,
    selectedSubject,
    searchTerm
  );
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGrade, selectedSubject, selectedCategory]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="study-materials" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Study Materials</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Access comprehensive study materials organized by grade, subject, and topic to enhance your learning experience.
          </p>
        </div>

        {/* Add content ad placement above filters */}
        <AdPlacement position="content" className="mb-8" />

        <MaterialsFilter 
          options={filterOptions}
          searchTerm={searchTerm}
          selectedGrade={selectedGrade}
          selectedSubject={selectedSubject}
          selectedCategory={selectedCategory}
          onSearch={setSearchTerm}
          onGradeChange={setSelectedGrade}
          onSubjectChange={setSelectedSubject}
          onCategoryChange={setSelectedCategory}
        />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content area */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />
                ))}
              </div>
            ) : paginatedMaterials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedMaterials.map((material) => (
                  <MaterialCard 
                    key={material.id}
                    material={material}
                    linkTo={`/content/${material.slug}`}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No materials found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Try changing your search criteria or browse all materials.
                </p>
              </div>
            )}
            
            {filteredMaterials.length > itemsPerPage && (
              <ContentPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredMaterials.length}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>
          
          {/* Sidebar with ads */}
          <div className="lg:w-1/4">
            <AdPlacement position="sidebar" />
          </div>
        </div>

        {/* Footer ad */}
        <AdPlacement position="footer" className="mt-12" />

        <div className="text-center mt-12">
          <Button className="btn-primary scale-on-hover" asChild>
            <Link to="/study-materials">Explore All Materials</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StudyMaterials;
