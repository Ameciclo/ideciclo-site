import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowRightLeft,
  Bike,
  CheckCircle2,
  FileText,
  Gauge,
  MapPinned,
  Route,
  Shield,
  SunMedium,
  TriangleAlert,
  Wrench,
} from "lucide-react";

import ManualHelpDialog from "@/components/ManualHelpDialog";
import SegmentPreviewMap from "@/components/SegmentPreviewMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { manualDownloadUrl } from "@/constants/siteLinks";
import { fetchCityFromDB, fetchFormsByCityId, fetchSegmentsFromDB } from "@/services/database";
import type { City, Form, Segment } from "@/types";
import { getHierarchyBadgeClassName, getSegmentTypeBadgeClassName } from "@/utils/segmentBadgeStyles";
import {
  buildResultsSnapshot,
  buildStructureDetails,
  findStructureDetail,
  formatCount,
  formatKm,
  formatScore,
  getCityDetailsPath,
  getComparisonFriendlyTitle,
  getRatingBadgeClassName,
  getStructureDetailsPath,
  getStructureStatusBadgeClassName,
  getStructureStatusLabel,
  getTopAndBottomCriteria,
  PUBLIC_CRITERION_GROUPS,
  type PublicStructureDetail,
} from "@/utils/publicIdeciclo";

const SummaryMetric = ({
  icon: Icon,
  label,
  value,
  helper,
  tone = "default",
}: {
  icon: typeof Bike;
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "good" | "alert" | "cool";
}) => {
  const toneClassName =
    tone === "good"
      ? "from-[#eff8f2] to-white"
      : tone === "alert"
        ? "from-[#fff3e7] to-white"
        : tone === "cool"
          ? "from-[#eef5fb] to-white"
          : "from-white to-white";

  return (
    <Card className="rounded-[28px] border-0 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className={`bg-gradient-to-br ${toneClassName}`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ideciclo-red shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
            {helper ? <ManualHelpDialog helpKey={helper} compact /> : null}
          </div>
          <CardDescription className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </CardDescription>
          <CardTitle className="text-3xl text-text-grey">{value}</CardTitle>
        </CardHeader>
      </div>
    </Card>
  );
};

const SECTION_HEADER_STYLES: Record<
  string,
  {
    letterClassName: string;
    titleClassName: string;
  }
> = {
  A: {
    letterClassName: "bg-[#f6d7cc] text-[#8f2f1d]",
    titleClassName: "text-[#8f2f1d]",
  },
  B: {
    letterClassName: "bg-[#f6e8be] text-[#8a6112]",
    titleClassName: "text-[#8a6112]",
  },
  C: {
    letterClassName: "bg-[#d9edf5] text-[#1f6278]",
    titleClassName: "text-[#1f6278]",
  },
  D: {
    letterClassName: "bg-[#dff1e4] text-[#27623d]",
    titleClassName: "text-[#27623d]",
  },
  E: {
    letterClassName: "bg-[#e8def7] text-[#5f3b91]",
    titleClassName: "text-[#5f3b91]",
  },
};

const DetalhesEstrutura = () => {
  const { cityId, segmentId } = useParams<{ cityId: string; segmentId: string }>();
  const [city, setCity] = useState<City | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.error("Erro ao carregar detalhes da estrutura:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [cityId]);

  const results = useMemo(() => {
    if (!city) return null;
    return buildResultsSnapshot(city, segments, forms);
  }, [city, forms, segments]);

  const structureDetails = useMemo(() => {
    if (!city || !results) return [];
    return buildStructureDetails(city, segments, forms, results);
  }, [city, forms, results, segments]);

  const currentDetail = useMemo(
    () => (segmentId ? findStructureDetail(structureDetails, segmentId) : null),
    [segmentId, structureDetails]
  );

  const orderedDetails = useMemo(
    () =>
      [...structureDetails].sort((left, right) =>
        getComparisonFriendlyTitle(left).localeCompare(
          getComparisonFriendlyTitle(right),
          "pt-BR"
        )
      ),
    [structureDetails]
  );

  const currentIndex = useMemo(
    () => orderedDetails.findIndex((detail) => detail.id === currentDetail?.id),
    [currentDetail?.id, orderedDetails]
  );

  const previousDetail =
    currentIndex > 0 ? orderedDetails[currentIndex - 1] : null;
  const nextDetail =
    currentIndex >= 0 && currentIndex < orderedDetails.length - 1
      ? orderedDetails[currentIndex + 1]
      : null;

  const topBottom = useMemo(
    () => (currentDetail ? getTopAndBottomCriteria(currentDetail) : null),
    [currentDetail]
  );

  if (loading) {
    return (
      <div className="container py-20">
        <div className="flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-ideciclo-red" />
        </div>
      </div>
    );
  }

  if (!city || !results || !currentDetail) {
    return (
      <div className="container py-20">
        <Card className="mx-auto max-w-2xl rounded-[28px] border-0 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-text-grey">Estrutura não encontrada</CardTitle>
            <CardDescription>
              Não foi possível localizar esta estrutura na base pública da cidade selecionada.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-ideciclo-red text-white hover:bg-ideciclo-red/90">
              <Link to={cityId ? getCityDetailsPath(cityId) : "/ranking"}>
                <ArrowLeft className="h-4 w-4" />
                Voltar à cidade
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/ranking">Ir para o ranking</Link>
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
            <Link to={getCityDetailsPath(city.id)} className="hover:text-ideciclo-red">
              {city.name}
            </Link>
            <span>/</span>
            <span>{getComparisonFriendlyTitle(currentDetail)}</span>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge className={currentDetail.scoreBadgeClassName}>
                  {currentDetail.scoreLabel} • nota {formatScore(currentDetail.totalScore)}
                </Badge>
                <Badge className={getSegmentTypeBadgeClassName(currentDetail.result.typeLabel)}>
                  {currentDetail.result.typeLabel}
                </Badge>
                <Badge className={getHierarchyBadgeClassName(currentDetail.result.hierarchy?.toString())}>
                  {currentDetail.result.hierarchyLabel}
                </Badge>
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight text-text-grey md:text-6xl">
                {getComparisonFriendlyTitle(currentDetail)}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700 md:text-lg">
                Esta página mostra por que essa estrutura recebeu sua nota atual, quais critérios do manual puxaram o resultado
                para cima ou para baixo e quais observações de campo ajudam a explicar a experiência de quem pedala nesse trecho.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-ideciclo-red text-white hover:bg-ideciclo-red/90">
                  <Link to={getCityDetailsPath(city.id)}>
                    <ArrowLeft className="h-4 w-4" />
                    Voltar à cidade
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link to={`${getCityDetailsPath(city.id)}?compare=${currentDetail.id}#comparacao`}>
                    <ArrowRightLeft className="h-4 w-4" />
                    Comparar com outra estrutura
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <a href={manualDownloadUrl} target="_blank" rel="noreferrer">
                    <FileText className="h-4 w-4" />
                    Ler manual
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
                  Uma síntese dos pontos que mais ajudam a entender a qualidade deste trecho.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topBottom ? (
                  <>
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
                          <span className="text-sm text-emerald-900/70">
                            Ainda sem destaques positivos consolidados.
                          </span>
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
                          <span className="text-sm text-amber-900/70">
                            Nenhum alerta crítico apareceu nesta leitura.
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="container -mt-8 space-y-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SummaryMetric
            icon={Gauge}
            label="Nota total"
            value={formatScore(currentDetail.totalScore)}
            helper="A1"
            tone="cool"
          />
          <SummaryMetric
            icon={Route}
            label="Extensão"
            value={`${formatKm(currentDetail.result.lengthKm)} km`}
            helper="B1"
          />
          <SummaryMetric
            icon={Bike}
            label="Tipologia"
            value={currentDetail.result.typeLabel}
            helper="B3"
          />
          <SummaryMetric
            icon={Shield}
            label="Hierarquia da via"
            value={currentDetail.result.hierarchyLabel}
            helper="A1"
            tone="good"
          />
          <SummaryMetric
            icon={MapPinned}
            label="Interseções"
            value={formatCount(
              Number(
                currentDetail.formData.intersections_count ||
                  currentDetail.segment.intersections_count ||
                  0
              )
            )}
            helper="C1"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-[32px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl text-text-grey">Mapa do trecho</CardTitle>
                  <CardDescription>
                    Visualização espacial da estrutura cicloviária analisada.
                  </CardDescription>
                </div>
                <MapPinned className="h-5 w-5 text-ideciclo-red" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-[24px] border border-slate-200">
                <SegmentPreviewMap segment={currentDetail.segment} className="h-[420px] w-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl text-text-grey">Leitura de campo</CardTitle>
                  <CardDescription>
                    Os pontos que mais ajudam a explicar a sensação de qualidade desse trecho.
                  </CardDescription>
                </div>
                <ManualHelpDialog helpKey="B7" compact />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] bg-[#f2f7fb] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ideciclo-blue">
                  <SunMedium className="h-4 w-4" />
                  Conforto e ambiência
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Iluminação, sombreamento, mobiliário e legibilidade da infraestrutura ajudam a transformar o trecho
                  em uma rota mais convidativa para uso cotidiano.
                </p>
              </div>
              <div className="rounded-[24px] bg-[#fff7e8] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                  <TriangleAlert className="h-4 w-4" />
                  Segurança e conflito
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  A nota cai quando aparecem conflitos em cruzamentos, falta de tratamento com veículos motorizados
                  ou riscos acumulados ao longo do percurso.
                </p>
              </div>
              <div className="rounded-[24px] bg-[#eff8f2] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <Wrench className="h-4 w-4" />
                  Conservação
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Estado do pavimento, delimitação e sinalização pesa bastante na leitura pública do trecho e na sua
                  confiabilidade para quem usa a bicicleta no dia a dia.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <Card className="rounded-[32px] border-0 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl text-text-grey">Critérios da avaliação</CardTitle>
                  <CardDescription>
                    Cada bloco abaixo mostra a nota por tema, a interpretação pública e os indícios usados no formulário.
                  </CardDescription>
                </div>
                <ManualHelpDialog helpKey="B4" compact />
              </div>
            </CardHeader>
            <CardContent className="space-y-8 px-4 pb-6 sm:space-y-6 sm:px-6">
              {currentDetail.sections.map((section) => {
                const headerStyle =
                  SECTION_HEADER_STYLES[section.key] || {
                    letterClassName: "bg-slate-200 text-slate-700",
                    titleClassName: "text-text-grey",
                  };

                return (
                <div
                  key={section.key}
                  className="px-0 py-0 sm:rounded-[28px] sm:border sm:border-slate-200 sm:bg-white sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${headerStyle.letterClassName}`}
                        >
                          {section.key}
                        </div>
                        <h3 className={`text-xl font-semibold sm:text-2xl ${headerStyle.titleClassName}`}>
                          {section.label}
                        </h3>
                      </div>
                      <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                        {PUBLIC_CRITERION_GROUPS.find((group) => group.key === section.key)?.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full px-4 py-2">
                      {section.score}/{section.max} pontos
                    </Badge>
                  </div>

                  <div className="mt-5 space-y-4">
                    {section.criteria.map((criterion) => {
                      const currentScale = criterion.scale.find(
                        (item) => item.rating === criterion.rating
                      );

                      return (
                        <div
                          key={criterion.code}
                          className="rounded-[24px] border border-slate-200 bg-slate-50 p-3 sm:p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-lg font-semibold text-text-grey">
                                  {criterion.code} • {criterion.label}
                                </div>
                                <ManualHelpDialog helpKey={criterion.code} compact />
                              </div>
                              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                                {currentScale?.description || "Sem explicação textual registrada para este item."}
                              </p>
                            </div>
                            <Badge className={`rounded-full px-4 py-2 ${getRatingBadgeClassName(criterion.rating)}`}>
                              {criterion.rating || "-"}
                              <span className="mx-2 opacity-80">•</span>
                              {criterion.points !== null
                                ? `${criterion.points}/${criterion.maxPoints}`
                                : `até ${criterion.maxPoints}`}
                            </Badge>
                          </div>
                          {criterion.evidence.length > 0 ? (
                            <div className="mt-4 grid gap-2 md:grid-cols-2">
                              {criterion.evidence.map((item) => (
                                <div
                                  key={`${criterion.code}-${item}`}
                                  className="rounded-2xl bg-white p-2.5 text-sm leading-6 text-slate-600 sm:p-3"
                                >
                                  {item}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
                );
              })}
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <div className="text-sm leading-7 text-slate-600">
            Estrutura {currentIndex + 1} de {orderedDetails.length} nesta cidade.
          </div>
          <div className="flex flex-wrap gap-3">
            {previousDetail ? (
              <Button asChild variant="outline" className="rounded-full">
                <Link to={getStructureDetailsPath(city.id, previousDetail.id)}>
                  <ArrowLeft className="h-4 w-4" />
                  Estrutura anterior
                </Link>
              </Button>
            ) : null}
            {nextDetail ? (
              <Button asChild variant="outline" className="rounded-full">
                <Link to={getStructureDetailsPath(city.id, nextDetail.id)}>
                  Próxima estrutura
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DetalhesEstrutura;
