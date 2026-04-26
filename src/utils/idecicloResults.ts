import type { City, Form, Segment } from "@/types";
import type {
  CriterionCode,
  IdecicloFormData,
  IdecicloRating,
} from "@/types/idecicloForm";
import { getScoreBreakdown } from "@/utils/idecicloAssessment";

export const NETWORK_CONFIG = {
  estrutural: {
    label: "Estrutural",
    weight: 0.59,
    cityField: "vias_estruturais_km",
  },
  alimentadora: {
    label: "Alimentadora",
    weight: 0.262,
    cityField: "vias_alimentadoras_km",
  },
  local: {
    label: "Local",
    weight: 0.148,
    cityField: "vias_locais_km",
  },
} as const;

export type NetworkKey = keyof typeof NETWORK_CONFIG;

export type ScoreBandKey =
  | "score-75-plus"
  | "score-50-plus"
  | "score-25-plus"
  | "score-below-25"
  | "score-unavailable";

export interface SegmentResultEntry {
  id: string;
  rawSegmentId: string;
  displayName: string;
  neighborhood?: string;
  typeLabel: string;
  hierarchy: NetworkKey | null;
  hierarchyLabel: string;
  lengthKm: number;
  evaluated: boolean;
  formId?: string;
  score: number | null;
  scoreBand: ScoreBandKey;
  a1Rating: IdecicloRating | null;
  adequate: boolean | null;
  contributes: boolean;
  contribution: number;
  geometry: Segment["geometry"];
}

export interface NetworkResultEntry {
  key: NetworkKey;
  label: string;
  weight: number;
  totalRoadKm: number;
  structuresCount: number;
  evaluatedCount: number;
  pendingCount: number;
  structureKm: number;
  evaluatedKm: number;
  adequateKm: number;
  contributionSum: number;
  gam: number | null;
  weightedContribution: number;
}

export interface CityResultsSummary {
  totalStructures: number;
  evaluatedStructures: number;
  pendingStructures: number;
  totalStructureKm: number;
  evaluatedStructureKm: number;
  classifiedStructures: number;
  unclassifiedStructures: number;
  incompatibleStructures: number;
  validStructures: number;
  validStructureKm: number;
  previewIdeciclo: number;
  officialReady: boolean;
  totalRoadKm: number;
}

export interface CityResultsBreakdown {
  city: City;
  segments: SegmentResultEntry[];
  networks: Record<NetworkKey, NetworkResultEntry>;
  summary: CityResultsSummary;
}

const NETWORK_KEYS = Object.keys(NETWORK_CONFIG) as NetworkKey[];

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const toNumber = (value: unknown): number | null => {
  if (isFiniteNumber(value)) return value;

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const clampScore = (value: number | null) => {
  if (value === null) return null;
  return Math.min(Math.max(value, 0), 100);
};

const isRating = (value: unknown): value is IdecicloRating =>
  value === "A" || value === "B" || value === "C" || value === "D";

const normalizeHierarchy = (value: unknown): NetworkKey | null => {
  const normalized = normalizeText(value);

  if (normalized.includes("estrut")) return "estrutural";
  if (normalized.includes("alimenta")) return "alimentadora";
  if (normalized.includes("local")) return "local";

  return null;
};

const stripCityPrefix = (value: string, cityId: string) =>
  value.startsWith(`${cityId}_`) ? value.slice(cityId.length + 1) : value;

const getReadableSegmentName = (segment: Segment, cityId: string) => {
  if (segment.name?.trim()) {
    return segment.name.trim();
  }

  const displayId = stripCityPrefix(segment.id, cityId);
  return `Trecho ${displayId}`;
};

const getScoreBand = (score: number | null): ScoreBandKey => {
  if (score === null) return "score-unavailable";
  if (score >= 75) return "score-75-plus";
  if (score >= 50) return "score-50-plus";
  if (score >= 25) return "score-25-plus";
  return "score-below-25";
};

const getEmbeddedCriterionRatings = (
  value: unknown
): Partial<Record<CriterionCode, IdecicloRating | null>> => {
  if (!value || typeof value !== "object") return {};
  return value as Partial<Record<CriterionCode, IdecicloRating | null>>;
};

const getEmbeddedBreakdown = (value: unknown) => {
  if (!value || typeof value !== "object") return null;
  return value as {
    total?: number;
    resolvedRatings?: Partial<Record<CriterionCode, IdecicloRating | null>>;
  };
};

const resolveFormMetrics = (form: Form) => {
  const responses =
    form.responses && typeof form.responses === "object"
      ? (form.responses as Partial<IdecicloFormData>)
      : {};
  const computedBreakdown = getScoreBreakdown(responses);
  const embeddedBreakdown = getEmbeddedBreakdown(responses.score_breakdown);
  const embeddedCriterionRatings = getEmbeddedCriterionRatings(
    responses.criterion_ratings
  );

  const score = clampScore(
    toNumber(responses.total_score) ??
      toNumber(embeddedBreakdown?.total) ??
      toNumber(computedBreakdown.total)
  );

  const a1Rating = [
    embeddedCriterionRatings.A1,
    embeddedBreakdown?.resolvedRatings?.A1,
    computedBreakdown.resolvedRatings?.A1,
  ].find(isRating) ?? null;

  return {
    formId: form.id,
    rawSegmentId: form.segment_id,
    score,
    a1Rating,
    hierarchy:
      normalizeHierarchy(responses.road_hierarchy) ??
      normalizeHierarchy(responses.classification) ??
      normalizeHierarchy(form.hierarchy),
    displayName:
      String(responses.segment_name || form.street_name || "").trim() || null,
  };
};

export const calculateCityResults = (
  city: City,
  segments: Segment[],
  forms: Form[]
): CityResultsBreakdown => {
  const formMetricsBySegmentId = new Map(
    forms.map((form) => [
      stripCityPrefix(form.segment_id, city.id),
      resolveFormMetrics(form),
    ])
  );

  const segmentEntries = segments
    .filter((segment) => !segment.parent_segment_id)
    .map<SegmentResultEntry>((segment) => {
      const normalizedId = stripCityPrefix(segment.id, city.id);
      const formMetrics = formMetricsBySegmentId.get(normalizedId);
      const hierarchy =
        normalizeHierarchy(segment.classification) ?? formMetrics?.hierarchy ?? null;
      const hierarchyLabel = hierarchy
        ? NETWORK_CONFIG[hierarchy].label
        : "Sem hierarquia";
      const score = formMetrics?.score ?? null;
      const adequate =
        formMetrics && formMetrics.a1Rating
          ? formMetrics.a1Rating !== "D"
          : formMetrics
            ? true
            : null;
      const contributes =
        Boolean(formMetrics) &&
        hierarchy !== null &&
        adequate === true &&
        score !== null;
      const contribution = contributes ? segment.length * (score as number) / 100 : 0;

      return {
        id: normalizedId,
        rawSegmentId: segment.id,
        displayName:
          formMetrics?.displayName ||
          getReadableSegmentName(
            {
              ...segment,
              id: normalizedId,
            },
            city.id
          ),
        neighborhood: segment.neighborhood || undefined,
        typeLabel: segment.type || "Sem tipologia",
        hierarchy,
        hierarchyLabel,
        lengthKm: segment.length || 0,
        evaluated: Boolean(formMetrics),
        formId: formMetrics?.formId,
        score,
        scoreBand: getScoreBand(score),
        a1Rating: formMetrics?.a1Rating ?? null,
        adequate,
        contributes,
        contribution,
        geometry: segment.geometry,
      };
    });

  const networks = NETWORK_KEYS.reduce((acc, key) => {
    const totalRoadKm = city[NETWORK_CONFIG[key].cityField] || 0;
    const entries = segmentEntries.filter((segment) => segment.hierarchy === key);
    const structuresCount = entries.length;
    const evaluatedCount = entries.filter((segment) => segment.evaluated).length;
    const structureKm = entries.reduce((sum, segment) => sum + segment.lengthKm, 0);
    const evaluatedKm = entries
      .filter((segment) => segment.evaluated)
      .reduce((sum, segment) => sum + segment.lengthKm, 0);
    const adequateKm = entries
      .filter((segment) => segment.contributes)
      .reduce((sum, segment) => sum + segment.lengthKm, 0);
    const contributionSum = entries.reduce(
      (sum, segment) => sum + segment.contribution,
      0
    );
    const gam = totalRoadKm > 0 ? contributionSum / totalRoadKm : null;

    acc[key] = {
      key,
      label: NETWORK_CONFIG[key].label,
      weight: NETWORK_CONFIG[key].weight,
      totalRoadKm,
      structuresCount,
      evaluatedCount,
      pendingCount: Math.max(structuresCount - evaluatedCount, 0),
      structureKm,
      evaluatedKm,
      adequateKm,
      contributionSum,
      gam,
      weightedContribution: gam !== null ? gam * NETWORK_CONFIG[key].weight : 0,
    };

    return acc;
  }, {} as Record<NetworkKey, NetworkResultEntry>);

  const totalStructures = segmentEntries.length;
  const evaluatedStructures = segmentEntries.filter((segment) => segment.evaluated).length;
  const totalStructureKm = segmentEntries.reduce(
    (sum, segment) => sum + segment.lengthKm,
    0
  );
  const evaluatedStructureKm = segmentEntries
    .filter((segment) => segment.evaluated)
    .reduce((sum, segment) => sum + segment.lengthKm, 0);
  const classifiedStructures = segmentEntries.filter(
    (segment) => segment.hierarchy !== null
  ).length;
  const incompatibleStructures = segmentEntries.filter(
    (segment) => segment.evaluated && segment.adequate === false
  ).length;
  const validSegments = segmentEntries.filter((segment) => segment.contributes);
  const previewIdeciclo = NETWORK_KEYS.reduce(
    (sum, key) => sum + networks[key].weightedContribution,
    0
  );

  return {
    city,
    segments: segmentEntries,
    networks,
    summary: {
      totalStructures,
      evaluatedStructures,
      pendingStructures: Math.max(totalStructures - evaluatedStructures, 0),
      totalStructureKm,
      evaluatedStructureKm,
      classifiedStructures,
      unclassifiedStructures: Math.max(totalStructures - classifiedStructures, 0),
      incompatibleStructures,
      validStructures: validSegments.length,
      validStructureKm: validSegments.reduce(
        (sum, segment) => sum + segment.lengthKm,
        0
      ),
      previewIdeciclo,
      officialReady:
        totalStructures > 0 &&
        evaluatedStructures === totalStructures &&
        classifiedStructures === totalStructures,
      totalRoadKm: NETWORK_KEYS.reduce(
        (sum, key) => sum + networks[key].totalRoadKm,
        0
      ),
    },
  };
};
