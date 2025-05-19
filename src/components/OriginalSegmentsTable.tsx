
import { useState, useRef } from "react";
import { Segment, SegmentType } from "@/types";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Pencil, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface SegmentsTableProps {
  segments: Segment[];
  onSelectSegment?: (id: string, selected: boolean) => void;
  onUpdateSegmentName?: (id: string, newName: string) => void;
  hideSelectColumn?: boolean;
  hideNameEditing?: boolean;
}

const OriginalSegmentsTable = ({ 
  segments, 
  onSelectSegment, 
  onUpdateSegmentName,
  hideSelectColumn = false,
  hideNameEditing = false
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
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Extensão (km)</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {segments.map(segment => (
            <TableRow key={segment.id} className={segment.evaluated ? "bg-muted/30" : undefined}>
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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={saveNameChange}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={cancelEditing}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{segment.name}</span>
                    {!hideNameEditing && onUpdateSegmentName && !segment.evaluated && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => startEditing(segment)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
                    {segment.evaluated && (
                      <Badge variant="outline" className="ml-2">Avaliado</Badge>
                    )}
                  </div>
                )}
              </TableCell>
              
              <TableCell>{getSegmentTypeBadge(segment.type)}</TableCell>
              
              <TableCell className="text-right">{segment.length.toFixed(4)}</TableCell>
              
              <TableCell className="text-right">
                {segment.evaluated ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/avaliar/formulario/${segment.id}`}>
                      Ver Avaliação
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/avaliar/formulario/${segment.id}`}>
                      Avaliar
                    </Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OriginalSegmentsTable;
