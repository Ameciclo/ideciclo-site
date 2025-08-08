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
import {
  ArrowDown,
  ArrowUp,
  Edit,
  Trash2,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MergedSegmentDropdown from "./MergedSegmentDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RefinementSegmentsTableProps {
  segments: Segment[];
  sortDirection?: "asc" | "desc";
  onToggleSortDirection?: () => void;
  onSelectSegment: (id: string, selected: boolean) => void;
  onSelectAllSegments: (segmentIds: string[], selected: boolean) => void;
  selectedSegments: Segment[];
  onUpdateSegmentName: (segmentId: string, newName: string) => Promise<void>;
  onDeleteSegment: (segmentId: string) => Promise<void>;
  onUnmergeSegments: (
    parentSegmentId: string,
    segmentIds: string[]
  ) => Promise<void>;
  onUpdateSegmentClassification?: (
    segmentId: string,
    classification: string
  ) => Promise<void>;
  onUpdateSegmentType?: (segmentId: string, type: SegmentType) => Promise<void>;
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
  onUpdateSegmentClassification,
  onUpdateSegmentType,
}: RefinementSegmentsTableProps) => {
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");

  // Available classification options
  const classificationOptions = ["estrutural", "alimentadora", "local"];

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

  const getClassificationBadge = (classification: string | undefined) => {
    switch (classification) {
      case "estrutural":
        return (
          <Badge variant="default" className="bg-blue-500">
            Estrutural
          </Badge>
        );
      case "alimentadora":
        return (
          <Badge variant="secondary" className="bg-green-500">
            Alimentadora
          </Badge>
        );
      case "local":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Local
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-gray-400 text-gray-500">
            Não classificada
          </Badge>
        );
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

  const handleUpdateClassification = async (
    segmentId: string,
    classification: string
  ) => {
    if (onUpdateSegmentClassification) {
      try {
        await onUpdateSegmentClassification(segmentId, classification);
      } catch (error) {
        console.error("Failed to update segment classification:", error);
      }
    }
  };

  const handleUpdateSegmentType = async (
    segmentId: string,
    type: SegmentType
  ) => {
    if (onUpdateSegmentType) {
      try {
        await onUpdateSegmentType(segmentId, type);
      } catch (error) {
        console.error("Failed to update segment type:", error);
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    // Get IDs of all segments on the current page
    const currentPageIds = segments.map((segment) => segment.id);
    onSelectAllSegments(currentPageIds, checked);
  };

  // Check if all segments on the current page are selected
  const allSegmentsSelected =
    segments.length > 0 &&
    segments.every((segment) =>
      selectedSegments.some((selected) => selected.id === segment.id)
    );

  // Check if some segments on the current page are selected
  const someSegmentsSelected = segments.some((segment) =>
    selectedSegments.some((selected) => selected.id === segment.id)
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>Lista de trechos cicloviários</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSegmentsSelected}
                onCheckedChange={handleSelectAll}
                className={
                  someSegmentsSelected && !allSegmentsSelected
                    ? "data-[state=checked]:bg-primary/50"
                    : ""
                }
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
            <TableHead>Classificação</TableHead>
            <TableHead className="text-right">km</TableHead>
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
            segments.map((segment, index) => (
              <TableRow
                key={`${segment.id}-${index}`}
                className={segment.evaluated ? "bg-muted/30" : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedSegments.some(
                      (selected) => selected.id === segment.id
                    )}
                    onCheckedChange={(checked) =>
                      onSelectSegment(segment.id, checked as boolean)
                    }
                  />
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
                      </div>
                    )}

                    <MergedSegmentDropdown
                      segment={segment}
                      onUnmergeSegments={onUnmergeSegments}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getSegmentTypeBadge(segment.type)}
                    {!segment.is_merged && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <ChevronDown size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {Object.values(SegmentType).map((type) => (
                            <DropdownMenuItem
                              key={type}
                              onClick={() =>
                                handleUpdateSegmentType(segment.id, type)
                              }
                            >
                              {type}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getClassificationBadge(segment.classification)}
                    {onUpdateSegmentClassification && !segment.is_merged && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <ChevronDown size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {classificationOptions.map((option) => (
                            <DropdownMenuItem
                              key={option}
                              onClick={() =>
                                handleUpdateClassification(segment.id, option)
                              }
                              className="capitalize"
                            >
                              {option}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {segment.length.toFixed(4)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
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
