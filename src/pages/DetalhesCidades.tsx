import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRightLeft,
  Award,
  Bike,
  Building2,
  CheckCircle2,
  Filter,
  GitCompareArrows,
  Gauge,
  ListFilter,
  MapPinned,
  Route,
  Search,
  TimerReset,
  TriangleAlert,
} from "lucide-react";

import CityMap from "@/components/CityMap";
import ManualHelpDialog from "@/components/ManualHelpDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { manualDownloadUrl } from "@/constants/siteLinks";
import { cn } from "@/lib/utils";
import {
  fetchAllStoredCities,
  fetchCityFromDB,
  fetchFormsByCityId,
  fetchSegmentsFromDB,
} from "@/services/database";
import type { City, Form, Segment } from "@/types";
import { getHierarchyBadgeClassName, getSegmentTypeBadgeClassName } from "@/utils/segmentBadgeStyles";
import { calculateIdeciclo } from "@/utils/idecicloCalculator";
import {
  buildResultsSnapshot,
  buildStructureDetails,
  buildTypologyStats,
  formatCount,
  formatIndex,
  formatKm,
  formatScore,
  formatPercent,
  getCityIndexMeta,
  getComparisonFriendlyTitle,
  getMostCommonTypology,
  getRatingBadgeClassName,
  getScoreBandMeta,
  getStructureDetailsPath,
  getStructureStatusBadgeClassName,
  getStructureStatusLabel,
  getTopAndBottomCriteria,
  PUBLIC_CRITERION_GROUPS,
  type PublicStructureDetail,
} from "@/utils/publicIdeciclo";

type StructureStatusFilter =
  | "todos"
  | "avaliadas"
  | "pendentes"
  | "validas"
  | "incompativeis";
type ScoreFilter = "todos" | "altas" | "medias" | "baixas" | "sem-nota";
type SortOption =
  | "nota-desc"
  | "nota-asc"
  | "extensao-desc"
  | "extensao-asc"
  | "nome-asc"
  | "nome-desc";

const MetricCard = ({
  icon: Icon,
  label,
  value,
  helper,
  caption,
  tone = "default",
}: {
  icon: typeof Bike;
  label: string;
  value: string;
  helper?: string;
  caption?: string;
  tone?: "default" | "warm" | "cool" | "alert";
}) => {
  const toneClassName =
    tone === "warm"
      ? "from-[#fce0c4] to-white"
      : tone === "cool"
        ? "from-[#dfeaf5] to-white"
        : tone === "alert"
          ? "from-[#f7d5d0] to-white"
          : "from-white to-white";

  return (
    <Card className={`overflow-hidden rounded-[28px] border-0 shadow-[0_16px_40px_rgba(15,23,42,0.08)]`}>
      <div className={`bg-gradient-to-br ${toneClassName}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-ideciclo-red shadow-sm">
              <Icon className="h-6 w-6" />
            </div>
            {helper ? <ManualHelpDialog helpKey={helper} compact /> : null}
          </div>
          <CardDescription className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
            {label}
          </CardDescription>
          <CardTitle className="text-3xl text-text-grey">{value}</CardTitle>
        </CardHeader>
        {caption ? (
          <CardContent className="pt-0 text-sm leading-6 text-slate-600">
            {caption}
          </CardContent>
        ) : null}
      </div>
    </Card>
  );
};

const ComparisonStructureCard = ({
  detail,
  cityId,
}: {
  detail: PublicStructureDetail;
  cityId: string;
}) => {
  const topBottom = getTopAndBottomCriteria(detail);

  return (
    <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl leading-tight text-text-grey">
              {getComparisonFriendlyTitle(detail)}
            </CardTitle>
            <CardDescription className="mt-2 text-sm leading-6 text-slate-600">
              {detail.result.lengthKm > 0 ? `${formatKm(detail.result.lengthKm)} km` : "Extensão não informada"} •{" "}
              {detail.result.hierarchyLabel}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={detail.scoreBadgeClassName}>{detail.scoreLabel}</Badge>
            <Badge className={getSegmentTypeBadgeClassName(detail.result.typeLabel)}>
              {detail.result.typeLabel}
            </Badge>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Nota total</div>
            <div className="mt-2 text-2xl font-bold text-text-grey">
              {formatScore(detail.totalScore)}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</div>
            <Badge className={`mt-2 ${getStructureStatusBadgeClassName(detail.result)}`}>
              {getStructureStatusLabel(detail.result)}
            </Badge>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Detalhamento</div>
            <Button asChild variant="outline" className="mt-2 w-full justify-between rounded-full">
              <Link to={getStructureDetailsPath(cityId, detail.id)}>
                Ver estrutura
                <ArrowRightLeft className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {detail.sections.map((section) => (
            <div key={section.key} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-text-grey">{section.label}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {PUBLIC_CRITERION_GROUPS.find((group) => group.key === section.key)?.description}
                  </p>
                </div>
                <Badge variant="outline">
                  {section.score}/{section.max}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-emerald-50 p-4">
            <div className="text-sm font-semibold text-emerald-900">Pontos fortes</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {topBottom.strengths.length > 0 ? (
                topBottom.strengths.map((criterion) => (
                  <Badge key={criterion.code} className={getRatingBadgeClassName(criterion.rating)}>
                    {criterion.code} • {criterion.label}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-emerald-900/70">Ainda sem destaque consolidado.</span>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4">
            <div className="text-sm font-semibold text-amber-900">Pontos de atenção</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {topBottom.attention.length > 0 ? (
                topBottom.attention.map((criterion) => (
                  <Badge key={criterion.code} className={getRatingBadgeClassName(criterion.rating)}>
                    {criterion.code} • {criterion.label}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-amber-900/70">Nenhum alerta crítico apareceu nesta leitura.</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DetalhesCidades = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [city, setCity] = useState<City | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankingPosition, setRankingPosition] = useState<number | null>(null);
  const [rankedCitiesCount, setRankedCitiesCount] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [hierarchyFilter, setHierarchyFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState<StructureStatusFilter>("todos");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("todos");
  const [sortOption, setSortOption] = useState<SortOption>("nota-desc");
  const [comparisonType, setComparisonType] = useState("todos");
  const [firstComparisonId, setFirstComparisonId] = useState("");
  const [secondComparisonId, setSecondComparisonId] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!cityId) return;

      try {
        setLoading(true);
        const [loadedCity, loadedSegments, loadedForms] = await Promise.all([
          fetchCityFromDB(cityId),
          fetchSegmentsFromDB(cityId),
          fetchFormsByCityId(cityId),
        ]);

        setCity(loadedCity);
        setSegments(loadedSegments);
        setForms(loadedForms);
      } catch (error) {
        console.error("Erro ao carregar detalhes da cidade:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [cityId]);

  useEffect(() => {
    const loadRankingPosition = async () => {
      if (!cityId) return;

      try {
        const citiesData = await fetchAllStoredCities();
        if (!citiesData || citiesData.length === 0) {
          setRankingPosition(null);
          setRankedCitiesCount(0);
          return;
        }

        const citiesWithForms = await Promise.all(
          citiesData.map(async (storedCity) => {
            const cityForms = await fetchFormsByCityId(storedCity.id);
            return { city: storedCity, hasForms: cityForms.length > 0 };
          })
        );

        const rankedCities = (
          await Promise.all(
            citiesWithForms
              .filter((item) => item.hasForms)
              .map(async ({ city: rankedCity }) => {
                const [cityForms, citySegments] = await Promise.all([
                  fetchFormsByCityId(rankedCity.id),
                  fetchSegmentsFromDB(rankedCity.id),
                ]);

                return {
                  cityId: rankedCity.id,
                  ideciclo: calculateIdeciclo(citySegments, cityForms),
                };
              })
          )
        ).sort((left, right) => right.ideciclo - left.ideciclo);

        setRankedCitiesCount(rankedCities.length);

        const position =
          rankedCities.findIndex((rankedCity) => rankedCity.cityId === cityId) + 1;

        setRankingPosition(position > 0 ? position : null);
      } catch (error) {
        console.error("Erro ao calcular posição no ranking da cidade:", error);
        setRankingPosition(null);
        setRankedCitiesCount(0);
      }
    };

    loadRankingPosition();
  }, [cityId]);

  const results = useMemo(() => {
    if (!city) return null;
    return buildResultsSnapshot(city, segments, forms);
  }, [city, segments, forms]);

  const structureDetails = useMemo(() => {
    if (!city || !results) return [];
    return buildStructureDetails(city, segments, forms, results);
  }, [city, forms, results, segments]);

  const typologyStats = useMemo(
    () => buildTypologyStats(structureDetails),
    [structureDetails]
  );

  const displayedIndex = useMemo(() => {
    if (!city || !results) return 0;
    return city.ideciclo > 0 ? city.ideciclo : results.summary.previewIdeciclo;
  }, [city, results]);

  const indexMeta = useMemo(
    () => getCityIndexMeta(displayedIndex),
    [displayedIndex]
  );

  const commonTypology = useMemo(
    () => getMostCommonTypology(structureDetails),
    [structureDetails]
  );

  const bestStructures = useMemo(
    () =>
      [...structureDetails]
        .filter((detail) => detail.totalScore !== null)
        .sort((left, right) => (right.totalScore ?? 0) - (left.totalScore ?? 0))
        .slice(0, 3),
    [structureDetails]
  );

  const attentionStructures = useMemo(
    () =>
      [...structureDetails]
        .filter((detail) => detail.totalScore !== null)
        .sort((left, right) => (left.totalScore ?? 0) - (right.totalScore ?? 0))
        .slice(0, 3),
    [structureDetails]
  );

  const structureTypeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          structureDetails
            .map((detail) => detail.result.typeLabel)
            .filter(Boolean)
        )
      ).sort((left, right) => left.localeCompare(right, "pt-BR")),
    [structureDetails]
  );

  const filteredStructures = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const filtered = structureDetails.filter((detail) => {
      const searchHaystack = [
        detail.result.displayName,
        detail.segment.name,
        detail.segment.neighborhood,
        detail.result.typeLabel,
        detail.result.hierarchyLabel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const matchesSearch =
        !normalizedSearch || searchHaystack.includes(normalizedSearch);
      const matchesType =
        typeFilter === "todos" || detail.result.typeLabel === typeFilter;
      const matchesHierarchy =
        hierarchyFilter === "todos" ||
        detail.result.hierarchyLabel === hierarchyFilter;
      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "avaliadas" && detail.result.evaluated) ||
        (statusFilter === "pendentes" && !detail.result.evaluated) ||
        (statusFilter === "validas" && detail.result.contributes) ||
        (statusFilter === "incompativeis" && detail.result.adequate === false);
      const matchesScore =
        scoreFilter === "todos" ||
        (scoreFilter === "altas" && (detail.totalScore ?? -1) >= 75) ||
        (scoreFilter === "medias" &&
          (detail.totalScore ?? -1) >= 25 &&
          (detail.totalScore ?? -1) < 75) ||
        (scoreFilter === "baixas" &&
          detail.totalScore !== null &&
          detail.totalScore < 25) ||
        (scoreFilter === "sem-nota" && detail.totalScore === null);

      return (
        matchesSearch &&
        matchesType &&
        matchesHierarchy &&
        matchesStatus &&
        matchesScore
      );
    });

    return filtered.sort((left, right) => {
      switch (sortOption) {
        case "nota-asc":
          return (left.totalScore ?? Number.POSITIVE_INFINITY) - (right.totalScore ?? Number.POSITIVE_INFINITY);
        case "extensao-desc":
          return right.result.lengthKm - left.result.lengthKm;
        case "extensao-asc":
          return left.result.lengthKm - right.result.lengthKm;
        case "nome-asc":
          return getComparisonFriendlyTitle(left).localeCompare(
            getComparisonFriendlyTitle(right),
            "pt-BR"
          );
        case "nome-desc":
          return getComparisonFriendlyTitle(right).localeCompare(
            getComparisonFriendlyTitle(left),
            "pt-BR"
          );
        case "nota-desc":
        default:
          return (right.totalScore ?? -1) - (left.totalScore ?? -1);
      }
    });
  }, [
    hierarchyFilter,
    scoreFilter,
    search,
    sortOption,
    statusFilter,
    structureDetails,
    typeFilter,
  ]);

  const comparisonCandidates = useMemo(() => {
    return structureDetails
      .filter((detail) =>
        comparisonType === "todos"
          ? true
          : detail.result.typeLabel === comparisonType
      )
      .sort((left, right) =>
        getComparisonFriendlyTitle(left).localeCompare(
          getComparisonFriendlyTitle(right),
          "pt-BR"
        )
      );
  }, [comparisonType, structureDetails]);

  useEffect(() => {
    if (comparisonType === "todos") return;

    const currentTypeValues = new Set(comparisonCandidates.map((detail) => detail.id));

    if (firstComparisonId && !currentTypeValues.has(firstComparisonId)) {
      setFirstComparisonId("");
    }

    if (secondComparisonId && !currentTypeValues.has(secondComparisonId)) {
      setSecondComparisonId("");
    }
  }, [comparisonCandidates, comparisonType, firstComparisonId, secondComparisonId]);

  useEffect(() => {
    const compareParam = searchParams.get("compare");
    if (!compareParam || structureDetails.length === 0) return;

    const selectedIds = compareParam
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const first = structureDetails.find((detail) => detail.id === selectedIds[0]);
    if (!first) return;

    setComparisonType(first.result.typeLabel || "todos");
    setFirstComparisonId(first.id);

    const second = selectedIds[1]
      ? structureDetails.find((detail) => detail.id === selectedIds[1])
      : null;

    if (second && second.id !== first.id) {
      setSecondComparisonId(second.id);
    }

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("compare");
      return next;
    });
  }, [searchParams, setSearchParams, structureDetails]);

  const firstComparisonDetail =
    comparisonCandidates.find((detail) => detail.id === firstComparisonId) || null;
  const secondComparisonDetail =
    comparisonCandidates.find((detail) => detail.id === secondComparisonId) || null;

  const comparisonRows = useMemo(() => {
    if (!firstComparisonDetail || !secondComparisonDetail) return [];

    const firstMap = new Map(
      firstComparisonDetail.criteria.map((criterion) => [criterion.code, criterion])
    );
    const secondMap = new Map(
      secondComparisonDetail.criteria.map((criterion) => [criterion.code, criterion])
    );

    return PUBLIC_CRITERION_GROUPS.map((group) => ({
      ...group,
      criteria: group.criteria
        .map((code) => ({
          code,
          first: firstMap.get(code) || null,
          second: secondMap.get(code) || null,
        }))
        .filter((row) => row.first || row.second),
    })).filter((group) => group.criteria.length > 0);
  }, [firstComparisonDetail, secondComparisonDetail]);

  if (loading) {
    return (
      <div className="container py-20">
        <div className="flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-ideciclo-red" />
        </div>
      </div>
    );
  }

  if (!city || !results) {
    return (
      <div className="container py-20">
        <Card className="mx-auto max-w-2xl rounded-[28px] border-0 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-text-grey">Cidade não encontrada</CardTitle>
            <CardDescription>
              Não foi possível localizar os dados públicos dessa cidade no ambiente atual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full bg-ideciclo-red text-white hover:bg-ideciclo-red/90">
              <Link to="/ranking">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao ranking
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <section
        className="relative overflow-hidden border-b border-slate-200 bg-slate-100"
        style={{ backgroundImage: "url('/pages_covers/ideciclo-navcover.png')" }}
      >
        <div className="absolute inset-0 bg-white/75" />
        <div className="container relative z-10 py-16">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Link to="/" className="hover:text-ideciclo-red">Início</Link>
            <span>/</span>
            <Link to="/ranking" className="hover:text-ideciclo-red">Ranking</Link>
            <span>/</span>
            <span>Detalhes da cidade</span>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <Badge className={indexMeta.badgeClassName}>
                IDECICLO {indexMeta.classification} • {indexMeta.description}
              </Badge>
              <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight text-text-grey md:text-6xl">
                {city.name}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700 md:text-lg">
                Em {city.name}, foram observados {formatKm(results.summary.totalStructureKm)} km de
                infraestrutura cicloviária distribuídos em {formatCount(results.summary.totalStructures)} trechos.
                Desses, {formatCount(results.summary.evaluatedStructures)} já possuem avaliação concluída
                e {formatCount(results.summary.validStructures)} entram hoje no cálculo do índice da cidade.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-ideciclo-red text-white hover:bg-ideciclo-red/90">
                  <Link to="/ranking">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar ao ranking
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <a href={manualDownloadUrl} target="_blank" rel="noreferrer">
                    <ListFilter className="h-4 w-4" />
                    Ler manual do IDECICLO
                  </a>
                </Button>
              </div>
            </div>

            <Card className="rounded-[32px] border-0 bg-white/95 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-2xl text-text-grey">Leitura rápida</CardTitle>
                  <ManualHelpDialog helpKey="A1" compact />
                </div>
                <CardDescription>
                  Uma visão direta do que já foi medido e do que hoje pesa mais na leitura pública da cidade.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Posição no ranking</div>
                  <div className="mt-2 text-3xl font-bold text-text-grey">
                    {rankingPosition && rankedCitiesCount > 0
                      ? `#${rankingPosition} de ${rankedCitiesCount}`
                      : "Não ranqueada"}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Malha cicloviária total</div>
                  <div className="mt-2 text-3xl font-bold text-text-grey">{formatKm(results.summary.totalStructureKm)} km</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Tipologia dominante</div>
                  <div className="mt-2 text-lg font-semibold text-text-grey">
                    {commonTypology
                      ? `${commonTypology.label} • ${formatKm(commonTypology.km)} km`
                      : "Sem predominância definida"}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Malha viária total</div>
                  <div className="mt-2 text-lg font-semibold text-text-grey">
                    {formatKm(results.summary.totalRoadKm)} km
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="container -mt-8 space-y-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Gauge}
            label="Índice IDECICLO"
            value={formatIndex(displayedIndex)}
            helper="A1"
            caption="Leitura sintética da qualidade cicloviária observada nesta cidade."
            tone="warm"
          />
          <MetricCard
            icon={Route}
            label="Km avaliados"
            value={`${formatKm(results.summary.evaluatedStructureKm)} km`}
            helper="B1"
            caption="Trechos que já possuem formulário preenchido e nota calculada."
            tone="cool"
          />
          <MetricCard
            icon={Bike}
            label="Estruturas observadas"
            value={formatCount(results.summary.totalStructures)}
            helper="A2"
            caption="Trechos cicloviários analisados na leitura pública da cidade."
          />
          <MetricCard
            icon={TriangleAlert}
            label="Trechos incompatíveis"
            value={formatCount(results.summary.incompatibleStructures)}
            helper="A1"
            caption="Estruturas que hoje não entram no índice por incompatibilidade metodológica."
            tone="alert"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-[32px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl text-text-grey">O que mais se destaca</CardTitle>
                  <CardDescription>
                    Uma síntese para quem quer entender por que a cidade aparece assim hoje.
                  </CardDescription>
                </div>
                <ManualHelpDialog helpKey="A2" compact />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-[#f8f5ef] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ideciclo-red">
                  <Award className="h-4 w-4" />
                  Melhor avaliação disponível
                </div>
                {bestStructures[0] ? (
                  <>
                    <p className="mt-3 text-lg font-semibold text-text-grey">
                      {getComparisonFriendlyTitle(bestStructures[0])}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Nota {formatScore(bestStructures[0].totalScore)} • {bestStructures[0].scoreLabel} •{" "}
                      {bestStructures[0].result.typeLabel}
                    </p>
                    <Button asChild variant="outline" className="mt-4 rounded-full">
                      <Link to={getStructureDetailsPath(city.id, bestStructures[0].id)}>
                        Ver estrutura
                      </Link>
                    </Button>
                  </>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Ainda não há estrutura com nota disponível para ranquear.
                  </p>
                )}
              </div>

              <div className="rounded-[24px] bg-[#f2f7fb] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ideciclo-blue">
                  <Building2 className="h-4 w-4" />
                  Onde a cidade mais aparece
                </div>
                <p className="mt-3 text-lg font-semibold text-text-grey">
                  {commonTypology
                    ? `${commonTypology.label} é o tipo mais presente`
                    : "Sem predominância clara"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {commonTypology
                    ? `${formatKm(commonTypology.km)} km em ${formatCount(commonTypology.count)} trechos.`
                    : "Os dados ainda não são suficientes para mostrar um tipo dominante."}
                </p>
              </div>

              <div className="rounded-[24px] bg-[#eff8f2] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  O que já entra no índice
                </div>
                <p className="mt-3 text-lg font-semibold text-text-grey">
                  {formatCount(results.summary.validStructures)} trechos válidos
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Somam {formatKm(results.summary.validStructureKm)} km que hoje contam no IDECICLO da cidade.
                </p>
              </div>

              <div className="rounded-[24px] bg-[#fff7e8] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                  <TriangleAlert className="h-4 w-4" />
                  Onde vale investigar primeiro
                </div>
                {attentionStructures[0] ? (
                  <>
                    <p className="mt-3 text-lg font-semibold text-text-grey">
                      {getComparisonFriendlyTitle(attentionStructures[0])}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Nota {formatScore(attentionStructures[0].totalScore)} • {attentionStructures[0].scoreLabel}
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Ainda não existe estrutura com nota baixa consolidada para destacar.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl text-text-grey">Tipologias avaliadas</CardTitle>
                  <CardDescription>
                    Quanto da rede observada aparece em cada tipo de infraestrutura.
                  </CardDescription>
                </div>
                <ManualHelpDialog helpKey="B3" compact />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {typologyStats.length > 0 ? (
                typologyStats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Badge className={getSegmentTypeBadgeClassName(item.label)}>
                        {item.label}
                      </Badge>
                      <span className="text-sm font-semibold text-text-grey">
                        {formatKm(item.km)} km
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {formatCount(item.count)} trechos, sendo {formatCount(item.evaluated)} com avaliação concluída.
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-slate-600">
                  Nenhuma tipologia foi consolidada para esta cidade.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {Object.values(results.networks).map((network) => (
            <Card key={network.key} className="rounded-[28px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <Badge className={cn("rounded-full px-3 py-1", getHierarchyBadgeClassName(network.key))}>
                    {network.label}
                  </Badge>
                  <ManualHelpDialog helpKey="A2" compact />
                </div>
                <CardTitle className="text-xl text-text-grey">{network.label}</CardTitle>
                <CardDescription>
                  Faixa viária com peso {formatPercent(network.weight * 100)} no cálculo final.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Vias da cidade</div>
                  <div className="mt-2 text-lg font-semibold text-text-grey">{formatKm(network.totalRoadKm)} km</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Infraestrutura observada</div>
                  <div className="mt-2 text-lg font-semibold text-text-grey">{formatKm(network.structureKm)} km</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Trechos válidos</div>
                  <div className="mt-2 text-lg font-semibold text-text-grey">{formatKm(network.adequateKm)} km</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[32px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl text-text-grey">Mapa da cidade</CardTitle>
                  <CardDescription>
                    Visualização dos trechos cicloviários considerados nesta leitura pública.
                  </CardDescription>
                </div>
                <MapPinned className="h-5 w-5 text-ideciclo-red" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-[24px] border border-slate-200">
                <CityMap segments={segments} className="w-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl text-text-grey">Melhores e piores notas</CardTitle>
                  <CardDescription>
                    Um atalho para as estruturas que mais ajudam ou mais puxam a leitura da cidade.
                  </CardDescription>
                </div>
                <ManualHelpDialog helpKey="E2" compact />
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
              <div>
                <div className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Destaques positivos
                </div>
                <div className="space-y-3">
                  {bestStructures.map((detail) => (
                    <Link
                      key={detail.id}
                      to={getStructureDetailsPath(city.id, detail.id)}
                      className="block rounded-2xl border border-slate-200 p-4 transition hover:border-ideciclo-teal hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-text-grey">
                            {getComparisonFriendlyTitle(detail)}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            {detail.result.typeLabel} • {formatKm(detail.result.lengthKm)} km
                          </div>
                        </div>
                        <Badge className={detail.scoreBadgeClassName}>
                          {formatScore(detail.totalScore)}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                  Demandam atenção
                </div>
                <div className="space-y-3">
                  {attentionStructures.map((detail) => (
                    <Link
                      key={detail.id}
                      to={getStructureDetailsPath(city.id, detail.id)}
                      className="block rounded-2xl border border-slate-200 p-4 transition hover:border-ideciclo-teal hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-text-grey">
                            {getComparisonFriendlyTitle(detail)}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            {detail.result.typeLabel} • {formatKm(detail.result.lengthKm)} km
                          </div>
                        </div>
                        <Badge className={detail.scoreBadgeClassName}>
                          {formatScore(detail.totalScore)}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <Card className="rounded-[32px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl text-text-grey">Estruturas avaliadas</CardTitle>
                  <CardDescription>
                    Explore a base com filtros, ordenação e acesso à página individual de cada trecho.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full px-4 py-2">
                  {formatCount(filteredStructures.length)} resultados
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <div className="xl:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Buscar trecho
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="rounded-full border-slate-200 pl-10"
                      placeholder="Nome, bairro, tipo..."
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Tipologia
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      {structureTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Hierarquia
                  </label>
                  <Select value={hierarchyFilter} onValueChange={setHierarchyFilter}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="Estrutural">Estrutural</SelectItem>
                      <SelectItem value="Alimentadora">Alimentadora</SelectItem>
                      <SelectItem value="Local">Local</SelectItem>
                      <SelectItem value="Sem hierarquia">Sem hierarquia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Situação
                  </label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StructureStatusFilter)}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="avaliadas">Avaliadas</SelectItem>
                      <SelectItem value="pendentes">Pendentes</SelectItem>
                      <SelectItem value="validas">Entram no índice</SelectItem>
                      <SelectItem value="incompativeis">Incompatíveis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Faixa de nota
                  </label>
                  <Select value={scoreFilter} onValueChange={(value) => setScoreFilter(value as ScoreFilter)}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="altas">75 a 100</SelectItem>
                      <SelectItem value="medias">25 a 74,9</SelectItem>
                      <SelectItem value="baixas">0 a 24,9</SelectItem>
                      <SelectItem value="sem-nota">Sem nota</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Ordenar
                  </label>
                  <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Nota maior" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nota-desc">Nota maior → menor</SelectItem>
                      <SelectItem value="nota-asc">Nota menor → maior</SelectItem>
                      <SelectItem value="extensao-desc">Extensão maior → menor</SelectItem>
                      <SelectItem value="extensao-asc">Extensão menor → maior</SelectItem>
                      <SelectItem value="nome-asc">Nome A → Z</SelectItem>
                      <SelectItem value="nome-desc">Nome Z → A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead>Estrutura</TableHead>
                      <TableHead>Tipologia</TableHead>
                      <TableHead>Hierarquia</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead className="text-right">Extensão</TableHead>
                      <TableHead className="text-right">Nota</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStructures.length > 0 ? (
                      filteredStructures.map((detail) => {
                        const scoreMeta = getScoreBandMeta(detail.totalScore);

                        return (
                          <TableRow key={detail.id} className="align-middle">
                            <TableCell>
                              <div className="font-semibold text-text-grey">
                                {getComparisonFriendlyTitle(detail)}
                              </div>
                              {detail.segment.neighborhood ? (
                                <div className="mt-1 text-sm text-slate-500">
                                  {detail.segment.neighborhood}
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <Badge className={getSegmentTypeBadgeClassName(detail.result.typeLabel)}>
                                {detail.result.typeLabel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getHierarchyBadgeClassName(detail.result.hierarchy?.toString())}>
                                {detail.result.hierarchyLabel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStructureStatusBadgeClassName(detail.result)}>
                                {getStructureStatusLabel(detail.result)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium text-text-grey">
                              {formatKm(detail.result.lengthKm)} km
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge className={scoreMeta.className}>
                                {formatScore(detail.totalScore)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" className="rounded-full">
                                <Link to={getStructureDetailsPath(city.id, detail.id)}>
                                  Ver detalhes
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                          Nenhuma estrutura atende aos filtros atuais.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="comparacao" className="space-y-6">
          <Card className="rounded-[32px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl text-text-grey">Comparar estruturas</CardTitle>
                  <CardDescription>
                    Compare duas estruturas da mesma tipologia para entender quais pontos puxam o resultado para cima ou para baixo.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <ManualHelpDialog helpKey="B4" compact />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      setComparisonType("todos");
                      setFirstComparisonId("");
                      setSecondComparisonId("");
                    }}
                  >
                    <TimerReset className="h-4 w-4" />
                    Limpar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <Filter className="h-4 w-4" />
                    Tipologia
                  </label>
                  <Select value={comparisonType} onValueChange={setComparisonType}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Escolha a tipologia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as tipologias</SelectItem>
                      {structureTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <GitCompareArrows className="h-4 w-4" />
                    Primeira estrutura
                  </label>
                  <Select
                    value={firstComparisonId || "__none__"}
                    onValueChange={(value) =>
                      setFirstComparisonId(value === "__none__" ? "" : value)
                    }
                  >
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Selecione</SelectItem>
                      {comparisonCandidates
                        .filter((detail) => detail.id !== secondComparisonId)
                        .map((detail) => (
                          <SelectItem key={detail.id} value={detail.id}>
                            {getComparisonFriendlyTitle(detail)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <GitCompareArrows className="h-4 w-4" />
                    Segunda estrutura
                  </label>
                  <Select
                    value={secondComparisonId || "__none__"}
                    onValueChange={(value) =>
                      setSecondComparisonId(value === "__none__" ? "" : value)
                    }
                  >
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Selecione</SelectItem>
                      {comparisonCandidates
                        .filter((detail) => detail.id !== firstComparisonId)
                        .map((detail) => (
                          <SelectItem key={detail.id} value={detail.id}>
                            {getComparisonFriendlyTitle(detail)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {firstComparisonDetail && secondComparisonDetail ? (
                <>
                  <div className="grid gap-6 xl:grid-cols-2">
                    <ComparisonStructureCard detail={firstComparisonDetail} cityId={city.id} />
                    <ComparisonStructureCard detail={secondComparisonDetail} cityId={city.id} />
                  </div>

                  <div className="overflow-hidden rounded-[24px] border border-slate-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead>Critério</TableHead>
                          <TableHead>{getComparisonFriendlyTitle(firstComparisonDetail)}</TableHead>
                          <TableHead>{getComparisonFriendlyTitle(secondComparisonDetail)}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonRows.map((group) => (
                          group.criteria.map((row, index) => (
                            <TableRow key={`${group.key}-${row.code}`}>
                              <TableCell>
                                <div className="flex items-start gap-2">
                                  <div>
                                    {index === 0 ? (
                                      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                        {group.title}
                                      </div>
                                    ) : null}
                                    <div className="font-medium text-text-grey">
                                      {row.code} • {row.first?.label || row.second?.label}
                                    </div>
                                  </div>
                                  <ManualHelpDialog helpKey={row.code} compact />
                                </div>
                              </TableCell>
                              <TableCell>
                                {row.first ? (
                                  <div className="space-y-2">
                                    <Badge className={getRatingBadgeClassName(row.first.rating)}>
                                      {row.first.rating || "-"}
                                    </Badge>
                                    <p className="text-sm leading-6 text-slate-600">
                                      {row.first.scale.find((item) => item.rating === row.first?.rating)?.description ||
                                        "Sem descrição disponível."}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-500">Não se aplica</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {row.second ? (
                                  <div className="space-y-2">
                                    <Badge className={getRatingBadgeClassName(row.second.rating)}>
                                      {row.second.rating || "-"}
                                    </Badge>
                                    <p className="text-sm leading-6 text-slate-600">
                                      {row.second.scale.find((item) => item.rating === row.second?.rating)?.description ||
                                        "Sem descrição disponível."}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-500">Não se aplica</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <ArrowRightLeft className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-4 text-lg font-semibold text-text-grey">
                    Escolha duas estruturas para iniciar a comparação
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    A tipologia ajuda a manter a comparação justa. Depois disso, veja lado a lado as notas e os principais critérios do manual.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default DetalhesCidades;
