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

  const addWidthMeasurement = () => {
    const parsedCentimeters = Number(widthDraftCm.replace(",", "."));
    if (!Number.isFinite(parsedCentimeters) || parsedCentimeters <= 0) return;

    const measurementMeters = parsedCentimeters / 100;
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
    setWidthDraftCm("");
  };

  const addBufferMeasurement = () => {
    const parsedCentimeters = Number(bufferDraftCm.replace(",", "."));
    if (!Number.isFinite(parsedCentimeters) || parsedCentimeters <= 0) return;

    const measurementMeters = parsedCentimeters / 100;
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
    setBufferDraftCm("");
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
  const computedAverageDistance =
    totalTrafficCalming > 0 && Number(data.extension_m) > 0
      ? Number(data.extension_m) / totalTrafficCalming
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
      nextTotal > 0 && Number(data.extension_m) > 0 ? Number(data.extension_m) / nextTotal : 0;

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
      allValues={["b11", "b12"]}
      defaultOpenValues={isCiclorrota ? ["b12"] : ["b11"]}
      filter={filter}
      command={command}
    >
      {!isCiclorrota ? (
        <AssessmentCriterionAccordion
          value="b11"
          title="B.1. Largura da infraestrutura cicloviária / B.3.2 Afastamento Lateral"
          description="Permite informar as medições de largura e de afastamento para cálculo automático."
          scorePreview={buildCriterionScorePreview(data, ["B1"])}
          answered={
            widthMeasurements.length > 0 ||
            bufferMeasurements.length > 0 ||
            data.width_meters > 0 ||
            data.buffer_width_m > 0 ||
            isTouched([
              "width_meters",
              "width_measurements_m",
              "includes_gutter",
              "buffer_width_m",
              "buffer_measurements_m",
              "infra_flow",
            ])
          }
          inAnalysis={data.criterion_workflow_state?.b11 === "analysis"}
          onAnalysisChange={(value) => updateWorkflow("b11", value ? "analysis" : "default")}
          onClear={() =>
            onDataChange({
              width_meters: 0,
              width_measurements_m: [],
              includes_gutter: false,
              buffer_width_m: 0,
              buffer_measurements_m: [],
              lateral_spacing_width_m: 0,
              touched_fields: {
                width_meters: false,
                width_measurements_m: false,
                includes_gutter: false,
                buffer_width_m: false,
                buffer_measurements_m: false,
                lateral_spacing_width_m: false,
              },
            })
          }
          helpKey="B1"
        >
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border p-4">
                <Label htmlFor="width_measurement_cm" className="mb-3 block">
                  Adicionar medição de largura
                </Label>
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="flex-1">
                    <Input
                      id="width_measurement_cm"
                      inputMode="decimal"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Ex.: 235"
                      value={widthDraftCm}
                      onChange={(event) => setWidthDraftCm(event.target.value)}
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Digite em centímetros para permitir precisão centimétrica. Ex.: 235 = 2,35 m.
                    </p>
                  </div>
                  <Button type="button" className="md:self-start" onClick={addWidthMeasurement}>
                    Adicionar medida
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border p-4">
                <Label htmlFor="buffer_width_cm" className="mb-3 block">
                  Adicionar medição de afastamento lateral
                </Label>
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="flex-1">
                    <Input
                      id="buffer_width_cm"
                      inputMode="decimal"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Ex.: 80"
                      value={bufferDraftCm}
                      onChange={(event) => setBufferDraftCm(event.target.value)}
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Digite em centímetros. Ex.: 80 = 0,80 m.
                    </p>
                  </div>
                  <Button type="button" className="md:self-start" onClick={addBufferMeasurement}>
                    Adicionar medida
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <div className="rounded-2xl border p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm font-medium text-foreground">Média da largura</div>
                    <div className="mt-2 text-3xl font-bold text-slate-900">
                      {formatMeters(widthAverage)} m
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm font-medium text-foreground">Média do afastamento</div>
                    <div className="mt-2 text-3xl font-bold text-slate-900">
                      {formatMeters(bufferAverage)} m
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  <div>
                    Fluxo considerado: <strong>{measuredFlowLabel}</strong>
                  </div>
                  {widthConcept ? (
                    <div>
                      Conceito atual de B.1: <strong>{widthConcept}</strong>
                    </div>
                  ) : null}
                  {!data.touched_fields?.infra_flow ? (
                    <p className="text-amber-700">
                      Revise o fluxo da infraestrutura. A nota da largura depende dele.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border p-4">
                  <div className="text-sm font-medium text-foreground">Histórico de larguras</div>
                  {widthMeasurements.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {widthMeasurements.map((measurement, index) => (
                        <button
                          key={`${measurement}-${index}`}
                          type="button"
                          onClick={() => removeWidthMeasurement(index)}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          {index + 1}. {formatMeters(measurement)} m ×
                        </button>
                      ))}
                    </div>
                  ) : data.width_meters > 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Há uma média registrada de {formatMeters(data.width_meters)} m, mas ainda sem
                      histórico individual de medições.
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Nenhuma medição adicionada ainda.
                    </p>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Toque em uma medição para removê-la do cálculo.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border p-4">
                  <div>
                    <div className="text-sm font-medium text-foreground">Histórico de afastamentos</div>
                    {bufferMeasurements.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {bufferMeasurements.map((measurement, index) => (
                          <button
                            key={`${measurement}-${index}`}
                            type="button"
                            onClick={() => removeBufferMeasurement(index)}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            {index + 1}. {formatMeters(measurement)} m ×
                          </button>
                        ))}
                      </div>
                    ) : data.buffer_width_m > 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Há uma média registrada de {formatMeters(data.buffer_width_m)} m, mas ainda sem
                        histórico individual de medições.
                      </p>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Nenhuma medição adicionada ainda.
                      </p>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">
                      Toque em uma medição para removê-la do cálculo.
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                    <div>
                      <div className="text-sm font-medium text-slate-800">Inclui sarjeta</div>
                      <p className="text-xs text-muted-foreground">
                        Marque se a largura registrada considera a sarjeta.
                      </p>
                    </div>
                    <Switch
                      checked={Boolean(data.includes_gutter)}
                      onCheckedChange={(checked) =>
                        onDataChange({
                          includes_gutter: checked,
                          touched_fields: { includes_gutter: true },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
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
                  Calculada automaticamente por extensao / numero de elementos.
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
