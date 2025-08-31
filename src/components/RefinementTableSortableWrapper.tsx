import { useState, useEffect } from "react";
import { Segment } from "@/types";
import RefinementSegmentsTable from "./RefinementSegmentsTable";
import { SegmentsFilters } from "./SegmentsFilters";
import { SegmentsPagination } from "./SegmentsPagination";
import CityMap from "./CityMap";

interface RefinementTableSortableWrapperProps {
  segments: Segment[];
  onSelectSegment: (id: string, selected: boolean) => void;
  onSelectAllSegments: (segmentIds: string[], selected: boolean) => void;
  selectedSegments: Segment[];
  onMergeSelected: () => Promise<void>;
  onUpdateSegmentName: (segmentId: string, newName: string) => Promise<void>;
  onDeleteSegment: (segmentId: string) => Promise<void>;
  onUnmergeSegments: (
    parentSegmentId: string,
    segmentIds: string[]
  ) => Promise<void>;
  onUpdateSegmentClassification?: (segmentId: string, classification: string) => Promise<void>;
  onUpdateSegmentType?: (segmentId: string, type: any) => Promise<void>;
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
  onUpdateSegmentClassification,
  onUpdateSegmentType,
}: RefinementTableSortableWrapperProps) => {
  // Debug removed
  // Filter and sort state
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedClassification, setSelectedClassification] = useState<string>("all");
  const [minLength, setMinLength] = useState<string>("");
  const [maxLength, setMaxLength] = useState<string>("");
  const [nameFilter, setNameFilter] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Splitter state
  const [leftWidth, setLeftWidth] = useState<number>(50); // percentage
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Reset filters
  const resetFilters = () => {
    setNameFilter("");
    setMinLength("");
    setMaxLength("");
    setSelectedType("all");
    setSelectedClassification("all");
  };

  // Filter and sort segments - show all segments that are not children of merged segments
  const filteredAndSortedSegments = () => {
    if (!initialSegments || !Array.isArray(initialSegments)) {
      // No segments or invalid segments
      return [];
    }
    
    // First, deduplicate segments by ID
    const uniqueSegments = Array.from(
      new Map(initialSegments.map(segment => [segment.id, segment])).values()
    );
    
    // Filtered duplicate segments
    
    return uniqueSegments
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
        // Filter by classification
        if (selectedClassification === "all") {
          return true;
        } else if (selectedClassification === "undefined") {
          return segment.classification === undefined;
        } else {
          return segment.classification === selectedClassification;
        }
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
  }, [selectedType, selectedClassification, minLength, maxLength, sortDirection, nameFilter]);
  
  // Reset to first page when segments change (e.g., after merge)
  useEffect(() => {
    setCurrentPage(1);
  }, [initialSegments.length]);

  // Splitter handlers
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const container = document.getElementById('splitter-container');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100;
    setLeftWidth(Math.max(20, Math.min(80, newLeftWidth))); // Limit between 20% and 80%
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Safety check
  if (!initialSegments) {
    // No segments provided
    return <div>Carregando segmentos...</div>;
  }

  return (
    <div>
      <SegmentsFilters
        nameFilter={nameFilter}
        onNameFilterChange={setNameFilter}
        selectedRating="all"
        onRatingChange={() => {}} // Not used in refinement
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedClassification={selectedClassification}
        onClassificationChange={setSelectedClassification}
        minLength={minLength}
        onMinLengthChange={setMinLength}
        maxLength={maxLength}
        onMaxLengthChange={setMaxLength}
        onResetFilters={resetFilters}
        showRatingFilter={false}
        showClassificationFilter={true}
      />
      {/* Table layout without map (temporary fix) */}
      <div className="space-y-4">
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
          onUpdateSegmentClassification={onUpdateSegmentClassification}
          onUpdateSegmentType={onUpdateSegmentType}
        />
        {/* Map temporarily disabled due to React Leaflet compatibility issues */}
        <div className="w-full h-[400px] bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">Mapa temporariamente indisponível</p>
            <p className="text-sm">Resolvendo problemas de compatibilidade</p>
          </div>
        </div>
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