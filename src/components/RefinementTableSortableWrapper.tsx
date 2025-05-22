import { useState, useEffect } from "react";
import { Segment } from "@/types";
import { SegmentsFilters } from "./SegmentsFilters";
import { SegmentsPagination } from "./SegmentsPagination";
import CityMap from "./CityMap";
import RefinementSegmentsTable from "./RefinementSegmentsTable";

interface RefinementTableSortableWrapper {
  segments: Segment[];
  onSelectSegment?: (id: string, selected: boolean) => void;
  selectedSegments?: Segment[];
  onMergeSelected?: () => Promise<void>;
  onMergeDataChange?: React.Dispatch<
    React.SetStateAction<{
      name: string;
      type: any;
    } | null>
  >;
  onUpdateSegmentName?: (segmentId: string, newName: string) => Promise<void>;
  onDeleteSegment: (segmentId: string) => Promise<void>; // Add this line
}

export const RefinementTableSortableWrapper = ({
  segments: initialSegments,
  onSelectSegment,
  onMergeSelected,
  selectedSegments,
  onMergeDataChange,
  onUpdateSegmentName,
  onDeleteSegment,
}: RefinementTableSortableWrapper) => {
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
        showRatingFilter={false}
      />

      <div className="flex gap-8">
        <RefinementSegmentsTable
          segments={currentItems}
          onSelectSegment={onSelectSegment}
          onUpdateSegmentName={onUpdateSegmentName}
          sortDirection={sortDirection}
          onToggleSortDirection={toggleSortDirection}
          onDeleteSegment={onDeleteSegment}
        />
        <CityMap segments={selectedSegments} className="flex-grow" />
      </div>

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
