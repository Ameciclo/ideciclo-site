
import { useState, useEffect } from 'react';
import { Segment, SegmentType } from '@/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import OriginalSegmentsTable from './OriginalSegmentsTable';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';

interface OriginalSegmentsTableProps {
  segments: Segment[];
  showSortOptions?: boolean;
  onSelectSegment?: (id: string, selected: boolean) => void;
  onMergeSelected?: () => Promise<void>;
  selectedSegmentsCount?: number;
  onMergeDataChange?: React.Dispatch<React.SetStateAction<{
    name: string;
    type: any;
  } | null>>;
  onUpdateSegmentName?: (segmentId: string, newName: string) => Promise<void>;
}

export const TableSortableWrapper = ({ 
  segments: initialSegments, 
  showSortOptions = false,
  onSelectSegment,
  onMergeSelected,
  selectedSegmentsCount,
  onMergeDataChange,
  onUpdateSegmentName,
}: OriginalSegmentsTableProps) => {
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [minLength, setMinLength] = useState<string>("");
  const [maxLength, setMaxLength] = useState<string>("");
  const [segments, setSegments] = useState<Segment[]>(initialSegments);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; // Number of items per page

  // Update segments when initialSegments change
  useEffect(() => {
    if (JSON.stringify(initialSegments) !== JSON.stringify(segments)) {
      setSegments(initialSegments);
      setCurrentPage(1); // Reset to first page when segments change
    }
  }, [initialSegments]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  // Filter and sort segments
  const filteredAndSortedSegments = () => {
    return [...initialSegments]
      .filter(segment => {
        // Filter by rating (currently a placeholder as we don't have ratings yet)
        if (selectedRating !== "all") {
          // We would filter by rating here if we had rating data
          return true; // For now just return all
        }
        return true;
      })
      .filter(segment => {
        // Filter by segment type
        if (selectedType !== "all") {
          return segment.type === selectedType;
        }
        return true;
      })
      .filter(segment => {
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
  const currentItems = processedSegments.slice(indexOfFirstItem, indexOfLastItem);
  
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  // Generate page numbers for pagination
  const pageNumbers = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, 4, 'ellipsis', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
    }
  }
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRating, selectedType, minLength, maxLength, sortDirection]);

  // Based on the props passed, determine which version to show
  if (onSelectSegment && onUpdateSegmentName) {
    // This is the "Refine Data" page version with selection, merging, and name editing
    return (
      <div>
        {showSortOptions && (
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleSortDirection}
              >
                Ordenar por Nome {sortDirection === "asc" ? "↑" : "↓"}
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
              
              <div className="flex items-center gap-2">
                <Label htmlFor="filter-type">Filtrar por tipo:</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="CICLOVIA">Ciclovia</SelectItem>
                    <SelectItem value="CICLOFAIXA">Ciclofaixa</SelectItem>
                    <SelectItem value="CICLORROTA">Ciclorrota</SelectItem>
                    <SelectItem value="COMPARTILHADA">Compartilhada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSegmentsCount !== undefined && selectedSegmentsCount > 0 && onMergeSelected && (
                <Button 
                  onClick={() => onMergeSelected()}
                  disabled={selectedSegmentsCount < 2}
                >
                  Mesclar {selectedSegmentsCount} segmentos
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="min-length">Extensão mínima (km):</Label>
                <Input 
                  id="min-length" 
                  type="number" 
                  className="w-[100px]" 
                  value={minLength} 
                  onChange={(e) => setMinLength(e.target.value)}
                  step="0.001"
                  min="0"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="max-length">Extensão máxima (km):</Label>
                <Input 
                  id="max-length" 
                  type="number" 
                  className="w-[100px]" 
                  value={maxLength} 
                  onChange={(e) => setMaxLength(e.target.value)}
                  step="0.001"
                  min={minLength || "0"}
                />
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setMinLength("");
                  setMaxLength("");
                  setSelectedType("all");
                  setSelectedRating("all");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        )}
        
        <OriginalSegmentsTable 
          segments={currentItems}
          onSelectSegment={onSelectSegment}
          onUpdateSegmentName={onUpdateSegmentName}
          hideSelectColumn={false}
          hideNameEditing={false}
        />
        
        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => paginate(currentPage - 1)} />
              </PaginationItem>
              
              {pageNumbers.map((page, index) => (
                page === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={`page-${page}`}>
                    <PaginationLink 
                      isActive={page === currentPage} 
                      onClick={() => paginate(page as number)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}
              
              <PaginationItem>
                <PaginationNext onClick={() => paginate(currentPage + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
        
        <div className="mt-2 text-sm text-gray-500">
          Mostrando {Math.min(indexOfFirstItem + 1, processedSegments.length)}-{Math.min(indexOfLastItem, processedSegments.length)} de {processedSegments.length} segmentos
        </div>
      </div>
    );
  }

  // Otherwise, this is the "Evaluation" page version without selection and merging
  return (
    <div>
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleSortDirection}
          >
            Ordenar por Nome {sortDirection === "asc" ? "↑" : "↓"}
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
          
          <div className="flex items-center gap-2">
            <Label htmlFor="filter-type">Filtrar por tipo:</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="CICLOVIA">Ciclovia</SelectItem>
                <SelectItem value="CICLOFAIXA">Ciclofaixa</SelectItem>
                <SelectItem value="CICLORROTA">Ciclorrota</SelectItem>
                <SelectItem value="COMPARTILHADA">Compartilhada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="min-length">Extensão mínima (km):</Label>
            <Input 
              id="min-length" 
              type="number" 
              className="w-[100px]" 
              value={minLength} 
              onChange={(e) => setMinLength(e.target.value)}
              step="0.001"
              min="0"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="max-length">Extensão máxima (km):</Label>
            <Input 
              id="max-length" 
              type="number" 
              className="w-[100px]" 
              value={maxLength} 
              onChange={(e) => setMaxLength(e.target.value)}
              step="0.001"
              min={minLength || "0"}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setMinLength("");
              setMaxLength("");
              setSelectedType("all");
              setSelectedRating("all");
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>Lista de segmentos cicloviários</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Extensão (km)</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">Nenhum segmento encontrado</TableCell>
              </TableRow>
            ) : (
              currentItems.map(segment => (
                <TableRow key={segment.id}>
                  <TableCell className="font-medium">{segment.name}</TableCell>
                  <TableCell>{segment.type}</TableCell>
                  <TableCell className="text-right">{segment.length.toFixed(4)}</TableCell>
                  <TableCell className="text-right">
                    {segment.evaluated ? "Avaliado" : "Não avaliado"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/avaliar/formulario/${segment.id}`}>
                        {segment.evaluated ? "Ver Avaliação" : "Avaliar"}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => paginate(currentPage - 1)} />
            </PaginationItem>
            
            {pageNumbers.map((page, index) => (
              page === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={`page-${page}`}>
                  <PaginationLink 
                    isActive={page === currentPage} 
                    onClick={() => paginate(page as number)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            ))}
            
            <PaginationItem>
              <PaginationNext onClick={() => paginate(currentPage + 1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      <div className="mt-2 text-sm text-gray-500">
        Mostrando {Math.min(indexOfFirstItem + 1, processedSegments.length)}-{Math.min(indexOfLastItem, processedSegments.length)} de {processedSegments.length} segmentos
      </div>
    </div>
  );
};

export default TableSortableWrapper;
