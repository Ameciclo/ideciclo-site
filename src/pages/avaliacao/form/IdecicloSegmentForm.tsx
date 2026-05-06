import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Eye, Lightbulb, Menu, Pin, Save, Wifi, WifiOff, X } from "lucide-react";
import DesignQualityStep from "./DesignQualityStep";
import TrafficConflictsStep from "./TrafficConflictsStep";
import PavementStep from "./PavementStep";
import DelimitationStep from "./DelimitationStep";
import SignageStep from "./SignageStep";
import SafetyAndComfortStep from "./SafetyAndComfortStep";
import UrbanityStep from "./UrbanityStep";
import ReviewAndSubmitStep from "./ReviewAndSubmitStep";
import { useToast } from "@/hooks/use-toast";
import {
  createFormInDB,
  fetchCityFromDB,
  fetchFormById,
  fetchSegmentById,
  getFormBySegmentId,
  getSegmentByIdForForm,
  updateSegmentInDB,
  updateFormInDB,
  updateSegmentEvaluationStatus,
} from "@/services/database";
import {
  CRITERION_CODES,
  CriterionCode,
  getInitialRatingModes,
  getA1Decision,
  getA1FieldLabel,
  getScoreBreakdown,
  isCriterionApplicable,
} from "@/utils/idecicloAssessment";
import { IdecicloFormData } from "@/types/idecicloForm";
import SegmentPreviewMap from "@/components/SegmentPreviewMap";
import { Segment } from "@/types";
import AssessmentCriterionAccordion from "@/components/AssessmentCriterionAccordion";
import { CriterionPagerConfig } from "@/components/AssessmentCriterionAccordion";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import {
  CriteriaAccordionContext,
  CriterionAnswerFilter,
  CriterionFilter,
  CriterionFilterMode,
  CriterionReviewFilter,
} from "@/components/criteriaAccordionContext";
import { buildCriterionScorePreview } from "@/utils/criterionScorePreview";
import { getPersistedCityData } from "@/utils/persistedCityData";

const DRAFT_PREFIX = "ideciclo-draft";
const PENDING_SUBMISSIONS_KEY = "ideciclo-pending-submissions";

const buildDraftKey = (segmentId?: string | null) =>
  segmentId ? `${DRAFT_PREFIX}:${segmentId}` : DRAFT_PREFIX;

const clampMinimumOne = (value: unknown) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 1;
  return Math.max(1, Math.round(numeric));
};

const clampNonNegative = (value: unknown) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.round(numeric));
};

const getSessionSelectedSegmentId = () => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("selectedSegmentId");
};

const getSessionSelectedCityId = () => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("selectedCityId");
};

const findSegmentInPersistedCityData = (segmentId: string | null | undefined): Partial<Segment> | null => {
  if (!segmentId) return null;
  const serialized = getPersistedCityData();
  if (!serialized) return null;

  try {
    const parsed = JSON.parse(serialized);
    const segments = Array.isArray(parsed?.segments) ? parsed.segments : [];
    const matched = segments.find((segment: Partial<Segment> & { id?: string }) => {
      if (!segment?.id) return false;
      if (segment.id === segmentId) return true;
      if (segment.id.includes("_")) {
        return segment.id.split("_").slice(1).join("_") === segmentId;
      }
      return false;
    });

    return matched || null;
  } catch (error) {
    console.warn("Falha ao ler cityData persistido:", error);
    return null;
  }
};

const mapDirectionPrefillToInfraFlow = (
  direction?: string
): "unidirectional" | "bidirectional" | undefined => {
  if (!direction) return undefined;
  const normalized = direction.toLowerCase();
  if (normalized.includes("bi")) return "bidirectional";
  if (normalized.includes("uni") || normalized.includes("contra")) return "unidirectional";
  return undefined;
};

const mapPositionPrefillToForm = (position?: string): string | undefined => {
  if (!position) return undefined;
  const normalized = position.toLowerCase();
  if (normalized === "canteiro") return "canteiro";
  if (normalized === "pista_canteiro") return "pista_canteiro";
  if (normalized === "pista_calcada") return "pista_calcada";
  if (normalized === "calcada") return "calcada";
  if (normalized === "centro_pista") return "centro_pista";
  if (normalized === "isolada") return "isolada";
  if (normalized.includes("esquerdo") || normalized.includes("direito")) return "pista_calcada";
  if (normalized.includes("ambos")) return "pista_calcada";
  if (normalized.includes("calçada") || normalized.includes("calcada")) return "calcada";
  if (normalized.includes("canteiro")) return "canteiro";
  if (normalized.includes("dedicada") || normalized.includes("segregada")) return "isolada";
  return undefined;
};

const mapFormTypologyToSegmentType = (
  value?: string
): Segment["type"] | undefined => {
  const normalized = (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("ciclovia")) return "Ciclovia";
  if (normalized.includes("ciclofaixa")) return "Ciclofaixa";
  if (normalized.includes("ciclorrota")) return "Ciclorrota";
  if (normalized.includes("partilhada") || normalized.includes("compartilhada")) {
    return "Compartilhada";
  }

  return undefined;
};

const OSM_SURFACE_TO_PAVEMENT_TYPE: Record<string, "A" | "B" | "C" | "D"> = {
  paved: "A",
  asphalt: "A",
  chipseal: "A",
  concrete: "A",
  "concrete:lanes": "A",
  "concrete:plates": "A",
  paving_stones: "B",
  "paving_stones:lanes": "B",
  bricks: "B",
  brick: "B",
  tiles: "B",
  sett: "C",
  unhewn_cobblestone: "C",
  cobblestone: "C",
  stepping_stones: "C",
  grass_paver: "C",
  stone: "C",
  unpaved: "D",
  compacted: "D",
  fine_gravel: "D",
  gravel: "D",
  pebblestone: "D",
  rock: "D",
  ground: "D",
  dirt: "D",
  earth: "D",
  grass: "D",
  mud: "D",
  sand: "D",
  woodchips: "D",
  metal: "D",
  metal_grid: "D",
  wood: "D",
  snow: "D",
  ice: "D",
  salt: "D",
};

const PREFILL_PAVEMENT_TO_TYPE: Record<string, "A" | "B" | "C" | "D"> = {
  "asfalto/concreto (melhor)": "A",
  "blocos (razoável)": "B",
  "paralelepípedo/pedra (regular)": "C",
  "inadequado/revisar": "D",
};

const mapOsmSurfaceToPavementType = (
  surface?: string,
  prefillPavement?: string
): "A" | "B" | "C" | "D" | undefined => {
  const normalizedSurface = surface?.trim().toLowerCase();
  if (normalizedSurface && normalizedSurface in OSM_SURFACE_TO_PAVEMENT_TYPE) {
    return OSM_SURFACE_TO_PAVEMENT_TYPE[normalizedSurface];
  }

  const normalizedPrefill = prefillPavement?.trim().toLowerCase();
  if (normalizedPrefill && normalizedPrefill in PREFILL_PAVEMENT_TO_TYPE) {
    return PREFILL_PAVEMENT_TO_TYPE[normalizedPrefill];
  }

  return undefined;
};

const mapIdecicloHierarchyToIntersectionRoadType = (
  hierarchy?: string
): "local" | "coletora" | "arterial" | "" => {
  const normalized = (hierarchy || "").toLowerCase();
  if (normalized === "estrutural") return "arterial";
  if (normalized === "alimentadora") return "coletora";
  if (normalized === "local") return "local";
  return "";
};

const applyOsmPrefillToFormData = (
  data: IdecicloFormData,
  segmentData: Partial<Segment> | null | undefined
): IdecicloFormData => {
  if (!segmentData?.ideciclo_prefill) return data;

  const prefill = segmentData.ideciclo_prefill;
  const inferredFlow = mapDirectionPrefillToInfraFlow(prefill.sentido);
  const inferredPosition = mapPositionPrefillToForm(prefill.posicaoNaVia);
  const inferredSpeed = prefill.velocidade ? Number(prefill.velocidade) : undefined;
  const inferredPavementType = mapOsmSurfaceToPavementType(
    segmentData.osm_tags?.surface,
    prefill.pavimento
  );
  const selectedIntersections = Array.isArray(segmentData.selected_intersections)
    ? segmentData.selected_intersections.filter((item) => item.selected !== false)
    : [];
  const inferredIntersectionCount = selectedIntersections.length;
  const inferredRoadTypesByIntersection = selectedIntersections.map((item) =>
    mapIdecicloHierarchyToIntersectionRoadType(item.hierarchyIdeciclo)
  );
  const inferredConnectionByIntersection = selectedIntersections.map(() => null);
  const inferredIntersectionNames = selectedIntersections.map(
    (item) => item.roadName || `Via ${item.roadId}`
  );
  const inferredIntersectionHighways = selectedIntersections.map(
    (item) => item.highway || ""
  );
  const inferredIntersectionOsmHierarchy = selectedIntersections.map(
    (item) => item.hierarchyOsm || ""
  );
  const inferredIntersectionIdecicloHierarchy = selectedIntersections.map(
    (item) => item.hierarchyIdeciclo || ""
  );

  return {
    ...data,
    start_point: data.start_point || prefill.trechoInicio || data.start_point,
    end_point: data.end_point || prefill.trechoFim || data.end_point,
    infra_typology: data.infra_typology || prefill.tipologia || data.infra_typology,
    road_hierarchy: data.road_hierarchy || prefill.hierarquia || data.road_hierarchy,
    classification: data.classification || prefill.hierarquia || data.classification,
    infra_flow: data.infra_flow !== "unidirectional" ? data.infra_flow : inferredFlow || data.infra_flow,
    position_on_road: data.position_on_road !== "pista_calcada"
      ? data.position_on_road
      : inferredPosition || data.position_on_road,
    velocity_kmh:
      data.velocity_kmh > 0
        ? data.velocity_kmh
        : Number.isFinite(inferredSpeed)
          ? Number(inferredSpeed)
          : data.velocity_kmh,
    regulated_speed_choices:
      Array.isArray(data.regulated_speed_choices) && data.regulated_speed_choices.length > 0
        ? data.regulated_speed_choices
        : data.velocity_kmh > 0
          ? [data.velocity_kmh]
          : Number.isFinite(inferredSpeed)
            ? [Number(inferredSpeed)]
            : data.regulated_speed_choices,
    pavement_type: data.pavement_type || inferredPavementType || data.pavement_type,
    traffic_lanes_count:
      data.traffic_lanes_count !== 2
        ? data.traffic_lanes_count
        : prefill.numeroFaixas ?? data.traffic_lanes_count,
    width_meters:
      data.width_meters > 0 ? data.width_meters : prefill.largura ?? data.width_meters,
    blocks_count:
      data.blocks_count !== 1
        ? data.blocks_count
        : clampMinimumOne(
            segmentData.blocks_count ??
              segmentData.estimated_blocks_count ??
              data.blocks_count
          ),
    intersections_count:
      data.intersections_count !== 0
        ? data.intersections_count
        : inferredIntersectionCount > 0
          ? inferredIntersectionCount
          : clampNonNegative(
              segmentData.intersections_count ??
                segmentData.estimated_intersections_count ??
                data.intersections_count
            ),
    relevant_intersections_count:
      data.relevant_intersections_count !== 0
        ? data.relevant_intersections_count
        : inferredRoadTypesByIntersection.length > 0
          ? inferredRoadTypesByIntersection.filter(
              (value) => value === "coletora" || value === "arterial"
            ).length
          : clampNonNegative(
              segmentData.relevant_intersections_count ?? data.relevant_intersections_count
            ),
    connected_intersections_count:
      data.connected_intersections_count !== 0
        ? data.connected_intersections_count
        : clampNonNegative(
            segmentData.connected_intersections_count ?? data.connected_intersections_count
          ),
    intersection_road_type_by_intersection:
      Array.isArray(data.intersection_road_type_by_intersection) &&
      data.intersection_road_type_by_intersection.length > 0
        ? data.intersection_road_type_by_intersection
        : inferredRoadTypesByIntersection,
    intersection_has_cycling_connection_by_intersection:
      Array.isArray(data.intersection_has_cycling_connection_by_intersection) &&
      data.intersection_has_cycling_connection_by_intersection.length > 0
        ? data.intersection_has_cycling_connection_by_intersection
        : inferredConnectionByIntersection,
    intersection_name_by_intersection:
      Array.isArray(data.intersection_name_by_intersection) &&
      data.intersection_name_by_intersection.length > 0
        ? data.intersection_name_by_intersection
        : inferredIntersectionNames,
    intersection_highway_by_intersection:
      Array.isArray(data.intersection_highway_by_intersection) &&
      data.intersection_highway_by_intersection.length > 0
        ? data.intersection_highway_by_intersection
        : inferredIntersectionHighways,
    intersection_hierarchy_osm_by_intersection:
      Array.isArray(data.intersection_hierarchy_osm_by_intersection) &&
      data.intersection_hierarchy_osm_by_intersection.length > 0
        ? data.intersection_hierarchy_osm_by_intersection
        : inferredIntersectionOsmHierarchy,
    intersection_hierarchy_ideciclo_by_intersection:
      Array.isArray(data.intersection_hierarchy_ideciclo_by_intersection) &&
      data.intersection_hierarchy_ideciclo_by_intersection.length > 0
        ? data.intersection_hierarchy_ideciclo_by_intersection
        : inferredIntersectionIdecicloHierarchy,
  };
};

const syncSegmentA1ToFormData = (
  data: IdecicloFormData,
  segmentData: Partial<Segment> | null | undefined
): IdecicloFormData => {
  if (!segmentData) return data;

  const prefill = segmentData.ideciclo_prefill;
  const inferredFlow = mapDirectionPrefillToInfraFlow(prefill?.sentido);
  const inferredPosition = mapPositionPrefillToForm(prefill?.posicaoNaVia);
  const inferredSpeed = prefill?.velocidade ? Number(prefill.velocidade) : 0;

  return {
    ...data,
    infra_typology: segmentData.type || prefill?.tipologia || data.infra_typology,
    road_hierarchy:
      segmentData.classification || prefill?.hierarquia || data.road_hierarchy,
    classification:
      segmentData.classification || prefill?.hierarquia || data.classification,
    infra_flow: inferredFlow || data.infra_flow,
    position_on_road: inferredPosition || data.position_on_road,
    velocity_kmh: inferredSpeed > 0 ? inferredSpeed : data.velocity_kmh,
    regulated_speed_choices:
      inferredSpeed > 0 ? [inferredSpeed] : data.regulated_speed_choices,
  };
};

const buildOsmFieldDifferences = (
  data: IdecicloFormData,
  segmentData: Partial<Segment> | null
) => {
  const prefill = segmentData?.ideciclo_prefill;
  if (!prefill) return [];

  const differences: Array<{
    field: string;
    osmValue: string | number;
    observedValue: string | number;
  }> = [];

  const compare = (field: string, osmValue: string | number | undefined, observedValue: string | number) => {
    if (osmValue === undefined || osmValue === null || osmValue === "") return;
    if (String(osmValue).trim() === String(observedValue).trim()) return;
    differences.push({ field, osmValue, observedValue });
  };

  compare("tipologia", prefill.tipologia, data.infra_typology);
  compare("hierarquia", prefill.hierarquia, data.road_hierarchy);
  compare("velocidade", prefill.velocidade, data.velocity_kmh);
  compare("numeroFaixas", prefill.numeroFaixas, data.traffic_lanes_count);
  compare("largura", prefill.largura, data.width_meters);
  compare("trechoInicio", prefill.trechoInicio, data.start_point);
  compare("trechoFim", prefill.trechoFim, data.end_point);
  compare("sentido", mapDirectionPrefillToInfraFlow(prefill.sentido), data.infra_flow);
  compare("posicaoNaVia", mapPositionPrefillToForm(prefill.posicaoNaVia), data.position_on_road);

  return differences;
};

const fetchSegmentContextById = async (
  segmentId: string | null | undefined
): Promise<Partial<Segment> | null> => {
  if (!segmentId) return null;
  const dbSegment = await fetchSegmentById(segmentId);
  const persistedSegment = findSegmentInPersistedCityData(segmentId);
  return {
    ...(persistedSegment || {}),
    ...(dbSegment || {}),
    ideciclo_prefill: dbSegment?.ideciclo_prefill || persistedSegment?.ideciclo_prefill,
    osm_confidence: dbSegment?.osm_confidence || persistedSegment?.osm_confidence,
    osm_improvement_suggestions:
      dbSegment?.osm_improvement_suggestions || persistedSegment?.osm_improvement_suggestions,
    intersections_preview: dbSegment?.intersections_preview || persistedSegment?.intersections_preview,
    selected_intersections:
      dbSegment?.selected_intersections || persistedSegment?.selected_intersections,
    estimated_blocks_count:
      dbSegment?.estimated_blocks_count ?? persistedSegment?.estimated_blocks_count,
    estimated_intersections_count:
      dbSegment?.estimated_intersections_count ??
      persistedSegment?.estimated_intersections_count,
    osm_advanced: dbSegment?.osm_advanced || persistedSegment?.osm_advanced,
  };
};

const toSegmentPreview = (
  segmentData: {
    id?: string;
    id_cidade?: string;
    name?: string;
    type?: Segment["type"];
    length?: number;
    neighborhood?: string | null;
    geometry?: unknown;
    selected?: boolean | null;
    evaluated?: boolean | null;
    id_form?: string | null;
    is_merged?: boolean | null;
    parent_segment_id?: string | null;
    merged_segments?: unknown;
    classification?: string | null;
    blocks_count?: number | null;
    intersections_count?: number | null;
    relevant_intersections_count?: number | null;
    connected_intersections_count?: number | null;
    osm_id?: string | null;
    osm_type?: string | null;
    osm_tags?: Record<string, string> | null;
    osm_raw?: unknown;
    osm_confidence?: Record<string, string> | null;
    ideciclo_prefill?: Segment["ideciclo_prefill"];
    osm_improvement_suggestions?: Segment["osm_improvement_suggestions"];
    estimated_blocks_count?: number | null;
    estimated_intersections_count?: number | null;
    intersections_preview?: Segment["intersections_preview"];
    selected_intersections?: Segment["selected_intersections"];
    osm_advanced?: Segment["osm_advanced"];
  } | null
): Segment | null => {
  if (!segmentData) return null;

  return {
    id: segmentData.id,
    id_cidade: segmentData.id_cidade,
    name: segmentData.name || "",
    type: segmentData.type,
    length: segmentData.length || 0,
    neighborhood: segmentData.neighborhood || undefined,
    geometry: segmentData.geometry,
    selected: Boolean(segmentData.selected),
    evaluated: Boolean(segmentData.evaluated),
    id_form: segmentData.id_form || undefined,
    is_merged: Boolean(segmentData.is_merged),
    parent_segment_id: segmentData.parent_segment_id || undefined,
    merged_segments: Array.isArray(segmentData.merged_segments)
      ? segmentData.merged_segments
      : undefined,
    classification: segmentData.classification || undefined,
    blocks_count: segmentData.blocks_count ?? undefined,
    intersections_count: segmentData.intersections_count ?? undefined,
    relevant_intersections_count: segmentData.relevant_intersections_count ?? undefined,
    connected_intersections_count: segmentData.connected_intersections_count ?? undefined,
    osm_id: segmentData.osm_id || undefined,
    osm_type: segmentData.osm_type || undefined,
    osm_tags: segmentData.osm_tags || undefined,
    osm_raw:
      (segmentData.osm_raw as Segment["osm_raw"]) || undefined,
    osm_confidence:
      (segmentData.osm_confidence as Segment["osm_confidence"]) || undefined,
    ideciclo_prefill: segmentData.ideciclo_prefill || undefined,
    osm_improvement_suggestions: segmentData.osm_improvement_suggestions || undefined,
    estimated_blocks_count: segmentData.estimated_blocks_count ?? undefined,
    estimated_intersections_count: segmentData.estimated_intersections_count ?? undefined,
    intersections_preview: segmentData.intersections_preview || undefined,
    selected_intersections: segmentData.selected_intersections || undefined,
    osm_advanced: segmentData.osm_advanced || undefined,
  };
};

const createEmptyFormData = (segmentId?: string | null): IdecicloFormData => ({
  researcher: "",
  date: new Date().toISOString().split("T")[0],
  city: "",
  city_id: "",
  neighborhood: "",
  id: segmentId || "",
  segment_id: segmentId || "",
  segment_name: "",
  extension_m: 0,
  velocity_kmh: 0,
  regulated_speed_choices: [],
  start_point: "",
  end_point: "",
  road_hierarchy: "",
  blocks_count: 1,
  intersections_count: 0,
  relevant_intersections_count: 0,
  connected_intersections_count: 0,
  intersection_road_type_by_intersection: [],
  intersection_has_cycling_connection_by_intersection: [],
  intersection_name_by_intersection: [],
  intersection_highway_by_intersection: [],
  intersection_hierarchy_osm_by_intersection: [],
  intersection_hierarchy_ideciclo_by_intersection: [],
  pedestrian_flow_per_hour_per_meter: 0,
  infra_typology: "",
  infra_flow: "unidirectional",
  position_on_road: "pista_calcada",
  width_meters: 0,
  width_measurements_m: [],
  includes_gutter: false,
  buffer_width_m: 0,
  buffer_measurements_m: [],
  speed_measures: [],
  traffic_calming_counts: {},
  avg_distance_measures_m: 0,
  no_traffic_calming_measures: false,
  pavement_type: "",
  conservation_state: "",
  separation_devices_ciclofaixa: "",
  separation_devices_ciclovia: "",
  separation_devices_calcada: "",
  devices_conservation: "",
  lateral_spacing_type: "",
  has_double_lateral_line: false,
  lateral_spacing_width_m: 0,
  spacing_conservation: "",
  space_identification: "",
  identification_conservation: "",
  pictograms_per_block: 0,
  pictograms_cover_all_blocks: false,
  pictograms_conservation: "",
  regulation_signs_per_block: 0,
  regulation_signs_per_block_by_block: [],
  signs_both_directions: null,
  signs_both_directions_by_block: [],
  vertical_signs_conservation: "",
  vertical_signs_conservation_by_block: [],
  traffic_lanes_count: 2,
  signalized_crossings_count: 0,
  traffic_lanes_count_by_block: [],
  signalized_crossings_count_by_block: [],
  no_risk_situations: false,
  risk_occurrence_counts: {},
  bus_stop_conflict: false,
  school_conflict: false,
  horizontal_obstacles: false,
  vertical_obstacles: false,
  side_change_mid_block: false,
  opposite_flow_direction: false,
  intersection_signaling: "",
  intersection_signaling_by_intersection: [],
  intersection_conservation: "",
  intersection_conservation_by_intersection: [],
  connection_accessibility: "",
  connection_accessibility_by_intersection: [],
  traffic_lanes_per_direction: 1,
  traffic_lanes_per_direction_by_intersection: [],
  mixed_lane_width_m: 2.7,
  mixed_lane_width_m_by_intersection: [],
  has_intersection_traffic_calming: false,
  has_intersection_traffic_calming_by_intersection: [],
  motorized_conflicts: [],
  motorized_conflicts_by_intersection: [],
  has_lighting_posts: null,
  lighting_rating: "",
  lighting_post_type: "",
  lighting_distance_m: 0,
  lighting_directed: null,
  lighting_barriers: null,
  lighting_distance_to_infra: "",
  shading_coverage: "",
  vegetation_size: "",
  blocks_with_cycling_furniture: 0,
  cycling_furniture: [],
  cycling_furniture_by_block: [],
  cycling_furniture_counts_by_block: [],
  no_cycling_furniture_by_block: [],
  observations: "",
  rating_modes: getInitialRatingModes(),
  manual_ratings: {},
  touched_fields: {},
  criterion_workflow_state: {},
});

const mergeWithDefaults = (
  segmentId: string | null | undefined,
  incoming: Partial<IdecicloFormData> | null | undefined
): IdecicloFormData => {
  const defaults = createEmptyFormData(segmentId);
  const data = incoming ?? {};
  const legacyData = data as Partial<IdecicloFormData> & {
    signalized_crossings_per_block?: number;
    bus_school_conflict?: boolean;
  };
  const fallbackTrafficCalmingCounts =
    data.traffic_calming_counts && Object.keys(data.traffic_calming_counts).length > 0
      ? data.traffic_calming_counts
      : Array.isArray(data.speed_measures)
        ? Object.fromEntries(data.speed_measures.map((measure) => [measure, 1]))
        : {};
  const fallbackRiskOccurrenceCounts =
    data.risk_occurrence_counts && Object.keys(data.risk_occurrence_counts).length > 0
      ? data.risk_occurrence_counts
      : {
        ...((data.bus_stop_conflict || legacyData.bus_school_conflict) ? { bus_stop_conflict: 1 } : {}),
        ...(data.school_conflict ? { school_conflict: 1 } : {}),
        ...(data.horizontal_obstacles ? { horizontal_obstacles: 1 } : {}),
        ...(data.vertical_obstacles ? { vertical_obstacles: 1 } : {}),
        ...(data.side_change_mid_block ? { side_change_mid_block: 1 } : {}),
        ...(data.opposite_flow_direction ? { opposite_flow_direction: 1 } : {}),
      };
  const fallbackIntersectionSignaling =
    Array.isArray(data.intersection_signaling_by_intersection) &&
      data.intersection_signaling_by_intersection.length > 0
      ? data.intersection_signaling_by_intersection
      : data.intersection_signaling
        ? [data.intersection_signaling]
        : [];
  const fallbackIntersectionRoadTypeByIntersection =
    Array.isArray(data.intersection_road_type_by_intersection) &&
    data.intersection_road_type_by_intersection.length > 0
      ? data.intersection_road_type_by_intersection
      : Array.from({ length: Math.max(0, Number(data.intersections_count || 0)) }, (_, index) => {
          const relevantCount = Number(data.relevant_intersections_count || 0);
          return index < relevantCount ? "coletora" : "";
        });
  const fallbackIntersectionHasCyclingConnectionByIntersection =
    Array.isArray(data.intersection_has_cycling_connection_by_intersection) &&
    data.intersection_has_cycling_connection_by_intersection.length > 0
      ? data.intersection_has_cycling_connection_by_intersection
      : Array.from({ length: Math.max(0, Number(data.intersections_count || 0)) }, (_, index) => {
          const connectedCount = Number(data.connected_intersections_count || 0);
          const relevantCount = Number(data.relevant_intersections_count || 0);
          if (index >= relevantCount) return null;
          return index < connectedCount;
        });
  const fallbackIntersectionNameByIntersection =
    Array.isArray(data.intersection_name_by_intersection) &&
    data.intersection_name_by_intersection.length > 0
      ? data.intersection_name_by_intersection
      : [];
  const fallbackIntersectionHighwayByIntersection =
    Array.isArray(data.intersection_highway_by_intersection) &&
    data.intersection_highway_by_intersection.length > 0
      ? data.intersection_highway_by_intersection
      : [];
  const fallbackIntersectionHierarchyOsmByIntersection =
    Array.isArray(data.intersection_hierarchy_osm_by_intersection) &&
    data.intersection_hierarchy_osm_by_intersection.length > 0
      ? data.intersection_hierarchy_osm_by_intersection
      : [];
  const fallbackIntersectionHierarchyIdecicloByIntersection =
    Array.isArray(data.intersection_hierarchy_ideciclo_by_intersection) &&
    data.intersection_hierarchy_ideciclo_by_intersection.length > 0
      ? data.intersection_hierarchy_ideciclo_by_intersection
      : [];
  const fallbackConnectionAccessibility =
    Array.isArray(data.connection_accessibility_by_intersection) &&
      data.connection_accessibility_by_intersection.length > 0
      ? data.connection_accessibility_by_intersection
      : data.connection_accessibility
        ? [data.connection_accessibility]
        : [];
  const fallbackIntersectionConservationByIntersection =
    Array.isArray(data.intersection_conservation_by_intersection) &&
    data.intersection_conservation_by_intersection.length > 0
      ? data.intersection_conservation_by_intersection
      : [];
  const fallbackTrafficLanesPerIntersection =
    Array.isArray(data.traffic_lanes_per_direction_by_intersection) &&
      data.traffic_lanes_per_direction_by_intersection.length > 0
      ? data.traffic_lanes_per_direction_by_intersection
      : typeof data.traffic_lanes_per_direction === "number"
        ? [data.traffic_lanes_per_direction]
        : [];
  const fallbackMixedLaneWidthPerIntersection =
    Array.isArray(data.mixed_lane_width_m_by_intersection) &&
      data.mixed_lane_width_m_by_intersection.length > 0
      ? data.mixed_lane_width_m_by_intersection
      : typeof data.mixed_lane_width_m === "number"
        ? [data.mixed_lane_width_m]
        : [];
  const fallbackIntersectionTrafficCalming =
    Array.isArray(data.has_intersection_traffic_calming_by_intersection) &&
      data.has_intersection_traffic_calming_by_intersection.length > 0
      ? data.has_intersection_traffic_calming_by_intersection
      : typeof data.has_intersection_traffic_calming === "boolean"
        ? [data.has_intersection_traffic_calming]
        : [];
  const fallbackMotorizedConflictsByIntersection =
    Array.isArray(data.motorized_conflicts_by_intersection) &&
      data.motorized_conflicts_by_intersection.length > 0
      ? data.motorized_conflicts_by_intersection
      : Array.isArray(data.motorized_conflicts) && data.motorized_conflicts.length > 0
        ? [data.motorized_conflicts]
        : [];
  const fallbackCyclingFurnitureByBlock =
    Array.isArray(data.cycling_furniture_by_block) && data.cycling_furniture_by_block.length > 0
      ? data.cycling_furniture_by_block
      : Array.isArray(data.cycling_furniture) && data.cycling_furniture.length > 0
        ? [data.cycling_furniture]
        : [];
  const fallbackCyclingFurnitureCountsByBlock =
    Array.isArray(data.cycling_furniture_counts_by_block) &&
    data.cycling_furniture_counts_by_block.length > 0
      ? data.cycling_furniture_counts_by_block
      : fallbackCyclingFurnitureByBlock.map((items) =>
          Object.fromEntries(items.map((item) => [item, 1]))
        );
  const fallbackNoCyclingFurnitureByBlock =
    Array.isArray(data.no_cycling_furniture_by_block) &&
    data.no_cycling_furniture_by_block.length > 0
      ? data.no_cycling_furniture_by_block
      : [];
  const fallbackTrafficLanesCountByBlock =
    Array.isArray(data.traffic_lanes_count_by_block) && data.traffic_lanes_count_by_block.length > 0
      ? data.traffic_lanes_count_by_block
      : typeof data.traffic_lanes_count === "number"
        ? [data.traffic_lanes_count]
        : [];
  const fallbackSignalizedCrossingsByBlock =
    Array.isArray(data.signalized_crossings_count_by_block) &&
      data.signalized_crossings_count_by_block.length > 0
      ? data.signalized_crossings_count_by_block
      : typeof data.signalized_crossings_count === "number"
        ? [data.signalized_crossings_count]
        : [];
  const fallbackVerticalSignsConservationByBlock =
    Array.isArray(data.vertical_signs_conservation_by_block) &&
      data.vertical_signs_conservation_by_block.length > 0
      ? data.vertical_signs_conservation_by_block
      : [];
  const fallbackRegulationSignsPerBlock =
    Array.isArray(data.regulation_signs_per_block_by_block) &&
      data.regulation_signs_per_block_by_block.length > 0
      ? data.regulation_signs_per_block_by_block
      : typeof data.regulation_signs_per_block === "number"
        ? [data.regulation_signs_per_block]
        : [];
  const fallbackSignsBothDirectionsByBlock =
    Array.isArray(data.signs_both_directions_by_block) && data.signs_both_directions_by_block.length > 0
      ? data.signs_both_directions_by_block
      : typeof data.signs_both_directions === "boolean" || data.signs_both_directions === null
        ? [data.signs_both_directions]
        : [];

  return {
    ...defaults,
    ...data,
    buffer_width_m: data.buffer_width_m ?? defaults.buffer_width_m,
    buffer_measurements_m: data.buffer_measurements_m ?? defaults.buffer_measurements_m,
    traffic_calming_counts: fallbackTrafficCalmingCounts,
    risk_occurrence_counts: fallbackRiskOccurrenceCounts,
    intersection_signaling_by_intersection: fallbackIntersectionSignaling,
    intersection_road_type_by_intersection: fallbackIntersectionRoadTypeByIntersection,
    intersection_has_cycling_connection_by_intersection:
      fallbackIntersectionHasCyclingConnectionByIntersection,
    intersection_name_by_intersection: fallbackIntersectionNameByIntersection,
    intersection_highway_by_intersection: fallbackIntersectionHighwayByIntersection,
    intersection_hierarchy_osm_by_intersection:
      fallbackIntersectionHierarchyOsmByIntersection,
    intersection_hierarchy_ideciclo_by_intersection:
      fallbackIntersectionHierarchyIdecicloByIntersection,
    intersection_conservation_by_intersection: fallbackIntersectionConservationByIntersection,
    connection_accessibility_by_intersection: fallbackConnectionAccessibility,
    traffic_lanes_per_direction_by_intersection: fallbackTrafficLanesPerIntersection,
    mixed_lane_width_m_by_intersection: fallbackMixedLaneWidthPerIntersection,
    has_intersection_traffic_calming_by_intersection: fallbackIntersectionTrafficCalming,
    motorized_conflicts_by_intersection: fallbackMotorizedConflictsByIntersection,
    cycling_furniture_by_block: fallbackCyclingFurnitureByBlock,
    cycling_furniture_counts_by_block: fallbackCyclingFurnitureCountsByBlock,
    no_cycling_furniture_by_block: fallbackNoCyclingFurnitureByBlock,
    traffic_lanes_count_by_block: fallbackTrafficLanesCountByBlock,
    signalized_crossings_count_by_block: fallbackSignalizedCrossingsByBlock,
    vertical_signs_conservation_by_block: fallbackVerticalSignsConservationByBlock,
    regulation_signs_per_block_by_block: fallbackRegulationSignsPerBlock,
    signs_both_directions_by_block: fallbackSignsBothDirectionsByBlock,
    signalized_crossings_count:
      data.signalized_crossings_count ?? legacyData.signalized_crossings_per_block ?? 0,
    id: data.id || defaults.id,
    segment_id: data.segment_id || defaults.segment_id,
    city_id: data.city_id || defaults.city_id,
    rating_modes: {
      ...defaults.rating_modes,
      ...(data.rating_modes || {}),
    },
    manual_ratings: {
      ...(data.manual_ratings || {}),
    },
  };
};

const hydrateHeaderFields = async (
  segmentId: string | null | undefined,
  data: IdecicloFormData,
  options?: { enableOsmPrefill?: boolean }
): Promise<IdecicloFormData> => {
  const currentSegmentId = segmentId || data.segment_id || data.id;
  if (!currentSegmentId) return data;

  const segmentData = await fetchSegmentContextById(currentSegmentId);
  if (!segmentData) return data;

  let cityName = data.city || "";
  const cityId = data.city_id || segmentData.id_cidade || "";

  if (!cityName && cityId) {
    const cityData = await fetchCityFromDB(cityId);
    cityName = cityData?.name || "";
  }

  const hydratedData = {
    ...data,
    id: data.id || currentSegmentId,
    segment_id: data.segment_id || currentSegmentId,
    city: data.city || cityName,
    city_id: data.city_id || cityId,
    neighborhood: data.neighborhood || segmentData.neighborhood || "",
    segment_name: data.segment_name || segmentData.name || "",
    infra_typology: data.infra_typology || segmentData.type || "",
    extension_m: data.extension_m || segmentData.length || 0,
    road_hierarchy: data.road_hierarchy || segmentData.classification || "",
    classification: data.classification || segmentData.classification || undefined,
    blocks_count:
      data.touched_fields?.blocks_count || data.blocks_count !== 1
        ? data.blocks_count
        : clampMinimumOne(segmentData.blocks_count),
    intersections_count:
      data.touched_fields?.intersections_count || data.intersections_count !== 0
        ? data.intersections_count
        : clampNonNegative(segmentData.intersections_count),
  };

  if (options?.enableOsmPrefill) {
    return applyOsmPrefillToFormData(hydratedData, segmentData);
  }

  return hydratedData;
};

const normalizeEvaluationCounts = (data: IdecicloFormData): IdecicloFormData => {
  const blockArraysMaxLength = Math.max(
    Array.isArray(data.regulation_signs_per_block_by_block)
      ? data.regulation_signs_per_block_by_block.length
      : 0,
    Array.isArray(data.signs_both_directions_by_block)
      ? data.signs_both_directions_by_block.length
      : 0,
    Array.isArray(data.vertical_signs_conservation_by_block)
      ? data.vertical_signs_conservation_by_block.length
      : 0,
    Array.isArray(data.traffic_lanes_count_by_block) ? data.traffic_lanes_count_by_block.length : 0,
    Array.isArray(data.signalized_crossings_count_by_block)
      ? data.signalized_crossings_count_by_block.length
      : 0,
    Array.isArray(data.cycling_furniture_by_block) ? data.cycling_furniture_by_block.length : 0,
    Array.isArray(data.cycling_furniture_counts_by_block)
      ? data.cycling_furniture_counts_by_block.length
      : 0,
    Array.isArray(data.no_cycling_furniture_by_block)
      ? data.no_cycling_furniture_by_block.length
      : 0
  );
  const intersectionArraysMaxLength = Math.max(
    Array.isArray(data.intersection_road_type_by_intersection)
      ? data.intersection_road_type_by_intersection.length
      : 0,
    Array.isArray(data.intersection_has_cycling_connection_by_intersection)
      ? data.intersection_has_cycling_connection_by_intersection.length
      : 0,
    Array.isArray(data.intersection_name_by_intersection)
      ? data.intersection_name_by_intersection.length
      : 0,
    Array.isArray(data.intersection_hierarchy_osm_by_intersection)
      ? data.intersection_hierarchy_osm_by_intersection.length
      : 0,
    Array.isArray(data.intersection_hierarchy_ideciclo_by_intersection)
      ? data.intersection_hierarchy_ideciclo_by_intersection.length
      : 0,
    Array.isArray(data.intersection_signaling_by_intersection)
      ? data.intersection_signaling_by_intersection.length
      : 0,
    Array.isArray(data.intersection_conservation_by_intersection)
      ? data.intersection_conservation_by_intersection.length
      : 0,
    Array.isArray(data.connection_accessibility_by_intersection)
      ? data.connection_accessibility_by_intersection.length
      : 0,
    Array.isArray(data.traffic_lanes_per_direction_by_intersection)
      ? data.traffic_lanes_per_direction_by_intersection.length
      : 0,
    Array.isArray(data.mixed_lane_width_m_by_intersection)
      ? data.mixed_lane_width_m_by_intersection.length
      : 0,
    Array.isArray(data.has_intersection_traffic_calming_by_intersection)
      ? data.has_intersection_traffic_calming_by_intersection.length
      : 0,
    Array.isArray(data.motorized_conflicts_by_intersection)
      ? data.motorized_conflicts_by_intersection.length
      : 0
  );
  const blocksCount = Math.max(clampMinimumOne(data.blocks_count), blockArraysMaxLength || 1);
  const intersectionsCount = Math.max(
    clampNonNegative(data.intersections_count),
    intersectionArraysMaxLength
  );
  const relevantIntersectionsCount = Math.min(
    Array.isArray(data.intersection_road_type_by_intersection) &&
      data.intersection_road_type_by_intersection.length > 0
      ? data.intersection_road_type_by_intersection.filter((value) =>
          value === "coletora" || value === "arterial"
        ).length
      : clampNonNegative(data.relevant_intersections_count),
    intersectionsCount
  );
  const connectedIntersectionsCount = Math.min(
    Array.isArray(data.intersection_road_type_by_intersection) &&
      Array.isArray(data.intersection_has_cycling_connection_by_intersection) &&
      (data.intersection_road_type_by_intersection.length > 0 ||
        data.intersection_has_cycling_connection_by_intersection.length > 0)
      ? data.intersection_road_type_by_intersection.reduce((sum, roadType, index) => {
          if ((roadType === "coletora" || roadType === "arterial") &&
            data.intersection_has_cycling_connection_by_intersection[index] === true) {
            return sum + 1;
          }
          return sum;
        }, 0)
      : clampNonNegative(data.connected_intersections_count),
    relevantIntersectionsCount
  );

  return {
    ...data,
    blocks_count: blocksCount,
    intersections_count: intersectionsCount,
    relevant_intersections_count: relevantIntersectionsCount,
    connected_intersections_count: connectedIntersectionsCount,
  };
};

interface PendingSubmission {
  segment_id: string;
  saved_at: string;
  payload: Record<string, unknown>;
}

interface AxisRibbonProps {
  tone: "a" | "b" | "c" | "d" | "e";
  title: string;
}

const AxisRibbon: React.FC<AxisRibbonProps> = ({ tone, title }) => (
  <div className={`ideciclo-axis-ribbon ideciclo-axis-ribbon-${tone}`}>
    <h3 className="text-xl font-bold tracking-tight text-black md:text-2xl">{title}</h3>
  </div>
);

const SaveStatusSummary: React.FC<{
  incompleteCount: number;
  pinnedCount: number;
  isOnline: boolean;
}> = ({ incompleteCount, pinnedCount, isOnline }) => (
  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
    <Badge variant={incompleteCount > 0 ? "secondary" : "outline"}>
      {incompleteCount} critério{incompleteCount === 1 ? "" : "s"} pendente{incompleteCount === 1 ? "" : "s"}
    </Badge>
    <Badge variant={pinnedCount > 0 ? "secondary" : "outline"}>
      {pinnedCount} fixado{pinnedCount === 1 ? "" : "s"}
    </Badge>
    <span>
      {incompleteCount > 0
        ? `O ${isOnline ? "envio da avaliação" : "salvamento do rascunho"} pode ficar incompleto.`
        : `Pronto para ${isOnline ? "enviar a avaliação" : "guardar o rascunho"}.`}
    </span>
  </div>
);

const ANSWER_FILTER_SEQUENCE: Array<{
  value: CriterionAnswerFilter;
  label: string;
  shortLabel: string;
}> = [
    { value: "all", label: "Situação", shortLabel: "Sit." },
    { value: "answered", label: "Respondidos", shortLabel: "Resp." },
    { value: "unanswered", label: "Pendentes", shortLabel: "Pend." },
  ];

const REVIEW_FILTER_SEQUENCE: Array<{
  value: CriterionReviewFilter;
  label: string;
  shortLabel: string;
}> = [
    { value: "all", label: "Todos", shortLabel: "Todos" },
    { value: "analysis", label: "Fixados", shortLabel: "Fix." },
  ];

const CRITERION_NAV_ITEMS: Array<{
  code: CriterionCode;
  anchor: string;
}> = [
    { code: "A1", anchor: "section-a" },
    { code: "A2", anchor: "section-a" },
    { code: "B2", anchor: "criterion-b2" },
    { code: "E2", anchor: "criterion-e2" },
    { code: "D1", anchor: "criterion-d1" },
    { code: "D2", anchor: "criterion-d2" },
    { code: "B4", anchor: "criterion-b42" },
    { code: "E4", anchor: "criterion-e41" },
    { code: "B3", anchor: "criterion-b31" },
    { code: "E3", anchor: "criterion-e31" },
    { code: "B7", anchor: "criterion-b7" },
    { code: "B1", anchor: "criterion-b11" },
    { code: "B5", anchor: "criterion-b5" },
    { code: "D3", anchor: "criterion-d3" },
    { code: "B6", anchor: "criterion-b12" },
    { code: "C1", anchor: "criterion-c1" },
    { code: "E1", anchor: "criterion-e1" },
    { code: "C2", anchor: "criterion-c2" },
    { code: "C3", anchor: "criterion-c3" },
  ];

const SECTION_NAV_ITEMS = [
  { id: "section-a", label: "Caracterização", tone: "a" },
  { id: "section-pavimento", label: "Cicloviário", tone: "e" },
  { id: "section-luz", label: "Urbanidade", tone: "d" },
  { id: "section-risco", label: "Risco", tone: "b" },
  { id: "section-medicoes", label: "Medições", tone: "a" },
  { id: "section-quadras", label: "Quadras", tone: "b" },
  { id: "section-intersecoes", label: "Interseções", tone: "c" },
  { id: "section-comentarios", label: "Comentários", tone: "e" },
] as const;

const HeaderField = ({
  label,
  value,
  readOnly = false,
  type = "text",
  name,
  onChange,
}: {
  label: string;
  value: string | number;
  readOnly?: boolean;
  type?: string;
  name: keyof IdecicloFormData;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
    <input
      className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ${readOnly ? "bg-gray-100 text-muted-foreground" : "bg-background"
        }`}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      disabled={readOnly}
    />
  </div>
);

const HorizontalScrollIndicators: React.FC<{
  children: React.ReactNode;
  viewportClassName?: string;
}> = ({ children, viewportClassName }) => {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const updateIndicators = () => {
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      setCanScrollLeft(element.scrollLeft > 4);
      setCanScrollRight(maxScrollLeft - element.scrollLeft > 4);
    };

    updateIndicators();
    element.addEventListener("scroll", updateIndicators, { passive: true });

    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(updateIndicators)
      : null;
    resizeObserver?.observe(element);

    window.addEventListener("resize", updateIndicators);

    return () => {
      element.removeEventListener("scroll", updateIndicators);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateIndicators);
    };
  }, []);

  return (
    <div className="relative">
      {canScrollLeft ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-start bg-gradient-to-r from-white/95 via-white/80 to-transparent pl-1">
          <div className="rounded-full border border-slate-200 bg-white/95 p-1 shadow-sm">
            <ChevronLeft className="h-3.5 w-3.5 text-slate-500" />
          </div>
        </div>
      ) : null}
      {canScrollRight ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-10 items-center justify-end bg-gradient-to-l from-white/95 via-white/80 to-transparent pr-1">
          <div className="rounded-full border border-slate-200 bg-white/95 p-1 shadow-sm">
            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
          </div>
        </div>
      ) : null}
      <div
        ref={viewportRef}
        className={viewportClassName || "overflow-x-auto scrollbar-none"}
      >
        {children}
      </div>
    </div>
  );
};

const getPendingSubmissions = (): PendingSubmission[] => {
  try {
    const raw = localStorage.getItem(PENDING_SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Erro ao ler fila local:", error);
    return [];
  }
};

const savePendingSubmission = (segmentId: string, payload: Record<string, unknown>) => {
  const pending = getPendingSubmissions().filter(
    (item) => item.segment_id !== segmentId
  );

  pending.push({
    segment_id: segmentId,
    saved_at: new Date().toISOString(),
    payload,
  });

  localStorage.setItem(PENDING_SUBMISSIONS_KEY, JSON.stringify(pending));
};

const removePendingSubmission = (segmentId: string) => {
  const pending = getPendingSubmissions().filter(
    (item) => item.segment_id !== segmentId
  );
  localStorage.setItem(PENDING_SUBMISSIONS_KEY, JSON.stringify(pending));
};

const SegmentForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { segmentId, formId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionSegmentId = getSessionSelectedSegmentId();
  const effectiveSegmentId = segmentId || sessionSegmentId;
  const sessionCityId = getSessionSelectedCityId();
  const [isLoading, setIsLoading] = useState(false);
  const [existingFormId, setExistingFormId] = useState<string | null>(formId || null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [currentStep, setCurrentStep] = useState<1 | 2>(
    searchParams.get("step") === "review" ? 2 : 1
  );
  const [lastLocalSaveAt, setLastLocalSaveAt] = useState<string | null>(null);
  const [originalSegmentType, setOriginalSegmentType] = useState("");
  const [originalRoadHierarchy, setOriginalRoadHierarchy] = useState("");
  const [originalSegmentCounts, setOriginalSegmentCounts] = useState<{
    blocks_count: number | null;
    intersections_count: number | null;
    relevant_intersections_count: number | null;
    connected_intersections_count: number | null;
  }>({
    blocks_count: null,
    intersections_count: null,
    relevant_intersections_count: null,
    connected_intersections_count: null,
  });
  const [segmentPreview, setSegmentPreview] = useState<Segment | null>(null);
  const [allowHierarchyEdit, setAllowHierarchyEdit] = useState(false);
  const [allowBlockPagerEdit, setAllowBlockPagerEdit] = useState(false);
  const [allowIntersectionPagerEdit, setAllowIntersectionPagerEdit] = useState(false);
  const [globalCriterionFilter, setGlobalCriterionFilter] = useState<CriterionFilter>({
    answer: "all",
    review: "all",
    mode: "or",
  });
  const [accordionDisplayMode, setAccordionDisplayMode] = useState<"expanded" | "collapsed">(
    "expanded"
  );
  const [criterionDescriptionsVisible, setCriterionDescriptionsVisible] = useState(true);
  const [criterionMetaVisible, setCriterionMetaVisible] = useState(true);
  const [navigationRowsVisible, setNavigationRowsVisible] = useState(true);
  const [accordionCommand, setAccordionCommand] = useState<{
    type: "expand" | "collapse";
    nonce: number;
  } | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentIntersectionIndex, setCurrentIntersectionIndex] = useState(0);
  const [formData, setFormData] = useState<IdecicloFormData>(() =>
    createEmptyFormData(effectiveSegmentId)
  );
  const [a1BannerSticky, setA1BannerSticky] = useState(false);
  const draftKey = buildDraftKey(effectiveSegmentId || formData.segment_id || formData.id);
  const liveSummary = useMemo(() => getScoreBreakdown(formData), [formData]);
  const a1Decision = useMemo(() => getA1Decision(formData), [formData]);
  const a1DecisionSignature = useMemo(
    () => `${a1Decision.status}:${a1Decision.headline}:${a1Decision.detail}:${a1Decision.missingFields.join("|")}`,
    [a1Decision]
  );

  useEffect(() => {
    setA1BannerSticky(
      a1Decision.status === "pending" || a1Decision.status === "incompatible"
    );
  }, [a1DecisionSignature, a1Decision.status]);

  useEffect(() => {
    if (!formId && !effectiveSegmentId) {
      toast({
        title: "Selecione um trecho primeiro",
        description: "O formulário é liberado a partir da etapa de seleção do trecho.",
        variant: "destructive",
      });
      navigate("/avaliacao/escolher-estrutura", { replace: true });
    }
  }, [effectiveSegmentId, formId, navigate, toast]);

  const getWorkflowStateKey = (code: CriterionCode) => {
    const typology = String(formData.infra_typology || "").toLowerCase();

    if (code === "A1") return "a1";
    if (code === "A2") return "a2";
    if (code === "B1") return "b11";
    if (code === "B6") return "b12";
    if (code === "B2") return "b2";
    if (code === "E2") return "e2";
    if (code === "B3") return "b31";
    if (code === "E3") return "e31";
    if (code === "B4") return typology.includes("ciclorrota") ? "b43" : "b41";
    if (code === "E4") return typology.includes("ciclorrota") ? "e43" : "e42";
    if (code === "B5") return "b5";
    if (code === "B7") return "b7";
    if (code === "C1") return "c1";
    if (code === "E1") return "e1";
    if (code === "C2") return "c2";
    if (code === "C3") return "c3";
    if (code === "D1") return "d1";
    if (code === "D2") return "d2";
    if (code === "D3") return "d3";
    return "";
  };

  const cycleAnswerFilter = () => {
    setGlobalCriterionFilter((current) => {
      const currentIndex = ANSWER_FILTER_SEQUENCE.findIndex(
        (item) => item.value === current.answer
      );
      return {
        ...current,
        answer: ANSWER_FILTER_SEQUENCE[(currentIndex + 1) % ANSWER_FILTER_SEQUENCE.length].value,
      };
    });
  };

  const cycleReviewFilter = () => {
    setGlobalCriterionFilter((current) => {
      const currentIndex = REVIEW_FILTER_SEQUENCE.findIndex(
        (item) => item.value === current.review
      );
      return {
        ...current,
        review: REVIEW_FILTER_SEQUENCE[(currentIndex + 1) % REVIEW_FILTER_SEQUENCE.length].value,
      };
    });
  };

  const toggleFilterMode = () => {
    setGlobalCriterionFilter((current) => ({
      ...current,
      mode: current.mode === "or" ? "and" : "or",
    }));
  };

  const triggerAccordionCommand = (type: "expand" | "collapse") => {
    setAccordionCommand({
      type,
      nonce: Date.now(),
    });
  };

  const toggleAccordionDisplayMode = () => {
    setAccordionDisplayMode((current) => {
      const next = current === "expanded" ? "collapsed" : "expanded";
      triggerAccordionCommand(next === "expanded" ? "expand" : "collapse");
      return next;
    });
  };

  const toggleCriterionDescriptionsVisible = () => {
    setCriterionDescriptionsVisible((current) => !current);
  };

  const toggleCriterionMetaVisible = () => {
    setCriterionMetaVisible((current) => !current);
  };

  const toggleNavigationRowsVisible = () => {
    setNavigationRowsVisible((current) => !current);
  };

  const currentAnswerFilter =
    ANSWER_FILTER_SEQUENCE.find((item) => item.value === globalCriterionFilter.answer) ||
    ANSWER_FILTER_SEQUENCE[0];
  const currentReviewFilter =
    REVIEW_FILTER_SEQUENCE.find((item) => item.value === globalCriterionFilter.review) ||
    REVIEW_FILTER_SEQUENCE[0];
  const currentAnswerFilterCompactLabel =
    globalCriterionFilter.answer === "answered"
      ? "R.:"
      : globalCriterionFilter.answer === "unanswered"
        ? "P."
        : "R.:";
  const shouldShowFilterModeToggle =
    globalCriterionFilter.answer !== "all" && globalCriterionFilter.review !== "all";
  const currentFilterModeLabel = globalCriterionFilter.mode === "or" ? "OU" : "E";

  const getCriterionAnchor = (code: CriterionCode) => {
    const workflowKey = getWorkflowStateKey(code);
    if (workflowKey) return `criterion-${workflowKey}`;
    return CRITERION_NAV_ITEMS.find((item) => item.code === code)?.anchor || "section-a";
  };

  const criterionAnswered = (code: CriterionCode) => {
    const manualRating = formData.manual_ratings?.[code];
    if (manualRating) return true;

    if (code === "A1") {
      return a1Decision.status !== "pending";
    }

    const touched = formData.touched_fields || {};
    const hasTouched = (fields: string[]) => fields.some((field) => Boolean(touched[field]));
    const typology = String(formData.infra_typology || "").toLowerCase();

    if (code === "A2") {
      return (
        Array.isArray(formData.intersection_road_type_by_intersection) &&
        formData.intersection_road_type_by_intersection.some((value) => Boolean(value))
      ) || (
        Array.isArray(formData.intersection_has_cycling_connection_by_intersection) &&
        formData.intersection_has_cycling_connection_by_intersection.some((value) => value !== null)
      );
    }
    if (code === "B5") {
      return hasTouched([
        "signalized_crossings_count",
        "signalized_crossings_count_by_block",
        "traffic_lanes_count",
        "traffic_lanes_count_by_block",
      ]);
    }
    if (code === "B6") {
      const totalTrafficCalming = Object.values(formData.traffic_calming_counts || {}).reduce(
        (sum, value) => sum + Number(value || 0),
        0
      );
      return totalTrafficCalming > 0 || Boolean(formData.no_traffic_calming_measures);
    }
    if (code === "B7") {
      return Boolean(formData.no_risk_situations) ||
        Boolean(formData.bus_stop_conflict) ||
        Boolean(formData.school_conflict) ||
        Boolean(formData.horizontal_obstacles) ||
        Boolean(formData.vertical_obstacles) ||
        Boolean(formData.side_change_mid_block) ||
        Boolean(formData.opposite_flow_direction);
    }
    if (code === "B4") {
      return typology.includes("ciclorrota")
        ? hasTouched(["pictograms_per_block", "pictograms_cover_all_blocks"])
        : hasTouched([
          "regulation_signs_per_block",
          "regulation_signs_per_block_by_block",
          "signs_both_directions",
          "signs_both_directions_by_block",
          "space_identification",
        ]);
    }
    if (code === "C1") {
      return hasTouched(["intersection_signaling_by_intersection", "intersection_signaling"]);
    }
    if (code === "C2") {
      return hasTouched([
        "connection_accessibility_by_intersection",
        "connection_accessibility",
      ]);
    }
    if (code === "E1") {
      return hasTouched([
        "intersection_conservation_by_intersection",
        "intersection_conservation",
      ]);
    }
    if (code === "C3") {
      return typology.includes("ciclorrota")
        ? hasTouched([
          "traffic_lanes_per_direction_by_intersection",
          "mixed_lane_width_m_by_intersection",
          "has_intersection_traffic_calming_by_intersection",
          "traffic_lanes_per_direction",
          "mixed_lane_width_m",
          "has_intersection_traffic_calming",
        ])
        : hasTouched(["motorized_conflicts_by_intersection", "motorized_conflicts"]);
    }
    if (code === "D1") return hasTouched(["lighting_rating"]);
    if (code === "D3") {
      return hasTouched([
        "blocks_with_cycling_furniture",
        "cycling_furniture",
        "cycling_furniture_by_block",
        "cycling_furniture_counts_by_block",
        "no_cycling_furniture_by_block",
      ]);
    }

    const rating = liveSummary.resolvedRatings?.[code];
    return Boolean(rating);
  };

  const criterionPinned = (code: CriterionCode) => {
    const workflow = formData.criterion_workflow_state || {};
    const typology = String(formData.infra_typology || "").toLowerCase();

    if (code === "B4") {
      return typology.includes("ciclorrota")
        ? workflow.b43 === "analysis"
        : workflow.b41 === "analysis" || workflow.b42 === "analysis";
    }

    if (code === "E3") {
      return workflow.e31 === "analysis" || workflow.e32 === "analysis";
    }

    if (code === "E4") {
      return typology.includes("ciclorrota")
        ? workflow.e43 === "analysis"
        : workflow.e41 === "analysis" || workflow.e42 === "analysis";
    }

    if (code === "C1") {
      return workflow.c1 === "analysis" || workflow.c1e1 === "analysis";
    }

    if (code === "E1") {
      return workflow.e1 === "analysis" || workflow.c1e1 === "analysis";
    }

    return workflow[getWorkflowStateKey(code)] === "analysis";
  };

  const criterionMatchesCurrentFilters = (code: CriterionCode) => {
    const applicable = isCriterionApplicable(formData, code);
    const answered = criterionAnswered(code);
    const pinned = criterionPinned(code);

    if (!applicable) {
      return false;
    }

    const answerMatches =
      globalCriterionFilter.answer === "all" ||
      (globalCriterionFilter.answer === "answered" && answered) ||
      (globalCriterionFilter.answer === "unanswered" && (!answered || pinned));

    const reviewMatches =
      globalCriterionFilter.review === "all" ||
      (globalCriterionFilter.review === "analysis" && pinned);

    const hasAnswerFilter = globalCriterionFilter.answer !== "all";
    const hasReviewFilter = globalCriterionFilter.review !== "all";

    if (!hasAnswerFilter && !hasReviewFilter) {
      return true;
    }

    if (hasAnswerFilter && hasReviewFilter) {
      return globalCriterionFilter.mode === "and"
        ? answerMatches && reviewMatches
        : answerMatches || reviewMatches;
    }

    if (hasAnswerFilter) {
      return answerMatches;
    }

    return reviewMatches;
  };

  const applicableCriteria = CRITERION_CODES.filter((code) => isCriterionApplicable(formData, code));
  const incompleteCriteriaCount = applicableCriteria.filter((code) => !criterionAnswered(code)).length;
  const pinnedCriteriaCount = applicableCriteria.filter((code) => criterionPinned(code)).length;

  const scrollToCriterion = (code: CriterionCode) => {
    const targetId = getCriterionAnchor(code);
    const target = document.getElementById(targetId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const sectionNavItems = SECTION_NAV_ITEMS;
  const blockCount = Math.max(0, Number(formData.blocks_count || 0));
  const intersectionCount = Math.max(0, Number(formData.intersections_count || 0));
  const normalizedTypology = String(formData.infra_typology || "").toLowerCase();
  const touchedFields = useMemo(() => formData.touched_fields || {}, [formData.touched_fields]);
  const isCiclorrota = normalizedTypology.includes("ciclorrota");

  const blockCompletionStates = useMemo(
    () =>
      Array.from({ length: blockCount }, (_, index) => {
        const hasB41 =
          isCiclorrota || (
            Boolean(touchedFields[`block_b41_signs_${index}`]) &&
            Boolean(touchedFields[`block_b41_directions_${index}`])
          );
        const hasE41 =
          isCiclorrota || Boolean(touchedFields[`block_e41_${index}`]);
        const hasB5 =
          Boolean(touchedFields[`block_b5_crossings_${index}`]) &&
          Boolean(touchedFields[`block_b5_lanes_${index}`]);
        const hasD3 = Boolean(touchedFields[`block_d3_${index}`]);

        return hasB41 && hasE41 && hasB5 && hasD3;
      }),
    [blockCount, isCiclorrota, touchedFields]
  );

  const intersectionCompletionStates = useMemo(
    () =>
      Array.from({ length: intersectionCount }, (_, index) => {
        const hasA2 =
          Boolean(formData.intersection_road_type_by_intersection?.[index]) &&
          formData.intersection_has_cycling_connection_by_intersection?.[index] !== null &&
          formData.intersection_has_cycling_connection_by_intersection?.[index] !== undefined;
        const hasC1 = isCiclorrota || Boolean(touchedFields[`intersection_c1_${index}`]);
        const hasE1 =
          isCiclorrota ||
          Boolean(formData.intersection_conservation_by_intersection?.[index]);
        const hasC2 = Boolean(touchedFields[`intersection_c2_${index}`]);
        const hasC3 = isCiclorrota
          ? Boolean(touchedFields[`intersection_c3_lanes_${index}`]) &&
            Boolean(touchedFields[`intersection_c3_width_${index}`]) &&
            Boolean(touchedFields[`intersection_c3_calming_${index}`])
          : Boolean(touchedFields[`intersection_c3_${index}`]);

        return hasA2 && hasC1 && hasE1 && hasC2 && hasC3;
      }),
    [
      formData.intersection_conservation_by_intersection,
      formData.intersection_has_cycling_connection_by_intersection,
      formData.intersection_road_type_by_intersection,
      intersectionCount,
      isCiclorrota,
      touchedFields,
    ]
  );

  const getIndexedPagerClassName = (isActive: boolean, isComplete: boolean) => {
    const baseClassName = isComplete
      ? isActive
        ? "border-emerald-700 bg-emerald-700 text-white"
        : "border-emerald-200 bg-emerald-50/85 text-emerald-800 hover:bg-emerald-100"
      : isActive
        ? "border-rose-600 bg-rose-600 text-white"
        : "border-rose-200 bg-rose-50/85 text-rose-800 hover:bg-rose-100";

    return `${baseClassName} ${isActive ? "ring-2 ring-slate-900 ring-offset-1" : ""}`;
  };

  const getCriterionNavClassName = (
    code: CriterionCode,
    applicable: boolean,
    inAnalysis: boolean,
    answered: boolean,
    rating: string | null | undefined
  ) => {
    if (!applicable) return "border-slate-200 bg-slate-100 text-slate-400 opacity-45";
    if (inAnalysis) return "border-amber-300 bg-amber-100 text-amber-950 ring-2 ring-amber-300";
    if (code === "A1" && a1Decision.status === "pending") {
      return "border-amber-300 bg-amber-100 text-amber-950";
    }
    if (!answered) return "border-rose-600 bg-rose-600 text-white";
    if (rating === "A") return "border-transparent bg-[#b8e5db] text-[#163b38]";
    if (rating === "B") return "border-transparent bg-[#9fd3cb] text-[#163b38]";
    if (rating === "C") return "border-transparent bg-[#8fafad] text-[#163b38]";
    if (rating === "D") return "border-transparent bg-[#748987] text-white";
    return "border-emerald-700 bg-emerald-700 text-white";
  };

  useEffect(() => {
    setCurrentBlockIndex((prev) => Math.min(prev, Math.max(blockCount - 1, 0)));
  }, [blockCount]);

  useEffect(() => {
    setCurrentIntersectionIndex((prev) => Math.min(prev, Math.max(intersectionCount - 1, 0)));
  }, [intersectionCount]);

  const handleBlockCountChange = (delta: number) => {
    const nextCount = Math.max(1, blockCount + delta);
    if (nextCount === blockCount) return;

    const trimArray = <T,>(values: T[] | undefined, fallback: T) =>
      Array.from({ length: nextCount }, (_, index) =>
        Array.isArray(values) && index < values.length ? (values[index] ?? fallback) : fallback
      );

    handleDataChange({
      blocks_count: nextCount,
      regulation_signs_per_block_by_block: trimArray(formData.regulation_signs_per_block_by_block, 0),
      signs_both_directions_by_block: trimArray(formData.signs_both_directions_by_block, null),
      vertical_signs_conservation_by_block: trimArray(formData.vertical_signs_conservation_by_block, ""),
      traffic_lanes_count_by_block: trimArray(formData.traffic_lanes_count_by_block, 0),
      signalized_crossings_count_by_block: trimArray(formData.signalized_crossings_count_by_block, 0),
      cycling_furniture_by_block: trimArray(formData.cycling_furniture_by_block, []),
      cycling_furniture_counts_by_block: trimArray(formData.cycling_furniture_counts_by_block, {}),
      no_cycling_furniture_by_block: trimArray(formData.no_cycling_furniture_by_block, false),
      touched_fields: Object.fromEntries(
        [
          "block_b41_signs",
          "block_b41_directions",
          "block_e41",
          "block_b5_crossings",
          "block_b5_lanes",
          "block_d3",
        ].flatMap((key) =>
          Array.from({ length: Math.max(blockCount, nextCount) }, (_, index) => [
            `${key}_${index}`,
            index < nextCount ? touchedFields[`${key}_${index}`] ?? false : false,
          ])
        )
      ),
    });
    setCurrentBlockIndex((prev) => Math.min(prev, nextCount - 1));
  };

  const handleIntersectionCountChange = (delta: number) => {
    const nextCount = Math.max(0, intersectionCount + delta);
    if (nextCount === intersectionCount) return;

    const trimArray = <T,>(values: T[] | undefined, fallback: T) =>
      Array.from({ length: nextCount }, (_, index) =>
        Array.isArray(values) && index < values.length ? (values[index] ?? fallback) : fallback
      );
    const trimMatrix = <T,>(values: T[][] | undefined, fallback: T[]) =>
      Array.from({ length: nextCount }, (_, index) =>
        Array.isArray(values) && index < values.length ? (values[index] ?? fallback) : fallback
      );

    handleDataChange({
      intersections_count: nextCount,
      intersection_road_type_by_intersection: trimArray(
        formData.intersection_road_type_by_intersection,
        ""
      ),
      intersection_has_cycling_connection_by_intersection: trimArray(
        formData.intersection_has_cycling_connection_by_intersection,
        null
      ),
      intersection_name_by_intersection: trimArray(
        formData.intersection_name_by_intersection,
        ""
      ),
      intersection_highway_by_intersection: trimArray(
        formData.intersection_highway_by_intersection,
        ""
      ),
      intersection_hierarchy_osm_by_intersection: trimArray(
        formData.intersection_hierarchy_osm_by_intersection,
        ""
      ),
      intersection_hierarchy_ideciclo_by_intersection: trimArray(
        formData.intersection_hierarchy_ideciclo_by_intersection,
        ""
      ),
      intersection_signaling_by_intersection: trimArray(formData.intersection_signaling_by_intersection, ""),
      intersection_conservation_by_intersection: trimArray(
        formData.intersection_conservation_by_intersection,
        ""
      ),
      connection_accessibility_by_intersection: trimArray(
        formData.connection_accessibility_by_intersection,
        ""
      ),
      traffic_lanes_per_direction_by_intersection: trimArray(
        formData.traffic_lanes_per_direction_by_intersection,
        1
      ),
      mixed_lane_width_m_by_intersection: trimArray(formData.mixed_lane_width_m_by_intersection, 2.7),
      has_intersection_traffic_calming_by_intersection: trimArray(
        formData.has_intersection_traffic_calming_by_intersection,
        false
      ),
      motorized_conflicts_by_intersection: trimMatrix(formData.motorized_conflicts_by_intersection, []),
      touched_fields: Object.fromEntries(
        [
          "intersection_a2_type",
          "intersection_a2_connection",
          "intersection_c1",
          "intersection_c2",
          "intersection_c3",
          "intersection_c3_lanes",
          "intersection_c3_width",
          "intersection_c3_calming",
        ].flatMap((key) =>
          Array.from({ length: Math.max(intersectionCount, nextCount) }, (_, index) => [
            `${key}_${index}`,
            index < nextCount ? touchedFields[`${key}_${index}`] ?? false : false,
          ])
        )
      ),
    });
    setCurrentIntersectionIndex((prev) => Math.min(prev, Math.max(nextCount - 1, 0)));
  };

  const blockPager: CriterionPagerConfig = {
    count: blockCount,
    currentIndex: currentBlockIndex,
    prefix: "Q",
    onSelect: setCurrentBlockIndex,
    label: "Quadra em edição",
    onAdd: () => handleBlockCountChange(1),
    onRemove: () => handleBlockCountChange(-1),
    canRemove: blockCount > 1,
  };

  const intersectionPager: CriterionPagerConfig = {
    count: intersectionCount,
    currentIndex: currentIntersectionIndex,
    prefix: "I",
    onSelect: setCurrentIntersectionIndex,
    label: "Interseção em edição",
    onAdd: () => handleIntersectionCountChange(1),
    onRemove: () => handleIntersectionCountChange(-1),
    canRemove: intersectionCount > 0,
  };

  useEffect(() => {
    const loadOriginalSegmentContext = async () => {
      const currentSegmentId = effectiveSegmentId || formData.segment_id || formData.id;
      if (!currentSegmentId) return;

      const segmentData = await fetchSegmentContextById(currentSegmentId);
      setSegmentPreview(toSegmentPreview(segmentData));
      setOriginalSegmentType(segmentData?.type || "");
      setOriginalRoadHierarchy(segmentData?.classification || "");
      setOriginalSegmentCounts({
        blocks_count:
          typeof segmentData?.blocks_count === "number" ? segmentData.blocks_count : null,
        intersections_count:
          typeof segmentData?.intersections_count === "number"
            ? segmentData.intersections_count
            : null,
        relevant_intersections_count:
          typeof segmentData?.relevant_intersections_count === "number"
            ? segmentData.relevant_intersections_count
            : null,
        connected_intersections_count:
          typeof segmentData?.connected_intersections_count === "number"
            ? segmentData.connected_intersections_count
            : null,
      });
    };

    loadOriginalSegmentContext();
  }, [effectiveSegmentId, formData.id, formData.segment_id]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        let nextFormData = createEmptyFormData(effectiveSegmentId);

        if (formId) {
          const dbForm = await fetchFormById(formId);
          if (!dbForm) throw new Error("Formulário não encontrado");

          setExistingFormId(formId);
          nextFormData = mergeWithDefaults(dbForm.segment_id || effectiveSegmentId, {
            ...dbForm.responses,
            id: dbForm.segment_id || effectiveSegmentId,
            segment_id: dbForm.segment_id || effectiveSegmentId,
            city_id: dbForm.city_id || sessionCityId || "",
          });
          nextFormData = await hydrateHeaderFields(
            dbForm.segment_id || effectiveSegmentId,
            nextFormData
          );
          const segmentData = await fetchSegmentContextById(
            dbForm.segment_id || effectiveSegmentId
          );
          nextFormData = applyOsmPrefillToFormData(nextFormData, segmentData);
        } else if (effectiveSegmentId) {
          const existingForm = await getFormBySegmentId(effectiveSegmentId);

          if (existingForm) {
            setExistingFormId(existingForm.id);
            nextFormData = mergeWithDefaults(effectiveSegmentId, {
              ...existingForm.responses,
              id: effectiveSegmentId,
              segment_id: effectiveSegmentId,
              city_id: existingForm.city_id || sessionCityId || "",
            });
            nextFormData = await hydrateHeaderFields(effectiveSegmentId, nextFormData);
            const segmentData = await fetchSegmentContextById(effectiveSegmentId);
            nextFormData = applyOsmPrefillToFormData(nextFormData, segmentData);
          } else {
            const segmentData = await fetchSegmentContextById(effectiveSegmentId);
            if (!segmentData) throw new Error("Trecho não encontrado");

            let cityName = "";
            const resolvedCityId = segmentData.id_cidade || sessionCityId || "";
            if (resolvedCityId) {
              const cityData = await fetchCityFromDB(resolvedCityId);
              cityName = cityData?.name || "";
            }

            nextFormData = mergeWithDefaults(effectiveSegmentId, {
              id: effectiveSegmentId,
              segment_id: effectiveSegmentId,
              segment_name: segmentData.name || "",
              infra_typology: segmentData.type || "",
              city: cityName,
              city_id: resolvedCityId,
              extension_m: segmentData.length || 0,
              neighborhood: segmentData.neighborhood || "",
              road_hierarchy: segmentData.classification || "",
              classification: segmentData.classification || undefined,
              blocks_count:
                typeof segmentData.blocks_count === "number" ? segmentData.blocks_count : 1,
              intersections_count:
                typeof segmentData.intersections_count === "number"
                  ? segmentData.intersections_count
                  : 0,
              relevant_intersections_count:
                typeof segmentData.relevant_intersections_count === "number"
                  ? segmentData.relevant_intersections_count
                  : 0,
              connected_intersections_count:
                typeof segmentData.connected_intersections_count === "number"
                  ? segmentData.connected_intersections_count
                  : 0,
            });
            nextFormData = applyOsmPrefillToFormData(nextFormData, segmentData);
          }
        }

        try {
          const rawDraft = localStorage.getItem(draftKey);
          if (rawDraft) {
            const draft = JSON.parse(rawDraft);
            nextFormData = mergeWithDefaults(effectiveSegmentId, draft.data);
            setLastLocalSaveAt(draft.savedAt || null);
          }
        } catch (draftError) {
          console.error("Erro ao recuperar rascunho local:", draftError);
        }

        const segmentForFinalPrefill = await fetchSegmentContextById(
          effectiveSegmentId || nextFormData.segment_id || nextFormData.id
        );
        nextFormData = applyOsmPrefillToFormData(nextFormData, segmentForFinalPrefill);
        nextFormData = syncSegmentA1ToFormData(nextFormData, segmentForFinalPrefill);

        setFormData(normalizeEvaluationCounts(nextFormData));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do formulário.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [draftKey, effectiveSegmentId, formId, sessionCityId, toast]);

  useEffect(() => {
    if (isLoading) return;

    const timer = window.setTimeout(() => {
      try {
        const payload = {
          savedAt: new Date().toISOString(),
          data: formData,
        };

        localStorage.setItem(draftKey, JSON.stringify(payload));
        setLastLocalSaveAt(payload.savedAt);
      } catch (error) {
        console.error("Erro ao salvar rascunho local:", error);
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [draftKey, formData, isLoading]);

  const handleDataChange = (newData: Partial<IdecicloFormData>) => {
    setFormData((prevData) => {
      const incomingTouched = newData.touched_fields || {};
      const { touched_fields, ...rest } = newData;
      const autoTouched = Object.keys(rest).reduce<Record<string, boolean>>((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});

      return normalizeEvaluationCounts({
        ...prevData,
        ...rest,
        touched_fields: {
          ...(prevData.touched_fields || {}),
          ...autoTouched,
          ...incomingTouched,
        },
      });
    });
  };

  const handleHeaderInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    handleDataChange({ [name]: processedValue } as Partial<IdecicloFormData>);
  };

  const handleHierarchyEditToggle = (checked: boolean) => {
    setAllowHierarchyEdit(checked);

    if (!checked) {
      handleDataChange({
        road_hierarchy: originalRoadHierarchy,
        classification: originalRoadHierarchy || undefined,
      });
    }
  };

  const handleHierarchySelection = (value: string) => {
    handleDataChange({
      road_hierarchy: value,
      classification: value,
    });
  };

  const handleSubmit = async () => {
    const currentSegmentId = effectiveSegmentId || formData.segment_id || formData.id;
    const cityId = formData.city_id || sessionCityId;

    if (!cityId) {
      toast({
        title: "Cidade ausente",
        description: "Não foi possível identificar a cidade deste trecho.",
        variant: "destructive",
      });
      return;
    }

    if (!currentSegmentId) {
      toast({
        title: "Trecho ausente",
        description: "Não foi possível identificar o trecho avaliado.",
        variant: "destructive",
      });
      return;
    }

    const resolvedSegment = await getSegmentByIdForForm(currentSegmentId, cityId);
    const persistedSegmentId = resolvedSegment?.dbId || currentSegmentId;

    const enrichedResponses = {
      ...formData,
      city_id: cityId,
      segment_id: persistedSegmentId,
      score_breakdown: liveSummary,
      criterion_ratings: liveSummary.resolvedRatings,
      auto_ratings: liveSummary.autoRatings,
      total_score: liveSummary.total,
      saved_offline: !isOnline,
      last_local_save_at: lastLocalSaveAt,
      osm_prefill_snapshot: segmentPreview?.ideciclo_prefill || null,
      osm_field_differences: buildOsmFieldDifferences(formData, segmentPreview),
    };

    const formToSave = {
      segment_id: persistedSegmentId,
      city_id: cityId,
      researcher: formData.researcher || "",
      date: formData.date || null,
      street_name: formData.segment_name || null,
      neighborhood: formData.neighborhood || null,
      extension: formData.extension_m || null,
      start_point: formData.start_point || null,
      end_point: formData.end_point || null,
      hierarchy: formData.road_hierarchy || null,
      velocity: formData.velocity_kmh || null,
      blocks_count: formData.blocks_count || null,
      intersections_count: formData.intersections_count || null,
      observations: formData.observations || null,
      responses: enrichedResponses,
    };

    if (!isOnline) {
      savePendingSubmission(currentSegmentId, formToSave);
      toast({
        title: "Rascunho salvo offline",
        description:
          "Você está sem conexão. O formulário ficou guardado no aparelho para envio posterior.",
      });
      return;
    }

    try {
      let result;
      const isUpdating = Boolean(existingFormId);

      if (isUpdating && existingFormId) {
        result = await updateFormInDB(existingFormId, formToSave);
      } else {
        const generatedFormId = `form-${currentSegmentId}-${Date.now()}`;
        result = await createFormInDB({ ...formToSave, id: generatedFormId });

        if (result) {
          await updateSegmentEvaluationStatus(persistedSegmentId, generatedFormId);
          setExistingFormId(generatedFormId);
        }
      }

      if (!result) {
        throw new Error("Não foi possível persistir os dados no banco.");
      }

      await updateSegmentInDB({
        id: persistedSegmentId,
        id_cidade: cityId,
        type: mapFormTypologyToSegmentType(formData.infra_typology),
        classification: formData.road_hierarchy || undefined,
        ideciclo_prefill: {
          ...(segmentPreview?.ideciclo_prefill || {}),
          tipologia: formData.infra_typology || undefined,
          hierarquia: formData.road_hierarchy || undefined,
          velocidade: formData.velocity_kmh > 0 ? String(formData.velocity_kmh) : undefined,
          sentido: formData.infra_flow || undefined,
          posicaoNaVia: formData.position_on_road || undefined,
        },
      });

      localStorage.removeItem(draftKey);
      removePendingSubmission(currentSegmentId);

      toast({
        title: existingFormId ? "Avaliação atualizada" : "Avaliação salva",
        description: `Nota calculada: ${liveSummary.total.toFixed(1)}/100.`,
      });

      navigate("/avaliacao");
    } catch (error) {
      console.error("Error saving form:", error);
      savePendingSubmission(currentSegmentId, formToSave);
      const description =
        error instanceof Error && error.message
          ? error.message
          : "Guardei o conteúdo como rascunho local para você tentar de novo quando a conexão estabilizar.";
      toast({
        title: "Falha no envio online",
        description,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {formData.segment_name || "Não informado"} ({formData.city || "Não informada"})
          </h2>
          <p className="text-muted-foreground">
            Formulario hibrido do IDECICLO em duas telas: coleta em campo e revisao final com
            override manual e rascunho offline.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/avaliacao")}>
          Voltar
        </Button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Estado</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="flex items-center gap-2 font-medium">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-emerald-600" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-amber-600" />
                  <span>Offline</span>
                </>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              O preenchimento segue funcionando e fica salvo localmente.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pontuação Atual</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold">{liveSummary.total.toFixed(1)}/100</div>
            <p className="mt-2 text-sm text-muted-foreground">
              {liveSummary.eliminated
                ? "Estrutura eliminada pela regra A1."
                : "Atualizada conforme os parâmetros e overrides manuais."}
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rascunho Local</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <Badge variant="outline">
              {lastLocalSaveAt
                ? `Último autosave: ${new Date(lastLocalSaveAt).toLocaleString("pt-BR")}`
                : "Ainda sem autosave"}
            </Badge>
            <p className="mt-2 text-sm text-muted-foreground">
              O rascunho fica preso a este trecho e a este aparelho.
            </p>
          </div>
        </Card>
      </div>

      <div
        className={
          a1BannerSticky
            ? "mb-6 md:sticky md:top-4 md:z-40"
            : "mb-6"
        }
      >
        <Alert
          className={`border pr-12 ${
            a1Decision.status === "incompatible"
              ? "border-rose-300 bg-rose-50 text-rose-950"
              : a1Decision.status === "compatible"
                ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                : "border-amber-300 bg-amber-50 text-amber-950"
          }`}
        >
          {a1Decision.status === "compatible" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {(a1Decision.status === "pending" || a1Decision.status === "incompatible") && a1BannerSticky ? (
            <button
              type="button"
              onClick={() => setA1BannerSticky(false)}
              className="absolute right-3 top-3 rounded-full border border-current/20 p-1 opacity-70 transition hover:opacity-100"
              title="Desfixar aviso"
              aria-label="Desfixar aviso"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <AlertTitle>{a1Decision.headline}</AlertTitle>
          <AlertDescription>
            {a1Decision.detail}
            {a1Decision.missingFields.length > 0
              ? ` Campos a verificar: ${a1Decision.missingFields.map(getA1FieldLabel).join(", ")}.`
              : ""}
            {a1Decision.status === "incompatible"
              ? " Você pode continuar a coleta, mas este trecho não será compatibilizado no IDECICLO."
              : ""}
          </AlertDescription>
        </Alert>
      </div>

      <Card className="mb-6 overflow-hidden">
        <CardHeader>
          <CardTitle>Mapa do Trecho Avaliado</CardTitle>
          <CardDescription>
            Visualizacao do segmento selecionado para apoio ao preenchimento em campo.
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          {segmentPreview ? (
            <SegmentPreviewMap
              segment={segmentPreview}
              className="h-[340px] overflow-hidden rounded-[24px] border"
            />
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-[24px] border border-dashed text-center text-muted-foreground">
              Mapa indisponivel para este trecho.
            </div>
          )}
        </div>
      </Card>

      <Card className="mb-6">
        <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Navegação do formulário</div>
            <div className="mt-1 text-lg font-semibold">
              {currentStep === 1 ? "Página 1 de 2 · Coleta em Campo" : "Página 2 de 2 · Revisão Final"}
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={currentStep === 1 ? "default" : "outline"}
                onClick={() => setCurrentStep(1)}
              >
                Coleta
              </Button>
              <Button
                type="button"
                variant={currentStep === 2 ? "default" : "outline"}
                onClick={() => setCurrentStep(2)}
              >
                Revisão Final
              </Button>
              <Button onClick={handleSubmit} variant="outline">
                <Save className="mr-2 h-4 w-4" />
                {isOnline ? "Enviar Avaliação" : "Guardar Rascunho Offline"}
              </Button>
            </div>
            <SaveStatusSummary
              incompleteCount={incompleteCriteriaCount}
              pinnedCount={pinnedCriteriaCount}
              isOnline={isOnline}
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="mb-6 p-6 text-center">
          <p>Carregando dados do segmento...</p>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Cabeçalho da Avaliação</CardTitle>
              <CardDescription>
                Identificacao do trecho e dados gerais antes dos blocos do formulario em papel.
              </CardDescription>
            </CardHeader>
            <div className="grid grid-cols-1 gap-4 px-6 pb-6 md:grid-cols-2 lg:grid-cols-3">
              <HeaderField
                label="Pesquisador(a):"
                name="researcher"
                value={formData.researcher || ""}
                onChange={handleHeaderInputChange}
              />
              <HeaderField
                label="Data:"
                name="date"
                type="date"
                value={formData.date || ""}
                onChange={handleHeaderInputChange}
              />
              <HeaderField
                label="Cidade:"
                name="city"
                value={formData.city || ""}
                readOnly
              />
              <HeaderField
                label="Bairro:"
                name="neighborhood"
                value={formData.neighborhood || ""}
                onChange={handleHeaderInputChange}
              />
              <HeaderField
                label="ID:"
                name="id"
                value={formData.id || ""}
                readOnly
              />
              <HeaderField
                label="Nome Trecho:"
                name="segment_name"
                value={formData.segment_name || ""}
                readOnly
              />
              <HeaderField
                label="Extensão (m):"
                name="extension_m"
                type="number"
                value={formData.extension_m || ""}
                readOnly
              />
              <HeaderField
                label="Início do trecho:"
                name="start_point"
                value={formData.start_point || ""}
                onChange={handleHeaderInputChange}
              />
              <HeaderField
                label="Fim do trecho:"
                name="end_point"
                value={formData.end_point || ""}
                onChange={handleHeaderInputChange}
              />
            </div>
          </Card>

          {currentStep === 1 ? (
            <CriteriaAccordionContext.Provider
              value={{
                filter: globalCriterionFilter,
                descriptionsVisible: criterionDescriptionsVisible,
                criterionMetaVisible,
              }}
            >
              <div className="space-y-10 pb-28">
                <section id="section-a" className="space-y-6">
                  <AxisRibbon tone="a" title="Caracterizacao do Trecho e Enquadramento Inicial" />
                  <CriteriaAccordionGroup
                    allValues={["a1"]}
                    defaultOpenValues={["a1"]}
                    filter={globalCriterionFilter}
                    command={accordionCommand}
                  >
                    <AssessmentCriterionAccordion
                      value="a1"
                      title="A.1. Adequação da tipologia de tratamento em relação à velocidade da via e sua respectiva hierarquia"
                      description={a1Decision.detail}
                      scorePreview={buildCriterionScorePreview(formData, ["A1"])}
                      answered={a1Decision.status !== "pending"}
                      inAnalysis={formData.criterion_workflow_state?.a1 === "analysis"}
                      onAnalysisChange={(value) =>
                        handleDataChange({
                          criterion_workflow_state: {
                            ...(formData.criterion_workflow_state || {}),
                            a1: value ? "analysis" : "default",
                          },
                        })
                      }
                      onClear={() => {
                        setAllowHierarchyEdit(false);
                        handleDataChange({
                          road_hierarchy: originalRoadHierarchy || "",
                          classification: originalRoadHierarchy || undefined,
                          infra_typology: originalSegmentType || "",
                          infra_flow: "unidirectional",
                          position_on_road: "pista_calcada",
                          velocity_kmh: 0,
                          regulated_speed_choices: [],
                          pedestrian_flow_per_hour_per_meter: 0,
                          touched_fields: {
                            infra_typology: false,
                            infra_flow: false,
                            position_on_road: false,
                            velocity_kmh: false,
                            regulated_speed_choices: false,
                            road_hierarchy: false,
                            pedestrian_flow_per_hour_per_meter: false,
                          },
                        });
                      }}
                      helpKey="A1"
                    >
                      <DesignQualityStep
                        data={formData}
                        onDataChange={handleDataChange}
                        segmentType={originalSegmentType}
                        originalRoadHierarchy={originalRoadHierarchy}
                        originalInfraFlow={mapDirectionPrefillToInfraFlow(
                          segmentPreview?.ideciclo_prefill?.sentido
                        )}
                        originalPositionOnRoad={mapPositionPrefillToForm(
                          segmentPreview?.ideciclo_prefill?.posicaoNaVia
                        )}
                        originalVelocityKmh={
                          segmentPreview?.ideciclo_prefill?.velocidade
                            ? Number(segmentPreview.ideciclo_prefill.velocidade)
                            : undefined
                        }
                        allowHierarchyEdit={allowHierarchyEdit}
                        onHierarchyEditToggle={handleHierarchyEditToggle}
                        onHierarchySelection={handleHierarchySelection}
                      />
                    </AssessmentCriterionAccordion>
                  </CriteriaAccordionGroup>
                </section>

                <section id="section-pavimento" className="space-y-6">
                  <AxisRibbon tone="e" title="Pavimento, Identificacao e Separacao do Cicloviario" />
                  <PavementStep
                    data={formData}
                    onDataChange={handleDataChange}
                    originalPavementType={mapOsmSurfaceToPavementType(
                      segmentPreview?.osm_tags?.surface,
                      segmentPreview?.ideciclo_prefill?.pavimento
                    )}
                    originalPavementSource={
                      segmentPreview?.osm_tags?.surface || segmentPreview?.ideciclo_prefill?.pavimento
                    }
                    filter={globalCriterionFilter}
                    command={accordionCommand}
                  />
                  <SignageStep
                    data={formData}
                    onDataChange={handleDataChange}
                    filter={globalCriterionFilter}
                    command={accordionCommand}
                    visibleValues={["b42", "e42"]}
                  />
                  <DelimitationStep
                    data={formData}
                    onDataChange={handleDataChange}
                    filter={globalCriterionFilter}
                    command={accordionCommand}
                  />
                </section>

                <section id="section-luz" className="space-y-6">
                  <AxisRibbon tone="d" title="Iluminacao e conforto termico" />
                  <UrbanityStep
                    data={formData}
                    onDataChange={handleDataChange}
                    filter={globalCriterionFilter}
                    command={accordionCommand}
                    visibleValues={["d1", "d2"]}
                  />
                </section>

                <section id="section-risco" className="space-y-6">
                  <AxisRibbon tone="b" title="Situacoes de risco" />
                  <SafetyAndComfortStep
                    data={formData}
                    onDataChange={handleDataChange}
                    filter={globalCriterionFilter}
                    command={accordionCommand}
                    visibleValues={["b7"]}
                  />
                </section>

                <section id="section-medicoes" className="space-y-6">
                  <AxisRibbon tone="a" title="Medicoes da estrutura" />
                  <TrafficConflictsStep
                    data={formData}
                    onDataChange={handleDataChange}
                    filter={globalCriterionFilter}
                    command={accordionCommand}
                    blockPager={blockPager}
                    visibleValues={
                      String(formData.infra_typology || "").toLowerCase().includes("ciclorrota")
                        ? ["b12"]
                        : String(formData.infra_typology || "").toLowerCase().includes("compart") ||
                          String(formData.infra_typology || "").toLowerCase().includes("calçada")
                          ? ["b11"]
                          : ["b11", "b32"]
                    }
                  />
                </section>

                <section id="section-quadras" className="space-y-6">
                  <AxisRibbon tone="e" title="Avaliacao das quadras" />
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Editar quadras</div>
                      <p className="text-xs text-slate-500">
                        Ative para adicionar ou remover quadras pelo navegador.
                      </p>
                    </div>
                    <Switch
                      checked={allowBlockPagerEdit}
                      onCheckedChange={setAllowBlockPagerEdit}
                    />
                  </div>
                  <div className="sticky top-24 z-20 -mx-1 px-1">
                      <div className="rounded-[24px] border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          {criterionDescriptionsVisible ? (
                            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                              Quadra em edição
                            </div>
                          ) : <div />}
                          <div />
                        </div>
                        <HorizontalScrollIndicators viewportClassName="overflow-x-auto">
                          <div className="flex min-w-max items-center gap-2">
                            {Array.from({ length: blockCount }, (_, index) => {
                              const isActive = index === currentBlockIndex;
                              const isComplete = blockCompletionStates[index] ?? false;

                              return (
                                <React.Fragment key={`section-quadras-q-${index + 1}`}>
                                  {allowBlockPagerEdit && isActive ? (
                                    <button
                                      type="button"
                                      onClick={() => handleBlockCountChange(-1)}
                                      disabled={blockCount <= 1}
                                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      −
                                    </button>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => setCurrentBlockIndex(index)}
                                    className={`flex h-9 min-w-[38px] items-center justify-center rounded-full border px-2.5 text-[11px] font-semibold transition sm:h-10 sm:min-w-[42px] sm:px-3 sm:text-xs ${getIndexedPagerClassName(
                                      isActive,
                                      isComplete
                                    )}`}
                                  >
                                    Q{index + 1}
                                  </button>
                                  {allowBlockPagerEdit && isActive ? (
                                    <button
                                      type="button"
                                      onClick={() => handleBlockCountChange(1)}
                                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                      +
                                    </button>
                                  ) : null}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </HorizontalScrollIndicators>
                      </div>
                    </div>
                  <SignageStep
                    data={formData}
                    onDataChange={handleDataChange}
                    filter={globalCriterionFilter}
                    command={accordionCommand}
                    blockPager={blockPager}
                    hideBlockPager
                    visibleValues={String(formData.infra_typology || "").toLowerCase().includes("ciclorrota") ? ["b43", "e43"] : ["b41", "e41"]}
                  />
                  <SafetyAndComfortStep
                    data={formData}
                    onDataChange={handleDataChange}
                    filter={globalCriterionFilter}
                    command={accordionCommand}
                    blockPager={blockPager}
                    hideBlockPager
                    currentIntersectionIndex={currentIntersectionIndex}
                    visibleValues={["b5"]}
                  />
                  <UrbanityStep
                    data={formData}
                    onDataChange={handleDataChange}
                    filter={globalCriterionFilter}
                    command={accordionCommand}
                    blockPager={blockPager}
                    hideBlockPager
                    visibleValues={["d3"]}
                  />
                </section>

                <section id="section-intersecoes" className="space-y-6">
                  <AxisRibbon tone="c" title="Avaliacao das intersecoes" />
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Editar interseções</div>
                      <p className="text-xs text-slate-500">
                        Ative para adicionar ou remover interseções pelo navegador.
                      </p>
                    </div>
                    <Switch
                      checked={allowIntersectionPagerEdit}
                      onCheckedChange={setAllowIntersectionPagerEdit}
                    />
                  </div>
                  <div className="sticky top-24 z-20 -mx-1 px-1">
                      <div className="rounded-[24px] border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          {criterionDescriptionsVisible ? (
                            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                              Interseção em edição
                            </div>
                          ) : <div />}
                          <div />
                        </div>
                        <HorizontalScrollIndicators viewportClassName="overflow-x-auto">
                          <div className="flex min-w-max items-center gap-2">
                            {allowIntersectionPagerEdit && intersectionCount === 0 ? (
                              <button
                                type="button"
                                onClick={() => handleIntersectionCountChange(1)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                title="Adicionar interseção"
                              >
                                +
                              </button>
                            ) : null}
                            {Array.from({ length: intersectionCount }, (_, index) => {
                              const isActive = index === currentIntersectionIndex;
                              const isComplete = intersectionCompletionStates[index] ?? false;

                              return (
                                <React.Fragment key={`section-intersecoes-i-${index + 1}`}>
                                  {allowIntersectionPagerEdit && isActive ? (
                                    <button
                                      type="button"
                                      onClick={() => handleIntersectionCountChange(-1)}
                                      disabled={intersectionCount <= 0}
                                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      −
                                    </button>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => setCurrentIntersectionIndex(index)}
                                    className={`flex h-9 min-w-[38px] items-center justify-center rounded-full border px-2.5 text-[11px] font-semibold transition sm:h-10 sm:min-w-[42px] sm:px-3 sm:text-xs ${getIndexedPagerClassName(
                                      isActive,
                                      isComplete
                                    )}`}
                                  >
                                    I{index + 1}
                                  </button>
                                  {allowIntersectionPagerEdit && isActive ? (
                                    <button
                                      type="button"
                                      onClick={() => handleIntersectionCountChange(1)}
                                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                      +
                                    </button>
                                  ) : null}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </HorizontalScrollIndicators>
                      </div>
                    </div>
                  <SafetyAndComfortStep
                    data={formData}
                    onDataChange={handleDataChange}
                    filter={globalCriterionFilter}
                    command={accordionCommand}
                    intersectionPager={intersectionPager}
                    hideIntersectionPager
                    currentIntersectionIndex={currentIntersectionIndex}
                    visibleValues={["a2", "c1", "e1", "c2", "c3"]}
                  />
                </section>

                <section id="section-comentarios" className="space-y-4">
                  <AxisRibbon tone="e" title="Comentarios" />
                  <Card>
                    <CardHeader>
                      <CardTitle>Observacoes de campo</CardTitle>
                      <CardDescription>
                        Registre contexto, justificativas, ressalvas ou qualquer detalhe importante da avaliacao.
                      </CardDescription>
                    </CardHeader>
                    <div className="px-6 pb-6">
                      <Textarea
                        value={formData.observations || ""}
                        onChange={(event) =>
                          handleDataChange({
                            observations: event.target.value,
                            touched_fields: { observations: event.target.value.trim().length > 0 },
                          })
                        }
                        placeholder="Ex.: interferencias temporarias, duvidas de classificacao, condicoes do trecho no momento da visita..."
                        className="min-h-[140px]"
                      />
                    </div>
                  </Card>
                </section>

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setCurrentStep(2)} size="lg">
                    Ir para a Revisão Final
                  </Button>
                </div>

                <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3">
                  <div className="w-full max-w-5xl rounded-[24px] border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur">
                    <div className="flex flex-col gap-3">
                      {navigationRowsVisible ? (
                        <>
                          <div className="overflow-x-auto">
                            <div className="flex min-w-max items-center gap-2">
                              {sectionNavItems.map((section) => (
                                <button
                                  key={section.id}
                                  type="button"
                                  onClick={() => scrollToSection(section.id)}
                                  className={`h-8 rounded-full border border-transparent px-3 text-[11px] font-semibold text-slate-900 transition hover:brightness-[0.98] sm:text-xs ${section.id === "section-quadras"
                                    ? "bg-[#f4c4cc]"
                                    : section.id === "section-comentarios"
                                      ? "bg-[#f3df8a]"
                                      : section.tone === "a"
                                        ? "bg-[#f6d26d]"
                                        : section.tone === "b"
                                          ? "bg-[#de6d57]"
                                          : section.tone === "c"
                                            ? "bg-[#70c3df]"
                                            : section.tone === "d"
                                              ? "bg-[#6cab73]"
                                              : "bg-[#f4c4cc]"
                                    }`}
                                >
                                  {section.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <div className="flex min-w-max items-center gap-2">
                              {CRITERION_CODES.filter((code) => criterionMatchesCurrentFilters(code)).map((code) => {
                                const applicable = isCriterionApplicable(formData, code);
                                const rating = liveSummary.resolvedRatings?.[code];
                                const inAnalysis = criterionPinned(code);
                                const answered = criterionAnswered(code);

                                return (
                                  <button
                                    key={code}
                                    type="button"
                                    onClick={() => scrollToCriterion(code)}
                                    className={`flex h-9 min-w-[38px] items-center justify-center rounded-full border px-2.5 text-[11px] font-semibold transition sm:h-10 sm:min-w-[42px] sm:px-3 sm:text-xs ${getCriterionNavClassName(
                                      code,
                                      applicable,
                                      inAnalysis,
                                      answered,
                                      rating
                                    )}`}
                                  >
                                    <span>{code}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      ) : null}

                      <div className="flex flex-wrap items-center justify-start gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title={navigationRowsVisible ? "Ocultar navegacao" : "Mostrar navegacao"}
                          aria-pressed={navigationRowsVisible}
                          className={`h-8 w-8 rounded-full ${navigationRowsVisible
                            ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-900/90"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                            }`}
                          onClick={toggleNavigationRowsVisible}
                        >
                          <Menu className="h-4 w-4" />
                          <span className="sr-only">
                            {navigationRowsVisible ? "Ocultar navegacao" : "Mostrar navegacao"}
                          </span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-full px-2.5 text-[11px] font-semibold"
                          onClick={toggleAccordionDisplayMode}
                        >
                          {accordionDisplayMode === "expanded" ? (
                            <ChevronDown className="h-3.5 w-3.5 sm:mr-1" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 sm:mr-1" />
                          )}
                          <span className="hidden sm:inline">
                            {accordionDisplayMode === "expanded" ? "Expandido" : "Colapsado"}
                          </span>
                          <span className="sr-only">
                            {accordionDisplayMode === "expanded" ? "Expandido" : "Colapsado"}
                          </span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`h-8 rounded-full px-2.5 text-[11px] font-semibold ${globalCriterionFilter.answer === "answered"
                            ? "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-700/90"
                            : globalCriterionFilter.answer === "unanswered"
                              ? "border-rose-600 bg-rose-600 text-white hover:bg-rose-600/90"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          onClick={cycleAnswerFilter}
                          title={currentAnswerFilter.label}
                        >
                          <span className="sm:hidden">{currentAnswerFilterCompactLabel}</span>
                          <span className="hidden sm:inline">{currentAnswerFilter.label}</span>
                        </Button>
                        {shouldShowFilterModeToggle ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={`h-8 rounded-full px-2.5 text-[11px] font-semibold ${globalCriterionFilter.mode === "or"
                              ? "border-sky-600 bg-sky-600 text-white hover:bg-sky-600/90"
                              : "border-violet-600 bg-violet-600 text-white hover:bg-violet-600/90"
                              }`}
                            onClick={toggleFilterMode}
                          >
                            <span>{currentFilterModeLabel}</span>
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`h-8 rounded-full px-2.5 text-[11px] font-semibold ${globalCriterionFilter.review === "analysis"
                            ? "border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-100/90"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          onClick={cycleReviewFilter}
                          title={currentReviewFilter.label}
                        >
                          <Pin
                            className={`h-3.5 w-3.5 sm:mr-1 ${globalCriterionFilter.review === "analysis" ? "fill-current" : ""
                              }`}
                          />
                          <span className="hidden sm:inline">{currentReviewFilter.label}</span>
                          <span className="sr-only sm:hidden">{currentReviewFilter.label}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          title={criterionMetaVisible ? "Ocultar barra de status dos itens" : "Mostrar barra de status dos itens"}
                          aria-pressed={criterionMetaVisible}
                          className={`h-8 rounded-full px-2.5 text-[11px] font-semibold ${criterionMetaVisible
                            ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-900/90"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                            }`}
                          onClick={toggleCriterionMetaVisible}
                        >
                          <Eye className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">
                            {criterionMetaVisible ? "Barra de Itens ligada" : "Barra de Itens desligada"}
                          </span>
                          <span className="sr-only">
                            {criterionMetaVisible ? "Ocultar barra de status dos itens" : "Mostrar barra de status dos itens"}
                          </span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          title={criterionDescriptionsVisible ? "Desligar ajudas" : "Ligar ajudas"}
                          aria-pressed={criterionDescriptionsVisible}
                          className={`h-8 rounded-full px-2.5 text-[11px] font-semibold ${criterionDescriptionsVisible
                            ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-900/90"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                            }`}
                          onClick={toggleCriterionDescriptionsVisible}
                        >
                          <Lightbulb
                            className={`h-4 w-4 ${criterionDescriptionsVisible ? "fill-current" : ""} sm:mr-1`}
                          />
                          <span className="hidden sm:inline">
                            {criterionDescriptionsVisible ? "Ajuda ligada" : "Ajuda desligada"}
                          </span>
                          <span className="sr-only">
                            {criterionDescriptionsVisible ? "Desligar ajudas" : "Ligar ajudas"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
            </CriteriaAccordionContext.Provider>
          ) : (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Revisão Final</CardTitle>
                <CardDescription>
                  Confira o conceito automatico, veja o que foi considerado em cada criterio e
                  troque para o modo manual quando precisar ajustar algum conceito.
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-2">
                <ReviewAndSubmitStep data={formData} onDataChange={handleDataChange} />
              </div>
              <div className="flex flex-col gap-3 px-6 py-6 md:flex-row md:justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  Voltar para a Coleta
                </Button>
                <div className="flex flex-col items-start gap-3 md:items-end">
                  <SaveStatusSummary
                    incompleteCount={incompleteCriteriaCount}
                    pinnedCount={pinnedCriteriaCount}
                    isOnline={isOnline}
                  />
                  <Button onClick={handleSubmit} size="lg">
                    <Save className="mr-2 h-4 w-4" />
                    {isOnline ? "Enviar Avaliação" : "Guardar Rascunho Offline"}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {currentStep === 1 ? (
            <Card className="mb-6">
              <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {isOnline ? "Enviar avaliação" : "Salvar rascunho"}
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {isOnline ? "Enviar avaliação atual" : "Guardar rascunho offline"}
                  </div>
                  <div className="mt-2">
                    <SaveStatusSummary
                      incompleteCount={incompleteCriteriaCount}
                      pinnedCount={pinnedCriteriaCount}
                      isOnline={isOnline}
                    />
                  </div>
                </div>
                <Button onClick={handleSubmit} size="lg">
                  <Save className="mr-2 h-4 w-4" />
                    {isOnline ? "Enviar Avaliação" : "Guardar Rascunho Offline"}
                </Button>
              </div>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
};

export default SegmentForm;
