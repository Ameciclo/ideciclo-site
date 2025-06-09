
import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { ArrowDown, ArrowUp, Edit, Trash2, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MergedSegmentDropdown from "./MergedSegmentDropdown";

interface RefinementSegmentsTableProps {
  segments: Segment[];
  sortDirection?: "asc" | "desc";
  onToggleSortDirection?: () => void;
  onSelectSegment: (id: string, selected: boolean) => void;
  onSelectAllSegments: (segmentIds: string[], selected: boolean) => void;
  selectedSegments: Segment[];
  onUpdateSegmentName: (segmentId: string, newName: string) => Promise<void>;
  onDeleteSegment: (segmentId: string) => Promise<void>;
  onUnmergeSegments: (parentSegmentId: string, segmentIds: string[]) => Promise<void>;
}

const RefinementSegmentsTable = ({
  segments,
  sortDirection,
  onToggleSortDirection,
  onSelectSegment,
  onSelectAllSegments,
  selectedSegments,
  onUpdateSegmentName,
  onDeleteSegment,
  onUnmergeSegments,
}: RefinementSegmentsTableProps) => {
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");

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

  const handleEditStart = (segment: Segment) => {
    setEditingSegment(segment.id);
    setEditName(segment.name);
  };

  const handleEditSave = async (segmentId: string) => {
    try {
      await onUpdateSegmentName(segmentId, editName);
      setEditingSegment(null);
      setEditName("");
    } catch (error) {
      console.error("Failed to update segment name:", error);
    }
  };

  const handleEditCancel = () => {
    setEditingSegment(null);
    setEditName("");
  };

  const handleDeleteSegment = async (segmentId: string) => {
    try {
      await onDeleteSegment(segmentId);
    } catch (error) {
      console.error("Failed to delete segment:", error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    // Only select non-merged segments for merging operations
    const selectableSegmentIds = segments
      .filter(segment => !segment.is_merged)
      .map(segment => segment.id);
    onSelectAllSegments(selectableSegmentIds, checked);
  };

  const allSelectableSelected = segments
    .filter(segment => !segment.is_merged)
    .every(segment => segment.selected);

  const someSelectableSelected = segments
    .filter(segment => !segment.is_merged)
    .some(segment => segment.selected);

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>Lista de segmentos cicloviários</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelectableSelected}
                onCheckedChange={handleSelectAll}
                className={someSelectableSelected && !allSelectableSelected ? "data-[state=checked]:bg-primary/50" : ""}
              />
            </TableHead>
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
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {segments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                Nenhum segmento encontrado
              </TableCell>
            </TableRow>
          ) : (
            segments.map((segment) => (
              <TableRow
                key={segment.id}
                className={segment.evaluated ? "bg-muted/30" : undefined}
              >
                <TableCell>
                  {!segment.is_merged && (
                    <Checkbox
                      checked={segment.selected || false}
                      onCheckedChange={(checked) =>
                        onSelectSegment(segment.id, checked as boolean)
                      }
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {editingSegment === segment.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleEditSave(segment.id);
                            } else if (e.key === "Escape") {
                              handleEditCancel();
                            }
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSave(segment.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Check size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleEditCancel}
                          className="h-8 w-8 p-0"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{segment.name}</span>
                        {segment.is_merged && (
                          <Badge variant="secondary" className="text-xs">
                            Mesclado
                          </Badge>
                        )}
                      </div>
                    )}
                    <MergedSegmentDropdown 
                      segment={segment} 
                      onUnmergeSegments={onUnmergeSegments}
                    />
                  </div>
                </TableCell>
                <TableCell>{getSegmentTypeBadge(segment.type)}</TableCell>
                <TableCell className="text-right">
                  {segment.length.toFixed(4)}
                </TableCell>
                <TableCell className="text-right">
                  {segment.evaluated ? "Avaliado" : "Não avaliado"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    {editingSegment !== segment.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStart(segment)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={14} />
                      </Button>
                    )}
                    {!segment.is_merged && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSegment(segment.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`/avaliar/formulario/${
                          segment.id
                        }?data=${encodeURIComponent(
                          JSON.stringify(segment)
                        )}`}
                      >
                        {segment.evaluated ? "Ver Avaliação" : "Avaliar"}
                      </a>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RefinementSegmentsTable;
