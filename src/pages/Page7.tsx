import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AssessmentCriterionAccordion, {
  CriterionPagerConfig,
} from "@/components/AssessmentCriterionAccordion";
import ConceptCriteriaTable from "@/components/ConceptCriteriaTable";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { CriterionFilter } from "@/components/criteriaAccordionContext";
import { IdecicloFormData, IdecicloRating, RiskOccurrenceKey } from "@/types/idecicloForm";
import { getMedianRating } from "@/utils/idecicloAssessment";
import { buildCriterionScorePreview } from "@/utils/criterionScorePreview";

const RISK_OPTIONS = [
  {
    key: "bus_school_conflict",
    label: "Conflito com ponto de ônibus ou escola",
    icons: ["/icones/onibus.svg", "/icones/escola.svg"],
    ciclorrota: false,
  },
  {
    key: "horizontal_obstacles",
    label: "Obstáculos horizontais no trecho",
    icons: ["/icones/obstaculos-horizontal.svg"],
    ciclorrota: true,
  },
  {
    key: "vertical_obstacles",
    label: "Obstáculos verticais no trecho",
    icons: ["/icones/obstaculos.svg"],
    ciclorrota: true,
  },
  {
    key: "side_change_mid_block",
    label: "Mudança de lado da infraestrutura no meio da quadra",
    icons: ["/icones/risco-troca-de-lado.svg"],
    ciclorrota: false,
  },
  {
    key: "opposite_flow_direction",
    label: "Sentido de circulação contrário ao fluxo veicular",
    icons: ["/icones/contramao-estrutura.svg"],
    ciclorrota: false,
  },
] as const satisfies ReadonlyArray<{
  key: RiskOccurrenceKey;
  label: string;
  icons: string[];
  ciclorrota: boolean;
}>;

interface Page7Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  filter?: CriterionFilter;
  command?: { type: "expand" | "collapse"; nonce: number } | null;
  visibleValues?: Array<"b7" | "b5" | "c1" | "e1" | "c2" | "c3">;
  blockPager?: CriterionPagerConfig;
  hideBlockPager?: boolean;
  intersectionPager?: CriterionPagerConfig;
  currentIntersectionIndex?: number;
}

const Page7: React.FC<Page7Props> = ({
  data,
  onDataChange,
  filter,
  command,
  visibleValues,
  blockPager,
  hideBlockPager = false,
  intersectionPager,
  currentIntersectionIndex = 0,
}) => {
  const normalizedTypology = (data.infra_typology || "").toLowerCase();
  const isCiclorrota = normalizedTypology.includes("ciclorrota");
  const canShow = (value: "b7" | "b5" | "c1" | "e1" | "c2" | "c3") =>
    !visibleValues || visibleValues.includes(value);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    onDataChange({ [name]: processedValue });
  };

  const handleRadioChange = (name: string, value: string | boolean | number) => {
    onDataChange({ [name]: value });
  };

  const handleCheckboxChange = (name: RiskOccurrenceKey, checked: boolean) => {
    onDataChange({
      [name]: checked,
      no_risk_situations:
        checked ||
        Boolean(
          (name !== "bus_school_conflict" && data.bus_school_conflict) ||
            (name !== "horizontal_obstacles" && data.horizontal_obstacles) ||
            (name !== "vertical_obstacles" && data.vertical_obstacles) ||
            (name !== "side_change_mid_block" && data.side_change_mid_block) ||
            (name !== "opposite_flow_direction" && data.opposite_flow_direction)
        )
          ? false
          : data.no_risk_situations,
    });
  };

  const riskOccurrenceCounts = data.risk_occurrence_counts || {};

  const handleRiskCountChange = (name: RiskOccurrenceKey, delta: number) => {
    const currentCount = Number(riskOccurrenceCounts[name] || 0);
    const nextCount = Math.max(0, currentCount + delta);
    const nextCounts = {
      ...riskOccurrenceCounts,
      [name]: nextCount,
    };
    const hasAnyRisk = Object.values(nextCounts).some((value) => Number(value || 0) > 0);

    onDataChange({
      risk_occurrence_counts: nextCounts,
      [name]: nextCount > 0,
      no_risk_situations: hasAnyRisk ? false : data.no_risk_situations,
      touched_fields: {
        risk_occurrence_counts: hasAnyRisk,
        [name]: nextCount > 0,
      },
    });
  };

  const availableRiskOptions = RISK_OPTIONS.filter((option) => option.ciclorrota || !isCiclorrota);
  const selectedRiskOptions = availableRiskOptions.filter((option) =>
    Number(riskOccurrenceCounts[option.key] || 0) > 0
  );

  const handleConflictCheckboxChange = (conflict: string, checked: boolean) => {
    const currentConflicts = [...(data.motorized_conflicts || [])];
    if (checked) {
      if (!currentConflicts.includes(conflict)) {
        currentConflicts.push(conflict);
      }
    } else {
      const index = currentConflicts.indexOf(conflict);
      if (index !== -1) {
        currentConflicts.splice(index, 1);
      }
    }
    onDataChange({ motorized_conflicts: currentConflicts });
  };
  const isTouched = (fields: string[]) => fields.some((field) => data.touched_fields?.[field]);
  const updateWorkflow = (criterion: string, value: "default" | "analysis") =>
    onDataChange({
      criterion_workflow_state: {
        ...(data.criterion_workflow_state || {}),
        [criterion]: value,
      },
    });
  const intersectionCount = Math.max(0, Number(data.intersections_count || 0));
  const ratingBadgeClassName = (rating: IdecicloRating | null | undefined) => {
    if (rating === "A") return "border-transparent bg-[#b8e5db] text-[#163b38]";
    if (rating === "B") return "border-transparent bg-[#9fd3cb] text-[#163b38]";
    if (rating === "C") return "border-transparent bg-[#8fafad] text-[#163b38]";
    if (rating === "D") return "border-transparent bg-[#748987] text-white";
    return "border-slate-200 bg-white text-slate-500";
  };

  const getIntersectionArrayValue = <T,>(values: T[] | undefined, fallback: T) =>
    Array.isArray(values) && currentIntersectionIndex < values.length
      ? (values[currentIntersectionIndex] ?? fallback)
      : fallback;

  const setIntersectionArrayValue = <T,>(
    values: T[] | undefined,
    nextValue: T,
    fallback: T
  ) => {
    const nextLength = Math.max(intersectionCount, currentIntersectionIndex + 1);
    const nextValues = Array.from({ length: nextLength }, (_, index) =>
      Array.isArray(values) && index < values.length ? (values[index] ?? fallback) : fallback
    );
    nextValues[currentIntersectionIndex] = nextValue;
    return nextValues;
  };

  const getIntersectionMatrixValue = <T,>(values: T[][] | undefined, fallback: T[]) =>
    Array.isArray(values) && currentIntersectionIndex < values.length
      ? (values[currentIntersectionIndex] ?? fallback)
      : fallback;

  const setIntersectionMatrixValue = <T,>(
    values: T[][] | undefined,
    nextValue: T[],
    fallback: T[]
  ) => {
    const nextLength = Math.max(intersectionCount, currentIntersectionIndex + 1);
    const nextValues = Array.from({ length: nextLength }, (_, index) =>
      Array.isArray(values) && index < values.length ? [...(values[index] ?? fallback)] : [...fallback]
    );
    nextValues[currentIntersectionIndex] = [...nextValue];
    return nextValues;
  };

  const currentIntersectionSignaling = getIntersectionArrayValue(
    data.intersection_signaling_by_intersection,
    data.intersection_signaling || ""
  );
  const currentConnectionAccessibility = getIntersectionArrayValue(
    data.connection_accessibility_by_intersection,
    data.connection_accessibility || ""
  );
  const currentTrafficLanesPerDirection = getIntersectionArrayValue(
    data.traffic_lanes_per_direction_by_intersection,
    Number(data.traffic_lanes_per_direction || 1)
  );
  const currentMixedLaneWidth = getIntersectionArrayValue(
    data.mixed_lane_width_m_by_intersection,
    Number(data.mixed_lane_width_m || 2.7)
  );
  const currentHasIntersectionTrafficCalming = getIntersectionArrayValue(
    data.has_intersection_traffic_calming_by_intersection,
    Boolean(data.has_intersection_traffic_calming)
  );
  const currentMotorizedConflicts = getIntersectionMatrixValue(
    data.motorized_conflicts_by_intersection,
    data.motorized_conflicts || []
  );

  const mapConnectionAccessibilityToRating = (
    value: "A" | "D" | "NA" | "" | string
  ): IdecicloRating | null => {
    if (value === "A") return "A";
    if (value === "D") return "D";
    return null;
  };

  const calculateC3IntersectionRating = (index: number): IdecicloRating | null => {
    if (isCiclorrota) {
      const lanesPerDirection =
        data.traffic_lanes_per_direction_by_intersection?.[index] ?? data.traffic_lanes_per_direction;
      const laneWidth =
        data.mixed_lane_width_m_by_intersection?.[index] ?? data.mixed_lane_width_m;
      const hasModeration =
        data.has_intersection_traffic_calming_by_intersection?.[index] ??
        data.has_intersection_traffic_calming;

      if (lanesPerDirection <= 1 && laneWidth > 0 && laneWidth <= 2.7) return "A";
      if (lanesPerDirection <= 1 && laneWidth > 2.7) return "B";
      if (lanesPerDirection > 1 && hasModeration) return "C";
      return "D";
    }

    const conflicts = new Set(
      data.motorized_conflicts_by_intersection?.[index] ?? data.motorized_conflicts ?? []
    );

    if (conflicts.has("no_conversion") || conflicts.has("exclusive_signal")) return "A";
    if (
      String(data.infra_flow || "") === "unidirectional" &&
      conflicts.has("conversion") &&
      conflicts.has("protection")
    ) {
      return "B";
    }
    if (conflicts.has("pedestrian_signal") || conflicts.has("traffic_calming")) return "C";
    return "D";
  };

  const c1IntersectionRatings = Array.from({ length: intersectionCount }, (_, index) => {
    const value =
      data.intersection_signaling_by_intersection?.[index] ??
      (index === 0 ? data.intersection_signaling : "");
    return ["A", "B", "C", "D"].includes(String(value)) ? (value as IdecicloRating) : null;
  });
  const c2IntersectionRatings = Array.from({ length: intersectionCount }, (_, index) =>
    mapConnectionAccessibilityToRating(
      (data.connection_accessibility_by_intersection?.[index] ??
        (index === 0 ? data.connection_accessibility : "")) as "A" | "D" | "NA" | ""
    )
  );
  const c3IntersectionRatings = Array.from({ length: intersectionCount }, (_, index) =>
    calculateC3IntersectionRating(index)
  );

  const renderMedianBadges = (
    prefix: string,
    currentRating: IdecicloRating | null | undefined,
    ratings: Array<IdecicloRating | null | undefined>
  ) => (
    <>
      <Badge
        variant="outline"
        className={`rounded-full px-3 py-1 text-xs ${ratingBadgeClassName(currentRating)}`}
      >
        {prefix}
        {currentIntersectionIndex + 1}
        <span className="mx-1 opacity-70">·</span>
        {currentRating ?? "-"}
      </Badge>
      <Badge
        variant="outline"
        className={`rounded-full px-3 py-1 text-xs ${ratingBadgeClassName(getMedianRating(ratings))}`}
      >
        Mediana
        <span className="mx-1 opacity-70">·</span>
        {getMedianRating(ratings) ?? "-"}
      </Badge>
    </>
  );

  const renderCounter = ({
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

  const signalizedCrossingsCount = Number(data.signalized_crossings_count || 0);
  const currentBlockIndex = blockPager?.currentIndex || 0;
  const normalizedTypologyForB5 = (data.infra_typology || "").toLowerCase();
  const maxTrafficLanesForB5 = normalizedTypologyForB5.includes("ciclorrota") ? 4 : 6;
  const currentBlockCrossings = Array.isArray(data.signalized_crossings_count_by_block)
    ? Number(data.signalized_crossings_count_by_block[currentBlockIndex] || 0)
    : signalizedCrossingsCount;
  const currentBlockTrafficLanes = Array.isArray(data.traffic_lanes_count_by_block)
    ? Number(data.traffic_lanes_count_by_block[currentBlockIndex] || 0)
    : Number(data.traffic_lanes_count || 0);
  const hasAnyRiskSelected = Boolean(
    selectedRiskOptions.length > 0
  );
  const chipClassName = (selected: boolean) =>
    `rounded-full border px-3 py-2 text-sm font-medium transition ${
      selected
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
    }`;

  const setB5BlockValue = (
    field: "signalized_crossings_count_by_block" | "traffic_lanes_count_by_block",
    nextValue: number
  ) => {
    const blockCount = Math.max(0, Number(data.blocks_count || 0));
    const nextLength = Math.max(blockCount, currentBlockIndex + 1);
    const sourceValues = Array.isArray(data[field]) ? data[field] : [];
    const nextValues = Array.from({ length: nextLength }, (_, index) =>
      Number(sourceValues[index] || 0)
    );
    nextValues[currentBlockIndex] = nextValue;

    const nextCrossings =
      field === "signalized_crossings_count_by_block"
        ? nextValues
        : Array.from({ length: nextLength }, (_, index) =>
            Number(data.signalized_crossings_count_by_block?.[index] || 0)
          );
    const nextTrafficLanes =
      field === "traffic_lanes_count_by_block"
        ? nextValues
        : Array.from({ length: nextLength }, (_, index) =>
            Number(data.traffic_lanes_count_by_block?.[index] || 0)
          );

    onDataChange({
      signalized_crossings_count_by_block: nextCrossings,
      signalized_crossings_count: nextCrossings.reduce((sum, value) => sum + Number(value || 0), 0),
      traffic_lanes_count_by_block: nextTrafficLanes,
      traffic_lanes_count: Math.max(...nextTrafficLanes, 0),
      touched_fields: {
        signalized_crossings_count_by_block: true,
        signalized_crossings_count: nextCrossings.some((value) => Number(value || 0) > 0),
        traffic_lanes_count_by_block: true,
        traffic_lanes_count: nextTrafficLanes.some((value) => Number(value || 0) > 0),
      },
    });
  };

  return (
    <CriteriaAccordionGroup
          allValues={["b7", "b5", "c1", "e1", "c2", "c3"].filter(canShow)}
          defaultOpenValues={["b7", "b5", "c1"].filter(canShow)}
          filter={filter}
          command={command}
        >
          {canShow("b7") ? <AssessmentCriterionAccordion
            value="b7"
            title="B.7. Situações de risco ao longo da infraestrutura"
            description="Marque ocorrências que representem conflito, obstáculo ou descontinuidade."
            scorePreview={buildCriterionScorePreview(data, ["B7"])}
            answered={Boolean(data.no_risk_situations) || hasAnyRiskSelected}
            inAnalysis={data.criterion_workflow_state?.b7 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("b7", value ? "analysis" : "default")}
              onClear={() =>
                onDataChange({
                  no_risk_situations: false,
                  risk_occurrence_counts: {},
                  bus_school_conflict: false,
                  horizontal_obstacles: false,
                  vertical_obstacles: false,
                side_change_mid_block: false,
                opposite_flow_direction: false,
                touched_fields: {
                  no_risk_situations: false,
                  bus_school_conflict: false,
                  horizontal_obstacles: false,
                  vertical_obstacles: false,
                  side_change_mid_block: false,
                  opposite_flow_direction: false,
                },
              })
            }
            helpKey="B7"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-slate-800">Sem situações de risco</div>
                  <p className="text-xs text-muted-foreground">
                    Ative quando nenhuma das situações abaixo estiver presente.
                  </p>
                </div>
                <Checkbox
                  id="no_risk_situations"
                  checked={Boolean(data.no_risk_situations) && !hasAnyRiskSelected}
                  onCheckedChange={(checked) => {
                    const active = Boolean(checked);
                    onDataChange({
                      no_risk_situations: active,
                      ...(active
                        ? {
                            risk_occurrence_counts: {},
                            bus_school_conflict: false,
                            horizontal_obstacles: false,
                            vertical_obstacles: false,
                            side_change_mid_block: false,
                            opposite_flow_direction: false,
                          }
                        : {}),
                    });
                  }}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availableRiskOptions.map((option) => {
                  const count = Number(riskOccurrenceCounts[option.key] || 0);
                  const selected = count > 0;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleRiskCountChange(option.key, 1)}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                        selected
                          ? "border-rose-300 bg-rose-50 shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {option.icons.map((icon) => (
                          <img
                            key={icon}
                            src={icon}
                            alt=""
                            aria-hidden="true"
                            className="h-10 w-10 object-contain"
                          />
                        ))}
                      </div>
                      <div className="space-y-1">
                        <span className="block text-sm font-semibold text-slate-700">
                          {option.label}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {selected ? `Toque para somar (${count})` : "Toque para marcar"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div>
                {selectedRiskOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedRiskOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => handleRiskCountChange(option.key, -1)}
                        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        {option.icons.map((icon) => (
                          <img
                            key={icon}
                            src={icon}
                            alt=""
                            aria-hidden="true"
                            className="h-4 w-4 object-contain"
                          />
                        ))}
                        <span>{option.label}</span>
                        <span className="font-semibold text-slate-500">
                          x{Number(riskOccurrenceCounts[option.key] || 0)}
                        </span>
                        <span>×</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma situação de risco marcada ainda.
                  </p>
                )}
              </div>
            </div>
          </AssessmentCriterionAccordion> : null}

          {canShow("b5") ? <AssessmentCriterionAccordion
            value="b5"
            title="B.5. Acessibilidade relativa ao uso do solo lindeiro"
            description="Conta travessias sinalizadas ao longo do trecho e relaciona com o numero de quadras."
            scorePreview={buildCriterionScorePreview(data, ["B5"])}
            answered={
              isTouched([
                "signalized_crossings_count",
                "signalized_crossings_count_by_block",
                "traffic_lanes_count",
                "traffic_lanes_count_by_block",
              ]) || signalizedCrossingsCount > 0
            }
            inAnalysis={data.criterion_workflow_state?.b5 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("b5", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                signalized_crossings_count: 0,
                signalized_crossings_count_by_block: [],
                traffic_lanes_count: 0,
                traffic_lanes_count_by_block: [],
                touched_fields: {
                  signalized_crossings_count: false,
                  signalized_crossings_count_by_block: false,
                  traffic_lanes_count: false,
                  traffic_lanes_count_by_block: false,
                },
              })
            }
            helpKey="B5"
            pager={blockPager}
            showPager={!hideBlockPager}
          >
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Travessias sinalizadas na quadra</Label>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2].map((value) => (
                    <button
                      key={`crossings-${value}`}
                      type="button"
                      className={chipClassName(currentBlockCrossings === value)}
                      onClick={() => setB5BlockValue("signalized_crossings_count_by_block", value)}
                    >
                      {value === 2 ? "2+" : value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Faixas de rolamento na quadra</Label>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: maxTrafficLanesForB5 + 1 }, (_, value) => (
                    <button
                      key={`lanes-${value}`}
                      type="button"
                      className={chipClassName(currentBlockTrafficLanes === value)}
                      onClick={() => setB5BlockValue("traffic_lanes_count_by_block", value)}
                    >
                      {value === maxTrafficLanesForB5 ? `${value}+` : value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AssessmentCriterionAccordion> : null}

          {!isCiclorrota && canShow("c1") ? (
            <AssessmentCriterionAccordion
              value="c1"
              title="C.1. Sinalização horizontal cicloviária nas interseções"
              description="Avalia a presença e o tipo de sinalização horizontal nas interseções."
              scorePreview={buildCriterionScorePreview(data, ["C1"])}
              answered={isTouched(["intersection_signaling"])}
              inAnalysis={
                data.criterion_workflow_state?.c1 === "analysis" ||
                data.criterion_workflow_state?.c1e1 === "analysis"
              }
              onAnalysisChange={(value) => updateWorkflow("c1", value ? "analysis" : "default")}
              onClear={() =>
                onDataChange({
                  intersection_signaling: "",
                  intersection_signaling_by_intersection: [],
                  touched_fields: {
                    intersection_signaling: false,
                    intersection_signaling_by_intersection: false,
                  },
                })
              }
              helpKey="C1"
              extraBadges={renderMedianBadges(
                "I",
                c1IntersectionRatings[currentIntersectionIndex],
                c1IntersectionRatings
              )}
              pager={
                intersectionPager
                  ? { ...intersectionPager, itemRatings: c1IntersectionRatings }
                  : undefined
              }
            >
              <p className="mb-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                Os conceitos de todos os cruzamentos são ordenados alfabeticamente e a mediana é
                utilizada como nota final.
              </p>
              <ConceptCriteriaTable
                value={currentIntersectionSignaling || ""}
                onValueChange={(value) =>
                  onDataChange({
                    intersection_signaling: value,
                    intersection_signaling_by_intersection: setIntersectionArrayValue(
                      data.intersection_signaling_by_intersection,
                      value,
                      ""
                    ),
                    touched_fields: {
                      intersection_signaling: true,
                      intersection_signaling_by_intersection: true,
                    },
                  })
                }
                options={[
                  {
                    value: "A",
                    description:
                      "Interseção apresenta pavimento vermelho na largura da infraestrutura e linhas tracejadas brancas.",
                  },
                  {
                    value: "B",
                    description:
                      "Pavimento em tom vermelho estreito ou pavimento vermelho sem linhas tracejadas.",
                  },
                  {
                    value: "C",
                    description: "Só linhas tracejadas ou só pictogramas.",
                  },
                  {
                    value: "D",
                    description: "Nenhuma sinalização.",
                  },
                ]}
              />
            </AssessmentCriterionAccordion>
          ) : null}

          {!isCiclorrota && canShow("e1") ? (
            <AssessmentCriterionAccordion
              value="e1"
              title="E.1. Estado de conservação da sinalização horizontal nas interseções"
              description="Avalia a conservação da sinalização horizontal cicloviária nas interseções."
              scorePreview={buildCriterionScorePreview(data, ["E1"])}
              answered={isTouched(["intersection_conservation"])}
              inAnalysis={
                data.criterion_workflow_state?.e1 === "analysis" ||
                data.criterion_workflow_state?.c1e1 === "analysis"
              }
              onAnalysisChange={(value) => updateWorkflow("e1", value ? "analysis" : "default")}
              onClear={() =>
                onDataChange({
                  intersection_conservation: "",
                  touched_fields: {
                    intersection_conservation: false,
                  },
                })
              }
              helpKey="E1"
              pager={intersectionPager}
            >
              <ConceptCriteriaTable
                value={data.intersection_conservation || ""}
                onValueChange={(value) => handleRadioChange("intersection_conservation", value)}
                options={[
                  {
                    value: "A",
                    description:
                      "Há sinalização em todas as interseções do trecho, visível em toda a extensão.",
                  },
                  {
                    value: "B",
                    description:
                      "Há sinalização em mais da metade das interseções e em bom estado.",
                  },
                  {
                    value: "C",
                    description:
                      "Há sinalização em menos da metade das interseções ou ela está muito danificada.",
                  },
                  {
                    value: "D",
                    description: "Praticamente apagada.",
                  },
                ]}
              />
            </AssessmentCriterionAccordion>
          ) : null}

          {canShow("c2") ? <AssessmentCriterionAccordion
            value="c2"
            title="C.2. Acessibilidade entre conexões cicloviárias"
            description="Indica se a ligação com outras estruturas é visível e pedalável."
            scorePreview={buildCriterionScorePreview(data, ["C2"])}
            answered={isTouched(["connection_accessibility"])}
            inAnalysis={data.criterion_workflow_state?.c2 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("c2", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                connection_accessibility: "",
                connection_accessibility_by_intersection: [],
                touched_fields: {
                  connection_accessibility: false,
                  connection_accessibility_by_intersection: false,
                },
              })
            }
            helpKey="C2"
            extraBadges={renderMedianBadges(
              "I",
              c2IntersectionRatings[currentIntersectionIndex],
              c2IntersectionRatings
            )}
            pager={
              intersectionPager
                ? { ...intersectionPager, itemRatings: c2IntersectionRatings }
                : undefined
            }
          >
            <p className="mb-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Os conceitos de todos os cruzamentos são ordenados alfabeticamente e a mediana é
              utilizada como nota final.
            </p>
            <ConceptCriteriaTable
              value={currentConnectionAccessibility || ""}
              onValueChange={(value) =>
                onDataChange({
                  connection_accessibility: value,
                  connection_accessibility_by_intersection: setIntersectionArrayValue(
                    data.connection_accessibility_by_intersection,
                    value,
                    ""
                  ),
                  touched_fields: {
                    connection_accessibility: true,
                    connection_accessibility_by_intersection: true,
                  },
                })
              }
              options={[
                {
                  value: "A",
                  description:
                    "A conexão é visível e tem acessibilidade física, com rampa pedalável quando há desnível.",
                },
                {
                  value: "D",
                  description:
                    "A conexão não é visível, não existe ou depende apenas de escadas/transposição ruim.",
                },
                {
                  value: "NA",
                  label: "N/A",
                  description: "Não se aplica, porque o trecho não possui conexão.",
                },
              ]}
            />
          </AssessmentCriterionAccordion> : null}

          {canShow("c3") ? <AssessmentCriterionAccordion
            value="c3"
            title="C.3. Conflitos com circulação de modos motorizados"
            description="Marque os elementos presentes para caracterizar o tratamento do conflito."
            scorePreview={buildCriterionScorePreview(data, ["C3"])}
            answered={isTouched([
              "motorized_conflicts",
              "traffic_lanes_per_direction",
              "mixed_lane_width_m",
              "has_intersection_traffic_calming",
            ])}
            inAnalysis={data.criterion_workflow_state?.c3 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("c3", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                motorized_conflicts: [],
                motorized_conflicts_by_intersection: [],
                traffic_lanes_per_direction: 1,
                traffic_lanes_per_direction_by_intersection: [],
                mixed_lane_width_m: 2.7,
                mixed_lane_width_m_by_intersection: [],
                has_intersection_traffic_calming: false,
                has_intersection_traffic_calming_by_intersection: [],
                touched_fields: {
                  motorized_conflicts: false,
                  motorized_conflicts_by_intersection: false,
                  traffic_lanes_per_direction: false,
                  traffic_lanes_per_direction_by_intersection: false,
                  mixed_lane_width_m: false,
                  mixed_lane_width_m_by_intersection: false,
                  has_intersection_traffic_calming: false,
                  has_intersection_traffic_calming_by_intersection: false,
                },
              })
            }
            helpKey="C3"
            extraBadges={renderMedianBadges(
              "I",
              c3IntersectionRatings[currentIntersectionIndex],
              c3IntersectionRatings
            )}
            pager={
              intersectionPager
                ? { ...intersectionPager, itemRatings: c3IntersectionRatings }
                : undefined
            }
          >
            <p className="mb-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Os conceitos de todos os cruzamentos são ordenados alfabeticamente e a mediana é
              utilizada como nota final.
            </p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conflict_no_conversion"
                  checked={currentMotorizedConflicts.includes("no_conversion")}
                  onCheckedChange={(checked) =>
                    handleConflictCheckboxChange("no_conversion", !!checked)
                  }
                />
                <Label htmlFor="conflict_no_conversion">
                  Não há conversão de modos motorizados sobre a infraestrutura cicloviária.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conflict_conversion"
                  checked={currentMotorizedConflicts.includes("conversion")}
                  onCheckedChange={(checked) =>
                    handleConflictCheckboxChange("conversion", !!checked)
                  }
                />
                <Label htmlFor="conflict_conversion">
                  Há conversão de modos motorizados sobre a infraestrutura cicloviária.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conflict_exclusive_signal"
                  checked={currentMotorizedConflicts.includes("exclusive_signal")}
                  onCheckedChange={(checked) =>
                    handleConflictCheckboxChange("exclusive_signal", !!checked)
                  }
                />
                <Label htmlFor="conflict_exclusive_signal">
                  Há estágio semafórico com tempo exclusivo para ciclistas.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conflict_protection"
                  checked={currentMotorizedConflicts.includes("protection")}
                  onCheckedChange={(checked) =>
                    handleConflictCheckboxChange("protection", !!checked)
                  }
                />
                <Label htmlFor="conflict_protection">
                  Há medidas de proteção para os ciclistas nas esquinas.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conflict_pedestrian_signal"
                  checked={currentMotorizedConflicts.includes("pedestrian_signal")}
                  onCheckedChange={(checked) =>
                    handleConflictCheckboxChange("pedestrian_signal", !!checked)
                  }
                />
                <Label htmlFor="conflict_pedestrian_signal">
                  Há estágio semafórico de pedestres, que possibilita a circulação conjunta.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conflict_traffic_calming"
                  checked={currentMotorizedConflicts.includes("traffic_calming")}
                  onCheckedChange={(checked) =>
                    handleConflictCheckboxChange("traffic_calming", !!checked)
                  }
                />
                <Label htmlFor="conflict_traffic_calming">
                  Há medidas de acalmamento de tráfego na via, mas não orientadas para a condição de
                  travessia de ciclistas.
                </Label>
              </div>
            </div>

            {String(data.infra_typology || "")
              .toLowerCase()
              .includes("ciclorrota") && (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="traffic_lanes_per_direction">Faixas mistas por sentido:</Label>
                  <Input
                    id="traffic_lanes_per_direction"
                    name="traffic_lanes_per_direction"
                    type="number"
                    value={currentTrafficLanesPerDirection || ""}
                    onChange={(event) =>
                      onDataChange({
                        traffic_lanes_per_direction: parseFloat(event.target.value) || 0,
                        traffic_lanes_per_direction_by_intersection: setIntersectionArrayValue(
                          data.traffic_lanes_per_direction_by_intersection,
                          parseFloat(event.target.value) || 0,
                          1
                        ),
                        touched_fields: {
                          traffic_lanes_per_direction: true,
                          traffic_lanes_per_direction_by_intersection: true,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="mixed_lane_width_m">Largura da faixa mista (m):</Label>
                  <Input
                    id="mixed_lane_width_m"
                    name="mixed_lane_width_m"
                    type="number"
                    step="0.1"
                    value={currentMixedLaneWidth || ""}
                    onChange={(event) =>
                      onDataChange({
                        mixed_lane_width_m: parseFloat(event.target.value) || 0,
                        mixed_lane_width_m_by_intersection: setIntersectionArrayValue(
                          data.mixed_lane_width_m_by_intersection,
                          parseFloat(event.target.value) || 0,
                          2.7
                        ),
                        touched_fields: {
                          mixed_lane_width_m: true,
                          mixed_lane_width_m_by_intersection: true,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-end pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_intersection_traffic_calming"
                      checked={currentHasIntersectionTrafficCalming || false}
                      onCheckedChange={(checked) =>
                        onDataChange({
                          has_intersection_traffic_calming: !!checked,
                          has_intersection_traffic_calming_by_intersection:
                            setIntersectionArrayValue(
                              data.has_intersection_traffic_calming_by_intersection,
                              !!checked,
                              false
                            ),
                          touched_fields: {
                            has_intersection_traffic_calming: true,
                            has_intersection_traffic_calming_by_intersection: true,
                          },
                        })
                      }
                    />
                    <Label htmlFor="has_intersection_traffic_calming">
                      Há moderação no cruzamento
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </AssessmentCriterionAccordion> : null}
        </CriteriaAccordionGroup>
  );
};

export default Page7;
