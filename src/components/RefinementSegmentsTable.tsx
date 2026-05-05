import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  Check,
  Trash2,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getHierarchyBadgeClassName,
  getSegmentTypeBadgeClassName,
} from "@/utils/segmentBadgeStyles";

const SPEED_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];

const FLOW_OPTIONS = [
  {
    value: "unidirectional",
    label: "Unidirecional",
    icon: "/icones/one-way-cycle.svg",
  },
  {
    value: "bidirectional",
    label: "Bidirecional",
    icon: "/icones/two-way-cycle.svg",
  },
] as const;

const POSITION_OPTIONS = [
  {
    value: "canteiro",
    label: "Sobre o canteiro",
    icon: "/icones/sobre-canteiro.svg",
  },
  {
    value: "pista_canteiro",
    label: "Pista, junto ao canteiro",
    icon: "/icones/proximo-canteiro.svg",
  },
  {
    value: "pista_calcada",
    label: "Pista, junto à calçada",
    icon: "/icones/pista-junto-calcada.svg",
  },
  {
    value: "calcada",
    label: "Sobre a calçada",
    icon: "/icones/na-calcada.svg",
  },
  {
    value: "centro_pista",
    label: "Centro da pista",
    icon: "/icones/centro-pista.svg",
  },
  {
    value: "isolada",
    label: "Isolada",
    icon: "/icones/isolada.svg",
  },
] as const;

type FlowValue = (typeof FLOW_OPTIONS)[number]["value"];
type PositionValue = (typeof POSITION_OPTIONS)[number]["value"];
type OptionalFlowValue = FlowValue | "";
type OptionalPositionValue = PositionValue | "";

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
  technicalOpen?: boolean;
  technicalSegment?: Segment | null;
  onFocusGeometryChange?: (geometry: any | null) => void;
  technicalPanelContainer?: HTMLElement | null;
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
  technicalOpen = false,
  technicalSegment = null,
  onFocusGeometryChange,
  technicalPanelContainer = null,
}: RefinementSegmentsTableProps) => {
  const [editingNameSegmentId, setEditingNameSegmentId] = useState<string | null>(null);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [isLoadingOsmComplement, setIsLoadingOsmComplement] = useState(false);
  const [osmComplementError, setOsmComplementError] = useState<string | null>(null);
  const [advancedByPartId, setAdvancedByPartId] = useState<
    Record<string, ParsedOsmAdvancedSegment>
  >({});
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [selectedCharacteristic, setSelectedCharacteristic] = useState<
    | "tipologia"
    | "hierarquia"
    | "velocidade"
    | "numeroFaixas"
    | "largura"
    | "sentido"
    | "posicaoNaVia"
    | "pavimento"
  >("velocidade");
  const [fetchScope, setFetchScope] = useState<"all" | "selected">("all");
  const [techDraft, setTechDraft] = useState({
    trechoInicio: "",
    trechoFim: "",
    posicaoNaVia: "" as OptionalPositionValue,
    velocidade: "",
    numeroFaixas: "" as number | "",
    sentido: "" as OptionalFlowValue,
    pavimento: "",
    largura: "",
    bufferSeparacao: "",
    quadrasEstimadas: 1,
    intersecoesEstimadas: 0,
  });
  const [typeDraft, setTypeDraft] = useState<SegmentType | "">("");
  const [classificationDraft, setClassificationDraft] = useState<string>("");

  // Available classification options
  const classificationOptions = ["estrutural", "alimentadora", "local"];

  const getSegmentTypeBadge = (type: SegmentType) => {
    return (
      <Badge className={getSegmentTypeBadgeClassName(type)}>
        {type || "Sem tipologia"}
      </Badge>
    );
  };

  const extractNumericOsmId = (value?: string): string | undefined => {
    if (!value) return undefined;
    if (/^\d+$/.test(value)) return value;
    const candidate = value.includes("_") ? value.split("_").pop() : value;
    if (candidate && /^\d+$/.test(candidate)) return candidate;
    return undefined;
  };

  const clampMinimumOne = (value: number) => Math.max(1, Math.round(value));
  const clampNonNegative = (value: number) => Math.max(0, Math.round(value));

  const inferFlowValue = (raw?: string): OptionalFlowValue => {
    const normalized = (raw || "").toLowerCase();
    if (!normalized.trim()) return "";
    if (normalized.includes("bi")) return "bidirectional";
    return "unidirectional";
  };

  const inferPositionValue = (raw?: string): OptionalPositionValue => {
    const normalized = (raw || "").toLowerCase();
    if (!normalized.trim()) return "";
    if (normalized === "canteiro") return "canteiro";
    if (normalized === "pista_canteiro") return "pista_canteiro";
    if (normalized === "pista_calcada") return "pista_calcada";
    if (normalized === "calcada") return "calcada";
    if (normalized === "centro_pista") return "centro_pista";
    if (normalized === "isolada") return "isolada";
    if (normalized.includes("canteiro")) return "pista_canteiro";
    if (normalized.includes("calçada") || normalized.includes("calcada")) return "calcada";
    if (normalized.includes("centro")) return "centro_pista";
    if (normalized.includes("isolada") || normalized.includes("dedicada")) return "isolada";
    return "";
  };

  const parseIntersectionPoint = (pointKey: string) => {
    const [latText, lonText] = pointKey.split(",");
    const lat = Number(latText);
    const lon = Number(lonText);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  };

  const inferEndpointRoadNamesFromAdvanced = (data: ParsedOsmAdvancedSegment) => {
    const geometry = data.osm_raw?.geometry || [];
    if (!Array.isArray(geometry) || geometry.length < 2) {
      return { trechoInicio: "", trechoFim: "" };
    }

    const preview = data.intersections_preview || [];
    if (preview.length === 0) {
      return { trechoInicio: "", trechoFim: "" };
    }

    const groupedByPoint = new Map<
      string,
      { lat: number; lon: number; roadNames: string[] }
    >();

    preview.forEach((item) => {
      const parsed = parseIntersectionPoint(item.pointKey);
      if (!parsed) return;
      const current = groupedByPoint.get(item.pointKey) || {
        lat: parsed.lat,
        lon: parsed.lon,
        roadNames: [],
      };
      if (item.roadName) {
        current.roadNames.push(item.roadName);
      }
      groupedByPoint.set(item.pointKey, current);
    });

    const candidates = Array.from(groupedByPoint.values());
    if (candidates.length === 0) {
      return { trechoInicio: "", trechoFim: "" };
    }

    const start = geometry[0];
    const end = geometry[geometry.length - 1];

    const distance2 = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) =>
      (a.lat - b.lat) ** 2 + (a.lon - b.lon) ** 2;

    const pickClosest = (target: { lat: number; lon: number }) => {
      const sorted = candidates
        .map((candidate) => ({
          candidate,
          d: distance2(candidate, target),
        }))
        .sort((left, right) => left.d - right.d);

      const closest = sorted[0]?.candidate;
      if (!closest) return "";

      const preferredName =
        closest.roadNames.find(
          (name) => name && !name.trim().toLowerCase().startsWith("via ")
        ) || closest.roadNames[0];

      return preferredName || "";
    };

    return {
      trechoInicio: pickClosest(start),
      trechoFim: pickClosest(end),
    };
  };

  const inferEndpointRoadNamesFromGroup = (
    segment: Segment,
    partsData: Record<string, ParsedOsmAdvancedSegment>
  ) => {
    const groupedByPoint = new Map<
      string,
      { key: string; lat: number; lon: number; roadNames: string[] }
    >();

    Object.values(partsData).forEach((item) => {
      (item.intersections_preview || []).forEach((preview) => {
        const parsed = parseIntersectionPoint(preview.pointKey);
        if (!parsed) return;
        const current = groupedByPoint.get(preview.pointKey) || {
          key: preview.pointKey,
          lat: parsed.lat,
          lon: parsed.lon,
          roadNames: [],
        };
        if (preview.roadName) current.roadNames.push(preview.roadName);
        groupedByPoint.set(preview.pointKey, current);
      });
    });

    const candidates = Array.from(groupedByPoint.values());
    if (candidates.length === 0) {
      return { trechoInicio: "", trechoFim: "" };
    }

    const fallbackCoordinates = Array.isArray(segment.geometry?.coordinates)
      ? segment.geometry.coordinates
      : [];

    const fallbackStart =
      fallbackCoordinates.length > 0
        ? { lon: fallbackCoordinates[0][0], lat: fallbackCoordinates[0][1] }
        : null;
    const fallbackEnd =
      fallbackCoordinates.length > 0
        ? {
            lon: fallbackCoordinates[fallbackCoordinates.length - 1][0],
            lat: fallbackCoordinates[fallbackCoordinates.length - 1][1],
          }
        : null;

    const firstMergedId = segment.merged_segments?.[0]?.id
      ? String(segment.merged_segments[0].id)
      : null;
    const lastMergedId =
      segment.merged_segments && segment.merged_segments.length > 0
        ? String(segment.merged_segments[segment.merged_segments.length - 1].id)
        : null;

    const firstGeometry = firstMergedId
      ? partsData[firstMergedId]?.osm_raw?.geometry
      : null;
    const lastGeometry = lastMergedId
      ? partsData[lastMergedId]?.osm_raw?.geometry
      : null;

    const startTarget =
      Array.isArray(firstGeometry) && firstGeometry.length > 0
        ? { lat: firstGeometry[0].lat, lon: firstGeometry[0].lon }
        : fallbackStart;

    const endTarget =
      Array.isArray(lastGeometry) && lastGeometry.length > 0
        ? {
            lat: lastGeometry[lastGeometry.length - 1].lat,
            lon: lastGeometry[lastGeometry.length - 1].lon,
          }
        : fallbackEnd;

    if (!startTarget || !endTarget) {
      return { trechoInicio: "", trechoFim: "" };
    }

    const distance2 = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) =>
      (a.lat - b.lat) ** 2 + (a.lon - b.lon) ** 2;

    const pickClosestCandidate = (
      target: { lat: number; lon: number },
      excludedKey?: string
    ) =>
      candidates
        .filter((candidate) => candidate.key !== excludedKey)
        .map((candidate) => ({ candidate, d: distance2(candidate, target) }))
        .sort((left, right) => left.d - right.d)[0]?.candidate;

    const formatRoadName = (candidate?: { roadNames: string[] }) => {
      if (!candidate) return "";
      return (
        candidate.roadNames.find(
          (name) => name && !name.toLowerCase().startsWith("via ")
        ) ||
        candidate.roadNames[0] ||
        ""
      );
    };

    const startCandidate = pickClosestCandidate(startTarget);
    let endCandidate = pickClosestCandidate(endTarget, startCandidate?.key);

    if (!endCandidate && startCandidate) {
      endCandidate = candidates
        .map((candidate) => ({ candidate, d: distance2(candidate, startCandidate) }))
        .sort((left, right) => right.d - left.d)[0]?.candidate;
    }

    return {
      trechoInicio: formatRoadName(startCandidate),
      trechoFim: formatRoadName(endCandidate),
    };
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
          osmType: merged.osm_type || "way",
          geometry: merged.geometry || null,
        };
      });
    }

    return [
      {
        partId: segment.id,
        label: segment.name,
        osmId: extractNumericOsmId(segment.osm_id || segment.id),
        osmType: segment.osm_type || "way",
        geometry: segment.geometry || null,
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
      posicaoNaVia: inferPositionValue(prefill?.posicaoNaVia),
      velocidade: prefill?.velocidade || "",
      numeroFaixas: prefill?.numeroFaixas ?? "",
      sentido: inferFlowValue(prefill?.sentido),
      pavimento: prefill?.pavimento || "",
      largura: prefill?.largura !== undefined ? String(prefill.largura) : "",
      bufferSeparacao: prefill?.bufferSeparacao || "",
      quadrasEstimadas: clampMinimumOne(
        segment.blocks_count ?? segment.estimated_blocks_count ?? 1
      ),
      intersecoesEstimadas: clampNonNegative(
        segment.intersections_count ?? segment.estimated_intersections_count ?? 0
      ),
    });
  };

  const getClassificationBadge = (classification: string | undefined) => {
    const label =
      classification === "estrutural"
        ? "Estrutural"
        : classification === "alimentadora"
          ? "Alimentadora"
          : classification === "local"
            ? "Local"
            : "Não classificada";

    return <Badge className={getHierarchyBadgeClassName(classification)}>{label}</Badge>;
  };

  const handleEditStart = (segment: Segment) => {
    setEditingSegment(segment);
    setEditName(segment.name);
    setTypeDraft(segment.type);
    setClassificationDraft(segment.classification || "");
    initDraft(segment);
    setOsmComplementError(null);
    setIsLoadingOsmComplement(false);
    setAdvancedByPartId({});
    setSelectedPartId("");
  };

  const handleNameEditStart = (segment: Segment) => {
    setEditingNameSegmentId(segment.id);
    setEditName(segment.name);
  };

  const handleNameEditCancel = () => {
    setEditingNameSegmentId(null);
    setEditName("");
  };

  const handleNameEditSave = async (segment: Segment) => {
    try {
      const nextName = editName.trim();
      if (nextName && nextName !== segment.name.trim()) {
        await onUpdateSegmentName(segment.id, nextName);
      }
      setEditingNameSegmentId(null);
      setEditName("");
    } catch (error) {
      console.error("Failed to update segment name:", error);
    }
  };

  const handleEditSave = async () => {
    if (!editingSegment) return;
    try {
      if (editName.trim() && editName.trim() !== editingSegment.name.trim()) {
        await onUpdateSegmentName(editingSegment.id, editName.trim());
      }
      if (onUpdateSegmentType && typeDraft && typeDraft !== editingSegment.type) {
        await onUpdateSegmentType(editingSegment.id, typeDraft);
      }
      if (
        onUpdateSegmentClassification &&
        (classificationDraft || "") !== (editingSegment.classification || "")
      ) {
        await onUpdateSegmentClassification(editingSegment.id, classificationDraft);
      }
      if (onUpdateSegmentTechnical) {
        const parsedNumeroFaixas =
          techDraft.numeroFaixas === "" ? NaN : Number(techDraft.numeroFaixas);
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
            posicaoNaVia: techDraft.posicaoNaVia || undefined,
            velocidade: techDraft.velocidade.trim(),
            numeroFaixas: Number.isFinite(parsedNumeroFaixas)
              ? parsedNumeroFaixas
              : undefined,
            sentido: techDraft.sentido || undefined,
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
            techDraft.quadrasEstimadas,
          estimated_intersections_count:
            techDraft.intersecoesEstimadas,
          blocks_count: techDraft.quadrasEstimadas,
          intersections_count: techDraft.intersecoesEstimadas,
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

  useEffect(() => {
    if (technicalOpen && technicalSegment) {
      handleEditStart(technicalSegment);
    }
    if (!technicalOpen) {
      setEditingSegment(null);
    }
  }, [technicalOpen, technicalSegment]);

  const handleFetchOsmComplement = async () => {
    if (!editingSegment) return;

    const targetParts =
      fetchScope === "selected" && selectedPartId
        ? segmentParts.filter((part) => part.partId === selectedPartId)
        : segmentParts;

    const partsWithIds = targetParts.filter((part) => Boolean(part.osmId));
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

      setAdvancedByPartId((prev) =>
        fetchScope === "selected" ? { ...prev, ...byPart } : byPart
      );

      if (editingSegment) {
        const mergedData = fetchScope === "selected" ? { ...advancedByPartId, ...byPart } : byPart;
        const endpoints = inferEndpointRoadNamesFromGroup(editingSegment, mergedData);
        setTechDraft((prev) => ({
          ...prev,
          trechoInicio: endpoints.trechoInicio || prev.trechoInicio,
          trechoFim: endpoints.trechoFim || prev.trechoFim,
        }));
      }

      if (!selectedPartId) {
        const firstKey = Object.keys(byPart)[0];
        if (firstKey) {
          applySelectedPartToDraft(firstKey);
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

  const selectionCardClassName = (selected: boolean) =>
    `rounded-xl border px-3 py-3 text-left transition-all ${
      selected
        ? "border-emerald-700 bg-emerald-50 shadow-sm"
        : "border-slate-200 bg-white hover:bg-slate-50"
    }`;

  const chipClassName = (selected: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
      selected
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
    }`;

  const compactChipClassName = (selected: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition ${
      selected
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
    }`;

  const TYPOLOGY_OPTIONS = [
    {
      value: SegmentType.CICLOVIA,
      label: "Ciclovia",
      className: "ideciclo-typology-chip ideciclo-typology-chip-ciclovia",
    },
    {
      value: SegmentType.CICLOFAIXA,
      label: "Ciclofaixa",
      className: "ideciclo-typology-chip ideciclo-typology-chip-ciclofaixa",
    },
    {
      value: SegmentType.COMPARTILHADA,
      label: "Calçada Partilhada",
      className: "ideciclo-typology-chip ideciclo-typology-chip-calcada",
    },
    {
      value: SegmentType.CICLORROTA,
      label: "Ciclorrota",
      className: "ideciclo-typology-chip ideciclo-typology-chip-ciclorrota",
    },
  ] as const;

  const renderStepper = ({
    label,
    value,
    min = 0,
    onDecrease,
    onIncrease,
  }: {
    label: string;
    value: number;
    min?: number;
    onDecrease: () => void;
    onIncrease: () => void;
  }) => (
    <div className="rounded-xl border p-3">
      <p className="mb-2 text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-8 w-8 rounded-full p-0 text-base"
          onClick={onDecrease}
          disabled={value <= min}
        >
          -
        </Button>
        <div className="flex min-h-[36px] min-w-[60px] items-center justify-center rounded-lg border px-2 text-base font-bold">
          {value}
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-8 w-8 rounded-full p-0 text-base"
          onClick={onIncrease}
        >
          +
        </Button>
      </div>
    </div>
  );

  const getCharacteristicValue = (
    data: ParsedOsmAdvancedSegment,
    characteristic:
      | "tipologia"
      | "hierarquia"
      | "velocidade"
      | "numeroFaixas"
      | "largura"
      | "sentido"
      | "posicaoNaVia"
      | "pavimento"
  ) => {
    const p = data.ideciclo_prefill;
    const flowLabel =
      p.sentido === "bidirectional"
        ? "Bidirecional"
        : p.sentido === "unidirectional"
          ? "Unidirecional"
          : p.sentido;
    const positionLabel =
      POSITION_OPTIONS.find((option) => option.value === (p.posicaoNaVia as PositionValue))
        ?.label || p.posicaoNaVia;
    switch (characteristic) {
      case "tipologia":
        return p.tipologia || "sem dado";
      case "hierarquia":
        return p.hierarquia || "sem dado";
      case "velocidade":
        return p.velocidade ? `${p.velocidade} km/h` : "sem dado";
      case "numeroFaixas":
        return p.numeroFaixas !== undefined ? String(p.numeroFaixas) : "sem dado";
      case "largura":
        return p.largura !== undefined ? `${p.largura} m` : "sem dado";
      case "sentido":
        return flowLabel || "sem dado";
      case "posicaoNaVia":
        return positionLabel || "sem dado";
      case "pavimento":
        return p.pavimento || "sem dado";
      default:
        return "sem dado";
    }
  };

  const applySelectedPartToDraft = (partId: string) => {
    setSelectedPartId(partId);
    const selectedPart = segmentParts.find((part) => part.partId === partId);
    const selected = advancedByPartId[partId];
    const fallbackGeometryFromOsm =
      Array.isArray(selected?.osm_raw?.geometry) && selected.osm_raw.geometry.length >= 2
        ? {
            type: "LineString",
            coordinates: selected.osm_raw.geometry.map((point) => [point.lon, point.lat]),
          }
        : null;
    onFocusGeometryChange?.(selectedPart?.geometry || fallbackGeometryFromOsm || null);
    if (!selected) return;
    const prefill = selected.ideciclo_prefill;
    setTechDraft((prev) => ({
      ...prev,
      posicaoNaVia: inferPositionValue(prefill.posicaoNaVia),
      velocidade: prefill.velocidade || prev.velocidade,
      numeroFaixas: prefill.numeroFaixas ?? prev.numeroFaixas,
      sentido: inferFlowValue(prefill.sentido),
      pavimento: prefill.pavimento || prev.pavimento,
      largura: prefill.largura !== undefined ? String(prefill.largura) : prev.largura,
      bufferSeparacao: prefill.bufferSeparacao || prev.bufferSeparacao,
      quadrasEstimadas: clampMinimumOne(
        selected.estimated_blocks_count ?? prev.quadrasEstimadas
      ),
      intersecoesEstimadas: clampNonNegative(
        selected.estimated_intersections_count ?? prev.intersecoesEstimadas
      ),
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

  const selectedPartMeta = segmentParts.find((part) => part.partId === selectedPartId);
  const osmLinkType =
    (selectedPartAdvanced?.osm_type || selectedPartMeta?.osmType || editingSegment?.osm_type || "way")
      .toLowerCase() === "relation"
      ? "relation"
      : (selectedPartAdvanced?.osm_type || selectedPartMeta?.osmType || editingSegment?.osm_type || "way")
          .toLowerCase() === "node"
        ? "node"
        : "way";
  const osmLinkId =
    selectedPartAdvanced?.osm_id || selectedPartMeta?.osmId || extractNumericOsmId(editingSegment?.osm_id);
  const osmLink = osmLinkId ? `https://www.openstreetmap.org/${osmLinkType}/${osmLinkId}` : "";

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
                      {editingNameSegmentId === segment.id ? (
                        <>
                          <Input
                            value={editName}
                            onChange={(event) => setEditName(event.target.value)}
                            className="h-8 w-[260px]"
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                void handleNameEditSave(segment);
                              } else if (event.key === "Escape") {
                                handleNameEditCancel();
                              }
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleNameEditSave(segment)}
                            className="h-8 w-8 p-0"
                            title="Salvar nome"
                          >
                            <Check size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNameEditCancel}
                            className="h-8 w-8 p-0"
                            title="Cancelar edição"
                          >
                            <X size={14} />
                          </Button>
                        </>
                      ) : (
                        <span className="font-medium">{segment.name}</span>
                      )}
                      {segment.is_merged && (
                        <Badge variant="secondary" className="text-xs">
                          Mesclado
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNameEditStart(segment)}
                        className="h-8 w-8 p-0"
                        title="Editar nome do trecho"
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

      {(() => {
        if (!(editingSegment && technicalOpen)) return null;
        const panel = (
          <div className="border-t bg-muted/10 p-4">
          <div className="mx-auto max-w-5xl space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Editar trecho e conteúdo técnico</h3>
              <p className="text-sm text-muted-foreground">
                Ajuste nome, tipologia, hierarquia e complemento técnico com o mapa disponível na página.
              </p>
            </div>
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Trechos da estrutura selecionada
                </h3>
                <div className="rounded-md border p-3">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => void handleFetchOsmComplement()}
                      disabled={
                        isLoadingOsmComplement ||
                        (fetchScope === "selected" && !selectedPartId)
                      }
                    >
                      {isLoadingOsmComplement
                        ? "Baixando..."
                        : fetchScope === "selected"
                          ? "Baixar OSM do trecho selecionado"
                          : "Baixar OSM de todos os trechos"}
                    </Button>
                    <Select
                      value={fetchScope}
                      onValueChange={(value) =>
                        setFetchScope(value as "all" | "selected")
                      }
                    >
                      <SelectTrigger className="w-[230px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Baixar todos os trechos</SelectItem>
                        <SelectItem value="selected">
                          Baixar trecho selecionado
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                            | "tipologia"
                            | "hierarquia"
                        )
                      }
                    >
                      <SelectTrigger className="w-[230px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tipologia">Tipologia</SelectItem>
                        <SelectItem value="hierarquia">Hierarquia viária</SelectItem>
                        <SelectItem value="velocidade">Velocidade máxima</SelectItem>
                        <SelectItem value="numeroFaixas">Número de faixas</SelectItem>
                        <SelectItem value="largura">Largura</SelectItem>
                        <SelectItem value="sentido">Sentido</SelectItem>
                        <SelectItem value="posicaoNaVia">Posição na via</SelectItem>
                        <SelectItem value="pavimento">Pavimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Clique na linha para definir a base do complemento técnico.
                  </p>
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-3 py-2">Trecho</th>
                        <th className="px-3 py-2">osm_id</th>
                        <th className="px-3 py-2">Valor ({selectedCharacteristic})</th>
                        <th className="px-3 py-2">Base</th>
                      </tr>
                    </thead>
                    <tbody>
                      {segmentParts.map((part) => {
                        const advanced = advancedByPartId[part.partId];
                        return (
                        <tr
                          key={`known-${part.partId}`}
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
                          <td className="px-3 py-2">
                            {selectedPartId === part.partId ? "Selecionado" : "-"}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {osmComplementError && (
                    <p className="mt-2 text-sm text-destructive">{osmComplementError}</p>
                  )}
                </div>
              </section>
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
                  Tipologia e hierarquia
                </h3>
                <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs text-muted-foreground">Tipologia</p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className={`min-h-[52px] rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                          !typeDraft
                            ? "border-black/10 bg-slate-900 text-white ring-2 ring-black/10"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                        onClick={() => setTypeDraft("" as SegmentType)}
                      >
                        Sem preenchimento
                      </button>
                      {TYPOLOGY_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`${option.className} min-h-[52px] rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                            typeDraft === option.value
                              ? "border-black/10 ring-2 ring-black/10 opacity-100 saturate-100"
                              : "border-slate-200 opacity-60 saturate-75 hover:opacity-85"
                          }`}
                          onClick={() => setTypeDraft(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs text-muted-foreground">Hierarquia</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={compactChipClassName(classificationDraft === "")}
                        onClick={() => setClassificationDraft("")}
                      >
                        Sem preenchimento
                      </button>
                      {classificationOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={compactChipClassName(classificationDraft === option)}
                          onClick={() => setClassificationDraft(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Complemento técnico
                </h3>
                <p className="text-sm text-muted-foreground">
                  Use a tabela de trechos acima para escolher a base e baixar dados do OSM.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Resumo técnico editável
                </h3>
                <div className="space-y-4 rounded-md border p-3">
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
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Sentido</p>
                    <div>
                      <button
                        type="button"
                        className={chipClassName(techDraft.sentido === "")}
                        onClick={() =>
                          setTechDraft((prev) => ({ ...prev, sentido: "" }))
                        }
                      >
                        Sem preenchimento
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {FLOW_OPTIONS.map((option) => {
                        const selected = techDraft.sentido === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={selectionCardClassName(selected)}
                            onClick={() =>
                              setTechDraft((prev) => ({ ...prev, sentido: option.value }))
                            }
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={option.icon}
                                alt={option.label}
                                className="h-10 w-10 shrink-0 object-contain"
                              />
                              <span className="text-sm font-semibold text-slate-700">
                                {option.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {getConfidenceBadge(
                      selectedPartAdvanced?.osm_confidence.sentido ||
                        editingSegment.osm_confidence?.sentido
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Posição na via</p>
                    <div>
                      <button
                        type="button"
                        className={chipClassName(techDraft.posicaoNaVia === "")}
                        onClick={() =>
                          setTechDraft((prev) => ({ ...prev, posicaoNaVia: "" }))
                        }
                      >
                        Sem preenchimento
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {POSITION_OPTIONS.map((option) => {
                        const selected = techDraft.posicaoNaVia === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={selectionCardClassName(selected)}
                            onClick={() =>
                              setTechDraft((prev) => ({
                                ...prev,
                                posicaoNaVia: option.value,
                              }))
                            }
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={option.icon}
                                alt={option.label}
                                className="h-10 w-10 shrink-0 object-contain"
                              />
                              <span className="text-sm font-semibold text-slate-700">
                                {option.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {getConfidenceBadge(
                      selectedPartAdvanced?.osm_confidence.posicaoNaVia ||
                        editingSegment.osm_confidence?.posicaoNaVia
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Velocidade máxima regulamentada</p>
                    <div>
                      <button
                        type="button"
                        className={chipClassName(techDraft.velocidade === "")}
                        onClick={() =>
                          setTechDraft((prev) => ({ ...prev, velocidade: "" }))
                        }
                      >
                        Sem preenchimento
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                      {SPEED_OPTIONS.map((speed) => {
                        const selected = Number(techDraft.velocidade) === speed;
                        return (
                          <button
                            key={speed}
                            type="button"
                            className={`flex w-full justify-center ${selectionCardClassName(selected)}`}
                            onClick={() =>
                              setTechDraft((prev) => ({ ...prev, velocidade: String(speed) }))
                            }
                          >
                            <img
                              src={`/icones/${speed}-speed.svg`}
                              alt={`${speed} km/h`}
                              className="h-12 w-12 object-contain"
                            />
                          </button>
                        );
                      })}
                    </div>
                    {getConfidenceBadge(
                      selectedPartAdvanced?.osm_confidence.velocidade ||
                        editingSegment.osm_confidence?.velocidade
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Número de faixas</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={chipClassName(techDraft.numeroFaixas === "")}
                        onClick={() =>
                          setTechDraft((prev) => ({ ...prev, numeroFaixas: "" }))
                        }
                      >
                        Sem preenchimento
                      </button>
                      {Array.from({ length: 9 }, (_, value) => (
                        <button
                          key={value}
                          type="button"
                          className={chipClassName(techDraft.numeroFaixas === value)}
                          onClick={() =>
                            setTechDraft((prev) => ({ ...prev, numeroFaixas: value }))
                          }
                        >
                          {value === 8 ? "8+" : value}
                        </button>
                      ))}
                    </div>
                    {getConfidenceBadge(
                      selectedPartAdvanced?.osm_confidence.numeroFaixas ||
                        editingSegment.osm_confidence?.numeroFaixas
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
                  <div className="sm:max-w-[220px]">
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
                  <div>
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
                <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
                  {renderStepper({
                    label: "N° quadras",
                    value: techDraft.quadrasEstimadas,
                    min: 1,
                    onDecrease: () =>
                      setTechDraft((prev) => ({
                        ...prev,
                        quadrasEstimadas: clampMinimumOne(prev.quadrasEstimadas - 1),
                      })),
                    onIncrease: () =>
                      setTechDraft((prev) => ({
                        ...prev,
                        quadrasEstimadas: clampMinimumOne(prev.quadrasEstimadas + 1),
                      })),
                  })}
                  {renderStepper({
                    label: "N° interseções",
                    value: techDraft.intersecoesEstimadas,
                    min: 0,
                    onDecrease: () =>
                      setTechDraft((prev) => ({
                        ...prev,
                        intersecoesEstimadas: clampNonNegative(prev.intersecoesEstimadas - 1),
                      })),
                    onIncrease: () =>
                      setTechDraft((prev) => ({
                        ...prev,
                        intersecoesEstimadas: clampNonNegative(prev.intersecoesEstimadas + 1),
                      })),
                  })}
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
                {osmLink && (
                  <p className="text-sm">
                    <a
                      href={osmLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 underline underline-offset-2 hover:text-blue-900"
                    >
                      Abrir estrutura no OpenStreetMap
                    </a>
                  </p>
                )}
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleEditCancel}>
                Cancelar
              </Button>
              <Button onClick={() => void handleEditSave()}>
                Salvar
              </Button>
            </div>
          </div>
          </div>
        );
        return technicalPanelContainer ? createPortal(panel, technicalPanelContainer) : panel;
      })()}
    </div>
  );
};

export default RefinementSegmentsTable;
