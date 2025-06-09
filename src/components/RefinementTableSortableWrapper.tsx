
import { useState, useEffect } from "react";
import { Segment } from "@/types";
import RefinementSegmentsTable from "./RefinementSegmentsTable";
import { SegmentsFilters } from "./SegmentsFilters";
import { SegmentsPagination } from "./SegmentsPagination";

interface RefinementTableSortableWrapperProps {
  segments: Segment[];
  onSelectSegment: (id: string, selected: boolean) => void;
  onSelectAllSegments: (segmentIds: string[], selected: boolean) => void;
  selectedSegments: Segment[];
  onMergeSelected: () => Promise<void>;
  onUpdateSegmentName: (segmentId: string, newName: string) => Promise<void>;
  onDeleteSegment: (segmentId: string) => Promise<void>;
  onUnmergeSegments: (parentSegmentId: string, segmentIds: string[]) => Promise<void>;
}

export const RefinementTableSortableWrapper = ({
  segments: initialSegments,
  onSelectSegment,
  onSelectAllSegments,
  selectedSegments,
  onMergeSelected,
  onUpdateSegmentName,
  onDeleteSegment,
  onUnmergeSegments,
}: RefinementTableSortableWrapperProps) => {
  // Filter and sort state
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [minLength, setMinLength] = useState<string>("");
  const [maxLength, setMaxLength] = useState<string>("");
  const [nameFilter, setNameFilter] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Reset filters
  const resetFilters = () => {
    setNameFilter("");
    setMinLength("");
    setMaxLength("");
    setSelectedType("all");
  };

  // Filter and sort segments - show all segments that are not children of merged segments
  const filteredAndSortedSegments = () => {
    return [...initialSegments]
      .filter((segment) => {
        // Only show segments that are either not merged or are the parent merged segment
        // Hide child segments (segments with parent_segment_id)
        return !segment.parent_segment_id;
      })
      .filter((segment) => {
        // Filter by name
        if (nameFilter) {
          return segment.name.toLowerCase().includes(nameFilter.toLowerCase());
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
  }, [selectedType, minLength, maxLength, sortDirection, nameFilter]);

  return (
    <div>
      <SegmentsFilters
        nameFilter={nameFilter}
        onNameFilterChange={setNameFilter}
        selectedRating="all"
        onRatingChange={() => {}} // Not used in refinement
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        minLength={minLength}
        onMinLengthChange={setMinLength}
        maxLength={maxLength}
        onMaxLengthChange={setMaxLength}
        onResetFilters={resetFilters}
        showRatingFilter={false}
      />

      <RefinementSegmentsTable
        segments={currentItems}
        sortDirection={sortDirection}
        onToggleSortDirection={toggleSortDirection}
        onSelectSegment={onSelectSegment}
        onSelectAllSegments={onSelectAllSegments}
        selectedSegments={selectedSegments}
        onUpdateSegmentName={onUpdateSegmentName}
        onDeleteSegment={onDeleteSegment}
        onUnmergeSegments={onUnmergeSegments}
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

export default RefinementTableSortableWrapper;
