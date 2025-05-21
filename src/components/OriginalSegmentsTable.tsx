
import { useRef, useState } from "react";
import { Segment, SegmentType } from "@/types";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowDown, ArrowUp, Check, Pencil, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SegmentsTableProps {
  segments: Segment[];
  onSelectSegment?: (id: string, selected: boolean) => void;
  onUpdateSegmentName?: (id: string, newName: string) => void;
  hideSelectColumn?: boolean;
  hideNameEditing?: boolean;
  sortDirection?: "asc" | "desc";
  onToggleSortDirection?: () => void;
  showEvaluationActions?: boolean;
}

const OriginalSegmentsTable = ({
  segments,
  onSelectSegment,
  onUpdateSegmentName,
  hideSelectColumn = false,
  hideNameEditing = false,
  sortDirection,
  onToggleSortDirection,
  showEvaluationActions = false,
}: SegmentsTableProps) => {
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = (segment: Segment) => {
    setEditingNameId(segment.id);
    setEditingName(segment.name);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const saveNameChange = () => {
    if (editingNameId && editingName.trim() && onUpdateSegmentName) {
      onUpdateSegmentName(editingNameId, editingName.trim());
    }
    cancelEditing();
  };

  const cancelEditing = () => {
    setEditingNameId(null);
    setEditingName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveNameChange();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const getSegmentTypeBadge = (type: SegmentType) => {
    switch (type) {
      case SegmentType.CICLOFAIXA:
        return <Badge variant="default">Ciclofaixa</Badge>;
      case SegmentType.CICLOVIA:
        return <Badge variant="secondary">Ciclovia</Badge>;
      case SegmentType.CICLORROTA:
        return <Badge variant="outline">Ciclorrota</Badge>;
      case SegmentType.COMPARTILHADA:
        return <Badge variant="destructive">Compartilhada</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>Lista de segmentos cicloviários</TableCaption>
        <TableHeader>
          <TableRow>
            {!hideSelectColumn && onSelectSegment && (
              <TableHead className="w-[50px]">Selecionar</TableHead>
            )}
            
            <TableHead className="flex items-center gap-2">
              Nome
              {sortDirection !== undefined && onToggleSortDirection && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-6 w-6"
                  onClick={onToggleSortDirection}
                >
                  {sortDirection === "asc" ? (
                    <ArrowUp size={14} />
                  ) : (
                    <ArrowDown size={14} />
                  )}
                </Button>
              )}
            </TableHead>
            
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Extensão (km)</TableHead>
            
            {showEvaluationActions && (
              <>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {segments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showEvaluationActions ? 5 : 3} className="text-center py-6">
                Nenhum segmento encontrado
              </TableCell>
            </TableRow>
          ) : (
            segments.map((segment) => (
              <TableRow
                key={segment.id}
                className={segment.evaluated ? "bg-muted/30" : undefined}
              >
                {!hideSelectColumn && onSelectSegment && (
                  <TableCell>
                    <Checkbox
                      checked={segment.selected}
                      onCheckedChange={(checked) => {
                        onSelectSegment(segment.id, !!checked);
                      }}
                      disabled={segment.evaluated}
                    />
                  </TableCell>
                )}

                <TableCell>
                  {editingNameId === segment.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="border rounded px-2 py-1 w-full"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={saveNameChange}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={cancelEditing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{segment.name}</span>
                      {!hideNameEditing &&
                        onUpdateSegmentName &&
                        !segment.evaluated && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => startEditing(segment)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                      {segment.evaluated && (
                        <Badge variant="outline" className="ml-2">
                          Avaliado
                        </Badge>
                      )}
                    </div>
                  )}
                </TableCell>

                <TableCell>{getSegmentTypeBadge(segment.type)}</TableCell>

                <TableCell className="text-right">
                  {segment.length.toFixed(4)}
                </TableCell>
                
                {showEvaluationActions && (
                  <>
                    <TableCell className="text-right">
                      {segment.evaluated ? "Avaliado" : "Não avaliado"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/avaliar/formulario/${segment.id}`}>
                          {segment.evaluated ? "Ver Avaliação" : "Avaliar"}
                        </a>
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OriginalSegmentsTable;
