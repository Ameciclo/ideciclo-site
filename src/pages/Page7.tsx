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
import {
  IdecicloFormData,
  IdecicloRating,
  IntersectionHorizontalSignsCondition,
  IntersectionRoadType,
  RiskOccurrenceKey,
} from "@/types/idecicloForm";
import { getMedianRating } from "@/utils/idecicloAssessment";
import { buildCriterionScorePreview } from "@/utils/criterionScorePreview";

const RISK_OPTIONS = [
  {
    key: "bus_stop_conflict",
    label: "Conflito com ponto de ônibus",
    icons: ["/icones/onibus.svg"],
    ciclorrota: false,
  },
  {
    key: "school_conflict",
    label: "Conflito com escola",
    icons: ["/icones/escola.svg"],
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
  visibleValues?: Array<"b7" | "b5" | "a2" | "c1" | "e1" | "c2" | "c3">;
  blockPager?: CriterionPagerConfig;
  hideBlockPager?: boolean;
  intersectionPager?: CriterionPagerConfig;
  hideIntersectionPager?: boolean;
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
  hideIntersectionPager = false,
  currentIntersectionIndex = 0,
}) => {
  const normalizedTypology = (data.infra_typology || "").toLowerCase();
  const isCiclorrota = normalizedTypology.includes("ciclorrota");
  const canShow = (value: "b7" | "b5" | "a2" | "c1" | "e1" | "c2" | "c3") =>
    !visibleValues || visibleValues.includes(value);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    onDataChange({ [name]: processedValue });
  };

  const handleRadioChange = (name: string, value: string | boolean | number) => {
    onDataChange({ [name]: value });
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
  const blockTouchKey = (criterion: "b5_crossings" | "b5_lanes", index: number) =>
    `block_${criterion}_${index}`;
  const intersectionTouchKey = (
    criterion:
      | "a2_type"
      | "a2_connection"
      | "c1"
      | "c2"
      | "c3"
      | "c3_lanes"
      | "c3_width"
      | "c3_calming",
    index: number
  ) => `intersection_${criterion}_${index}`;
  const resetBlockTouchKeys = (criteria: Array<"b5_crossings" | "b5_lanes">) =>
    Object.fromEntries(
      Array.from({ length: Math.max(0, Number(data.blocks_count || 0)) }, (_, index) =>
        criteria.map((criterion) => [blockTouchKey(criterion, index), false] as const)
      ).flat()
    );
  const resetIntersectionTouchKeys = (
    criteria: Array<
      "a2_type" | "a2_connection" | "c1" | "c2" | "c3" | "c3_lanes" | "c3_width" | "c3_calming"
    >
  ) =>
    Object.fromEntries(
      Array.from({ length: Math.max(0, Number(data.intersections_count || 0)) }, (_, index) =>
        criteria.map((criterion) => [intersectionTouchKey(criterion, index), false] as const)
      ).flat()
    );

  const setC3ConflictRating = (rating: "A" | "B" | "C" | "D") => {
    const nextConflicts =
      rating === "A"
        ? ["no_conversion"]
        : rating === "B"
          ? ["conversion", "protection"]
          : rating === "C"
            ? ["pedestrian_signal"]
            : ["conversion"];

    onDataChange({
      motorized_conflicts: nextConflicts,
      motorized_conflicts_by_intersection: setIntersectionMatrixValue(
        data.motorized_conflicts_by_intersection,
        nextConflicts,
        []
      ),
      touched_fields: {
        motorized_conflicts: true,
        motorized_conflicts_by_intersection: true,
        [intersectionTouchKey("c3", currentIntersectionIndex)]: true,
      },
    });
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
  const currentIntersectionRoadType = getIntersectionArrayValue(
    data.intersection_road_type_by_intersection,
    "" as IntersectionRoadType
  );
  const currentIntersectionHasCyclingConnection = getIntersectionArrayValue(
    data.intersection_has_cycling_connection_by_intersection,
    null as boolean | null
  );
  const currentConnectionAccessibility = getIntersectionArrayValue(
    data.connection_accessibility_by_intersection,
    data.connection_accessibility || ""
  );
  const currentIntersectionConservationCondition = getIntersectionArrayValue(
    data.intersection_conservation_by_intersection,
    "" as IntersectionHorizontalSignsCondition
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
  const deriveIntersectionConservationRating = (
    values: IntersectionHorizontalSignsCondition[]
  ): IdecicloRating | "" => {
    const totalIntersections = Math.max(
      intersectionCount,
      Array.isArray(values) ? values.length : 0
    );
    if (totalIntersections <= 0) return "";

    const goodCount = values.filter((value) => value === "good").length;
    const damagedCount = values.filter((value) => value === "damage").length;
    const noneCount = values.filter((value) => value === "none").length;

    if (goodCount === totalIntersections) return "A";
    if (goodCount > totalIntersections / 2) return "B";
    if (goodCount + damagedCount > 0) return "C";
    if (noneCount > 0) return "D";
    return "";
  };
  const setIntersectionConservationCondition = (nextValue: IntersectionHorizontalSignsCondition) => {
    const nextValues = setIntersectionArrayValue(
      data.intersection_conservation_by_intersection,
      nextValue,
      "" as IntersectionHorizontalSignsCondition
    );

    onDataChange({
      intersection_conservation_by_intersection: nextValues,
      intersection_conservation: deriveIntersectionConservationRating(nextValues),
      touched_fields: {
        intersection_conservation_by_intersection: true,
        intersection_conservation: nextValues.some((value) => value !== ""),
      },
    });
  };
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

  const renderIntersectionBadge = (
    prefix: string,
    currentRating: IdecicloRating | null | undefined
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
    </>
  );
  const setA2IntersectionRoadType = (nextValue: IntersectionRoadType) => {
    const nextRoadTypes = setIntersectionArrayValue(
      data.intersection_road_type_by_intersection,
      nextValue,
      "" as IntersectionRoadType
    );

    onDataChange({
      intersection_road_type_by_intersection: nextRoadTypes,
      touched_fields: {
        intersection_road_type_by_intersection: true,
        [intersectionTouchKey("a2_type", currentIntersectionIndex)]: true,
      },
    });
  };
  const setA2IntersectionCyclingConnection = (nextValue: boolean) => {
    const nextConnections = setIntersectionArrayValue(
      data.intersection_has_cycling_connection_by_intersection,
      nextValue,
      null as boolean | null
    );

    onDataChange({
      intersection_has_cycling_connection_by_intersection: nextConnections,
      touched_fields: {
        intersection_has_cycling_connection_by_intersection: true,
        [intersectionTouchKey("a2_connection", currentIntersectionIndex)]: true,
      },
    });
  };

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
  const hasAnyRiskSelected = availableRiskOptions.some(
    (option) => Number(riskOccurrenceCounts[option.key] || 0) > 0
  );
  const chipClassName = (selected: boolean) =>
    `rounded-full border px-3 py-2 text-sm font-medium transition ${
      selected
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
    }`;
  const hasTouchedB5Crossings = Boolean(
    data.touched_fields?.[blockTouchKey("b5_crossings", currentBlockIndex)]
  );
  const hasTouchedB5Lanes = Boolean(
    data.touched_fields?.[blockTouchKey("b5_lanes", currentBlockIndex)]
  );

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
        [blockTouchKey(
          field === "signalized_crossings_count_by_block" ? "b5_crossings" : "b5_lanes",
          currentBlockIndex
        )]: true,
      },
    });
  };

  return (
    <CriteriaAccordionGroup
          allValues={["b7", "b5", "a2", "c1", "e1", "c2", "c3"].filter(canShow)}
          defaultOpenValues={["b7", "b5", "a2", "c1"].filter(canShow)}
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
                  bus_stop_conflict: false,
                  school_conflict: false,
                  horizontal_obstacles: false,
                  vertical_obstacles: false,
                side_change_mid_block: false,
                opposite_flow_direction: false,
                touched_fields: {
                  no_risk_situations: false,
                  bus_stop_conflict: false,
                  school_conflict: false,
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
                            bus_stop_conflict: false,
                            school_conflict: false,
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
                    <div
                      key={option.key}
                      className={`flex items-stretch overflow-hidden rounded-2xl border transition ${
                        selected
                          ? "border-rose-300 bg-rose-50 shadow-sm"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleRiskCountChange(option.key, 1)}
                        className="flex flex-1 items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50/50"
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
                            {selected ? `Ocorrencias: ${count}` : "Toque para marcar"}
                          </span>
                        </div>
                      </button>
                      {selected ? (
                        <button
                          type="button"
                          onClick={() => handleRiskCountChange(option.key, -1)}
                          className="flex w-11 shrink-0 items-center justify-center border-l border-rose-200 bg-white/60 text-slate-500 transition hover:bg-white hover:text-rose-700"
                          aria-label={`Reduzir ${option.label}`}
                          title={`Reduzir ${option.label}`}
                        >
                          <span className="text-lg font-semibold leading-none">×</span>
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </AssessmentCriterionAccordion> : null}

          {canShow("a2") ? (
            <AssessmentCriterionAccordion
              value="a2"
              title="A.2. Conectividade da rede cicloviária"
              description="Classifique a via da interseção e informe se há continuidade ou conexão com outra infraestrutura cicloviária."
              scorePreview={buildCriterionScorePreview(data, ["A2"])}
              answered={
                Array.isArray(data.intersection_road_type_by_intersection) &&
                data.intersection_road_type_by_intersection.some((value) => Boolean(value))
              }
              inAnalysis={data.criterion_workflow_state?.a2 === "analysis"}
              onAnalysisChange={(value) => updateWorkflow("a2", value ? "analysis" : "default")}
              onClear={() =>
                onDataChange({
                  intersection_road_type_by_intersection: Array.from(
                    { length: intersectionCount },
                    () => "" as IntersectionRoadType
                  ),
                  intersection_has_cycling_connection_by_intersection: Array.from(
                    { length: intersectionCount },
                    () => null as boolean | null
                  ),
                  relevant_intersections_count: 0,
                  connected_intersections_count: 0,
                  touched_fields: {
                    intersection_road_type_by_intersection: false,
                    intersection_has_cycling_connection_by_intersection: false,
                    ...resetIntersectionTouchKeys(["a2_type", "a2_connection"]),
                  },
                })
              }
              helpKey="A2"
              pager={intersectionPager}
              showPager={!hideIntersectionPager}
              extraBadges={renderIntersectionBadge("I", undefined)}
            >
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Tipo da via na interseção</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Local", value: "local" as const },
                      { label: "Coletora", value: "coletora" as const },
                      { label: "Arterial", value: "arterial" as const },
                    ].map((option) => (
                      <button
                        key={`a2-road-${option.value}`}
                        type="button"
                        className={chipClassName(currentIntersectionRoadType === option.value)}
                        onClick={() => setA2IntersectionRoadType(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Há infraestrutura cicloviária conectada?</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Sim", value: true },
                      { label: "Não", value: false },
                    ].map((option) => (
                      <button
                        key={`a2-connection-${String(option.value)}`}
                        type="button"
                        className={chipClassName(currentIntersectionHasCyclingConnection === option.value)}
                        onClick={() => setA2IntersectionCyclingConnection(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </AssessmentCriterionAccordion>
          ) : null}

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
                  ...resetBlockTouchKeys(["b5_crossings", "b5_lanes"]),
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
                      className={chipClassName(
                        hasTouchedB5Crossings && currentBlockCrossings === value
                      )}
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
                      className={chipClassName(
                        hasTouchedB5Lanes && currentBlockTrafficLanes === value
                      )}
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
                    ...resetIntersectionTouchKeys(["c1"]),
                  },
                })
              }
              helpKey="C1"
              extraBadges={renderIntersectionBadge("I", c1IntersectionRatings[currentIntersectionIndex])}
              pager={
                intersectionPager
                  ? { ...intersectionPager, itemRatings: c1IntersectionRatings }
                  : undefined
              }
              showPager={!hideIntersectionPager}
            >
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
                      [intersectionTouchKey("c1", currentIntersectionIndex)]: true,
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
              description="Informe a condição da sinalização em cada interseção para calcular o conceito do trecho."
              scorePreview={buildCriterionScorePreview(data, ["E1"])}
              answered={isTouched([
                "intersection_conservation",
                "intersection_conservation_by_intersection",
              ])}
              inAnalysis={
                data.criterion_workflow_state?.e1 === "analysis" ||
                data.criterion_workflow_state?.c1e1 === "analysis"
              }
              onAnalysisChange={(value) => updateWorkflow("e1", value ? "analysis" : "default")}
              onClear={() =>
                onDataChange({
                  intersection_conservation: "",
                  intersection_conservation_by_intersection: [],
                  touched_fields: {
                    intersection_conservation: false,
                    intersection_conservation_by_intersection: false,
                  },
                })
              }
              helpKey="E1"
              pager={intersectionPager}
              showPager={!hideIntersectionPager}
            >
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Condição da sinalização na interseção</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Bom", value: "good" as const },
                      { label: "Danos", value: "damage" as const },
                      { label: "Não há", value: "none" as const },
                    ].map((option) => (
                      <button
                        key={`intersection-conservation-${option.value}`}
                        type="button"
                        className={chipClassName(currentIntersectionConservationCondition === option.value)}
                        onClick={() => setIntersectionConservationCondition(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
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
                    ...resetIntersectionTouchKeys(["c2"]),
                  },
                })
              }
            helpKey="C2"
            extraBadges={renderIntersectionBadge("I", c2IntersectionRatings[currentIntersectionIndex])}
            pager={
              intersectionPager
                ? { ...intersectionPager, itemRatings: c2IntersectionRatings }
                : undefined
            }
            showPager={!hideIntersectionPager}
          >
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
                    [intersectionTouchKey("c2", currentIntersectionIndex)]: true,
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
                  label: "-",
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
                  ...resetIntersectionTouchKeys(["c3", "c3_lanes", "c3_width", "c3_calming"]),
                },
              })
            }
            helpKey="C3"
            extraBadges={renderIntersectionBadge("I", c3IntersectionRatings[currentIntersectionIndex])}
            pager={
              intersectionPager
                ? { ...intersectionPager, itemRatings: c3IntersectionRatings }
                : undefined
            }
            showPager={!hideIntersectionPager}
          >
            {!isCiclorrota ? (
              <ConceptCriteriaTable
                value={c3IntersectionRatings[currentIntersectionIndex] || ""}
                onValueChange={(value) => setC3ConflictRating(value as "A" | "B" | "C" | "D")}
                options={[
                  {
                    value: "A",
                    description:
                      "Não há conversão veicular sobre a infraestrutura cicloviária OU há conversão, mas há estágio semafórico com tempo exclusivo para ciclistas.",
                  },
                  ...(String(data.infra_flow || "") === "unidirectional"
                    ? [
                        {
                          value: "B",
                          description:
                            "Há conversão veicular, com medidas físicas de proteção dos ciclistas na esquina.",
                        },
                      ]
                    : []),
                  {
                    value: "C",
                    description:
                      "Há estágio semafórico de pedestres, que possibilita a circulação conjunta OU há medidas de acalmamento de tráfego na via, mas não orientadas para a condição de travessia de ciclistas.",
                  },
                  {
                    value: "D",
                    description:
                      "Há conversão veicular, ou cruzamento sem medidas de acalmamento de tráfego; não há estágio semafórico para ciclistas.",
                  },
                ]}
              />
            ) : null}

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
                          [intersectionTouchKey("c3_lanes", currentIntersectionIndex)]: true,
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
                          [intersectionTouchKey("c3_width", currentIntersectionIndex)]: true,
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
                            [intersectionTouchKey("c3_calming", currentIntersectionIndex)]: true,
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
