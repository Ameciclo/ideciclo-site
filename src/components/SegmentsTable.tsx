
import { useState } from "react";
import { Segment, SegmentType } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious
} from "@/components/ui/pagination";

interface SegmentsTableProps {
  segments: Segment[];
  onSelectSegment: (id: string, selected: boolean) => void;
  onMergeSelected: () => void;
  selectedSegmentsCount: number;
}

const ITEMS_PER_PAGE = 10;

const SegmentsTable = ({ 
  segments, 
  onSelectSegment, 
  onMergeSelected,
  selectedSegmentsCount
}: SegmentsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const totalPages = Math.ceil(segments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSegments = segments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const translateType = (type: SegmentType): string => {
    switch (type) {
      case SegmentType.CICLOFAIXA:
        return "Ciclofaixa";
      case SegmentType.CICLOVIA:
        return "Ciclovia";
      case SegmentType.CICLORROTA:
        return "Ciclorrota";
      case SegmentType.COMPARTILHADA:
        return "Compartilhada";
      default:
        return type;
    }
  };

  const handleCheckboxChange = (segmentId: string, checked: boolean) => {
    onSelectSegment(segmentId, checked);
  };

  const handleMergeClick = () => {
    if (selectedSegmentsCount < 2) {
      toast({
        title: "Aviso",
        description: "Selecione pelo menos 2 segmentos para mesclar",
        variant: "default",
      });
      return;
    }
    
    onMergeSelected();
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          isActive={currentPage === 1} 
          onClick={() => goToPage(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i} 
            onClick={() => goToPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if it's different from the first
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            isActive={currentPage === totalPages} 
            onClick={() => goToPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Segmentos da via ({segments.length})</h3>
        <Button 
          onClick={handleMergeClick} 
          disabled={selectedSegmentsCount < 2}
          variant="default"
        >
          Mesclar {selectedSegmentsCount > 0 ? `(${selectedSegmentsCount})` : ''}
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rua</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Extensão (km)</TableHead>
              <TableHead>Nota Geral</TableHead>
              <TableHead className="w-[100px]">Selecionar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSegments.length > 0 ? (
              paginatedSegments.map((segment) => (
                <TableRow key={segment.id}>
                  <TableCell>{segment.name}</TableCell>
                  <TableCell>{translateType(segment.type)}</TableCell>
                  <TableCell className="text-right">{segment.length.toFixed(4)}</TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>
                    <Checkbox 
                      checked={segment.selected} 
                      onCheckedChange={(checked) => 
                        handleCheckboxChange(segment.id, checked === true)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Nenhum segmento encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationPrevious 
              onClick={() => goToPage(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
            
            {renderPaginationItems()}
            
            <PaginationNext 
              onClick={() => goToPage(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default SegmentsTable;
