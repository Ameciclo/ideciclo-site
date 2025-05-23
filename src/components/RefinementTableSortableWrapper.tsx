import { useState, useEffect } from "react";
import { Segment } from "@/types";
import { SegmentsFilters } from "./SegmentsFilters";
import { SegmentsPagination } from "./SegmentsPagination";
import CityMap from "./CityMap";
import RefinementSegmentsTable from "./RefinementSegmentsTable";

interface RefinementTableSortableWrapper {
  segments: Segment[];
  onSelectSegment?: (id: string, selected: boolean) => void;
  onSelectAllSegments?: (segmentIds: string[], selected: boolean) => void;
  selectedSegments?: Segment[];
  onMergeSelected?: () => Promise<void>;
  onMergeDataChange?: React.Dispatch<
    React.SetStateAction<{
      name: string;
      type: any;
    } | null>
  >;
  onUpdateSegmentName?: (segmentId: string, newName: string) => Promise<void>;
  onDeleteSegment: (segmentId: string) => Promise<void>;
}

export const RefinementTableSortableWrapper = ({
  segments: initialSegments,
  onSelectSegment,
  onSelectAllSegments,
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

  // Update segments when initialSegments change - more robust comparison
  useEffect(() => {
    setSegments(initialSegments);
  }, [initialSegments]);

  // Wrapper for merge operation that refreshes data
  const handleMergeSelected = async () => {
    if (onMergeSelected) {
      try {
        await onMergeSelected();
        // After merge, clear any localStorage cache to force fresh data
        clearSegmentsCache();
        // Reset to first page since segments may have changed
        setCurrentPage(1);
      } catch (error) {
        console.error("Error during merge operation:", error);
      }
    }
  };

  // Clear segments cache from localStorage
  const clearSegmentsCache = () => {
    if (segments.length > 0 && segments[0]?.id_cidade) {
      const cachedSegmentsKey = `segments_${segments[0].id_cidade}`;
      localStorage.removeItem(cachedSegmentsKey);
    }
  };

  // Wrapper for delete operation
  const handleDeleteSegment = async (segmentId: string) => {
    try {
      await onDeleteSegment(segmentId);
      // Update local state immediately to reflect the deletion
      setSegments((prevSegments) =>
        prevSegments.filter((seg) => seg.id !== segmentId)
      );
      // Clear cache to ensure fresh data on next load
      clearSegmentsCache();
    } catch (error) {
      console.error("Error during delete operation:", error);
    }
  };

  // Wrapper for update segment name
  const handleUpdateSegmentName = async (
    segmentId: string,
    newName: string
  ) => {
    try {
      if (onUpdateSegmentName) {
        await onUpdateSegmentName(segmentId, newName);
        // Update local state immediately
        setSegments((prevSegments) =>
          prevSegments.map((seg) =>
            seg.id === segmentId ? { ...seg, name: newName } : seg
          )
        );
      }
    } catch (error) {
      console.error("Error updating segment name:", error);
    }
  };

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

  // Filter and sort segments - use current segments state instead of initialSegments
  const filteredAndSortedSegments = () => {
    return [...segments]
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

  // Also reset to first page if total pages decrease and current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handleSelectAllInPage = (selected: boolean) => {
    const currentPageSegmentIds = currentItems
      .filter((segment) => !segment.evaluated) // Only selectable segments
      .map((segment) => segment.id);

    if (onSelectAllSegments) {
      onSelectAllSegments(currentPageSegmentIds, selected);
    }
  };

  // Check if all selectable segments in current page are selected
  const selectableSegmentsInPage = currentItems.filter(
    (segment) => !segment.evaluated
  );
  const selectedSegmentsInPage = selectableSegmentsInPage.filter(
    (segment) => segment.selected
  );
  const isAllSelectedInPage =
    selectableSegmentsInPage.length > 0 &&
    selectedSegmentsInPage.length === selectableSegmentsInPage.length;
  const isIndeterminate =
    selectedSegmentsInPage.length > 0 &&
    selectedSegmentsInPage.length < selectableSegmentsInPage.length;

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
          onSelectAllInPage={handleSelectAllInPage}
          isAllSelectedInPage={isAllSelectedInPage}
          isIndeterminate={isIndeterminate}
          onUpdateSegmentName={handleUpdateSegmentName}
          sortDirection={sortDirection}
          onToggleSortDirection={toggleSortDirection}
          onDeleteSegment={handleDeleteSegment}
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

      {/* Pass the wrapped merge function to parent component */}
      {onMergeDataChange && (
        <div style={{ display: "none" }}>
          {/* This is a hack to pass the wrapped merge function up */}
          {React.useEffect(() => {
            // Replace the original merge function with our wrapped version
            const originalOnMergeSelected = onMergeSelected;
            onMergeSelected = handleMergeSelected;
            return () => {
              onMergeSelected = originalOnMergeSelected;
            };
          }, [])}
        </div>
      )}
    </div>
  );
};

export default RefinementTableSortableWrapper;
