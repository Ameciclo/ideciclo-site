import { useState, useEffect, useRef } from "react";
import { Segment } from "@/types";
import RefinementSegmentsTable from "./RefinementSegmentsTable";
import { SegmentsFilters } from "./SegmentsFilters";
import { SegmentsPagination } from "./SegmentsPagination";
import MapboxMap from "./MapboxMap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface RefinementTableSortableWrapperProps {
  segments: Segment[];
  onSelectSegment: (id: string, selected: boolean) => void;
  onSelectAllSegments: (segmentIds: string[], selected: boolean) => void;
  selectedSegments: Segment[];
  onMergeSelected: () => Promise<void>;
  onUpdateSegmentName: (segmentId: string, newName: string) => Promise<void>;
  onUpdateSegmentTechnical?: (
    segmentId: string,
    updates: Partial<Segment>
  ) => Promise<void>;
  onDeleteSegment: (segmentId: string) => Promise<void>;
  onUnmergeSegments: (
    parentSegmentId: string,
    segmentIds: string[]
  ) => Promise<void>;
  onUpdateSegmentClassification?: (segmentId: string, classification: string) => Promise<void>;
  onUpdateSegmentType?: (segmentId: string, type: any) => Promise<void>;
  technicalOpen?: boolean;
  technicalSegment?: Segment | null;
  onFocusGeometryChange?: (geometry: any | null) => void;
}

export const RefinementTableSortableWrapper = ({
  segments: initialSegments,
  onSelectSegment,
  onSelectAllSegments,
  selectedSegments,
  onMergeSelected,
  onUpdateSegmentName,
  onUpdateSegmentTechnical,
  onDeleteSegment,
  onUnmergeSegments,
  onUpdateSegmentClassification,
  onUpdateSegmentType,
  technicalOpen = false,
  technicalSegment = null,
  onFocusGeometryChange,
}: RefinementTableSortableWrapperProps) => {
  // Debug removed
  // Filter and sort state
  const [sortField, setSortField] = useState<
    "name" | "type" | "classification" | "length"
  >("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedClassification, setSelectedClassification] = useState<string>("all");
  const [minLength, setMinLength] = useState<string>("");
  const [maxLength, setMaxLength] = useState<string>("");
  const [nameFilter, setNameFilter] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [desktopLayout, setDesktopLayout] = useState<"stacked" | "split" | "table-only">("stacked");
  const [focusGeometry, setFocusGeometry] = useState<any | null>(null);
  const [mapSticky, setMapSticky] = useState<boolean>(true);
  const [technicalPortalTarget, setTechnicalPortalTarget] = useState<HTMLElement | null>(null);
  const technicalPortalRef = useRef<HTMLDivElement | null>(null);

  const handleSortChange = (
    field: "name" | "type" | "classification" | "length"
  ) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
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
        const direction = sortDirection === "asc" ? 1 : -1;

        if (sortField === "length") {
          return (a.length - b.length) * direction;
        }

        const valueA =
          sortField === "classification"
            ? a.classification || ""
            : a[sortField] || "";
        const valueB =
          sortField === "classification"
            ? b.classification || ""
            : b[sortField] || "";

        return valueA.localeCompare(valueB, "pt-BR", {
          sensitivity: "base",
        }) * direction;
      });
  };

  const processedSegments = filteredAndSortedSegments();
  const mapSegments =
    selectedSegments.length > 0 ? selectedSegments : processedSegments;

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
  }, [selectedType, selectedClassification, minLength, maxLength, sortField, sortDirection, nameFilter, itemsPerPage]);
  
  // Reset to first page when segments change (e.g., after merge)
  useEffect(() => {
    setCurrentPage(1);
  }, [initialSegments.length]);

  useEffect(() => {
    if (selectedSegments.length !== 1) {
      setFocusGeometry(null);
      onFocusGeometryChange?.(null);
    }
  }, [selectedSegments.length, onFocusGeometryChange]);

  useEffect(() => {
    setTechnicalPortalTarget(technicalPortalRef.current);
  }, []);

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
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <div className="flex justify-end">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span>Visualização</span>
              <Select
                value={desktopLayout}
                onValueChange={(value) =>
                  setDesktopLayout(value as "split" | "stacked" | "table-only")
                }
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="split">Lado a lado</SelectItem>
                  <SelectItem value="stacked">Empilhado</SelectItem>
                  <SelectItem value="table-only">Sem mapa</SelectItem>
                </SelectContent>
              </Select>
              <span>Segmentos por página</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(parseInt(value, 10))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {desktopLayout === "split" && (
                <Button
                  variant={mapSticky ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMapSticky((prev) => !prev)}
                >
                  {mapSticky ? "Mapa fixo" : "Mapa livre"}
                </Button>
              )}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Modo atual:{" "}
          {desktopLayout === "split"
            ? "Lado a lado"
            : desktopLayout === "stacked"
              ? "Empilhado"
              : "Sem mapa"}
        </p>

        {desktopLayout === "split" && (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
              <RefinementSegmentsTable
                segments={currentItems}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                onSelectSegment={onSelectSegment}
                onSelectAllSegments={onSelectAllSegments}
                selectedSegments={selectedSegments}
                onUpdateSegmentName={onUpdateSegmentName}
                onUpdateSegmentTechnical={onUpdateSegmentTechnical}
                onDeleteSegment={onDeleteSegment}
                onUnmergeSegments={onUnmergeSegments}
                onUpdateSegmentClassification={onUpdateSegmentClassification}
                onUpdateSegmentType={onUpdateSegmentType}
                technicalOpen={technicalOpen}
                technicalSegment={technicalSegment}
                onFocusGeometryChange={(geometry) => {
                  setFocusGeometry(geometry);
                  onFocusGeometryChange?.(geometry);
                }}
                technicalPanelContainer={technicalPortalTarget}
              />
              <MapboxMap
                segments={mapSegments}
                className={`h-[62vh] min-h-[420px] w-full rounded-md border ${
                  mapSticky ? "lg:sticky lg:top-6" : ""
                }`}
                focusGeometry={focusGeometry}
              />
            </div>
            <div ref={technicalPortalRef} />
          </div>
        )}

        {desktopLayout === "stacked" && (
          <div className="space-y-4">
            <RefinementSegmentsTable
              segments={currentItems}
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
              onSelectSegment={onSelectSegment}
              onSelectAllSegments={onSelectAllSegments}
              selectedSegments={selectedSegments}
              onUpdateSegmentName={onUpdateSegmentName}
              onUpdateSegmentTechnical={onUpdateSegmentTechnical}
              onDeleteSegment={onDeleteSegment}
              onUnmergeSegments={onUnmergeSegments}
              onUpdateSegmentClassification={onUpdateSegmentClassification}
              onUpdateSegmentType={onUpdateSegmentType}
              technicalOpen={technicalOpen}
              technicalSegment={technicalSegment}
              onFocusGeometryChange={(geometry) => {
                setFocusGeometry(geometry);
                onFocusGeometryChange?.(geometry);
              }}
            />
            <MapboxMap
              segments={mapSegments}
              className="h-[58vh] min-h-[420px] w-full rounded-md border"
              focusGeometry={focusGeometry}
            />
          </div>
        )}

        {desktopLayout === "table-only" && (
          <RefinementSegmentsTable
            segments={currentItems}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            onSelectSegment={onSelectSegment}
            onSelectAllSegments={onSelectAllSegments}
            selectedSegments={selectedSegments}
            onUpdateSegmentName={onUpdateSegmentName}
            onUpdateSegmentTechnical={onUpdateSegmentTechnical}
            onDeleteSegment={onDeleteSegment}
            onUnmergeSegments={onUnmergeSegments}
            onUpdateSegmentClassification={onUpdateSegmentClassification}
            onUpdateSegmentType={onUpdateSegmentType}
            technicalOpen={technicalOpen}
            technicalSegment={technicalSegment}
            onFocusGeometryChange={(geometry) => {
              setFocusGeometry(geometry);
              onFocusGeometryChange?.(geometry);
            }}
          />
        )}
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
