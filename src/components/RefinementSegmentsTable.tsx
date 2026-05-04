import React, { useState } from "react";
import { Segment, SegmentType } from "@/types";
import { ParsedOsmAdvancedSegment } from "@/services/osmAdvancedParser";
import { fetchSegmentOsmAdvancedData } from "@/services/api";
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
import {
  ArrowDown,
  ArrowUp,
  Edit,
  Trash2,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RefinementSegmentsTableProps {
  segments: Segment[];
  sortField?: "name" | "type" | "classification" | "length";
  sortDirection?: "asc" | "desc";
  onSortChange?: (field: "name" | "type" | "classification" | "length") => void;
  onSelectSegment: (id: string, selected: boolean) => void;
  onSelectAllSegments: (segmentIds: string[], selected: boolean) => void;
  selectedSegments: Segment[];
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
  onUpdateSegmentClassification?: (
    segmentId: string,
    classification: string
  ) => Promise<void>;
  onUpdateSegmentType?: (segmentId: string, type: SegmentType) => Promise<void>;
}

const RefinementSegmentsTable = ({
  segments,
  sortField,
  sortDirection,
  onSortChange,
  onSelectSegment,
  onSelectAllSegments,
  selectedSegments,
  onUpdateSegmentName,
  onUpdateSegmentTechnical,
  onDeleteSegment,
  onUnmergeSegments,
  onUpdateSegmentClassification,
  onUpdateSegmentType,
}: RefinementSegmentsTableProps) => {
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [isLoadingOsmComplement, setIsLoadingOsmComplement] = useState(false);
  const [osmComplementError, setOsmComplementError] = useState<string | null>(null);
  const [advancedByPartId, setAdvancedByPartId] = useState<
    Record<string, ParsedOsmAdvancedSegment>
  >({});
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [selectedCharacteristic, setSelectedCharacteristic] = useState<
    "velocidade" | "numeroFaixas" | "largura" | "sentido" | "posicaoNaVia" | "pavimento"
  >("velocidade");
  const [techDraft, setTechDraft] = useState({
    trechoInicio: "",
    trechoFim: "",
    posicaoNaVia: "",
    velocidade: "",
    numeroFaixas: "",
    sentido: "",
    pavimento: "",
    largura: "",
    bufferSeparacao: "",
  });

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

  const extractNumericOsmId = (value?: string): string | undefined => {
    if (!value) return undefined;
    if (/^\d+$/.test(value)) return value;
    const candidate = value.includes("_") ? value.split("_").pop() : value;
    if (candidate && /^\d+$/.test(candidate)) return candidate;
    return undefined;
  };

  const getSegmentParts = (segment: Segment | null) => {
    if (!segment) return [];

    if (
      segment.is_merged &&
      Array.isArray(segment.merged_segments) &&
      segment.merged_segments.length > 0
    ) {
      return segment.merged_segments.map((merged: any, index: number) => {
        const partId = String(merged.id ?? `parte-${index}`);
        return {
          partId,
          label: merged.name || `Trecho ${partId}`,
          osmId: extractNumericOsmId(merged.osm_id || merged.id),
        };
      });
    }

    return [
      {
        partId: segment.id,
        label: segment.name,
        osmId: extractNumericOsmId(segment.osm_id || segment.id),
      },
    ];
  };

  const segmentParts = getSegmentParts(editingSegment);
  const selectedPartAdvanced = selectedPartId ? advancedByPartId[selectedPartId] : undefined;

  const initDraft = (segment: Segment) => {
    const prefill = segment.ideciclo_prefill;
    setTechDraft({
      trechoInicio: prefill?.trechoInicio || "",
      trechoFim: prefill?.trechoFim || "",
      posicaoNaVia: prefill?.posicaoNaVia || "",
      velocidade: prefill?.velocidade || "",
      numeroFaixas:
        prefill?.numeroFaixas !== undefined ? String(prefill.numeroFaixas) : "",
      sentido: prefill?.sentido || "",
      pavimento: prefill?.pavimento || "",
      largura: prefill?.largura !== undefined ? String(prefill.largura) : "",
      bufferSeparacao: prefill?.bufferSeparacao || "",
    });
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
    setEditingSegment(segment);
    setEditName(segment.name);
    initDraft(segment);
    setOsmComplementError(null);
    setIsLoadingOsmComplement(false);
    setAdvancedByPartId({});
    setSelectedPartId("");
  };

  const handleEditSave = async () => {
    if (!editingSegment) return;
    try {
      if (editName.trim() && editName.trim() !== editingSegment.name.trim()) {
        await onUpdateSegmentName(editingSegment.id, editName.trim());
      }
      if (onUpdateSegmentTechnical) {
        const parsedNumeroFaixas =
          techDraft.numeroFaixas.trim() === ""
            ? undefined
            : Number(techDraft.numeroFaixas);
        const parsedLargura =
          techDraft.largura.trim() === "" ? undefined : Number(techDraft.largura);

        const selectedData = selectedPartAdvanced;
        const prefillFromSelection = selectedData?.ideciclo_prefill;
        const confidenceFromSelection = selectedData?.osm_confidence;

        await onUpdateSegmentTechnical(editingSegment.id, {
          ideciclo_prefill: {
            ...editingSegment.ideciclo_prefill,
            ...(prefillFromSelection || {}),
            trechoInicio: techDraft.trechoInicio.trim(),
            trechoFim: techDraft.trechoFim.trim(),
            posicaoNaVia: techDraft.posicaoNaVia.trim(),
            velocidade: techDraft.velocidade.trim(),
            numeroFaixas: Number.isFinite(parsedNumeroFaixas)
              ? parsedNumeroFaixas
              : undefined,
            sentido: techDraft.sentido.trim(),
            pavimento: techDraft.pavimento.trim(),
            largura: Number.isFinite(parsedLargura) ? parsedLargura : undefined,
            bufferSeparacao: techDraft.bufferSeparacao.trim(),
            pendenciasCampo:
              prefillFromSelection?.pendenciasCampo ||
              editingSegment.ideciclo_prefill?.pendenciasCampo ||
              [],
          },
          osm_confidence: confidenceFromSelection || editingSegment.osm_confidence,
          osm_tags: selectedData?.osm_tags || editingSegment.osm_tags,
          osm_raw: selectedData?.osm_raw || editingSegment.osm_raw,
          osm_improvement_suggestions:
            selectedData?.osm_improvement_suggestions ||
            editingSegment.osm_improvement_suggestions,
          intersections_preview:
            selectedData?.intersections_preview || editingSegment.intersections_preview,
          estimated_blocks_count:
            selectedData?.estimated_blocks_count ??
            editingSegment.estimated_blocks_count,
          estimated_intersections_count:
            selectedData?.estimated_intersections_count ??
            editingSegment.estimated_intersections_count,
          blocks_count:
            selectedData?.estimated_blocks_count ?? editingSegment.blocks_count,
          intersections_count:
            selectedData?.estimated_intersections_count ??
            editingSegment.intersections_count,
        });
      }
      setEditingSegment(null);
      setEditName("");
    } catch (error) {
      console.error("Failed to update segment name:", error);
    }
  };

  const handleEditCancel = () => {
    setEditingSegment(null);
    setEditName("");
    setOsmComplementError(null);
    setIsLoadingOsmComplement(false);
    setAdvancedByPartId({});
    setSelectedPartId("");
  };

  const handleFetchOsmComplement = async () => {
    if (!editingSegment) return;

    const partsWithIds = segmentParts.filter((part) => Boolean(part.osmId));
    if (partsWithIds.length === 0) {
      setOsmComplementError(
        "Não há OSM ID válido para este trecho. Preencha manualmente no formulário."
      );
      return;
    }

    try {
      setIsLoadingOsmComplement(true);
      setOsmComplementError(null);

      const results = await fetchSegmentOsmAdvancedData(
        partsWithIds.map((part) => part.osmId as string)
      );

      const byOsmId = new Map<string, ParsedOsmAdvancedSegment>();
      results.forEach((item) => {
        byOsmId.set(item.osm_id, item);
      });

      const byPart: Record<string, ParsedOsmAdvancedSegment> = {};
      partsWithIds.forEach((part) => {
        if (!part.osmId) return;
        const found = byOsmId.get(part.osmId);
        if (found) {
          byPart[part.partId] = found;
        }
      });

      if (Object.keys(byPart).length === 0) {
        setOsmComplementError(
          "Nenhum dado complementar foi retornado pelo OSM para estes IDs."
        );
      }

      setAdvancedByPartId(byPart);

      if (!selectedPartId) {
        const firstKey = Object.keys(byPart)[0];
        if (firstKey) {
          setSelectedPartId(firstKey);
        }
      }
    } catch (error) {
      console.error("Failed to fetch advanced OSM data:", error);
      setOsmComplementError(
        error instanceof Error
          ? error.message
          : "Falha ao baixar complemento técnico do OSM."
      );
    } finally {
      setIsLoadingOsmComplement(false);
    }
  };

  const getConfidenceBadge = (confidence: string | undefined) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-emerald-600 text-white">alta</Badge>;
      case "medium":
        return <Badge className="bg-amber-500 text-white">média</Badge>;
      case "low":
        return <Badge variant="secondary">baixa</Badge>;
      default:
        return <Badge variant="outline">desconhecida</Badge>;
    }
  };

  const getCharacteristicValue = (
    data: ParsedOsmAdvancedSegment,
    characteristic: "velocidade" | "numeroFaixas" | "largura" | "sentido" | "posicaoNaVia" | "pavimento"
  ) => {
    const p = data.ideciclo_prefill;
    switch (characteristic) {
      case "velocidade":
        return p.velocidade ? `${p.velocidade} km/h` : "sem dado";
      case "numeroFaixas":
        return p.numeroFaixas !== undefined ? String(p.numeroFaixas) : "sem dado";
      case "largura":
        return p.largura !== undefined ? `${p.largura} m` : "sem dado";
      case "sentido":
        return p.sentido || "sem dado";
      case "posicaoNaVia":
        return p.posicaoNaVia || "sem dado";
      case "pavimento":
        return p.pavimento || "sem dado";
      default:
        return "sem dado";
    }
  };

  const applySelectedPartToDraft = (partId: string) => {
    setSelectedPartId(partId);
    const selected = advancedByPartId[partId];
    if (!selected) return;
    const prefill = selected.ideciclo_prefill;
    setTechDraft((prev) => ({
      ...prev,
      posicaoNaVia: prefill.posicaoNaVia || prev.posicaoNaVia,
      velocidade: prefill.velocidade || prev.velocidade,
      numeroFaixas:
        prefill.numeroFaixas !== undefined ? String(prefill.numeroFaixas) : prev.numeroFaixas,
      sentido: prefill.sentido || prev.sentido,
      pavimento: prefill.pavimento || prev.pavimento,
      largura: prefill.largura !== undefined ? String(prefill.largura) : prev.largura,
      bufferSeparacao: prefill.bufferSeparacao || prev.bufferSeparacao,
    }));
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

  const renderSortButton = (
    field: "name" | "type" | "classification" | "length",
    label: string,
    align: "left" | "right" = "left"
  ) => (
    <div
      className={`flex items-center gap-2 ${
        align === "right" ? "justify-end" : ""
      }`}
    >
      <span>{label}</span>
      {sortDirection !== undefined && onSortChange && (
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-6 w-6"
          onClick={() => onSortChange(field)}
        >
          {sortField === field ? (
            sortDirection === "asc" ? (
              <ArrowUp size={14} />
            ) : (
              <ArrowDown size={14} />
            )
          ) : (
            <ArrowUp size={14} className="opacity-30" />
          )}
        </Button>
      )}
    </div>
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
            <TableHead>{renderSortButton("name", "Nome")}</TableHead>
            <TableHead>{renderSortButton("type", "Tipo")}</TableHead>
            <TableHead>{renderSortButton("classification", "Hierarquia da via")}</TableHead>
            <TableHead className="text-right">
              {renderSortButton("length", "km", "right")}
            </TableHead>
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
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{segment.name}</span>
                      {segment.is_merged && (
                        <Badge variant="secondary" className="text-xs">
                          Mesclado
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStart(segment)}
                        className="h-8 w-8 p-0"
                        title="Editar trecho e complemento técnico"
                      >
                        <Edit size={14} />
                      </Button>
                    </div>

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

      <Sheet
        open={Boolean(editingSegment)}
        onOpenChange={(open) => {
          if (!open) handleEditCancel();
        }}
      >
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Editar trecho e complemento técnico</SheetTitle>
            <SheetDescription>
              Ajuste o nome do trecho e revise os dados técnicos extraídos do OSM.
            </SheetDescription>
          </SheetHeader>

          {editingSegment && (
            <div className="space-y-6 py-4">
              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Nome do trecho
                </h3>
                <Input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void handleEditSave();
                    }
                  }}
                />
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Complemento técnico
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => void handleFetchOsmComplement()}
                    disabled={isLoadingOsmComplement}
                  >
                    {isLoadingOsmComplement ? "Baixando..." : "Baixar dados do OSM"}
                  </Button>
                  <Select
                    value={selectedCharacteristic}
                    onValueChange={(value) =>
                      setSelectedCharacteristic(
                        value as
                          | "velocidade"
                          | "numeroFaixas"
                          | "largura"
                          | "sentido"
                          | "posicaoNaVia"
                          | "pavimento"
                      )
                    }
                  >
                    <SelectTrigger className="w-[260px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="velocidade">Velocidade máxima</SelectItem>
                      <SelectItem value="numeroFaixas">Número de faixas</SelectItem>
                      <SelectItem value="largura">Largura</SelectItem>
                      <SelectItem value="sentido">Sentido</SelectItem>
                      <SelectItem value="posicaoNaVia">Posição na via</SelectItem>
                      <SelectItem value="pavimento">Pavimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {osmComplementError && (
                  <p className="text-sm text-destructive">{osmComplementError}</p>
                )}
                {Object.keys(advancedByPartId).length > 0 ? (
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Clique em um trecho para usar seus dados como base editável.
                    </p>
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left">
                        <tr>
                          <th className="px-3 py-2">Trecho</th>
                          <th className="px-3 py-2">osm_id</th>
                          <th className="px-3 py-2">
                            Valor: {selectedCharacteristic}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {segmentParts.map((part) => {
                          const advanced = advancedByPartId[part.partId];
                          return (
                            <tr
                              key={part.partId}
                              className={`border-t cursor-pointer ${
                                selectedPartId === part.partId ? "bg-muted" : ""
                              }`}
                              onClick={() => applySelectedPartToDraft(part.partId)}
                            >
                              <td className="px-3 py-2">{part.label}</td>
                              <td className="px-3 py-2">{part.osmId || "-"}</td>
                              <td className="px-3 py-2">
                                {advanced
                                  ? getCharacteristicValue(advanced, selectedCharacteristic)
                                  : "sem dados"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Baixe os dados do OSM para comparar os trechos por característica.
                  </p>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Resumo técnico editável
                </h3>
                <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Trecho início</p>
                    <Input
                      value={techDraft.trechoInicio}
                      onChange={(event) =>
                        setTechDraft((prev) => ({
                          ...prev,
                          trechoInicio: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Trecho fim</p>
                    <Input
                      value={techDraft.trechoFim}
                      onChange={(event) =>
                        setTechDraft((prev) => ({ ...prev, trechoFim: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Posição na via</p>
                    <Input
                      value={techDraft.posicaoNaVia}
                      onChange={(event) =>
                        setTechDraft((prev) => ({ ...prev, posicaoNaVia: event.target.value }))
                      }
                    />
                    {getConfidenceBadge(
                      selectedPartAdvanced?.osm_confidence.posicaoNaVia ||
                        editingSegment.osm_confidence?.posicaoNaVia
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Velocidade</p>
                    <Input
                      value={techDraft.velocidade}
                      onChange={(event) =>
                        setTechDraft((prev) => ({ ...prev, velocidade: event.target.value }))
                      }
                      placeholder="Ex.: 30"
                    />
                    {getConfidenceBadge(
                      selectedPartAdvanced?.osm_confidence.velocidade ||
                        editingSegment.osm_confidence?.velocidade
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Faixas</p>
                    <Input
                      value={techDraft.numeroFaixas}
                      onChange={(event) =>
                        setTechDraft((prev) => ({ ...prev, numeroFaixas: event.target.value }))
                      }
                      placeholder="Ex.: 2"
                    />
                    {getConfidenceBadge(
                      selectedPartAdvanced?.osm_confidence.numeroFaixas ||
                        editingSegment.osm_confidence?.numeroFaixas
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sentido</p>
                    <Input
                      value={techDraft.sentido}
                      onChange={(event) =>
                        setTechDraft((prev) => ({ ...prev, sentido: event.target.value }))
                      }
                    />
                    {getConfidenceBadge(
                      selectedPartAdvanced?.osm_confidence.sentido ||
                        editingSegment.osm_confidence?.sentido
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pavimento</p>
                    <Input
                      value={techDraft.pavimento}
                      onChange={(event) =>
                        setTechDraft((prev) => ({ ...prev, pavimento: event.target.value }))
                      }
                    />
                    {getConfidenceBadge(
                      selectedPartAdvanced?.osm_confidence.pavimento ||
                        editingSegment.osm_confidence?.pavimento
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Largura</p>
                    <Input
                      value={techDraft.largura}
                      onChange={(event) =>
                        setTechDraft((prev) => ({ ...prev, largura: event.target.value }))
                      }
                      placeholder="Ex.: 2.4"
                    />
                    {getConfidenceBadge(
                      selectedPartAdvanced?.osm_confidence.largura ||
                        editingSegment.osm_confidence?.largura
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Buffer/separação</p>
                    <Input
                      value={techDraft.bufferSeparacao}
                      onChange={(event) =>
                        setTechDraft((prev) => ({
                          ...prev,
                          bufferSeparacao: event.target.value,
                        }))
                      }
                    />
                    {getConfidenceBadge(
                      selectedPartAdvanced?.osm_confidence.bufferSeparacao ||
                        editingSegment.osm_confidence?.bufferSeparacao
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Tags de referência
                </h3>
                {(selectedPartAdvanced?.osm_tags &&
                  Object.keys(selectedPartAdvanced.osm_tags).length > 0) ||
                (editingSegment.osm_tags && Object.keys(editingSegment.osm_tags).length > 0) ? (
                  <div className="max-h-40 overflow-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left">
                        <tr>
                          <th className="px-3 py-2">Tag</th>
                          <th className="px-3 py-2">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(
                          selectedPartAdvanced?.osm_tags || editingSegment.osm_tags || {}
                        ).map(([key, value]) => (
                          <tr key={key} className="border-t align-top">
                            <td className="px-3 py-2 font-mono text-xs">{key}</td>
                            <td className="px-3 py-2">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma tag OSM disponível neste trecho.
                  </p>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Pendências para campo
                </h3>
                {(selectedPartAdvanced?.ideciclo_prefill.pendenciasCampo?.length ||
                  editingSegment.ideciclo_prefill?.pendenciasCampo?.length) ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {(selectedPartAdvanced?.ideciclo_prefill.pendenciasCampo ||
                      editingSegment.ideciclo_prefill?.pendenciasCampo ||
                      []
                    ).map((pending) => (
                      <li key={pending}>{pending}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sem pendências críticas detectadas para este trecho.
                  </p>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Interseções e quadras estimadas
                </h3>
                <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Interseções estimadas</p>
                    <p className="text-lg font-semibold">
                      {selectedPartAdvanced?.estimated_intersections_count ??
                        editingSegment.estimated_intersections_count ??
                        0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quadras estimadas</p>
                    <p className="text-lg font-semibold">
                      {selectedPartAdvanced?.estimated_blocks_count ??
                        editingSegment.estimated_blocks_count ??
                        1}
                    </p>
                  </div>
                </div>
                {(selectedPartAdvanced?.intersections_preview?.length ||
                  editingSegment.intersections_preview?.length) ? (
                  <div className="max-h-48 overflow-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left">
                        <tr>
                          <th className="px-3 py-2">Via</th>
                          <th className="px-3 py-2">Highway</th>
                          <th className="px-3 py-2">Hierarquia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedPartAdvanced?.intersections_preview ||
                          editingSegment.intersections_preview ||
                          []
                        )
                          .slice(0, 40)
                          .map((item) => (
                            <tr key={`${item.pointKey}-${item.roadId}`} className="border-t">
                              <td className="px-3 py-2">
                                {item.roadName || `Via ${item.roadId}`}
                              </td>
                              <td className="px-3 py-2">{item.highway || "-"}</td>
                              <td className="px-3 py-2">
                                {item.hierarchy || "não classificada"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Não foi possível estimar interseções com os dados disponíveis.
                  </p>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Sugestões para o OSM
                </h3>
                {(selectedPartAdvanced?.osm_improvement_suggestions?.length ||
                  editingSegment.osm_improvement_suggestions?.length) ? (
                  <div className="space-y-2">
                    {(selectedPartAdvanced?.osm_improvement_suggestions ||
                      editingSegment.osm_improvement_suggestions ||
                      []
                    ).map((suggestion, index) => (
                      <div key={`${suggestion.field}-${index}`} className="rounded-md border p-3">
                        <p className="text-sm font-semibold">
                          {suggestion.field}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            ({suggestion.priority})
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Tags sugeridas: {suggestion.suggestedTags.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sem sugestões automáticas de melhoria para este trecho.
                  </p>
                )}
              </section>
            </div>
          )}

          <SheetFooter>
            <Button variant="outline" onClick={handleEditCancel}>
              Cancelar
            </Button>
            <Button onClick={() => void handleEditSave()}>
              Salvar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default RefinementSegmentsTable;
