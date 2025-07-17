
import React from 'react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface ContentPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

const ContentPagination: React.FC<ContentPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 12
}) => {
  
  // Generate the visible page numbers depending on current page and total pages
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
    }
    
    if (currentPage >= totalPages - 2) {
      return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    return [
      1,
      'ellipsis',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      'ellipsis',
      totalPages
    ];
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="w-full mt-8 flex flex-col items-center gap-2">
      {totalItems !== undefined && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </p>
      )}
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink 
                  isActive={page === currentPage}
                  onClick={() => typeof page === 'number' && onPageChange(page)}
                  className={typeof page === 'number' ? "cursor-pointer" : ""}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ContentPagination;
