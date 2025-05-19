
import { useState } from "react";
import { Segment, SegmentType, RatingType } from "@/types";
import OriginalSegmentsTable from "./OriginalSegmentsTable";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

interface TableSortableWrapperProps {
  segments: Segment[];
  onSelectSegment?: (id: string, selected: boolean) => void;
  onMergeSelected?: () => void;
  selectedSegmentsCount?: number;
  onMergeDataChange?: (data: { name: string; type: SegmentType }) => void;
  onUpdateSegmentName?: (id: string, newName: string) => void;
  showSortOptions?: boolean;
  hideSelectColumn?: boolean;
  hideNameEditing?: boolean;
}

export function TableSortableWrapper({
  segments,
  onSelectSegment,
  onMergeSelected,
  selectedSegmentsCount,
  onMergeDataChange,
  onUpdateSegmentName,
  showSortOptions = false,
  hideSelectColumn = false,
  hideNameEditing = false
}: TableSortableWrapperProps) {
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [mergeName, setMergeName] = useState("");
  const [mergeType, setMergeType] = useState<SegmentType>(SegmentType.CICLOFAIXA);

  const handleMergeConfirm = () => {
    if (onMergeDataChange) {
      onMergeDataChange({
        name: mergeName,
        type: mergeType
      });
    }
    setMergeDialogOpen(false);
    
    if (onMergeSelected) {
      onMergeSelected();
    }
  };

  const handleMergeClick = () => {
    setMergeDialogOpen(true);
    setMergeName(`Segmento mesclado (${selectedSegmentsCount})`);
    setMergeType(SegmentType.CICLOFAIXA);
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  // Sort segments by name
  const sortedSegments = [...segments].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    
    if (sortDirection === "asc") {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

  // Filter by rating (would need to integrate with actual rating data)
  const filteredSegments = selectedRating === "all" 
    ? sortedSegments 
    : sortedSegments.filter(segment => {
        // Filter by rating logic would go here
        // For now just return all as we don't have ratings in our current data model
        return true;
      });

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h3 className="text-lg font-semibold">Segmentos Cicloviários</h3>
        
        {showSortOptions && (
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleSortDirection}
              className="flex items-center gap-1"
            >
              {sortDirection === "asc" ? (
                <>Ordenar por Nome <ArrowDownAZ className="h-4 w-4" /></>
              ) : (
                <>Ordenar por Nome <ArrowUpAZ className="h-4 w-4" /></>
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="filter-rating">Filtrar por nota:</Label>
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {!hideSelectColumn && selectedSegmentsCount && selectedSegmentsCount > 1 && (
          <Button onClick={handleMergeClick}>
            Mesclar {selectedSegmentsCount} segmentos
          </Button>
        )}
      </div>

      <OriginalSegmentsTable 
        segments={filteredSegments} 
        onSelectSegment={hideSelectColumn ? undefined : onSelectSegment} 
        onUpdateSegmentName={hideNameEditing ? undefined : onUpdateSegmentName}
        hideSelectColumn={hideSelectColumn}
        hideNameEditing={hideNameEditing}
      />
      
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mesclar segmentos</DialogTitle>
            <DialogDescription>
              Defina as propriedades do segmento mesclado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="merge-name" className="text-right">
                Nome
              </Label>
              <Input
                id="merge-name"
                value={mergeName}
                onChange={(e) => setMergeName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="merge-type" className="text-right">
                Tipo
              </Label>
              <Select value={mergeType} onValueChange={(val) => setMergeType(val as SegmentType)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Tipo de segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SegmentType.CICLOFAIXA}>Ciclofaixa</SelectItem>
                  <SelectItem value={SegmentType.CICLOVIA}>Ciclovia</SelectItem>
                  <SelectItem value={SegmentType.CICLORROTA}>Ciclorrota</SelectItem>
                  <SelectItem value={SegmentType.COMPARTILHADA}>Compartilhada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleMergeConfirm}>
              Mesclar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
