import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Filter, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SegmentPreviewMap from "@/components/SegmentPreviewMap";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { fetchSegmentsByCity } from "@/services/database";
import type { Segment } from "@/types";
import {
  getEvaluatedBadgeClassName,
  getHierarchyBadgeClassName,
  getSegmentTypeBadgeClassName,
} from "@/utils/segmentBadgeStyles";

interface PersistedCityData {
  cityId: string;
  cityName: string;
  stateName: string;
}

interface EtapaEscolherEstruturaProps {
  cityData: PersistedCityData | null;
}

type StatusFilter = "todos" | "pendentes" | "avaliados";

const classificationLabels: Record<string, string> = {
  estrutural: "Estrutural",
  alimentadora: "Alimentadora",
  local: "Local",
};

const formatLength = (length?: number | null) => {
  const safeLength = length ?? 0;
  return `${safeLength.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} km`;
};

const getReadableSegmentName = (segment: Segment, cityId?: string) => {
  if (segment.name?.trim()) {
    return segment.name.trim();
  }

  const displayId =
    cityId && segment.id.startsWith(`${cityId}_`)
      ? segment.id.slice(cityId.length + 1)
      : segment.id;

  return `Trecho ${displayId}`;
};

const EtapaEscolherEstrutura = ({ cityData }: EtapaEscolherEstruturaProps) => {
  const navigate = useNavigate();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [classificationFilter, setClassificationFilter] = useState("todos");

  useEffect(() => {
    let isActive = true;

    const loadSegments = async () => {
      if (!cityData?.cityId) {
        if (isActive) {
          setSegments([]);
          setSelectedSegment(null);
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
        const data = await fetchSegmentsByCity(cityData.cityId);
        if (!isActive) return;

        const topLevelSegments = data.filter((segment) => !segment.parent_segment_id);
        const source = topLevelSegments.length > 0 ? topLevelSegments : data;
        const uniqueSegments = Array.from(
          new Map(source.map((segment) => [segment.id, segment])).values()
        ).sort((firstSegment, secondSegment) => {
          if (firstSegment.evaluated !== secondSegment.evaluated) {
            return Number(firstSegment.evaluated) - Number(secondSegment.evaluated);
          }

          return getReadableSegmentName(firstSegment, cityData.cityId).localeCompare(
            getReadableSegmentName(secondSegment, cityData.cityId),
            "pt-BR"
          );
        });

        const storedSelectedSegmentId =
          typeof window !== "undefined"
            ? sessionStorage.getItem("selectedSegmentId")
            : null;

        setSegments(uniqueSegments);
        setSelectedSegment(
          uniqueSegments.find((segment) => segment.id === storedSelectedSegmentId) || null
        );
      } catch (error) {
        console.error("Error loading segments:", error);
        if (isActive) {
          setSegments([]);
          setSelectedSegment(null);
          setLoadError("Não foi possível carregar os trechos desta cidade agora.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadSegments();

    return () => {
      isActive = false;
    };
  }, [cityData, reloadKey]);

  const typeOptions = useMemo(
    () =>
      Array.from(new Set(segments.map((segment) => segment.type).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      ),
    [segments]
  );

  const classificationOptions = useMemo(
    () =>
      Array.from(
        new Set(segments.map((segment) => segment.classification).filter(Boolean) as string[])
      ).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [segments]
  );

  const segmentSummary = useMemo(() => {
    const evaluated = segments.filter((segment) => segment.evaluated).length;

    return {
      total: segments.length,
      evaluated,
      pending: Math.max(segments.length - evaluated, 0),
      classified: segments.filter((segment) => segment.classification).length,
    };
  }, [segments]);

  const filteredSegments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");

    return segments.filter((segment) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          getReadableSegmentName(segment, cityData?.cityId),
          segment.id,
          segment.neighborhood || "",
          segment.type || "",
          classificationLabels[segment.classification || ""] || segment.classification || "",
        ]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "avaliados" && segment.evaluated) ||
        (statusFilter === "pendentes" && !segment.evaluated);

      const matchesType = typeFilter === "todos" || segment.type === typeFilter;
      const matchesClassification =
        classificationFilter === "todos" || segment.classification === classificationFilter;

      return matchesSearch && matchesStatus && matchesType && matchesClassification;
    });
  }, [cityData?.cityId, classificationFilter, searchTerm, segments, statusFilter, typeFilter]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== "todos" ||
    typeFilter !== "todos" ||
    classificationFilter !== "todos";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("todos");
    setTypeFilter("todos");
    setClassificationFilter("todos");
  };

  const handleSelectSegment = (segment: Segment) => {
    setSelectedSegment(segment);
    sessionStorage.setItem("selectedSegmentId", segment.id);

    if (cityData?.cityId) {
      sessionStorage.setItem("selectedCityId", cityData.cityId);
    }
  };

  const handleGoToEvaluation = () => {
    if (!selectedSegment) return;

    sessionStorage.setItem("selectedSegmentId", selectedSegment.id);
    navigate("/avaliacao/avaliar-estrutura");
  };

  if (!cityData) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <CardTitle>Selecione uma cidade antes de continuar</CardTitle>
          <CardDescription>
            Esta etapa depende da cidade escolhida e dos trechos refinados na etapa anterior.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => navigate("/avaliacao/refinar-dados")}>
            Voltar para refinamento
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-[28px] border-ideciclo-blue/10 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Trechos disponíveis</p>
            <p className="mt-2 text-3xl font-black text-ideciclo-blue">{segmentSummary.total}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-emerald-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">{segmentSummary.pending}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-amber-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Já avaliados</p>
            <p className="mt-2 text-3xl font-black text-amber-500">{segmentSummary.evaluated}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Com classificação</p>
            <p className="mt-2 text-3xl font-black text-slate-700">{segmentSummary.classified}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[32px] border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Estruturas Disponíveis em {cityData.cityName}</CardTitle>
          <CardDescription>
            Filtre a lista para localizar mais rápido o trecho certo e siga para o formulário com a seleção salva.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr),repeat(3,minmax(0,1fr)),auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome, ID, bairro ou tipologia"
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="todos">Todos os status</option>
              <option value="pendentes">Pendentes</option>
              <option value="avaliados">Avaliados</option>
            </select>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="todos">Todas as tipologias</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={classificationFilter}
              onChange={(event) => setClassificationFilter(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="todos">Todas as classes</option>
              {classificationOptions.map((classification) => (
                <option key={classification} value={classification}>
                  {classificationLabels[classification] || classification}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Limpar
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>
              {filteredSegments.length} de {segments.length} trechos visíveis
            </p>
            {selectedSegment ? (
              <p>
                Trecho selecionado:{" "}
                <span className="font-semibold text-foreground">
                  {getReadableSegmentName(selectedSegment, cityData.cityId)}
                </span>
              </p>
            ) : (
              <p>Selecione um trecho para habilitar o formulário.</p>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p>Carregando trechos disponíveis...</p>
            </div>
          ) : loadError ? (
            <div className="rounded-3xl border border-destructive/20 bg-destructive/5 px-6 py-8 text-center">
              <p className="font-medium text-destructive">{loadError}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setReloadKey((currentValue) => currentValue + 1)}
                className="mt-4"
              >
                Tentar novamente
              </Button>
            </div>
          ) : segments.length === 0 ? (
            <div className="rounded-3xl border border-dashed px-6 py-8 text-center">
              <p className="font-medium">Nenhum trecho foi encontrado para esta cidade.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Se você acabou de baixar os dados, volte para a etapa de refinamento e confirme se os trechos foram carregados corretamente.
              </p>
            </div>
          ) : filteredSegments.length === 0 ? (
            <div className="rounded-3xl border border-dashed px-6 py-8 text-center">
              <p className="font-medium">Nenhum trecho corresponde aos filtros atuais.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Ajuste a busca ou limpe os filtros para ver todos os trechos novamente.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredSegments.map((segment) => (
                <div
                  key={segment.id}
                  className={cn(
                    "w-full rounded-[28px] border p-5 text-left transition-all",
                    selectedSegment?.id === segment.id
                      ? "border-emerald-300 bg-emerald-50 shadow-md"
                      : "border-slate-200 bg-white hover:border-ideciclo-teal/40 hover:shadow-sm"
                  )}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => handleSelectSegment(segment)}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            className={getEvaluatedBadgeClassName(segment.evaluated)}
                          >
                            {segment.evaluated ? "Avaliado" : "Pendente"}
                          </Badge>
                          <Badge className={getSegmentTypeBadgeClassName(segment.type)}>
                            {segment.type}
                          </Badge>
                          {segment.classification ? (
                            <Badge className={getHierarchyBadgeClassName(segment.classification)}>
                              {classificationLabels[segment.classification] || segment.classification}
                            </Badge>
                          ) : null}
                          {selectedSegment?.id === segment.id ? (
                            <Badge className="bg-emerald-600 text-white">Selecionado</Badge>
                          ) : null}
                        </div>
                        <h4 className="mt-3 text-lg font-semibold text-foreground">
                          {getReadableSegmentName(segment, cityData.cityId)}
                        </h4>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>ID: {segment.id}</span>
                          <span>Extensão: {formatLength(segment.length)}</span>
                          {segment.neighborhood ? <span>Bairro: {segment.neighborhood}</span> : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          Interseções:{" "}
                          {segment.intersections_count ??
                            segment.estimated_intersections_count ??
                            "-"}
                        </span>
                        <span>•</span>
                        <span>
                          Quadras:{" "}
                          {segment.blocks_count ?? segment.estimated_blocks_count ?? "-"}
                        </span>
                        <span>•</span>
                        <span>OSM: {segment.osm_id || "-"}</span>
                      </div>
                    </div>
                  </button>

                  {selectedSegment?.id === segment.id ? (
                    <div className="mt-5 border-t border-emerald-200 pt-5">
                      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr),minmax(320px,0.9fr)]">
                        <div className="flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-emerald-700">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <h4 className="mt-3 text-xl font-bold text-slate-900">
                              {getReadableSegmentName(segment, cityData.cityId)}
                            </h4>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge className={cn("border", getSegmentTypeBadgeClassName(segment.type))}>
                                {segment.type}
                              </Badge>
                              {segment.classification ? (
                                <Badge className={cn("border", getHierarchyBadgeClassName(segment.classification))}>
                                  {classificationLabels[segment.classification] || segment.classification}
                                </Badge>
                              ) : null}
                              <Badge variant="outline" className="border-emerald-300 bg-white">
                                {formatLength(segment.length)}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-5">
                            <Button onClick={handleGoToEvaluation} className="gap-2">
                              {segment.evaluated ? "Revisar avaliação" : "Avaliar com IDECICLO"}
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="overflow-hidden rounded-[24px] border border-emerald-200 bg-white">
                          <SegmentPreviewMap
                            segment={segment}
                            className="h-[280px] w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EtapaEscolherEstrutura;
