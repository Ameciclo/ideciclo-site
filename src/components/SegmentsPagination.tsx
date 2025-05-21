
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

interface SegmentsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  currentItemsStart: number;
  currentItemsEnd: number;
}

export const SegmentsPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  currentItemsStart,
  currentItemsEnd,
}: SegmentsPaginationProps) => {
  // Generate page numbers for pagination
  const pageNumbers = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, 4, "ellipsis", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(
        1,
        "ellipsis",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pageNumbers.push(
        1,
        "ellipsis",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "ellipsis",
        totalPages
      );
    }
  }

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {pageNumbers.map((page, index) =>
            page === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={`page-${page}`}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(currentPage + 1)} 
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="text-sm text-gray-500">
        Mostrando {currentItemsStart}-{currentItemsEnd} de {totalItems} segmentos
      </div>
    </div>
  );
};
