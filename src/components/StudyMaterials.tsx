import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MaterialCard from './study-materials/MaterialCard';
import MaterialsFilter from './study-materials/MaterialsFilter';
import ContentPagination from './common/ContentPagination';
import { studyMaterialsData } from '@/data/studyMaterialsData';
import { filterMaterials } from '@/utils/studyMaterialsUtils';
import { StudyMaterial } from '@/utils/queryUtils';
import AdPlacement from './ads/AdPlacement';
import { useToast } from "@/hooks/use-toast";

const StudyMaterials = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter options
  const filterOptions = {
    grades: ['All', 'Grade 10', 'Grade 11', 'Grade 12', "Bachelor's"],
    subjects: ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography'],
    categories: ['All', 'Notes', 'Worksheets', 'Practice Tests', 'Guides']
  };

  // Get filtered materials
  const filteredMaterials = filterMaterials(
    studyMaterialsData,
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

  const handleDownload = (materialId: number, materialTitle: string) => {
    toast({
      title: "Download Started",
      description: `${materialTitle} is being downloaded.`,
    });
  };

  return (
    <section id="study-materials" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Study Materials</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Access comprehensive study materials, notes, and resources for all subjects and grades.
            Download what you need to excel in your studies.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search study materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-edu-purple"
            />
          </div>

          <MaterialsFilter
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedCategory={selectedCategory}
            onGradeChange={setSelectedGrade}
            onSubjectChange={setSelectedSubject}
            onCategoryChange={setSelectedCategory}
            filterOptions={filterOptions}
          />
        </div>

        {/* Ad Placement */}
        <div className="max-w-6xl mx-auto mb-8">
          <AdPlacement position="top" />
        </div>

        {/* Results */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {paginatedMaterials.length} of {filteredMaterials.length} materials
            </p>
            <Link to="/materials">
              <Button variant="outline" size="sm">
                View All Materials
              </Button>
            </Link>
          </div>

          {paginatedMaterials.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedMaterials.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    onDownload={handleDownload}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <ContentPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No study materials found matching your criteria.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedGrade("All");
                  setSelectedSubject("All");
                  setSelectedCategory("All");
                }}
                className="mt-4"
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StudyMaterials;