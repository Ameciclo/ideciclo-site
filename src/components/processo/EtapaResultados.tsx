import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Map, { Layer, MapRef, NavigationControl, Source } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  FileText,
  Filter,
  MapPinned,
  RotateCcw,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  getHierarchyBadgeClassName,
  getSegmentTypeBadgeClassName,
  SEGMENT_TYPE_COLORS,
} from "@/utils/segmentBadgeStyles";
import {
  fetchCityFromDB,
  fetchFormsByCityId,
  fetchSegmentsFromDB,
  saveCityToDB,
  updateCityRankingVisibility,
} from "@/services/database";
import type { City } from "@/types";
import { clearPersistedCityData } from "@/utils/persistedCityData";
import {
  calculateCityResults,
  NETWORK_CONFIG,
  type CityResultsBreakdown,
  type NetworkKey,
  type ScoreBandKey,
  type SegmentResultEntry,
} from "@/utils/idecicloResults";

interface PersistedCityData {
  cityId: string;
  cityName: string;
  stateName?: string;
  city?: Partial<City>;
}

interface EtapaResultadosProps {
  cityData: PersistedCityData | null;
}

type StatusFilter = "todos" | "avaliados" | "nao-avaliados";
type CalculationFilter =
  | "todos"
  | "validos"
  | "incompativeis"
  | "sem-hierarquia"
  | "sem-nota";
type SortField =
  | "displayName"
  | "typeLabel"
  | "hierarchyLabel"
  | "status"
  | "lengthKm"
  | "score"
  | "contribution";
type SortDirection = "asc" | "desc";

const NETWORK_KEYS = Object.keys(NETWORK_CONFIG) as NetworkKey[];

const hierarchyBadgeClassName: Record<NetworkKey, string> = {
  estrutural: getHierarchyBadgeClassName("estrutural"),
  alimentadora: getHierarchyBadgeClassName("alimentadora"),
  local: getHierarchyBadgeClassName("local"),
};

const scoreBandLabels: Record<ScoreBandKey, string> = {
  "score-75-plus": "75 a 100",
  "score-50-plus": "50 a 74,9",
  "score-25-plus": "25 a 49,9",
  "score-below-25": "0 a 24,9",
  "score-unavailable": "Sem nota",
};

const formatKm = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatCount = (value: number) =>
  value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

const formatIndex = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

const formatScore = (value: number | null) =>
  value === null
    ? "-"
    : value.toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });

const formatPercent = (value: number) =>
  `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;

const getStatusBadgeClassName = (segment: SegmentResultEntry) => {
  if (!segment.evaluated) {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }

  if (segment.adequate === false) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (segment.contributes) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
};

const getStatusLabel = (segment: SegmentResultEntry) => {
  if (!segment.evaluated) return "Pendente";
  if (segment.adequate === false) return "A1 = D";
  if (segment.hierarchy === null) return "Sem hierarquia";
  if (segment.score === null) return "Sem nota";
  return "Entra no cálculo";
};

const getMapColor = (segment: SegmentResultEntry) =>
  SEGMENT_TYPE_COLORS[segment.typeLabel] || "#475569";

const getScoreBandBadgeClassName = (band: ScoreBandKey) => {
  if (band === "score-75-plus") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (band === "score-50-plus") return "border-sky-200 bg-sky-50 text-sky-700";
  if (band === "score-25-plus") return "border-amber-200 bg-amber-50 text-amber-700";
  if (band === "score-below-25") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-100 text-slate-700";
};

const normalizeText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const extractLineCoordinates = (geometry: unknown): number[][] => {
  if (!geometry || typeof geometry !== "object" || !("type" in geometry)) {
    return [];
  }

  const typedGeometry = geometry as { type?: string; coordinates?: unknown };

  if (typedGeometry.type === "LineString" && Array.isArray(typedGeometry.coordinates)) {
    return typedGeometry.coordinates.filter(
      (coordinate): coordinate is number[] =>
        Array.isArray(coordinate) &&
        coordinate.length >= 2 &&
        typeof coordinate[0] === "number" &&
        typeof coordinate[1] === "number"
    );
  }

  if (typedGeometry.type === "MultiLineString" && Array.isArray(typedGeometry.coordinates)) {
    return typedGeometry.coordinates.flatMap((line) =>
      Array.isArray(line)
        ? line.filter(
            (coordinate): coordinate is number[] =>
              Array.isArray(coordinate) &&
              coordinate.length >= 2 &&
              typeof coordinate[0] === "number" &&
              typeof coordinate[1] === "number"
          )
        : []
    );
  }

  return [];
};

const getBounds = (segments: SegmentResultEntry[]) => {
  const coordinates = segments.flatMap((segment) => extractLineCoordinates(segment.geometry));

  if (coordinates.length < 2) return null;

  const [firstLng, firstLat] = coordinates[0];
  let minLng = firstLng;
  let maxLng = firstLng;
  let minLat = firstLat;
  let maxLat = firstLat;

  for (const [lng, lat] of coordinates) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  const lngPadding = Math.max((maxLng - minLng) * 0.12, 0.003);
  const latPadding = Math.max((maxLat - minLat) * 0.12, 0.003);

  return [
    [minLng - lngPadding, minLat - latPadding],
    [maxLng + lngPadding, maxLat + latPadding],
  ] as [[number, number], [number, number]];
};

interface ResultsMapProps {
  segments: SegmentResultEntry[];
  selectedSegmentId: string | null;
  onSelectSegment: (segmentId: string) => void;
}

const ResultsMap = ({
  segments,
  selectedSegmentId,
  onSelectSegment,
}: ResultsMapProps) => {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const mapRef = useRef<MapRef | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapFeatures = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: segments
        .filter((segment) => extractLineCoordinates(segment.geometry).length >= 2)
        .map((segment) => ({
          type: "Feature" as const,
          properties: {
            id: segment.id,
            lineColor: getMapColor(segment),
            evaluated: segment.evaluated,
            selected: segment.id === selectedSegmentId,
          },
          geometry: segment.geometry,
        })),
    }),
    [segments, selectedSegmentId]
  );

  const bounds = useMemo(() => getBounds(segments), [segments]);

  const fitMapToBounds = () => {
    if (!mapRef.current || !bounds) return;

    mapRef.current.fitBounds(bounds, {
      padding: 48,
      duration: 700,
      maxZoom: 15,
    });
  };

  useEffect(() => {
    if (!mapLoaded || !bounds) return;

    fitMapToBounds();

    const firstPass = window.setTimeout(() => {
      fitMapToBounds();
    }, 120);

    const secondPass = window.setTimeout(() => {
      fitMapToBounds();
    }, 420);

    return () => {
      window.clearTimeout(firstPass);
      window.clearTimeout(secondPass);
    };
  }, [bounds, mapLoaded, segments.length]);

  const pendingLayer = {
    id: "results-segments-pending",
    type: "line" as const,
    filter: ["==", ["get", "evaluated"], false] as unknown as any[],
    paint: {
      "line-color": ["get", "lineColor"],
      "line-width": 3,
      "line-opacity": 0.5,
    },
    layout: {
      "line-cap": "round" as const,
      "line-join": "round" as const,
    },
  };

  const evaluatedLayer = {
    id: "results-segments-evaluated",
    type: "line" as const,
    filter: ["==", ["get", "evaluated"], true] as unknown as any[],
    paint: {
      "line-color": ["get", "lineColor"],
      "line-width": 4,
      "line-opacity": 0.9,
    },
    layout: {
      "line-cap": "round" as const,
      "line-join": "round" as const,
    },
  };

  const selectedLayer = {
    id: "results-segments-selected",
    type: "line" as const,
    filter: ["==", ["get", "selected"], true] as unknown as any[],
    paint: {
      "line-color": "#0f172a",
      "line-width": 7,
      "line-opacity": 1,
    },
    layout: {
      "line-cap": "round" as const,
      "line-join": "round" as const,
    },
  };

  if (!token) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
        <div>
          <p className="text-base font-semibold">Mapa indisponível</p>
          <p className="mt-1 text-sm">
            Configure `VITE_MAPBOX_ACCESS_TOKEN` para visualizar as estruturas no mapa.
          </p>
        </div>
      </div>
    );
  }

  if (mapFeatures.features.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
        <div>
          <p className="text-base font-semibold">Nenhuma estrutura visível com os filtros atuais</p>
          <p className="mt-1 text-sm">Ajuste os filtros para exibir os trechos no mapa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -34.8556378,
          latitude: -7.9845551,
          zoom: 12,
        }}
        mapboxAccessToken={token}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: "100%", height: 420 }}
        onLoad={() => {
          setMapLoaded(true);
          fitMapToBounds();
        }}
        interactiveLayerIds={[
          pendingLayer.id,
          evaluatedLayer.id,
        ]}
        onClick={(event) => {
          const id = event.features?.[0]?.properties?.id;
          if (typeof id === "string") {
            onSelectSegment(id);
          }
        }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <Source id="results-segments-source" type="geojson" data={mapFeatures}>
          <Layer {...selectedLayer} />
          <Layer {...pendingLayer} />
          <Layer {...evaluatedLayer} />
        </Source>
      </Map>
    </div>
  );
};

const buildFallbackCity = (cityData: PersistedCityData): City => ({
  id: cityData.cityId,
  name: cityData.city?.name || cityData.cityName,
  state: cityData.city?.state || cityData.stateName || "",
  extensao_avaliada: cityData.city?.extensao_avaliada || 0,
  ideciclo: cityData.city?.ideciclo || 0,
  vias_estruturais_km: cityData.city?.vias_estruturais_km || 0,
  vias_alimentadoras_km: cityData.city?.vias_alimentadoras_km || 0,
  vias_locais_km: cityData.city?.vias_locais_km || 0,
});

const EtapaResultados = ({ cityData }: EtapaResultadosProps) => {
  const navigate = useNavigate();
  const [results, setResults] = useState<CityResultsBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [scoreBandFilter, setScoreBandFilter] = useState<ScoreBandKey | "todos">("todos");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [hierarchyFilter, setHierarchyFilter] = useState<NetworkKey | "todos">("todos");
  const [calculationFilter, setCalculationFilter] =
    useState<CalculationFilter>("todos");
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("displayName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showInRanking, setShowInRanking] = useState<boolean>(true);
  const [isUpdatingRankingVisibility, setIsUpdatingRankingVisibility] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isActive = true;

    const loadResults = async () => {
      if (!cityData?.cityId) {
        if (isActive) {
          setResults(null);
          setLoadError(null);
          setIsLoading(false);
        }
        return;
      }

      if (isActive) {
        setIsLoading(true);
        setLoadError(null);
      }

      try {
        const [cityFromDb, segments, forms] = await Promise.all([
          fetchCityFromDB(cityData.cityId),
          fetchSegmentsFromDB(cityData.cityId),
          fetchFormsByCityId(cityData.cityId),
        ]);

        if (!isActive) return;

        const city = cityFromDb || buildFallbackCity(cityData);
        const breakdown = calculateCityResults(city, segments, forms);

        setResults(breakdown);
        setShowInRanking(city.show_in_ranking !== false);

        const storedSelectedSegmentId =
          typeof window !== "undefined"
            ? sessionStorage.getItem("selectedSegmentId")
            : null;

        setSelectedSegmentId(
          breakdown.segments.find((segment) => segment.id === storedSelectedSegmentId)?.id ||
            breakdown.segments[0]?.id ||
            null
        );
      } catch (error) {
        console.error("Error loading IDECICLO results:", error);
        if (isActive) {
          setResults(null);
          setLoadError("Não foi possível carregar os dados da cidade e das avaliações.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadResults();

    return () => {
      isActive = false;
    };
  }, [cityData]);

  const handleToggleRankingVisibility = async () => {
    if (!results?.city?.id || isUpdatingRankingVisibility) return;

    const nextValue = !showInRanking;
    setIsUpdatingRankingVisibility(true);
    setShowInRanking(nextValue);

    try {
      const cityToPersist = {
        ...results.city,
        name: results.city.name || cityData?.city?.name || cityData?.cityName || "",
        state: results.city.state || cityData?.city?.state || cityData?.stateName || "",
      };

      if (!cityToPersist.name || !cityToPersist.state) {
        throw new Error("Dados obrigatórios da cidade ausentes para salvar a liberação no ranking.");
      }

      await saveCityToDB(cityToPersist);
      const success = await updateCityRankingVisibility(results.city.id, nextValue, cityToPersist);

      if (!success) {
        setShowInRanking(!nextValue);
        toast({
          title: "Não foi possível atualizar",
          description: "A liberação do ranking não foi salva.",
          variant: "destructive",
        });
        return;
      }

      setResults((current) =>
        current
          ? {
              ...current,
              city: {
                ...current.city,
              show_in_ranking: nextValue,
              },
            }
          : current
      );
      toast({
        title: nextValue ? "Cidade liberada" : "Cidade removida",
        description: nextValue
          ? "A cidade agora pode aparecer no ranking."
          : "A cidade deixou de aparecer no ranking.",
      });
    } catch (error) {
      setShowInRanking(!nextValue);
      toast({
        title: "Não foi possível atualizar",
        description: "Verifique o banco de dados e tente novamente.",
        variant: "destructive",
      });
      console.error("Error toggling ranking visibility:", error);
    } finally {
      setIsUpdatingRankingVisibility(false);
    }
  };

  const filteredSegments = useMemo(() => {
    if (!results) return [];

    const normalizedSearch = normalizeText(searchTerm);

    const filtered = results.segments.filter((segment) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        normalizeText(
          [
            segment.displayName,
            segment.id,
            segment.typeLabel,
            segment.hierarchyLabel,
            segment.neighborhood || "",
          ].join(" ")
        ).includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "avaliados" && segment.evaluated) ||
        (statusFilter === "nao-avaliados" && !segment.evaluated);

      const matchesScoreBand =
        scoreBandFilter === "todos" || segment.scoreBand === scoreBandFilter;

      const matchesType = typeFilter === "todos" || segment.typeLabel === typeFilter;
      const matchesHierarchy =
        hierarchyFilter === "todos" || segment.hierarchy === hierarchyFilter;

      const matchesCalculation =
        calculationFilter === "todos" ||
        (calculationFilter === "validos" && segment.contributes) ||
        (calculationFilter === "incompativeis" && segment.adequate === false) ||
        (calculationFilter === "sem-hierarquia" && segment.hierarchy === null) ||
        (calculationFilter === "sem-nota" && segment.score === null);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesScoreBand &&
        matchesType &&
        matchesHierarchy &&
        matchesCalculation
      );
    });

    const getSortableValue = (segment: SegmentResultEntry) => {
      if (sortField === "displayName") return segment.displayName;
      if (sortField === "typeLabel") return segment.typeLabel;
      if (sortField === "hierarchyLabel") return segment.hierarchyLabel;
      if (sortField === "status") return getStatusLabel(segment);
      if (sortField === "lengthKm") return segment.lengthKm;
      if (sortField === "score") return segment.score ?? -1;
      return segment.contribution;
    };

    return [...filtered].sort((first, second) => {
      const left = getSortableValue(first);
      const right = getSortableValue(second);

      let comparison = 0;

      if (typeof left === "number" && typeof right === "number") {
        comparison = left - right;
      } else {
        comparison = String(left).localeCompare(String(right), "pt-BR");
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [
    calculationFilter,
    hierarchyFilter,
    results,
    scoreBandFilter,
    searchTerm,
    sortDirection,
    sortField,
    statusFilter,
    typeFilter,
  ]);

  useEffect(() => {
    if (filteredSegments.length === 0) {
      setSelectedSegmentId(null);
      return;
    }

    if (!selectedSegmentId || !filteredSegments.some((segment) => segment.id === selectedSegmentId)) {
      setSelectedSegmentId(filteredSegments[0].id);
    }
  }, [filteredSegments, selectedSegmentId]);

  const selectedSegment =
    filteredSegments.find((segment) => segment.id === selectedSegmentId) ||
    results?.segments.find((segment) => segment.id === selectedSegmentId) ||
    null;

  const typeOptions = useMemo(() => {
    if (!results) return [];
    return Array.from(new Set(results.segments.map((segment) => segment.typeLabel))).sort(
      (first, second) => first.localeCompare(second, "pt-BR")
    );
  }, [results]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== "todos" ||
    scoreBandFilter !== "todos" ||
    typeFilter !== "todos" ||
    hierarchyFilter !== "todos" ||
    calculationFilter !== "todos";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("todos");
    setScoreBandFilter("todos");
    setTypeFilter("todos");
    setHierarchyFilter("todos");
    setCalculationFilter("todos");
    setSortField("displayName");
    setSortDirection("asc");
  };

  const handleStartOver = () => {
    clearPersistedCityData();
    sessionStorage.clear();
    navigate("/avaliacao");
  };

  const handleContinueEvaluating = () => {
    navigate("/avaliacao");
  };

  const handleRefineData = () => {
    navigate("/avaliacao/refinar-dados");
  };

  const handleSelectedSegmentAction = () => {
    if (!selectedSegment) return;

    sessionStorage.setItem("selectedSegmentId", selectedSegment.id);
    if (cityData?.cityId) {
      sessionStorage.setItem("selectedCityId", cityData.cityId);
    }
    navigate("/avaliacao/avaliar-estrutura");
  };

  if (!cityData) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <CardTitle>Selecione uma cidade para ver o cálculo</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => navigate("/avaliacao")}>
            Escolher cidade
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-ideciclo-blue" />
          <p className="mt-4 text-sm text-slate-600">Calculando painel IDECICLO...</p>
        </div>
      </div>
    );
  }

  if (loadError || !results) {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="h-5 w-5" />
            Falha ao montar a página de cálculo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-rose-700">{loadError || "Dados indisponíveis."}</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/avaliacao")}>Voltar para avaliação</Button>
            <Button variant="outline" onClick={handleRefineData}>
              Revisar dados
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { city, networks, summary } = results;
  const previewPercent = summary.previewIdeciclo * 100;
  const evaluatedProgress =
    summary.totalStructures > 0
      ? (summary.evaluatedStructures / summary.totalStructures) * 100
      : 0;
  const evaluatedKmProgress =
    summary.totalStructureKm > 0
      ? (summary.evaluatedStructureKm / summary.totalStructureKm) * 100
      : 0;

  return (
    <div className="space-y-6">
      <Card
        className={cn(
          "border-2",
          summary.officialReady
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
        )}
      >
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {summary.officialReady ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-700" />
              )}
              <Badge
                className={cn(
                  "border-transparent",
                  summary.officialReady
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-500 text-slate-950"
                )}
              >
                {summary.officialReady ? "Cálculo oficial liberado" : "Prévia parcial"}
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {summary.officialReady
                ? `${city.name} já tem todas as estruturas necessárias para o cálculo do IDECICLO.`
                : `${city.name} ainda está em andamento, mas já dá para acompanhar a prévia do índice.`}
            </h3>
            <p className="max-w-3xl text-sm text-slate-700">
              A conta segue o manual nas páginas 62 a 66: cada trecho contribui com
              `extensão × nota / 100`, o Grau de Atendimento da Malha divide a soma das
              contribuições pela extensão total da malha viária, e o IDECICLO pondera
              estrutural, alimentadora e local.
            </p>
          </div>
          <div className="grid min-w-[260px] gap-2 rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm">
            <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
              {summary.officialReady ? "IDECICLO" : "Prévia do IDECICLO"}
            </div>
            <div className="text-5xl font-black text-slate-950">
              {formatIndex(summary.previewIdeciclo)}
            </div>
            <div className="text-sm text-slate-600">{formatPercent(previewPercent)} de 100</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-slate-500">
              <Award className="h-5 w-5" />
              <span className="text-sm font-medium">Estruturas avaliadas</span>
            </div>
            <div className="mt-4 text-3xl font-black text-slate-950">
              {formatCount(summary.evaluatedStructures)}/{formatCount(summary.totalStructures)}
            </div>
            <p className="mt-2 text-sm text-slate-600">{formatPercent(evaluatedProgress)} concluído</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-slate-500">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm font-medium">Km avaliados</span>
            </div>
            <div className="mt-4 text-3xl font-black text-slate-950">
              {formatKm(summary.evaluatedStructureKm)}/{formatKm(summary.totalStructureKm)}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {formatPercent(evaluatedKmProgress)} da malha cicloviária baixada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-slate-500">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Trechos válidos no cálculo</span>
            </div>
            <div className="mt-4 text-3xl font-black text-slate-950">
              {formatCount(summary.validStructures)}/{formatCount(summary.totalStructures)}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {formatKm(summary.validStructureKm)} km com contribuição positiva
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-slate-500">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium">Pontos de atenção</span>
            </div>
            <div className="mt-4 text-3xl font-black text-slate-950">
              {formatCount(summary.pendingStructures + summary.unclassifiedStructures)}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {summary.pendingStructures} pendentes, {summary.unclassifiedStructures} sem hierarquia e{" "}
              {summary.incompatibleStructures} incompatíveis
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Andamento das avaliações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-slate-700">
              <span>Estruturas concluídas</span>
              <span>{formatCount(summary.evaluatedStructures)}/{formatCount(summary.totalStructures)}</span>
            </div>
            <Progress value={evaluatedProgress} className="h-3 bg-slate-100 [&>div]:bg-ideciclo-blue" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-slate-700">
              <span>Extensão avaliada</span>
              <span>{formatKm(summary.evaluatedStructureKm)}/{formatKm(summary.totalStructureKm)} km</span>
            </div>
            <Progress value={evaluatedKmProgress} className="h-3 bg-slate-100 [&>div]:bg-ideciclo-teal" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-700">Pendentes</div>
              <div className="mt-2 text-2xl font-black text-slate-950">{formatCount(summary.pendingStructures)}</div>
              <p className="mt-1 text-sm text-slate-600">
                Ainda não têm formulário salvo.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-700">Sem hierarquia</div>
              <div className="mt-2 text-2xl font-black text-slate-950">
                {formatCount(summary.unclassifiedStructures)}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Precisam voltar para o refinamento antes do cálculo final.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-700">Incompatíveis</div>
              <div className="mt-2 text-2xl font-black text-slate-950">
                {formatCount(summary.incompatibleStructures)}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Avaliadas com A1 = D, então entram com contribuição zero.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {NETWORK_KEYS.map((networkKey) => {
          const network = networks[networkKey];
          const structuresProgress =
            network.structuresCount > 0
              ? (network.evaluatedCount / network.structuresCount) * 100
              : 0;
          const kmProgress =
            network.structureKm > 0
              ? (network.evaluatedKm / network.structureKm) * 100
              : 0;

          return (
            <Card key={network.key} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{network.label}</CardTitle>
                  <Badge className="border-slate-200 bg-slate-100 text-slate-700">
                    Peso {formatPercent(network.weight * 100)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Malha viária total
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-950">
                      {formatKm(network.totalRoadKm)} km
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Estruturas mapeadas
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-950">
                      {formatCount(network.structuresCount)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>Avaliações concluídas</span>
                    <span>
                      {formatCount(network.evaluatedCount)}/{formatCount(network.structuresCount)}
                    </span>
                  </div>
                  <Progress
                    value={structuresProgress}
                    className="h-2.5 bg-slate-100 [&>div]:bg-ideciclo-blue"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>Km avaliados</span>
                    <span>{formatKm(network.evaluatedKm)}/{formatKm(network.structureKm)} km</span>
                  </div>
                  <Progress
                    value={kmProgress}
                    className="h-2.5 bg-slate-100 [&>div]:bg-ideciclo-teal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <div className="text-slate-500">Contribuição total</div>
                    <div className="mt-2 text-xl font-bold text-slate-950">
                      {formatKm(network.contributionSum)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <div className="text-slate-500">GAM</div>
                    <div className="mt-2 text-xl font-bold text-slate-950">
                      {network.gam === null ? "-" : formatIndex(network.gam)}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-950 p-4 text-white">
                  <div className="text-xs uppercase tracking-wide text-slate-300">
                    Parcela atual no IDECICLO
                  </div>
                  <div className="mt-2 text-3xl font-black">
                    {formatIndex(network.weightedContribution)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPinned className="h-5 w-5 text-ideciclo-blue" />
                Mapa das estruturas e filtros de acompanhamento
              </CardTitle>
              <p className="mt-2 text-sm text-slate-600">
                Filtre por nota, tipologia, hierarquia e status para localizar rápido os
                trechos que ainda faltam ou que já estão entrando na prévia do IDECICLO.
              </p>
            </div>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Limpar filtros
              </Button>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div className="xl:col-span-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar trecho, bairro ou ID"
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Status: todos</SelectItem>
                <SelectItem value="avaliados">Avaliados</SelectItem>
                <SelectItem value="nao-avaliados">Não avaliados</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={scoreBandFilter}
              onValueChange={(value) => setScoreBandFilter(value as ScoreBandKey | "todos")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Faixa da nota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Nota: todas</SelectItem>
                {Object.entries(scoreBandLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipologia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Tipologia: todas</SelectItem>
                {typeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={hierarchyFilter}
              onValueChange={(value) => setHierarchyFilter(value as NetworkKey | "todos")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Hierarquia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Hierarquia: todas</SelectItem>
                {NETWORK_KEYS.map((networkKey) => (
                  <SelectItem key={networkKey} value={networkKey}>
                    {NETWORK_CONFIG[networkKey].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={calculationFilter}
              onValueChange={(value) => setCalculationFilter(value as CalculationFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Situação no cálculo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Situação: todas</SelectItem>
                <SelectItem value="validos">Entram no cálculo</SelectItem>
                <SelectItem value="incompativeis">Incompatíveis</SelectItem>
                <SelectItem value="sem-hierarquia">Sem hierarquia</SelectItem>
                <SelectItem value="sem-nota">Sem nota</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
            <ResultsMap
              segments={filteredSegments}
              selectedSegmentId={selectedSegmentId}
              onSelectSegment={(segmentId) => {
                setSelectedSegmentId(segmentId);
                sessionStorage.setItem("selectedSegmentId", segmentId);
              }}
            />

            <div className="rounded-[28px] border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-500">
                <Filter className="h-4 w-4" />
                Trecho selecionado
              </div>

              {selectedSegment ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-slate-950">
                      {selectedSegment.displayName}
                    </h4>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedSegment.neighborhood || "Bairro não informado"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={cn("border", getStatusBadgeClassName(selectedSegment))}>
                      {getStatusLabel(selectedSegment)}
                    </Badge>
                    <Badge className={cn("border", getSegmentTypeBadgeClassName(selectedSegment.typeLabel))}>
                      {selectedSegment.typeLabel}
                    </Badge>
                    {selectedSegment.hierarchy ? (
                      <Badge className={cn("border", hierarchyBadgeClassName[selectedSegment.hierarchy])}>
                        {selectedSegment.hierarchyLabel}
                      </Badge>
                    ) : null}
                    <Badge className={cn("border", getScoreBandBadgeClassName(selectedSegment.scoreBand))}>
                      {scoreBandLabels[selectedSegment.scoreBand]}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-xs uppercase tracking-wide text-slate-500">Extensão</div>
                      <div className="mt-2 text-xl font-bold text-slate-950">
                        {formatKm(selectedSegment.lengthKm)} km
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-xs uppercase tracking-wide text-slate-500">Nota</div>
                      <div className="mt-2 text-xl font-bold text-slate-950">
                        {selectedSegment.score === null
                          ? "-"
                          : `${formatScore(selectedSegment.score)}/100`}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-xs uppercase tracking-wide text-slate-500">A1</div>
                      <div className="mt-2 text-xl font-bold text-slate-950">
                        {selectedSegment.a1Rating || "-"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Contribuição
                      </div>
                      <div className="mt-2 text-xl font-bold text-slate-950">
                        {formatKm(selectedSegment.contribution)}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600">
                    {selectedSegment.formId
                      ? "Este trecho já tem formulário salvo. Você pode revisar a avaliação ou usar a seleção para cruzar com a tabela abaixo."
                      : "Este trecho ainda não foi avaliado. A página de avaliação abre o formulário já vinculado a ele."}
                  </p>

                  <Button onClick={handleSelectedSegmentAction} className="w-full">
                    {selectedSegment.formId ? "Ver avaliação" : "Avaliar este trecho"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Selecione um trecho no mapa ou na tabela para ver mais detalhes.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200">
            <div className="border-b border-slate-200 px-4 py-3">
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="font-semibold text-slate-950">Tabela das estruturas</h4>
                  <p className="text-sm text-slate-600">
                    {formatCount(filteredSegments.length)} trecho(s) visível(is) com os filtros atuais.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    Entram no cálculo
                  </Badge>
                  <Badge className="border-rose-200 bg-rose-50 text-rose-700">
                    A1 = D / incompatíveis
                  </Badge>
                  <Badge className="border-slate-200 bg-slate-100 text-slate-700">
                    Pendente ou sem nota
                  </Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <Select
                    value={sortField}
                    onValueChange={(value) => setSortField(value as SortField)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="displayName">Ordenar: trecho</SelectItem>
                      <SelectItem value="typeLabel">Tipologia</SelectItem>
                      <SelectItem value="hierarchyLabel">Hierarquia</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="lengthKm">Extensão</SelectItem>
                      <SelectItem value="score">Nota</SelectItem>
                      <SelectItem value="contribution">Contribuição</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={sortDirection}
                    onValueChange={(value) => setSortDirection(value as SortDirection)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Direção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Crescente</SelectItem>
                      <SelectItem value="desc">Decrescente</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    Estrutural: peso {formatPercent(NETWORK_CONFIG.estrutural.weight * 100)}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    Alimentadora: peso {formatPercent(NETWORK_CONFIG.alimentadora.weight * 100)}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    Local: peso {formatPercent(NETWORK_CONFIG.local.weight * 100)}
                  </div>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trecho</TableHead>
                  <TableHead>Tipologia</TableHead>
                  <TableHead>Hierarquia</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Extensão</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Contribuição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSegments.length > 0 ? (
                  filteredSegments.map((segment) => (
                    <TableRow
                      key={segment.id}
                      className={cn(
                        "cursor-pointer",
                        segment.id === selectedSegmentId && "bg-slate-50"
                      )}
                      onClick={() => {
                        setSelectedSegmentId(segment.id);
                        sessionStorage.setItem("selectedSegmentId", segment.id);
                      }}
                    >
                      <TableCell>
                        <div className="font-medium text-slate-950">{segment.displayName}</div>
                        <div className="text-xs text-slate-500">{segment.id}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border", getSegmentTypeBadgeClassName(segment.typeLabel))}>
                          {segment.typeLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {segment.hierarchy ? (
                          <Badge className={cn("border", hierarchyBadgeClassName[segment.hierarchy])}>
                            {segment.hierarchyLabel}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Sem hierarquia</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border", getStatusBadgeClassName(segment))}>
                          {getStatusLabel(segment)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatKm(segment.lengthKm)} km</TableCell>
                      <TableCell>
                        {segment.score === null ? "-" : `${formatScore(segment.score)}/100`}
                      </TableCell>
                      <TableCell>{formatKm(segment.contribution)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-slate-500">
                      Nenhum trecho encontrado com os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos passos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Button onClick={handleContinueEvaluating} className="h-auto flex-col gap-2 p-6">
              <FileText className="h-7 w-7" />
              <span>Continuar avaliando</span>
            </Button>

            <Button onClick={handleRefineData} variant="outline" className="h-auto flex-col gap-2 p-6">
              <MapPinned className="h-7 w-7" />
              <span>Revisar hierarquias</span>
            </Button>

            <Button onClick={() => navigate("/ranking")} variant="outline" className="h-auto flex-col gap-2 p-6">
              <BarChart3 className="h-7 w-7" />
              <span>Ver ranking</span>
            </Button>

            <Button
              onClick={handleToggleRankingVisibility}
              variant="outline"
              className={cn(
                "h-auto flex-col gap-2 p-6 border-transparent text-white",
                showInRanking
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              )}
              disabled={isUpdatingRankingVisibility}
            >
              <Award className="h-7 w-7" />
              <span>
                {showInRanking ? "Remover do ranking" : "Liberar no ranking"}
              </span>
            </Button>

            <Button onClick={handleStartOver} variant="outline" className="h-auto flex-col gap-2 p-6">
              <RotateCcw className="h-7 w-7" />
              <span>Nova cidade</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EtapaResultados;
