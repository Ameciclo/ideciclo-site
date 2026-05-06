import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Segment, SegmentIntersectionSelection, SegmentType } from "@/types";
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
  CircleHelp,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getA1Decision, getA1FieldLabel } from "@/utils/idecicloAssessment";
import {
  getHierarchyBadgeClassName,
  getSegmentTypeBadgeClassName,
} from "@/utils/segmentBadgeStyles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SPEED_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];
const CTB_SPEED_BY_HIERARCHY: Record<string, number> = {
  estrutural: 60,
  alimentadora: 40,
  local: 30,
};

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

const INTERSECTION_TYPING_OPTIONS = [
  { value: "Ciclovia", label: "Ciclovia" },
  { value: "Ciclofaixa", label: "Ciclofaixa" },
  { value: "Calçada", label: "Calçada" },
  { value: "Ciclorrota", label: "Ciclorrota" },
  { value: "Sim", label: "Sim" },
  { value: "Não", label: "Não" },
] as const;

const FIELD_HELP_CONTENT: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  nomeTrecho: {
    title: "Nome do trecho",
    description:
      "Nome consolidado da estrutura que será usado nas próximas etapas da avaliação.",
  },
  tipologia: {
    title: "Tipologia",
    description:
      "Classificação principal da infraestrutura cicloviária (ciclovia, ciclofaixa, calçada partilhada ou ciclorrota).",
  },
  hierarquia: {
    title: "Hierarquia viária",
    description:
      "Classe da via no IDECICLO (estrutural, alimentadora ou local).",
  },
  trechoInicio: {
    title: "Trecho início",
    description:
      "Via transversal de referência em uma extremidade da estrutura avaliada.",
  },
  trechoFim: {
    title: "Trecho fim",
    description:
      "Via transversal de referência na outra extremidade da estrutura avaliada.",
  },
  sentido: {
    title: "Sentido",
    description:
      "Direção operacional da infraestrutura cicloviária (uni ou bidirecional).",
  },
  posicaoNaVia: {
    title: "Posição na via",
    description:
      "Posicionamento da infraestrutura no espaço viário (canteiro, pista, calçada etc.).",
  },
  velocidade: {
    title: "Velocidade regulamentada",
    description:
      "Velocidade máxima da via motorizada associada ao trecho (km/h).",
  },
  numeroFaixas: {
    title: "Número de faixas",
    description:
      "Quantidade de faixas de rolamento da via motorizada do trecho.",
  },
  pavimento: {
    title: "Pavimento",
    description:
      "Tipo de revestimento predominante da infraestrutura cicloviária no trecho.",
  },
  largura: {
    title: "Largura",
    description:
      "Largura útil da infraestrutura cicloviária (em metros).",
  },
  bufferSeparacao: {
    title: "Buffer/separação",
    description:
      "Dispositivo ou distância de separação entre o espaço cicloviário e o tráfego motorizado.",
  },
  quadras: {
    title: "Número de quadras",
    description:
      "Estimativa de quadras do conjunto da estrutura para apoio ao formulário.",
  },
  intersecoes: {
    title: "Interseções estimadas",
    description:
      "Lista de interseções identificadas no OSM. Desmarcar remove a interseção da contagem e do pré-preenchimento do formulário.",
  },
};

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
  >("tipologia");
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
  const [fieldHelpKey, setFieldHelpKey] = useState<string | null>(null);
  const [intersectionSelections, setIntersectionSelections] = useState<
    SegmentIntersectionSelection[]
  >([]);
  const [intersectionRoadFilter, setIntersectionRoadFilter] = useState("");
  const [intersectionHierarchyFilter, setIntersectionHierarchyFilter] =
    useState<string>("all");
  const [intersectionTypeFilter, setIntersectionTypeFilter] = useState<string>("all");
  const [intersectionConsiderationFilter, setIntersectionConsiderationFilter] =
    useState<string>("all");

  // Available classification options
  const classificationOptions = ["estrutural", "alimentadora", "local"];

  const getIntersectionInfrastructureLabel = (item: SegmentIntersectionSelection) => {
    if (item.cyclingInfrastructureType) {
      return item.cyclingInfrastructureType;
    }

    if (item.hasCyclingInfrastructure === true) return "Sim";
    if (item.hasCyclingInfrastructure === false) return "Não";
    return "Indef.";
  };

  const setIntersectionSelectionPatch = (
    intersectionId: string,
    patch: Partial<SegmentIntersectionSelection>
  ) => {
    setIntersectionSelections((prev) =>
      prev.map((item) => (item.id === intersectionId ? { ...item, ...patch } : item))
    );
  };

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

  const getCompatibilityBadge = (segment: Segment) => {
    const decision = getA1Decision({
      infra_typology: segment.type || segment.ideciclo_prefill?.tipologia || "",
      road_hierarchy: segment.classification || segment.ideciclo_prefill?.hierarquia || "",
      classification: segment.classification || undefined,
      velocity_kmh: Number(segment.ideciclo_prefill?.velocidade || 0),
      pedestrian_flow_per_hour_per_meter: 0,
      position_on_road: segment.ideciclo_prefill?.posicaoNaVia || "",
    });

    if (decision.status === "compatible") {
      return <Badge className="bg-emerald-600 text-white">Compatível</Badge>;
    }

    if (decision.status === "incompatible") {
      return <Badge className="bg-rose-600 text-white">Incompatível</Badge>;
    }

    return <Badge className="bg-amber-500 text-white">Pendente</Badge>;
  };

  const getCtbSpeedForClassification = (classification: string) =>
    CTB_SPEED_BY_HIERARCHY[classification] ?? null;

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
    setFieldHelpKey(null);
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
        const selectedIntersections = intersectionSelections.filter((item) => item.selected);
        const allIntersectionsPreview = intersectionSelections.map((item) => ({
          pointKey: item.pointKey,
          roadId: item.roadId,
          roadName: item.roadName,
          highway: item.highway,
          hierarchy: item.hierarchyIdeciclo,
          hasCyclingInfrastructure: item.hasCyclingInfrastructure ?? null,
          cyclingInfrastructureType: item.cyclingInfrastructureType || undefined,
        }));

        const currentPending = [
          !typeDraft ? "Tipologia sem preenchimento" : null,
          !classificationDraft ? "Hierarquia viária sem preenchimento" : null,
          !techDraft.trechoInicio?.trim() ? "Trecho início sem preenchimento" : null,
          !techDraft.trechoFim?.trim() ? "Trecho fim sem preenchimento" : null,
          !techDraft.sentido ? "Sentido sem preenchimento" : null,
          !techDraft.posicaoNaVia ? "Posição na via sem preenchimento" : null,
          !techDraft.velocidade?.trim()
            ? "Velocidade regulamentada sem preenchimento"
            : null,
          techDraft.numeroFaixas === "" ? "Número de faixas sem preenchimento" : null,
          !techDraft.pavimento?.trim() ? "Pavimento sem preenchimento" : null,
          !techDraft.largura?.trim() ? "Largura sem preenchimento" : null,
          !techDraft.bufferSeparacao?.trim() ? "Buffer/separação sem preenchimento" : null,
        ].filter((item): item is string => Boolean(item));

        const selectedData = selectedPartAdvanced;
        const prefillFromSelection = selectedData?.ideciclo_prefill;
        const confidenceFromSelection = selectedData?.osm_confidence;

        await onUpdateSegmentTechnical(editingSegment.id, {
          ideciclo_prefill: {
            ...editingSegment.ideciclo_prefill,
            ...(prefillFromSelection || {}),
            tipologia: typeDraft || undefined,
            hierarquia: classificationDraft || undefined,
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
            pendenciasCampo: currentPending,
          },
          osm_confidence: confidenceFromSelection || editingSegment.osm_confidence,
          osm_tags: selectedData?.osm_tags || editingSegment.osm_tags,
          osm_raw: selectedData?.osm_raw || editingSegment.osm_raw,
          osm_improvement_suggestions:
            selectedData?.osm_improvement_suggestions ||
            editingSegment.osm_improvement_suggestions,
          intersections_preview: allIntersectionsPreview,
          selected_intersections: intersectionSelections,
          estimated_blocks_count:
            techDraft.quadrasEstimadas,
          estimated_intersections_count: selectedIntersections.length,
          blocks_count: techDraft.quadrasEstimadas,
          intersections_count: selectedIntersections.length,
          relevant_intersections_count: selectedIntersections.filter(
            (item) =>
              item.hierarchyIdeciclo === "estrutural" ||
              item.hierarchyIdeciclo === "alimentadora"
          ).length,
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
    setFieldHelpKey(null);
  };

  useEffect(() => {
    if (technicalOpen && technicalSegment) {
      handleEditStart(technicalSegment);
    }
    if (!technicalOpen) {
      setEditingSegment(null);
    }
  }, [technicalOpen, technicalSegment]);

  useEffect(() => {
    if (!editingSegment) {
      setIntersectionSelections([]);
      return;
    }

    const baseIntersections = getCombinedIntersectionsPreview();
    const savedSelection =
      editingSegment.selected_intersections ||
      ((editingSegment.osm_advanced as any)?.selected_intersections as
        | SegmentIntersectionSelection[]
        | undefined);

    const merged = mergeIntersectionsWithExistingSelection(
      baseIntersections,
      savedSelection
    );
    setIntersectionSelections(merged);
  }, [editingSegment, advancedByPartId]);

  useEffect(() => {
    if (intersectionSelections.length === 0) return;
    const selectedCount = intersectionSelections.filter((item) => item.selected).length;
    setTechDraft((prev) => ({
      ...prev,
      intersecoesEstimadas: selectedCount,
    }));
  }, [intersectionSelections]);

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

      const baseIntersections = (() => {
        const byKey = new Map<string, SegmentIntersectionSelection>();
        Object.values(byPart).forEach((part) => {
          (part.intersections_preview || []).forEach((item) => {
            const key = `${item.pointKey}-${item.roadId}`;
            if (!byKey.has(key)) {
              byKey.set(key, {
                id: key,
                pointKey: item.pointKey,
                roadId: item.roadId,
                roadName: item.roadName,
                highway: item.highway,
                hierarchyOsm: item.highway || undefined,
                hierarchyIdeciclo: item.hierarchy || undefined,
                hasCyclingInfrastructure: item.hasCyclingInfrastructure ?? null,
                cyclingInfrastructureType: item.cyclingInfrastructureType,
                selected: true,
              });
            }
          });
        });
        return Array.from(byKey.values());
      })();

      setIntersectionSelections((prev) =>
        mergeIntersectionsWithExistingSelection(baseIntersections, prev)
      );

      if (editingSegment) {
        const endpoints = inferEndpointRoadNamesFromGroup(editingSegment, byPart);
        const totalBlocks = Object.values(byPart).reduce(
          (sum, item) => sum + clampMinimumOne(item.estimated_blocks_count ?? 1),
          0
        );
        const totalIntersections = Object.values(byPart).reduce(
          (sum, item) => sum + clampNonNegative(item.estimated_intersections_count ?? 0),
          0
        );
        setTechDraft((prev) => ({
          ...prev,
          trechoInicio: endpoints.trechoInicio || prev.trechoInicio,
          trechoFim: endpoints.trechoFim || prev.trechoFim,
          quadrasEstimadas: totalBlocks > 0 ? totalBlocks : prev.quadrasEstimadas,
          intersecoesEstimadas:
            totalIntersections >= 0 ? totalIntersections : prev.intersecoesEstimadas,
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
    onInputChange,
    disabled = false,
  }: {
    label: string;
    value: number;
    min?: number;
    onDecrease: () => void;
    onIncrease: () => void;
    onInputChange?: (value: number) => void;
    disabled?: boolean;
  }) => (
    <div className="rounded-xl border p-3">
      <p className="mb-2 text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-8 w-8 rounded-full p-0 text-base"
          onClick={onDecrease}
          disabled={disabled || value <= min}
        >
          -
        </Button>
        {onInputChange ? (
          <Input
            type="number"
            min={min}
            value={String(value)}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              if (!Number.isFinite(nextValue)) return;
              onInputChange(nextValue);
            }}
            className="h-9 min-w-[80px] text-center text-base font-bold"
            disabled={disabled}
          />
        ) : (
          <div className="flex min-h-[36px] min-w-[60px] items-center justify-center rounded-lg border px-2 text-base font-bold">
            {value}
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          className="h-8 w-8 rounded-full p-0 text-base"
          onClick={onIncrease}
          disabled={disabled}
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

  const renderFieldHelpButton = (helpKey: string) => (
    <button
      type="button"
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:bg-slate-100"
      title="Ajuda"
      onClick={() => setFieldHelpKey(helpKey)}
    >
      <CircleHelp size={12} />
    </button>
  );

  const getCombinedIntersectionsPreview = () => {
    if (Object.keys(advancedByPartId).length > 0) {
      const byKey = new Map<string, SegmentIntersectionSelection>();
      Object.values(advancedByPartId).forEach((part) => {
        (part.intersections_preview || []).forEach((item) => {
          const key = `${item.pointKey}-${item.roadId}`;
          if (!byKey.has(key)) {
            byKey.set(key, {
              id: key,
              pointKey: item.pointKey,
              roadId: item.roadId,
              roadName: item.roadName,
              highway: item.highway,
              hierarchyOsm: item.highway || undefined,
              hierarchyIdeciclo: item.hierarchy || undefined,
              hasCyclingInfrastructure: item.hasCyclingInfrastructure ?? null,
              cyclingInfrastructureType: item.cyclingInfrastructureType,
              selected: true,
            });
          }
        });
      });
      return Array.from(byKey.values());
    }
    return (editingSegment?.intersections_preview || []).map((item) => ({
      id: `${item.pointKey}-${item.roadId}`,
      pointKey: item.pointKey,
      roadId: item.roadId,
      roadName: item.roadName,
      highway: item.highway,
      hierarchyOsm: item.highway || undefined,
      hierarchyIdeciclo: item.hierarchy || undefined,
      hasCyclingInfrastructure: item.hasCyclingInfrastructure ?? null,
      cyclingInfrastructureType: item.cyclingInfrastructureType,
      selected: true,
    }));
  };

  const mergeIntersectionsWithExistingSelection = (
    base: SegmentIntersectionSelection[],
    existing?: SegmentIntersectionSelection[]
  ) => {
    const existingById = new Map((existing || []).map((item) => [item.id, item]));
    const mergedBase = base.map((item) => {
      const saved = existingById.get(item.id);
      return {
        ...item,
        selected: saved?.selected ?? true,
        hierarchyIdeciclo: saved?.hierarchyIdeciclo ?? item.hierarchyIdeciclo,
        hasCyclingInfrastructure:
          saved?.hasCyclingInfrastructure ?? item.hasCyclingInfrastructure,
        cyclingInfrastructureType:
          saved?.cyclingInfrastructureType ?? item.cyclingInfrastructureType,
      };
    });
    const baseIds = new Set(mergedBase.map((item) => item.id));
    const appendedSaved = (existing || []).filter((item) => !baseIds.has(item.id));
    return [...mergedBase, ...appendedSaved];
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
    }));
  };

  const getCombinedEstimatedCounts = () => {
    const blocks = techDraft.quadrasEstimadas;
    const intersections =
      intersectionSelections.length > 0
        ? intersectionSelections.filter((item) => item.selected).length
        : techDraft.intersecoesEstimadas;

    return { blocks, intersections };
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

  const pendingFromDraft = [
    !typeDraft ? "Tipologia sem preenchimento" : null,
    !classificationDraft ? "Hierarquia viária sem preenchimento" : null,
    !techDraft.trechoInicio?.trim() ? "Trecho início sem preenchimento" : null,
    !techDraft.trechoFim?.trim() ? "Trecho fim sem preenchimento" : null,
    !techDraft.sentido ? "Sentido sem preenchimento" : null,
    !techDraft.posicaoNaVia ? "Posição na via sem preenchimento" : null,
    !techDraft.velocidade?.trim() ? "Velocidade regulamentada sem preenchimento" : null,
    techDraft.numeroFaixas === "" ? "Número de faixas sem preenchimento" : null,
    !techDraft.pavimento?.trim() ? "Pavimento sem preenchimento" : null,
    !techDraft.largura?.trim() ? "Largura sem preenchimento" : null,
    !techDraft.bufferSeparacao?.trim() ? "Buffer/separação sem preenchimento" : null,
    intersectionSelections.length > 0 &&
    intersectionSelections.every((item) => !item.selected)
      ? "Interseções sem preenchimento"
      : null,
  ].filter((item): item is string => Boolean(item));

  const pendingFromOsmRaw =
    selectedPartAdvanced?.ideciclo_prefill.pendenciasCampo ||
    editingSegment?.ideciclo_prefill?.pendenciasCampo ||
    [];

  const getPendingFieldKey = (label: string) => {
    const normalized = label.toLowerCase();
    if (normalized.includes("tipolog")) return "tipologia";
    if (normalized.includes("hierarquia")) return "hierarquia";
    if (normalized.includes("trecho início") || normalized.includes("trecho inicio"))
      return "trechoInicio";
    if (normalized.includes("trecho fim")) return "trechoFim";
    if (normalized.includes("sentido")) return "sentido";
    if (normalized.includes("posição na via") || normalized.includes("posicao na via"))
      return "posicaoNaVia";
    if (normalized.includes("velocidade")) return "velocidade";
    if (normalized.includes("faixas")) return "numeroFaixas";
    if (normalized.includes("pavimento")) return "pavimento";
    if (normalized.includes("largura")) return "largura";
    if (normalized.includes("buffer") || normalized.includes("separa")) return "bufferSeparacao";
    if (normalized.includes("interse")) return "intersecoes";
    return "";
  };

  const isFilledByFieldKey = (fieldKey: string) => {
    switch (fieldKey) {
      case "tipologia":
        return Boolean(typeDraft);
      case "hierarquia":
        return Boolean(classificationDraft);
      case "trechoInicio":
        return Boolean(techDraft.trechoInicio?.trim());
      case "trechoFim":
        return Boolean(techDraft.trechoFim?.trim());
      case "sentido":
        return Boolean(techDraft.sentido);
      case "posicaoNaVia":
        return Boolean(techDraft.posicaoNaVia);
      case "velocidade":
        return Boolean(techDraft.velocidade?.trim());
      case "numeroFaixas":
        return techDraft.numeroFaixas !== "";
      case "pavimento":
        return Boolean(techDraft.pavimento?.trim());
      case "largura":
        return Boolean(techDraft.largura?.trim());
      case "bufferSeparacao":
        return Boolean(techDraft.bufferSeparacao?.trim());
      case "intersecoes":
        return (
          intersectionSelections.length === 0 ||
          intersectionSelections.some((item) => item.selected)
        );
      default:
        return false;
    }
  };

  const pendingFromOsm = pendingFromOsmRaw.filter((item) => {
    const key = getPendingFieldKey(item);
    if (!key) return true;
    return !isFilledByFieldKey(key);
  });

  const pendingItems = Array.from(new Set([...pendingFromOsm, ...pendingFromDraft]));
  const refinementCompatibilityDecision = getA1Decision({
    infra_typology: typeDraft,
    road_hierarchy: classificationDraft,
    classification: classificationDraft || undefined,
    velocity_kmh: Number(techDraft.velocidade || 0),
    position_on_road: techDraft.posicaoNaVia || "",
    pedestrian_flow_per_hour_per_meter: 0,
  });
  const ctbSuggestedSpeed = getCtbSpeedForClassification(classificationDraft);
  const filteredIntersectionSelections = intersectionSelections.filter((item) => {
    const roadFilter = intersectionRoadFilter.trim().toLowerCase();
    const roadMatch =
      !roadFilter ||
      (item.roadName || `Via ${item.roadId}`).toLowerCase().includes(roadFilter) ||
      item.roadId.toLowerCase().includes(roadFilter);

    const hierarchyValue = item.hierarchyIdeciclo || "não classificada";
    const hierarchyMatch =
      intersectionHierarchyFilter === "all" ||
      hierarchyValue === intersectionHierarchyFilter;

    const typeValue = getIntersectionInfrastructureLabel(item);
    const typeMatch =
      intersectionTypeFilter === "all" || typeValue === intersectionTypeFilter;

    const considerationMatch =
      intersectionConsiderationFilter === "all" ||
      (intersectionConsiderationFilter === "selected" && item.selected) ||
      (intersectionConsiderationFilter === "unselected" && !item.selected);

    return roadMatch && hierarchyMatch && typeMatch && considerationMatch;
  });
  const visibleIntersectionIds = new Set(
    filteredIntersectionSelections.map((item) => item.id)
  );
  const allIntersectionsSelected =
    filteredIntersectionSelections.length > 0 &&
    filteredIntersectionSelections.every((item) => item.selected);
  const someIntersectionsSelected =
    filteredIntersectionSelections.some((item) => item.selected) && !allIntersectionsSelected;

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
            <TableHead>Compatibilidade</TableHead>
            <TableHead className="text-right">
              {renderSortButton("length", "km", "right")}
            </TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {segments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6">
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
                <TableCell>{getCompatibilityBadge(segment)}</TableCell>
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
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">Editar trecho e conteúdo técnico</h3>
                <p className="text-xs text-muted-foreground">
                  Clique nos ícones de dúvida para entender cada campo.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Ajuste nome, tipologia, hierarquia e complemento técnico com o mapa disponível na página.
              </p>
            </div>
            <Dialog
              open={Boolean(fieldHelpKey)}
              onOpenChange={(open) => {
                if (!open) setFieldHelpKey(null);
              }}
            >
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {fieldHelpKey
                      ? FIELD_HELP_CONTENT[fieldHelpKey]?.title || "Ajuda"
                      : "Ajuda"}
                  </DialogTitle>
                  <DialogDescription>
                    {fieldHelpKey
                      ? FIELD_HELP_CONTENT[fieldHelpKey]?.description
                      : "Informação de apoio ao preenchimento."}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <div className="space-y-6">
              <Alert
                className={
                  refinementCompatibilityDecision.status === "incompatible"
                    ? "border-rose-300 bg-rose-50 text-rose-950"
                    : refinementCompatibilityDecision.status === "compatible"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                      : "border-amber-300 bg-amber-50 text-amber-950"
                }
              >
                <AlertTitle>{refinementCompatibilityDecision.headline}</AlertTitle>
                <AlertDescription>
                  {refinementCompatibilityDecision.detail}
                  {refinementCompatibilityDecision.missingFields.length > 0
                    ? ` Campos-chave: ${refinementCompatibilityDecision.missingFields
                        .map(getA1FieldLabel)
                        .join(", ")}.`
                    : ""}
                </AlertDescription>
              </Alert>
              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Trechos da estrutura selecionada
                </h3>
                <div className="rounded-md border p-3">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => void handleFetchOsmComplement()}
                      disabled={isLoadingOsmComplement}
                      className="bg-black text-white hover:bg-black/90"
                    >
                      {isLoadingOsmComplement
                        ? "Baixando..."
                        : "Baixar OSM de todos os trechos"}
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
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                    Nome do trecho
                  </h3>
                  {renderFieldHelpButton("nomeTrecho")}
                </div>
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
                    <div className="mb-2 flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">Tipologia</p>
                      {renderFieldHelpButton("tipologia")}
                    </div>
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
                    <div className="mb-2 flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">Hierarquia</p>
                      {renderFieldHelpButton("hierarquia")}
                    </div>
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
                  Resumo técnico editável
                </h3>
                <div className="space-y-4 rounded-md border p-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">Trecho início</p>
                      {renderFieldHelpButton("trechoInicio")}
                    </div>
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
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">Trecho fim</p>
                      {renderFieldHelpButton("trechoFim")}
                    </div>
                    <Input
                      value={techDraft.trechoFim}
                      onChange={(event) =>
                        setTechDraft((prev) => ({ ...prev, trechoFim: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">Sentido</p>
                      {renderFieldHelpButton("sentido")}
                    </div>
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
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">Posição na via</p>
                      {renderFieldHelpButton("posicaoNaVia")}
                    </div>
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
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        Velocidade máxima regulamentada
                      </p>
                      {renderFieldHelpButton("velocidade")}
                    </div>
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
                      <button
                        type="button"
                        className={chipClassName(
                          ctbSuggestedSpeed !== null &&
                            Number(techDraft.velocidade) === ctbSuggestedSpeed
                        )}
                        onClick={() => {
                          if (ctbSuggestedSpeed === null) return;
                          setTechDraft((prev) => ({
                            ...prev,
                            velocidade: String(ctbSuggestedSpeed),
                          }));
                        }}
                        disabled={ctbSuggestedSpeed === null}
                      >
                        {ctbSuggestedSpeed === null
                          ? "Usar velocidade do CTB"
                          : `Usar CTB (${ctbSuggestedSpeed} km/h)`}
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
                    <p className="text-xs text-muted-foreground">
                      Sem placa observada, use o padrão urbano do CTB pela hierarquia do trecho.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">Número de faixas</p>
                      {renderFieldHelpButton("numeroFaixas")}
                    </div>
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
                  </div>

                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">Pavimento</p>
                      {renderFieldHelpButton("pavimento")}
                    </div>
                    <Input
                      value={techDraft.pavimento}
                      onChange={(event) =>
                        setTechDraft((prev) => ({ ...prev, pavimento: event.target.value }))
                      }
                    />
                  </div>
                  <div className="sm:max-w-[220px]">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">Largura</p>
                      {renderFieldHelpButton("largura")}
                    </div>
                    <Input
                      value={techDraft.largura}
                      onChange={(event) =>
                        setTechDraft((prev) => ({ ...prev, largura: event.target.value }))
                      }
                      placeholder="Ex.: 2.4"
                    />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">Buffer/separação</p>
                      {renderFieldHelpButton("bufferSeparacao")}
                    </div>
                    <Input
                      value={techDraft.bufferSeparacao}
                      onChange={(event) =>
                        setTechDraft((prev) => ({
                          ...prev,
                          bufferSeparacao: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Pendências para campo
                </h3>
                {pendingItems.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {pendingItems.map((pending) => (
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
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                    Interseções e quadras estimadas
                  </h3>
                  {renderFieldHelpButton("quadras")}
                  {renderFieldHelpButton("intersecoes")}
                </div>
                {(() => {
                  const totals = getCombinedEstimatedCounts();
                  return (
                    <p className="text-xs text-muted-foreground">
                      Total estimado no conjunto selecionado: {totals.blocks} quadras e{" "}
                      {totals.intersections} interseções.
                    </p>
                  );
                })()}
                <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
                  {renderStepper({
                    label: "N° quadras",
                    value: techDraft.quadrasEstimadas,
                    min: 1,
                    onInputChange: (value) =>
                      setTechDraft((prev) => ({
                        ...prev,
                        quadrasEstimadas: clampMinimumOne(value),
                      })),
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
                    onInputChange: (value) =>
                      setTechDraft((prev) => ({
                        ...prev,
                        intersecoesEstimadas: clampNonNegative(value),
                      })),
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
                {intersectionSelections.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 rounded-md border p-3 md:grid-cols-2 xl:grid-cols-4">
                      <Input
                        value={intersectionRoadFilter}
                        onChange={(event) => setIntersectionRoadFilter(event.target.value)}
                        placeholder="Filtrar por via ou ID"
                      />
                      <Select
                        value={intersectionHierarchyFilter}
                        onValueChange={setIntersectionHierarchyFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Hierarquia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as hierarquias</SelectItem>
                          <SelectItem value="estrutural">Estrutural</SelectItem>
                          <SelectItem value="alimentadora">Alimentadora</SelectItem>
                          <SelectItem value="local">Local</SelectItem>
                          <SelectItem value="não classificada">Não classificada</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={intersectionTypeFilter}
                        onValueChange={setIntersectionTypeFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipologia / infra" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as opções</SelectItem>
                          {INTERSECTION_TYPING_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                          <SelectItem value="Indef.">Indef.</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={intersectionConsiderationFilter}
                        onValueChange={setIntersectionConsiderationFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Consideração" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="selected">Consideradas</SelectItem>
                          <SelectItem value="unselected">Desconsideradas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  <div className="max-h-72 overflow-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left">
                        <tr>
                          <th className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={allIntersectionsSelected}
                                className={
                                  someIntersectionsSelected
                                    ? "data-[state=checked]:bg-primary/50"
                                    : ""
                                }
                                onCheckedChange={(checked) =>
                                  setIntersectionSelections((prev) =>
                                    prev.map((item) => ({
                                      ...item,
                                      selected: visibleIntersectionIds.has(item.id)
                                        ? Boolean(checked)
                                        : item.selected,
                                    }))
                                  )
                                }
                              />
                              <span>Considerar</span>
                            </div>
                          </th>
                          <th className="px-3 py-2">Via</th>
                          <th className="px-3 py-2">Hierarquia IDECICLO</th>
                          <th className="px-3 py-2">Tipologia / infra cicloviária</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredIntersectionSelections
                          .slice(0, 80)
                          .map((item) => (
                            <tr key={`${item.pointKey}-${item.roadId}`} className="border-t">
                              <td className="px-3 py-2">
                                <Checkbox
                                  checked={item.selected}
                                  onCheckedChange={(checked) =>
                                    setIntersectionSelectionPatch(item.id, {
                                      selected: Boolean(checked),
                                    })
                                  }
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  value={item.roadName || `Via ${item.roadId}`}
                                  onChange={(event) =>
                                    setIntersectionSelectionPatch(item.id, {
                                      roadName: event.target.value,
                                    })
                                  }
                                  className="h-8 min-w-[220px]"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Select
                                  value={item.hierarchyIdeciclo || "não classificada"}
                                  onValueChange={(value) =>
                                    setIntersectionSelectionPatch(item.id, {
                                      hierarchyIdeciclo:
                                        value === "não classificada" ? undefined : value,
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-8 min-w-[150px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="estrutural">Estrutural</SelectItem>
                                    <SelectItem value="alimentadora">Alimentadora</SelectItem>
                                    <SelectItem value="local">Local</SelectItem>
                                    <SelectItem value="não classificada">
                                      Não classificada
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-3 py-2">
                                <Select
                                  value={getIntersectionInfrastructureLabel(item)}
                                  onValueChange={(value) =>
                                    setIntersectionSelectionPatch(item.id, {
                                      cyclingInfrastructureType:
                                        value === "Sim" ||
                                        value === "Não" ||
                                        value === "Indef."
                                          ? undefined
                                          : value,
                                      hasCyclingInfrastructure:
                                        value === "Sim"
                                          ? true
                                          : value === "Não"
                                            ? false
                                            : value === "Indef."
                                              ? null
                                              : true,
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-8 min-w-[170px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {INTERSECTION_TYPING_OPTIONS.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                    <SelectItem value="Indef.">Indef.</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Não foi possível estimar interseções com os dados disponíveis.
                  </p>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Tags de referência
                </h3>
                <div className="space-y-3">
                  {segmentParts.map((part) => {
                    const advanced = advancedByPartId[part.partId];
                    const tagMap =
                      advanced?.osm_tags ||
                      (part.partId === editingSegment?.id ? editingSegment?.osm_tags : undefined) ||
                      {};
                    const osmTypeRaw = (advanced?.osm_type || part.osmType || "way").toLowerCase();
                    const osmType =
                      osmTypeRaw === "relation" ? "relation" : osmTypeRaw === "node" ? "node" : "way";
                    const osmId = advanced?.osm_id || part.osmId;
                    const perPartOsmLink = osmId
                      ? `https://www.openstreetmap.org/${osmType}/${osmId}`
                      : "";
                    const isSelectedPart = selectedPartId === part.partId;

                    return (
                      <div
                        key={`tags-${part.partId}`}
                        className={`rounded-md border p-3 ${
                          isSelectedPart ? "border-slate-900 bg-slate-50 ring-1 ring-slate-300" : ""
                        }`}
                      >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{part.label}</p>
                          {perPartOsmLink ? (
                            <a
                              href={perPartOsmLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-700 underline underline-offset-2 hover:text-blue-900"
                            >
                              Abrir este trecho no OSM
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sem link OSM</span>
                          )}
                        </div>
                        {Object.keys(tagMap).length > 0 ? (
                          <div className="max-h-44 overflow-auto rounded-md border">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50 text-left">
                                <tr>
                                  <th className="px-3 py-2">Tag</th>
                                  <th className="px-3 py-2">Valor</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(tagMap).map(([key, value]) => (
                                  <tr key={`${part.partId}-${key}`} className="border-t align-top">
                                    <td className="px-3 py-2 font-mono text-xs">{key}</td>
                                    <td className="px-3 py-2">{value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Sem tags carregadas para este trecho. Clique em "Baixar OSM de todos os trechos".
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
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
