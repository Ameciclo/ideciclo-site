import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Segment, SegmentType, RatingType } from "@/types";
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
import { Input } from "@/components/ui/input";
import { Search, Filter, Edit } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    types: {
      [SegmentType.CICLOFAIXA]: true,
      [SegmentType.CICLOVIA]: true,
      [SegmentType.CICLORROTA]: true,
      [SegmentType.COMPARTILHADA]: true
    },
    minLength: "",
    maxLength: ""
  });
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [selectedType, setSelectedType] = useState<SegmentType | null>(null);
  const [totalLength, setTotalLength] = useState(0);
  const [selectedSegments, setSelectedSegments] = useState<Segment[]>([]);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filter and search segments
  const filteredSegments = segments.filter(segment => {
    // Search by name
    const matchesSearch = segment.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by type
    const matchesType = filters.types[segment.type];
    
    // Filter by length
    const minLengthFilter = filters.minLength !== "" ? parseFloat(filters.minLength) : null;
    const maxLengthFilter = filters.maxLength !== "" ? parseFloat(filters.maxLength) : null;
    
    const matchesMinLength = minLengthFilter === null || segment.length >= minLengthFilter;
    const matchesMaxLength = maxLengthFilter === null || segment.length <= maxLengthFilter;
    
    return matchesSearch && matchesType && matchesMinLength && matchesMaxLength;
  });
  
  const totalPages = Math.ceil(filteredSegments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSegments = filteredSegments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when filters/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Update selected segments when segments prop changes
  useEffect(() => {
    setSelectedSegments(segments.filter(s => s.selected));
  }, [segments]);

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
    // Verificar se o segmento já foi avaliado
    const segment = segments.find(s => s.id === segmentId);
    if (segment && segment.evaluated) {
      toast({
        title: "Aviso",
        description: "Segmentos já avaliados não podem ser mesclados",
        variant: "default",
      });
      return;
    }
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
    
    // Verificar se algum segmento selecionado já foi avaliado
    const evaluatedSegments = segments
      .filter(s => s.selected && s.evaluated)
      .map(s => s.name);
    
    if (evaluatedSegments.length > 0) {
      toast({
        title: "Erro",
        description: `Os seguintes segmentos já foram avaliados e não podem ser mesclados: ${evaluatedSegments.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    
    prepareMergeData();
    setIsMergeDialogOpen(true);
  };

  const handleEvaluateSegment = (segmentId: string) => {
    navigate(`/avaliar/formulario/${segmentId}`);
  };

  const prepareMergeData = () => {
    const selected = segments.filter(s => s.selected);
    setSelectedSegments(selected);
    
    // Calculate total length
    const totalLen = selected.reduce((total, segment) => total + segment.length, 0);
    setTotalLength(totalLen);
    
    // Generate default name
    const uniqueNames = [...new Set(selected.map(s => s.name))];
    const defaultName = uniqueNames.join(" / ");
    setSelectedName(defaultName);
    
    // Check if all segments have the same type
    const uniqueTypes = [...new Set(selected.map(s => s.type))];
    setSelectedType(uniqueTypes.length === 1 ? uniqueTypes[0] as SegmentType : null);
  };

  const handleMergeConfirm = () => {
    // Validate data
    if (!selectedName.trim()) {
      toast({
        title: "Erro",
        description: "O nome do segmento não pode estar vazio",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedType === null) {
      toast({
        title: "Erro",
        description: "Selecione um tipo para o segmento",
        variant: "destructive",
      });
      return;
    }
    
    // Close dialog
    setIsMergeDialogOpen(false);
    
    // Call merge function
    onMergeSelected();
    
    // Show success message
    toast({
      title: "Segmentos mesclados",
      description: `${selectedSegments.length} segmentos mesclados com nome "${selectedName}" e extensão total de ${totalLength.toFixed(4)} km`,
    });
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleFilterChange = (key: string, value: any) => {
    if (key === 'types') {
      setFilters(prev => ({
        ...prev,
        types: {
          ...prev.types,
          [value]: !prev.types[value as SegmentType]
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    
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
        <h3 className="text-lg font-semibold">Segmentos da via ({filteredSegments.length})</h3>
        <Button 
          onClick={handleMergeClick} 
          disabled={selectedSegmentsCount < 2}
          variant="default"
        >
          Mesclar {selectedSegmentsCount > 0 ? `(${selectedSegmentsCount})` : ''}
        </Button>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Pesquisar segmentos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Filter size={16} />
              Filtros
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Tipos de segmento</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(filters.types).map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`filter-${type}`} 
                      checked={filters.types[type as SegmentType]} 
                      onCheckedChange={() => handleFilterChange('types', type)}
                    />
                    <Label htmlFor={`filter-${type}`}>{translateType(type as SegmentType)}</Label>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Extensão (km)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="min-length">Mínima</Label>
                    <Input 
                      id="min-length"
                      type="number"
                      placeholder="Min"
                      value={filters.minLength}
                      onChange={(e) => handleFilterChange('minLength', e.target.value)}
                      step="0.001"
                      min="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="max-length">Máxima</Label>
                    <Input 
                      id="max-length"
                      type="number"
                      placeholder="Max"
                      value={filters.maxLength}
                      onChange={(e) => handleFilterChange('maxLength', e.target.value)}
                      step="0.001"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rua</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Extensão (km)</TableHead>
              <TableHead>Nota Geral</TableHead>
              <TableHead>Formulário</TableHead>
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
                  <TableCell>
                    {segment.id_form ? (
                      <div className="px-2 py-0.5 rounded text-xs font-medium inline-block bg-green-100 text-green-800">
                        {/* Aqui seria onde mostraria o RatingType real */}
                        N/A
                      </div>
                    ) : (
                      <div className="px-2 py-0.5 rounded text-xs font-medium inline-block bg-gray-100 text-gray-800">
                        N/A
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEvaluateSegment(segment.id)}
                      className="flex gap-1"
                    >
                      <Edit size={14} />
                      {segment.evaluated ? "Ver" : "Avaliar"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Checkbox 
                      checked={segment.selected} 
                      disabled={segment.evaluated}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange(segment.id, checked === true)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
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

      {/* Merge Dialog */}
      <Dialog open={isMergeDialogOpen} onOpenChange={setIsMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mesclar Segmentos</DialogTitle>
            <DialogDescription>
              Configure as propriedades do segmento mesclado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="merged-name">Nome do segmento</Label>
              <Textarea 
                id="merged-name" 
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                placeholder="Nome do segmento mesclado"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Extensão total</Label>
              <div className="p-2 bg-gray-100 rounded-md font-medium">
                {totalLength.toFixed(4)} km
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de segmento</Label>
              {selectedType !== null ? (
                <div className="p-2 bg-gray-100 rounded-md">
                  {translateType(selectedType)}
                </div>
              ) : (
                <RadioGroup 
                  value={selectedType || ""} 
                  onValueChange={(value) => setSelectedType(value as SegmentType)}
                >
                  {Object.values(SegmentType).map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`type-${type}`} />
                      <Label htmlFor={`type-${type}`}>{translateType(type)}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMergeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleMergeConfirm}>
              Mesclar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SegmentsTable;
