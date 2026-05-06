import type { City, Form, Segment } from "@/types";
import type {
  CriterionCode,
  IdecicloFormData,
  IdecicloRating,
} from "@/types/idecicloForm";
import type { CriterionScaleDescription } from "@/utils/criterionRatingDescriptions";
import {
  calculateCityResults,
  type CityResultsBreakdown,
  type SegmentResultEntry,
} from "@/utils/idecicloResults";
import {
  getCriterionLabel,
  getScoreBreakdown,
} from "@/utils/idecicloAssessment";
import { getCriterionRatingScale } from "@/utils/criterionRatingDescriptions";
import { getCriterionEvidence } from "@/utils/idecicloReview";
import {
  getIdecicloClassification,
  getIdecicloDescription,
} from "@/utils/idecicloCalculator";

export interface PublicCriterionDetail {
  code: CriterionCode;
  label: string;
  rating: IdecicloRating | null;
  points: number | null;
  maxPoints: number;
  evidence: string[];
  scale: CriterionScaleDescription[];
}

export interface PublicSectionDetail {
  key: string;
  label: string;
  score: number;
  max: number;
  criteria: PublicCriterionDetail[];
}

export interface PublicStructureDetail {
  id: string;
  segment: Segment;
  result: SegmentResultEntry;
  form: Form | null;
  formData: Partial<IdecicloFormData>;
  totalScore: number | null;
  scoreLabel: string;
  scoreBadgeClassName: string;
  sections: PublicSectionDetail[];
  criteria: PublicCriterionDetail[];
}

export const PUBLIC_CRITERION_GROUPS: Array<{
  key: string;
  title: string;
  description: string;
  criteria: CriterionCode[];
}> = [
  {
    key: "A",
    title: "Compatibilidade e conexão",
    description:
      "Mostra se a tipologia escolhida combina com a via e se o trecho se conecta com a rede cicloviária da cidade.",
    criteria: ["A1", "A2"],
  },
  {
    key: "B",
    title: "Projeto do trecho",
    description:
      "Reúne largura, pavimento, delimitação, sinalização, acessibilidade e situações de risco ao longo do percurso.",
    criteria: ["B1", "B2", "B3", "B4", "B5", "B6", "B7"],
  },
  {
    key: "C",
    title: "Cruzamentos e conflitos",
    description:
      "Avalia como a infraestrutura se comporta nas interseções e como trata conflitos com o tráfego motorizado.",
    criteria: ["C1", "C2", "C3"],
  },
  {
    key: "D",
    title: "Conforto urbano",
    description:
      "Mostra as condições de iluminação, sombreamento e mobiliário cicloviário ao longo do trecho.",
    criteria: ["D1", "D2", "D3"],
  },
  {
    key: "E",
    title: "Conservação",
    description:
      "Resume o estado de manutenção do pavimento, da sinalização e dos elementos de separação do trecho.",
    criteria: ["E1", "E2", "E3", "E4"],
  },
];

const SCORE_BAND_CONFIG = {
  excellent: {
    label: "Excelente",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  good: {
    label: "Bom",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  fair: {
    label: "Regular",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  poor: {
    label: "Precisa melhorar",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  unavailable: {
    label: "Sem nota",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
} as const;

const RATING_CLASSNAMES: Record<IdecicloRating, string> = {
  A: "border-transparent bg-[#b8e5db] text-[#163b38]",
  B: "border-transparent bg-[#9fd3cb] text-[#163b38]",
  C: "border-transparent bg-[#8fafad] text-[#163b38]",
  D: "border-transparent bg-[#748987] text-white",
};

const RATING_VALUES: Record<IdecicloRating, number> = {
  A: 4,
  B: 3,
  C: 2,
  D: 1,
};

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const stripCityPrefix = (value: string, cityId: string) =>
  value.startsWith(`${cityId}_`) ? value.slice(cityId.length + 1) : value;

export const formatKm = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatScore = (value: number | null) =>
  value === null
    ? "-"
    : value.toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });

export const formatIndex = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

export const formatCount = (value: number) =>
  value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

export const formatPercent = (value: number) =>
  `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;

export const getCityDetailsPath = (cityId: string) => `/detalhes-cidades/${cityId}`;

export const getStructureDetailsPath = (cityId: string, segmentId: string) =>
  `/detalhes-cidades/${cityId}/estruturas/${segmentId}`;

export const getHierarchyLabel = (value: string | null | undefined) => {
  const normalized = normalizeText(value);

  if (normalized.includes("estrut")) return "Estrutural";
  if (normalized.includes("alimenta")) return "Alimentadora";
  if (normalized.includes("local")) return "Local";

  return "Sem hierarquia";
};

export const getStructureStatusLabel = (segment: SegmentResultEntry) => {
  if (!segment.evaluated) return "Ainda não avaliada";
  if (segment.adequate === false) return "Incompatível para o índice";
  if (segment.hierarchy === null) return "Sem hierarquia definida";
  if (segment.score === null) return "Avaliada sem nota final";
  return "Entra no cálculo da cidade";
};

export const getStructureStatusBadgeClassName = (segment: SegmentResultEntry) => {
  if (!segment.evaluated) {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }

  if (segment.adequate === false) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (segment.contributes) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
};

export const getScoreBandMeta = (score: number | null) => {
  if (score === null) return SCORE_BAND_CONFIG.unavailable;
  if (score >= 75) return SCORE_BAND_CONFIG.excellent;
  if (score >= 50) return SCORE_BAND_CONFIG.good;
  if (score >= 25) return SCORE_BAND_CONFIG.fair;
  return SCORE_BAND_CONFIG.poor;
};

export const getRatingBadgeClassName = (rating: IdecicloRating | null) =>
  rating ? RATING_CLASSNAMES[rating] : SCORE_BAND_CONFIG.unavailable.className;

export const getRatingOrderValue = (rating: IdecicloRating | null) =>
  rating ? RATING_VALUES[rating] : 0;

export const getCityIndexMeta = (value: number) => {
  const classification = getIdecicloClassification(value);

  return {
    classification,
    description: getIdecicloDescription(classification),
    badgeClassName:
      classification === "A"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : classification === "B"
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : classification === "C"
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-rose-200 bg-rose-50 text-rose-700",
  };
};

export const buildResultsSnapshot = (
  city: City,
  segments: Segment[],
  forms: Form[]
): CityResultsBreakdown => calculateCityResults(city, segments, forms);

export const buildFormsBySegmentId = (cityId: string, forms: Form[]) =>
  new Map(forms.map((form) => [stripCityPrefix(form.segment_id, cityId), form]));

export const buildStructureDetails = (
  city: City,
  segments: Segment[],
  forms: Form[],
  results: CityResultsBreakdown
): PublicStructureDetail[] => {
  const formsBySegmentId = buildFormsBySegmentId(city.id, forms);
  const resultEntriesById = new Map(results.segments.map((item) => [item.id, item]));

  return segments
    .filter((segment) => !segment.parent_segment_id)
    .map((segment) => {
      const normalizedId = stripCityPrefix(segment.id, city.id);
      const result = resultEntriesById.get(normalizedId);

      if (!result) return null;

      const form = formsBySegmentId.get(normalizedId) || null;
      const formData =
        form?.responses && typeof form.responses === "object"
          ? (form.responses as Partial<IdecicloFormData>)
          : {};
      const breakdown = getScoreBreakdown(formData);
      const scoreMeta = getScoreBandMeta(result.score);

      const criteria = Object.entries(breakdown.sections).flatMap(
        ([, section]): PublicCriterionDetail[] =>
          Object.entries(section.items).map(([code, item]) => ({
            code: code as CriterionCode,
            label: getCriterionLabel(code as CriterionCode) || item.label,
            rating: item.rating ?? null,
            points: typeof item.points === "number" ? item.points : null,
            maxPoints: item.maxPoints,
            evidence: getCriterionEvidence(code as CriterionCode, formData),
            scale: getCriterionRatingScale(code as CriterionCode, formData),
          }))
      );

      const criteriaByCode = new Map(criteria.map((item) => [item.code, item]));

      const sections = PUBLIC_CRITERION_GROUPS.map((group) => ({
        key: group.key,
        label: group.title,
        score: breakdown.sections[group.key]?.score ?? 0,
        max: breakdown.sections[group.key]?.max ?? 0,
        criteria: group.criteria
          .map((code) => criteriaByCode.get(code))
          .filter((item): item is PublicCriterionDetail => Boolean(item)),
      })).filter((section) => section.criteria.length > 0);

      return {
        id: normalizedId,
        segment,
        result,
        form,
        formData,
        totalScore: result.score,
        scoreLabel: scoreMeta.label,
        scoreBadgeClassName: scoreMeta.className,
        sections,
        criteria,
      };
    })
    .filter((item): item is PublicStructureDetail => Boolean(item));
};

export const getTopAndBottomCriteria = (detail: PublicStructureDetail) => {
  const ratedCriteria = detail.criteria.filter(
    (criterion) => criterion.rating !== null
  );

  const sorted = [...ratedCriteria].sort(
    (left, right) =>
      getRatingOrderValue(right.rating) - getRatingOrderValue(left.rating)
  );

  return {
    strengths: sorted.filter((item) => item.rating === "A" || item.rating === "B").slice(0, 3),
    attention: [...sorted]
      .reverse()
      .filter((item) => item.rating === "C" || item.rating === "D")
      .slice(0, 3),
  };
};

export const getComparisonFriendlyTitle = (detail: PublicStructureDetail) =>
  detail.segment.name || detail.result.displayName || `Trecho ${detail.id}`;

export const getMostCommonTypology = (details: PublicStructureDetail[]) => {
  const counts = details.reduce<Record<string, { count: number; km: number }>>(
    (acc, detail) => {
      const key = detail.result.typeLabel || "Sem tipologia";
      const current = acc[key] || { count: 0, km: 0 };
      current.count += 1;
      current.km += detail.result.lengthKm;
      acc[key] = current;
      return acc;
    },
    {}
  );

  const [label, stats] =
    Object.entries(counts).sort((left, right) => right[1].km - left[1].km)[0] || [];

  if (!label || !stats) return null;

  return {
    label,
    count: stats.count,
    km: stats.km,
  };
};

export const buildTypologyStats = (details: PublicStructureDetail[]) =>
  Object.entries(
    details.reduce<Record<string, { count: number; km: number; evaluated: number }>>(
      (acc, detail) => {
        const key = detail.result.typeLabel || "Sem tipologia";
        const current = acc[key] || { count: 0, km: 0, evaluated: 0 };
        current.count += 1;
        current.km += detail.result.lengthKm;
        current.evaluated += detail.result.evaluated ? 1 : 0;
        acc[key] = current;
        return acc;
      },
      {}
    )
  )
    .map(([label, stats]) => ({
      label,
      count: stats.count,
      km: stats.km,
      evaluated: stats.evaluated,
    }))
    .sort((left, right) => right.km - left.km);

export const findStructureDetail = (
  details: PublicStructureDetail[],
  segmentId: string
) => {
  const normalizedId = segmentId.includes("_")
    ? segmentId.split("_").slice(1).join("_")
    : segmentId;

  return (
    details.find((detail) => detail.id === normalizedId) ||
    details.find((detail) => detail.segment.id === normalizedId)
  );
};
