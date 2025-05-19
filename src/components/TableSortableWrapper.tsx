
import { useState } from 'react';
import { Segment } from '@/types';
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

interface OriginalSegmentsTableProps {
  segments: Segment[];
  showSortOptions?: boolean;
}

export const TableSortableWrapper = ({ segments: initialSegments, showSortOptions = false }: OriginalSegmentsTableProps) => {
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [segments, setSegments] = useState<Segment[]>(initialSegments);

  // Update segments when initialSegments change
  if (JSON.stringify(initialSegments) !== JSON.stringify(segments)) {
    setSegments(initialSegments);
  }

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  const sortedSegments = [...segments].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    
    if (sortDirection === "asc") {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

  const filteredSegments = selectedRating === "all" 
    ? sortedSegments 
    : sortedSegments.filter(segment => {
        // Filter by rating logic would go here
        // For now just return all as we don't have ratings in our current data model
        return true;
      });

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Segmentos</h3>
        {showSortOptions && (
          <div className="flex items-center gap-4 mb-2">
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
          </div>
        )}
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
            {filteredSegments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">Nenhum segmento encontrado</TableCell>
              </TableRow>
            ) : (
              filteredSegments.map(segment => (
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
    </div>
  );
};

export default TableSortableWrapper;
