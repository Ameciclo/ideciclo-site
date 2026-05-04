import React, { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import AssessmentCriterionAccordion, {
  CriterionPagerConfig,
} from "@/components/AssessmentCriterionAccordion";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { CriterionFilter } from "@/components/criteriaAccordionContext";
import { IdecicloFormData, TrafficCalmingMeasure } from "@/types/idecicloForm";
import {
  buildCriterionScorePreview,
  CriterionScorePreviewItem,
} from "@/utils/criterionScorePreview";

interface Page3Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  filter?: CriterionFilter;
  command?: { type: "expand" | "collapse"; nonce: number } | null;
  visibleValues?: Array<"b11" | "b32" | "b12">;
  blockPager?: CriterionPagerConfig;
}

const TRAFFIC_CALMING_OPTIONS: Array<{
  key: TrafficCalmingMeasure;
  label: string;
  icon: string;
}> = [
  {
    key: "lombada",
    label: "Lombada",
    icon: "/icones/lombada.svg",
  },
  {
    key: "valas",
    label: "Vala transversal",
    icon: "/icones/vala-transversal.svg",
  },
  {
    key: "faixa_elevada",
    label: "Faixa em nível",
    icon: "/icones/faixa%20em%20nível.svg",
  },
  {
    key: "elevacao_intersecao",
    label: "Elevamento de interseção",
    icon: "/icones/elevamento-intersecao.svg",
  },
  {
    key: "reducao_largura",
    label: "Estreitamento de pista",
    icon: "/icones/estreitamento-pista.svg",
  },
];

const Page3: React.FC<Page3Props> = ({
  data,
  onDataChange,
  filter,
  command,
  visibleValues,
}) => {
  const [widthDraftCm, setWidthDraftCm] = useState("");
  const [bufferDraftCm, setBufferDraftCm] = useState("");
  const normalizedTypology = (data.infra_typology || "").toLowerCase();
  const isCiclorrota = normalizedTypology.includes("ciclorrota");
  const isCalcada =
    normalizedTypology.includes("compart") || normalizedTypology.includes("calçada");
  const canShow = (value: "b11" | "b32" | "b12") =>
    !visibleValues || visibleValues.includes(value);
  const visibleAccordionValues = (
    isCiclorrota ? ["b12"] : isCalcada ? ["b11"] : ["b11", "b32", "b12"]
  ).filter(canShow);

  const isTouched = (fields: string[]) => fields.some((field) => data.touched_fields?.[field]);
  const updateWorkflow = (criterion: string, value: "default" | "analysis") =>
    onDataChange({
      criterion_workflow_state: {
        ...(data.criterion_workflow_state || {}),
        [criterion]: value,
      },
    });

  const widthMeasurements = useMemo(
    () => (Array.isArray(data.width_measurements_m) ? data.width_measurements_m : []),
    [data.width_measurements_m]
  );
  const bufferMeasurements = useMemo(
    () => (Array.isArray(data.buffer_measurements_m) ? data.buffer_measurements_m : []),
    [data.buffer_measurements_m]
  );

  const widthAverage = useMemo(() => {
    if (widthMeasurements.length === 0) return data.width_meters || 0;
    const total = widthMeasurements.reduce((sum, measurement) => sum + measurement, 0);
    return total / widthMeasurements.length;
  }, [data.width_meters, widthMeasurements]);

  const bufferAverage = useMemo(() => {
    if (bufferMeasurements.length === 0) return data.buffer_width_m || 0;
    const total = bufferMeasurements.reduce((sum, measurement) => sum + measurement, 0);
    return total / bufferMeasurements.length;
  }, [bufferMeasurements, data.buffer_width_m]);

  const formatMeters = (value: number) => value.toFixed(2).replace(".", ",");
  const ratingChipClassName = (rating: string | null | undefined) => {
    if (rating === "A") return "border-transparent bg-[#b8e5db] text-[#163b38]";
    if (rating === "B") return "border-transparent bg-[#9fd3cb] text-[#163b38]";
    if (rating === "C") return "border-transparent bg-[#8fafad] text-[#163b38]";
    if (rating === "D") return "border-transparent bg-[#748987] text-white";
    return "border-slate-300 bg-slate-900 text-white";
  };
  const formatDraftAsMeters = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";

    const numericValue = Number(digits) / 100;
    return numericValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const parseDraftToMeters = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return 0;
    return Number(digits) / 100;
  };

  const measuredFlowLabel =
    data.infra_flow === "bidirectional" ? "Bidirecional" : "Unidirecional";
  const widthConcept =
    widthAverage <= 0
      ? null
      : data.infra_flow === "bidirectional"
        ? widthAverage >= 3
          ? "A"
          : widthAverage >= 2.5
            ? "B"
            : widthAverage >= 2
              ? "C"
              : "D"
        : widthAverage >= 2
          ? "A"
          : widthAverage >= 1.5
            ? "B"
            : widthAverage >= 1
              ? "C"
              : "D";

  const bufferConcept =
    bufferAverage <= 0
      ? null
      : Number(data.velocity_kmh || 0) >= 50
        ? data.lateral_spacing_type === "apagada"
          ? "D"
          : bufferAverage > 1
            ? "A"
            : bufferAverage >= 0.4 && bufferAverage <= 1
              ? "B"
              : bufferAverage >= 0.2 && bufferAverage < 0.4
                ? "C"
                : "D"
        : data.lateral_spacing_type === "apagada"
          ? "D"
          : bufferAverage > 0.7
            ? "A"
            : bufferAverage > 0.4 &&
                bufferAverage <= 0.7 &&
                (["A", "B", "C"].includes(data.separation_devices_ciclofaixa || "") ||
                  normalizedTypology.includes("ciclovia") ||
                  data.has_double_lateral_line)
              ? "B"
              : !["A", "B", "C"].includes(data.separation_devices_ciclofaixa || "") &&
                  !normalizedTypology.includes("ciclovia") &&
                  !data.has_double_lateral_line
                ? "C"
                : "D";
  const b32ScorePreview: CriterionScorePreviewItem[] = bufferConcept
    ? [{ code: "B3", rating: bufferConcept, points: null }]
    : [];
  const b3FinalRating = buildCriterionScorePreview(data, ["B3"])[0]?.rating;
  const b31LocalRating = normalizedTypology.includes("ciclovia")
    ? data.separation_devices_ciclovia || null
    : normalizedTypology.includes("ciclofaixa")
      ? data.separation_devices_ciclofaixa || null
      : normalizedTypology.includes("compart") || normalizedTypology.includes("calçada")
        ? data.separation_devices_calcada || null
        : null;
  const b3LocalConceptBadge =
    b31LocalRating || bufferConcept ? (
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${ratingChipClassName(
          b3FinalRating
        )}`}
      >
        <span>{b31LocalRating || "–"}</span>
        <span className="mx-1.5 opacity-70">×</span>
        <span>{bufferConcept || "–"}</span>
      </span>
    ) : null;

  const addWidthMeasurement = () => {
    const measurementMeters = parseDraftToMeters(widthDraftCm);
    if (!Number.isFinite(measurementMeters) || measurementMeters <= 0) return;

    const nextMeasurements = [...widthMeasurements, measurementMeters];
    const nextAverage =
      nextMeasurements.reduce((sum, measurement) => sum + measurement, 0) /
      nextMeasurements.length;

    onDataChange({
      width_measurements_m: nextMeasurements,
      width_meters: Number(nextAverage.toFixed(4)),
      touched_fields: {
        width_measurements_m: true,
        width_meters: true,
      },
    });
  };

  const addBufferMeasurement = () => {
    const measurementMeters = parseDraftToMeters(bufferDraftCm);
    if (!Number.isFinite(measurementMeters) || measurementMeters <= 0) return;

    const nextMeasurements = [...bufferMeasurements, measurementMeters];
    const nextAverage =
      nextMeasurements.reduce((sum, measurement) => sum + measurement, 0) /
      nextMeasurements.length;

    onDataChange({
      buffer_measurements_m: nextMeasurements,
      buffer_width_m: Number(nextAverage.toFixed(4)),
      lateral_spacing_width_m: Number(nextAverage.toFixed(4)),
      touched_fields: {
        buffer_measurements_m: true,
        buffer_width_m: true,
        lateral_spacing_width_m: true,
      },
    });
  };

  const removeWidthMeasurement = (indexToRemove: number) => {
    const nextMeasurements = widthMeasurements.filter((_, index) => index !== indexToRemove);
    const nextAverage =
      nextMeasurements.length > 0
        ? nextMeasurements.reduce((sum, measurement) => sum + measurement, 0) /
          nextMeasurements.length
        : 0;

    onDataChange({
      width_measurements_m: nextMeasurements,
      width_meters: Number(nextAverage.toFixed(4)),
      touched_fields: {
        width_measurements_m: nextMeasurements.length > 0,
        width_meters: nextMeasurements.length > 0,
      },
    });
  };

  const removeBufferMeasurement = (indexToRemove: number) => {
    const nextMeasurements = bufferMeasurements.filter((_, index) => index !== indexToRemove);
    const nextAverage =
      nextMeasurements.length > 0
        ? nextMeasurements.reduce((sum, measurement) => sum + measurement, 0) /
          nextMeasurements.length
        : 0;

    onDataChange({
      buffer_measurements_m: nextMeasurements,
      buffer_width_m: Number(nextAverage.toFixed(4)),
      lateral_spacing_width_m: Number(nextAverage.toFixed(4)),
      touched_fields: {
        buffer_measurements_m: nextMeasurements.length > 0,
        buffer_width_m: nextMeasurements.length > 0,
        lateral_spacing_width_m: nextMeasurements.length > 0,
      },
    });
  };

  const trafficCalmingCounts = useMemo(
    () => data.traffic_calming_counts || {},
    [data.traffic_calming_counts]
  );
  const totalTrafficCalming = Object.values(trafficCalmingCounts).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );
  const extensionMeters = Number(data.extension_m || 0) * 1000;
  const computedAverageDistance =
    totalTrafficCalming > 0 && extensionMeters > 0
      ? extensionMeters / totalTrafficCalming
      : 0;
  const displayAverageDistance = computedAverageDistance || data.avg_distance_measures_m || 0;

  const handleTrafficCalmingCountChange = (measure: TrafficCalmingMeasure, delta: number) => {
    const currentCount = Number(trafficCalmingCounts[measure] || 0);
    const nextCount = Math.max(0, currentCount + delta);
    const nextCounts = {
      ...trafficCalmingCounts,
      [measure]: nextCount,
    };
    const nextMeasures = Object.entries(nextCounts)
      .filter(([, value]) => Number(value) > 0)
      .map(([key]) => key);
    const nextTotal = Object.values(nextCounts).reduce(
      (sum, value) => sum + Number(value || 0),
      0
    );
    const nextAverage =
      nextTotal > 0 && extensionMeters > 0 ? extensionMeters / nextTotal : 0;

    onDataChange({
      traffic_calming_counts: nextCounts,
      speed_measures: nextMeasures,
      avg_distance_measures_m: Number(nextAverage.toFixed(2)),
      no_traffic_calming_measures: false,
      touched_fields: {
        traffic_calming_counts: nextTotal > 0,
        speed_measures: nextTotal > 0,
        avg_distance_measures_m: nextTotal > 0,
        no_traffic_calming_measures: false,
      },
    });
  };

  const handleNoTrafficCalmingChange = (checked: boolean) =>
    onDataChange({
      no_traffic_calming_measures: checked,
      ...(checked
        ? {
            traffic_calming_counts: {},
            speed_measures: [],
            avg_distance_measures_m: 0,
          }
        : {}),
      touched_fields: {
        no_traffic_calming_measures: checked,
        ...(checked
          ? {
              traffic_calming_counts: false,
              speed_measures: false,
              avg_distance_measures_m: false,
            }
          : {}),
      },
    });

  const clearTrafficCalming = () =>
    onDataChange({
      traffic_calming_counts: {},
      speed_measures: [],
      avg_distance_measures_m: 0,
      no_traffic_calming_measures: false,
      touched_fields: {
        traffic_calming_counts: false,
        speed_measures: false,
        avg_distance_measures_m: false,
        no_traffic_calming_measures: false,
      },
    });

  const trafficCalmingHistory = useMemo(
    () =>
      TRAFFIC_CALMING_OPTIONS.map((option) => ({
        ...option,
        count: Number(trafficCalmingCounts[option.key] || 0),
      })).filter((option) => option.count > 0),
    [trafficCalmingCounts]
  );

  const removeTrafficCalmingMeasurement = (measure: TrafficCalmingMeasure) => {
    handleTrafficCalmingCountChange(measure, -1);
  };

  return (
    <CriteriaAccordionGroup
      allValues={visibleAccordionValues}
      defaultOpenValues={visibleAccordionValues}
      filter={filter}
      command={command}
    >
      {!isCiclorrota && canShow("b11") ? (
        <AssessmentCriterionAccordion
          value="b11"
          title="B.1. Largura da infraestrutura cicloviária"
          description="Adicione as medições da largura observada em campo para cálculo automático."
          scorePreview={buildCriterionScorePreview(data, ["B1"])}
          answered={
            widthMeasurements.length > 0 ||
            Boolean(data.includes_gutter)
          }
          inAnalysis={data.criterion_workflow_state?.b11 === "analysis"}
          onAnalysisChange={(value) => updateWorkflow("b11", value ? "analysis" : "default")}
          onClear={() =>
            onDataChange({
              width_meters: 0,
              width_measurements_m: [],
              includes_gutter: false,
              touched_fields: {
                width_meters: false,
                width_measurements_m: false,
                includes_gutter: false,
              },
            })
          }
          helpKey="B1"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                id="width_measurement_cm"
                inputMode="numeric"
                type="text"
                placeholder="Ex.: 2,35"
                value={formatDraftAsMeters(widthDraftCm)}
                onChange={(event) => setWidthDraftCm(event.target.value.replace(/\D/g, ""))}
              />
              <Button type="button" className="h-10 px-3" onClick={addWidthMeasurement}>
                Adicionar
              </Button>
            </div>
            <div>
              {widthMeasurements.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {widthMeasurements.map((measurement, index) => (
                    <button
                      key={`${measurement}-${index}`}
                      type="button"
                      onClick={() => removeWidthMeasurement(index)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      {formatMeters(measurement)} m ×
                    </button>
                  ))}
                  <div
                    className={`rounded-full px-3 py-2 text-sm font-semibold ${ratingChipClassName(widthConcept)}`}
                  >
                    = {formatMeters(widthAverage)} m
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma medição adicionada ainda.</p>
              )}
            </div>

            <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
              <Switch
                checked={Boolean(data.includes_gutter)}
                onCheckedChange={(checked) =>
                  onDataChange({
                    includes_gutter: checked,
                    touched_fields: { includes_gutter: true },
                  })
                }
              />
              <span>Inclui sarjeta</span>
            </label>

            {!data.touched_fields?.infra_flow ? (
              <p className="text-sm text-amber-700">
                Revise o fluxo da infraestrutura. A nota da largura depende dele.
              </p>
            ) : null}
          </div>
        </AssessmentCriterionAccordion>
      ) : null}

      {!isCiclorrota && !isCalcada && canShow("b32") ? (
        <AssessmentCriterionAccordion
          value="b32"
          title="B.3.2. Afastamento lateral"
          description="Adicione as medições observadas em campo para compor o cálculo de B.3."
          scorePreview={b32ScorePreview}
          extraBadges={b3LocalConceptBadge}
          answered={
            bufferMeasurements.length > 0 ||
            data.buffer_width_m > 0 ||
            isTouched(["buffer_width_m", "buffer_measurements_m", "lateral_spacing_width_m"])
          }
          inAnalysis={data.criterion_workflow_state?.b32 === "analysis"}
          onAnalysisChange={(value) => updateWorkflow("b32", value ? "analysis" : "default")}
          onClear={() =>
            onDataChange({
              buffer_width_m: 0,
              buffer_measurements_m: [],
              lateral_spacing_width_m: 0,
              lateral_spacing_type: "",
              has_double_lateral_line: false,
              touched_fields: {
                buffer_width_m: false,
                buffer_measurements_m: false,
                lateral_spacing_width_m: false,
                lateral_spacing_type: false,
                has_double_lateral_line: false,
              },
            })
          }
          helpKey="b32"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                id="buffer_width_cm"
                inputMode="numeric"
                type="text"
                placeholder="Ex.: 0,80"
                value={formatDraftAsMeters(bufferDraftCm)}
                onChange={(event) => setBufferDraftCm(event.target.value.replace(/\D/g, ""))}
              />
              <Button type="button" className="h-10 px-3" onClick={addBufferMeasurement}>
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Os dispositivos de separação são lidos do B.3.1. Para ciclovia, a separação é
                considerada automaticamente.
              </p>
              <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
                <Switch
                  checked={Boolean(data.has_double_lateral_line)}
                  onCheckedChange={(checked) =>
                    onDataChange({
                      has_double_lateral_line: checked,
                      touched_fields: {
                        has_double_lateral_line: true,
                      },
                    })
                  }
                />
                <span>Linha dupla</span>
              </label>
            </div>
            <div>
              {bufferMeasurements.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {bufferMeasurements.map((measurement, index) => (
                    <button
                      key={`${measurement}-${index}`}
                      type="button"
                      onClick={() => removeBufferMeasurement(index)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      {formatMeters(measurement)} m ×
                    </button>
                  ))}
                  <div
                    className={`rounded-full px-3 py-2 text-sm font-semibold ${ratingChipClassName(bufferConcept)}`}
                  >
                    = {formatMeters(bufferAverage)} m
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma medição adicionada ainda.</p>
              )}
            </div>
          </div>
        </AssessmentCriterionAccordion>
      ) : null}

      {isCiclorrota && canShow("b12") ? (
        <AssessmentCriterionAccordion
          value="b12"
          title="B.6. Medidas de moderação de velocidade"
          description="Aplicável a ciclorrotas, com contagem dos elementos físicos ao longo do trecho."
          scorePreview={buildCriterionScorePreview(data, ["B6"])}
          answered={totalTrafficCalming > 0 || Boolean(data.no_traffic_calming_measures)}
          inAnalysis={data.criterion_workflow_state?.b12 === "analysis"}
          onAnalysisChange={(value) => updateWorkflow("b12", value ? "analysis" : "default")}
          onClear={clearTrafficCalming}
          helpKey="B6"
        >
          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800">
              <span>Sem medidas de moderação</span>
              <Switch
                checked={Boolean(data.no_traffic_calming_measures) && totalTrafficCalming === 0}
                onCheckedChange={handleNoTrafficCalmingChange}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TRAFFIC_CALMING_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleTrafficCalmingCountChange(option.key, 1)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <img src={option.icon} alt={option.label} className="h-12 w-12 object-contain" />
                  <div className="space-y-1">
                    <span className="block text-sm font-semibold text-slate-700">{option.label}</span>
                    <span className="block text-xs text-slate-500">Toque para adicionar</span>
                  </div>
                </button>
              ))}
            </div>

            <div>
              {trafficCalmingHistory.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {trafficCalmingHistory.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => removeTrafficCalmingMeasurement(item.key)}
                      className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      <img src={item.icon} alt={item.label} className="h-5 w-5 object-contain" />
                      <span>{item.label}</span>
                      <span className="font-semibold text-slate-500">x{item.count}</span>
                      <span>×</span>
                    </button>
                  ))}
                  <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
                    = {displayAverageDistance.toFixed(1).replace(".", ",")} m
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma medida adicionada ainda.</p>
              )}
            </div>
          </div>
        </AssessmentCriterionAccordion>
      ) : null}
    </CriteriaAccordionGroup>
  );
};

export default Page3;
