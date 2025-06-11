import { useState, useEffect } from "react";
import { Segment } from "@/types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import OriginalSegmentsTable from "./OriginalSegmentsTable";
import { SegmentsFilters } from "./SegmentsFilters";
import { SegmentsPagination } from "./SegmentsPagination";
import { supabase } from "@/integrations/supabase/client";

interface TableSortableWrapperProps {
  segments: Segment[];
  showSortOptions?: boolean;
}

export const EvaluationTableSortableWrapper = ({
  segments: initialSegments,
  showSortOptions = false,
}: TableSortableWrapperProps) => {
  // Filter state
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [minLength, setMinLength] = useState<string>("");
  const [maxLength, setMaxLength] = useState<string>("");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [segments, setSegments] = useState<Segment[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Update segments when initialSegments change and verify form existence
  useEffect(() => {
    const verifyFormsAndUpdateSegments = async () => {
      // Get all segments that are marked as evaluated
      const evaluatedSegments = initialSegments.filter(
        (s) => s.evaluated && s.id_form
      );

      if (evaluatedSegments.length === 0) {
        setSegments(initialSegments);
        return;
      }

      // Get all form IDs
      const formIds = evaluatedSegments.map((s) => s.id_form).filter(Boolean);

      try {
        // Check which forms actually exist in the database
        const { data, error } = await supabase
          .from("forms")
          .select("id")
          .in("id", formIds);

        if (error) {
          console.error("Error verifying forms:", error);
          setSegments(initialSegments);
          return;
        }

        // Create a set of existing form IDs for quick lookup
        const existingFormIds = new Set(data.map((form) => form.id));

        // Update segments to mark those with missing forms as not evaluated
        const updatedSegments = initialSegments.map((segment) => {
          if (
            segment.evaluated &&
            segment.id_form &&
            !existingFormIds.has(segment.id_form)
          ) {
            // Form doesn't exist, update segment in database
            supabase
              .from("segments")
              .update({ evaluated: false, id_form: null })
              .eq("id", segment.id)
              .then(() =>
                console.log(`Updated segment ${segment.id} to not evaluated`)
              )
              .catch((err) =>
                console.error(`Error updating segment ${segment.id}:`, err)
              );

            // Return updated segment for UI
            return { ...segment, evaluated: false, id_form: null };
          }
          return segment;
        });

        setSegments(updatedSegments);
      } catch (error) {
        console.error("Error verifying forms:", error);
        setSegments(initialSegments);
      }
    };

    verifyFormsAndUpdateSegments();
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

  // Filter and sort segments - only show parent merged segments or non-merged segments
  const filteredAndSortedSegments = () => {
    return [...segments]
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
        showRatingFilter={true}
      />

      <OriginalSegmentsTable
        segments={currentItems}
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
};

export default EvaluationTableSortableWrapper;
