import { useState, useEffect } from "react";
import { Segment } from "@/types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import OriginalSegmentsTable from "./OriginalSegmentsTable";
import { SegmentsFilters } from "./SegmentsFilters";
import { SegmentsPagination } from "./SegmentsPagination";

interface TableSortableWrapperProps {
  segments: Segment[];
  showSortOptions?: boolean;
  onSelectSegment?: (id: string, selected: boolean) => void;
  onMergeSelected?: () => Promise<void>;
  selectedSegmentsCount?: number;
  onMergeDataChange?: React.Dispatch<
    React.SetStateAction<{
      name: string;
      type: any;
    } | null>
  >;
  onUpdateSegmentName?: (segmentId: string, newName: string) => Promise<void>;
  onDeleteSegment: (segmentId: string) => Promise<void>; // Add this line
}

export const TableSortableWrapper = ({
  segments: initialSegments,
  showSortOptions = false,
  onSelectSegment,
  onMergeSelected,
  selectedSegmentsCount,
  onMergeDataChange,
  onUpdateSegmentName,
}: TableSortableWrapperProps) => {
  // Filter state
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [minLength, setMinLength] = useState<string>("");
  const [maxLength, setMaxLength] = useState<string>("");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [segments, setSegments] = useState<Segment[]>(initialSegments);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Update segments when initialSegments change
  useEffect(() => {
    if (JSON.stringify(initialSegments) !== JSON.stringify(segments)) {
      setSegments(initialSegments);
    }
  }, [initialSegments]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Reset filters
  const resetFilters = () => {
    setNameFilter("");
    setMinLength("");
    setMaxLength("");
    setSelectedType("all");
    setSelectedRating("all");
  };

  // Filter and sort segments
  const filteredAndSortedSegments = () => {
    return [...initialSegments]
      .filter((segment) => {
        // Filter by name
        if (nameFilter) {
          return segment.name.toLowerCase().includes(nameFilter.toLowerCase());
        }
        return true;
      })
      .filter((segment) => {
        // Filter by rating
        if (selectedRating !== "all") {
          // For now, placeholder as we don't have ratings directly in segments
          return true; // We would filter by rating here if ratings were available
        }
        return true;
      })
      .filter((segment) => {
        // Filter by segment type
        if (selectedType !== "all") {
          return segment.type.toLowerCase() === selectedType.toLowerCase();
        }
        return true;
      })
      .filter((segment) => {
        // Filter by length
        const segmentLength = segment.length;
        const min = minLength ? parseFloat(minLength) : null;
        const max = maxLength ? parseFloat(maxLength) : null;

        if (min !== null && max !== null) {
          return segmentLength >= min && segmentLength <= max;
        } else if (min !== null) {
          return segmentLength >= min;
        } else if (max !== null) {
          return segmentLength <= max;
        }
        return true;
      })
      .sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        if (sortDirection === "asc") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
  };

  const processedSegments = filteredAndSortedSegments();

  // Calculate pagination values
  const totalPages = Math.ceil(processedSegments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedSegments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedRating,
    selectedType,
    minLength,
    maxLength,
    sortDirection,
    nameFilter,
  ]);

  // Based on the props passed, determine which version to show
  if (onSelectSegment && onUpdateSegmentName) {
    // This is the "Refine Data" page version with selection, merging, and name editing
    return (
      <div>
        {showSortOptions && (
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {selectedSegmentsCount !== undefined &&
                selectedSegmentsCount > 0 &&
                onMergeSelected && (
                  <Button
                    onClick={() => onMergeSelected()}
                    disabled={selectedSegmentsCount < 2}
                  >
                    Mesclar {selectedSegmentsCount} segmentos
                  </Button>
                )}
            </div>
          </div>
        )}

        <SegmentsFilters
          nameFilter={nameFilter}
          onNameFilterChange={setNameFilter}
          selectedRating={selectedRating}
          onRatingChange={setSelectedRating}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          minLength={minLength}
          onMinLengthChange={setMinLength}
          maxLength={maxLength}
          onMaxLengthChange={setMaxLength}
          onResetFilters={resetFilters}
          showRatingFilter={false}
        />

        <OriginalSegmentsTable
          segments={currentItems}
          onSelectSegment={onSelectSegment}
          onUpdateSegmentName={onUpdateSegmentName}
          hideSelectColumn={false}
          hideNameEditing={false}
          sortDirection={sortDirection}
          onToggleSortDirection={toggleSortDirection}
        />

        <SegmentsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
          itemsPerPage={itemsPerPage}
          totalItems={processedSegments.length}
          currentItemsStart={Math.min(
            indexOfFirstItem + 1,
            processedSegments.length
          )}
          currentItemsEnd={Math.min(indexOfLastItem, processedSegments.length)}
        />
      </div>
    );
  }

  // Otherwise, this is the "Evaluation" page version without selection and merging
  return (
    <div>
      <SegmentsFilters
        nameFilter={nameFilter}
        onNameFilterChange={setNameFilter}
        selectedRating={selectedRating}
        onRatingChange={setSelectedRating}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        minLength={minLength}
        onMinLengthChange={setMinLength}
        maxLength={maxLength}
        onMaxLengthChange={setMaxLength}
        onResetFilters={resetFilters}
        showRatingFilter={true}
      />

      <OriginalSegmentsTable
        segments={currentItems}
        sortDirection={sortDirection}
        onToggleSortDirection={toggleSortDirection}
        showEvaluationActions={true}
      />

      <SegmentsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={paginate}
        itemsPerPage={itemsPerPage}
        totalItems={processedSegments.length}
        currentItemsStart={Math.min(
          indexOfFirstItem + 1,
          processedSegments.length
        )}
        currentItemsEnd={Math.min(indexOfLastItem, processedSegments.length)}
      />
    </div>
  );
};

export default TableSortableWrapper;
