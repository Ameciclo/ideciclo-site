import React, { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import AssessmentCriterionAccordion from "@/components/AssessmentCriterionAccordion";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { CriterionFilter } from "@/components/criteriaAccordionContext";
import { IdecicloFormData, TrafficCalmingMeasure } from "@/types/idecicloForm";
import { buildCriterionScorePreview } from "@/utils/criterionScorePreview";

interface Page3Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  filter?: CriterionFilter;
  command?: { type: "expand" | "collapse"; nonce: number } | null;
}

const TRAFFIC_CALMING_OPTIONS: Array<{
  key: TrafficCalmingMeasure;
  label: string;
}> = [
  { key: "lombada", label: "Lombadas, quebra-molas ou ondulacoes transversais" },
  { key: "valas", label: "Valas transversais" },
  { key: "faixa_elevada", label: "Faixas de travessia elevadas" },
  { key: "elevacao_intersecao", label: "Elevacoes de intersecao" },
  { key: "reducao_largura", label: "Estreitamentos de faixa" },
];

const Page3: React.FC<Page3Props> = ({ data, onDataChange, filter, command }) => {
  const [widthDraftCm, setWidthDraftCm] = useState("");
  const [bufferDraftCm, setBufferDraftCm] = useState("");
  const normalizedTypology = (data.infra_typology || "").toLowerCase();
  const isCiclorrota = normalizedTypology.includes("ciclorrota");
  const isCalcada =
    normalizedTypology.includes("compart") || normalizedTypology.includes("calçada");

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
        ? data.lateral_spacing_type === "linha" || data.lateral_spacing_type === "apagada"
          ? "D"
          : bufferAverage > 1
            ? "A"
            : bufferAverage >= 0.4
              ? "B"
              : bufferAverage >= 0.2
                ? "C"
                : "D"
        : data.lateral_spacing_type === "apagada"
          ? "D"
          : bufferAverage > 0.7
            ? "A"
            : data.lateral_spacing_type === "dispositivos" &&
                bufferAverage > 0.4 &&
                bufferAverage <= 0.7
              ? "B"
              : data.lateral_spacing_type === "linha"
                ? "C"
                : "D";

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

  const trafficCalmingCounts = data.traffic_calming_counts || {};
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
      touched_fields: {
        traffic_calming_counts: nextTotal > 0,
        speed_measures: nextTotal > 0,
        avg_distance_measures_m: nextTotal > 0,
      },
    });
  };

  const clearTrafficCalming = () =>
    onDataChange({
      traffic_calming_counts: {},
      speed_measures: [],
      avg_distance_measures_m: 0,
      touched_fields: {
        traffic_calming_counts: false,
        speed_measures: false,
        avg_distance_measures_m: false,
      },
    });

  const renderStepper = ({
    label,
    value,
    onDecrease,
    onIncrease,
  }: {
    label: string;
    value: number;
    onDecrease: () => void;
    onIncrease: () => void;
  }) => (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="mb-3 text-sm font-medium text-slate-700">{label}</div>
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 w-9 rounded-full p-0"
          onClick={onDecrease}
          disabled={value <= 0}
        >
          -
        </Button>
        <div className="min-w-[44px] text-center text-xl font-bold text-slate-900">{value}</div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 w-9 rounded-full p-0"
          onClick={onIncrease}
        >
          +
        </Button>
      </div>
    </div>
  );

  return (
    <CriteriaAccordionGroup
      allValues={
        isCiclorrota ? ["b12"] : isCalcada ? ["b11"] : ["b11", "b32", "b12"]
      }
      defaultOpenValues={isCiclorrota ? ["b12"] : isCalcada ? ["b11"] : ["b11", "b32"]}
      filter={filter}
      command={command}
    >
      {!isCiclorrota ? (
        <AssessmentCriterionAccordion
          value="b11"
          title="B.1. Largura da infraestrutura cicloviária"
          description="Adicione as medições da largura observada em campo para cálculo automático."
          scorePreview={buildCriterionScorePreview(data, ["B1"])}
          answered={
            widthMeasurements.length > 0 ||
            data.width_meters > 0 ||
            isTouched(["width_meters", "width_measurements_m", "includes_gutter", "infra_flow"])
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

      {!isCiclorrota && !isCalcada ? (
        <AssessmentCriterionAccordion
          value="b32"
          title="B.3.2. Afastamento lateral"
          description="Adicione as medições observadas em campo para compor o cálculo de B.3."
          scorePreview={buildCriterionScorePreview(data, ["B3"])}
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
              touched_fields: {
                buffer_width_m: false,
                buffer_measurements_m: false,
                lateral_spacing_width_m: false,
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

      {isCiclorrota ? (
        <AssessmentCriterionAccordion
          value="b12"
          title="B.6. Medidas de moderação de velocidade"
          description="Aplicável a ciclorrotas, com contagem dos elementos físicos ao longo do trecho."
          scorePreview={buildCriterionScorePreview(data, ["B6"])}
          answered={
            totalTrafficCalming > 0 ||
            isTouched(["traffic_calming_counts", "speed_measures", "avg_distance_measures_m"])
          }
          inAnalysis={data.criterion_workflow_state?.b12 === "analysis"}
          onAnalysisChange={(value) => updateWorkflow("b12", value ? "analysis" : "default")}
          onClear={clearTrafficCalming}
          helpKey="B6"
        >
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {TRAFFIC_CALMING_OPTIONS.map((option) => (
                <div key={option.key}>
                  {renderStepper({
                    label: option.label,
                    value: Number(trafficCalmingCounts[option.key] || 0),
                    onDecrease: () => handleTrafficCalmingCountChange(option.key, -1),
                    onIncrease: () => handleTrafficCalmingCountChange(option.key, 1),
                  })}
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border p-4">
                <div className="text-sm font-medium text-slate-700">Total de elementos</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{totalTrafficCalming}</div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="text-sm font-medium text-slate-700">Distância média</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">
                  {displayAverageDistance.toFixed(1).replace(".", ",")} m
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Calculada automaticamente por extensão em metros / número de elementos.
                  Extensão considerada: {(Number(data.extension_m || 0)).toFixed(2).replace(".", ",")} km.
                </p>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="text-sm font-medium text-slate-700">Referencia do manual</div>
                <div className="mt-2 space-y-1 text-sm text-slate-700">
                  <div>10-20 km/h: recomendado ate 20 m, maximo 50 m</div>
                  <div>30 km/h ou mais: recomendado ate 50 m, maximo 75 m</div>
                </div>
              </div>
            </div>
          </div>
        </AssessmentCriterionAccordion>
      ) : null}
    </CriteriaAccordionGroup>
  );
};

export default Page3;
