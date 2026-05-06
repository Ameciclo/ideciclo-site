import { IdecicloFormData } from "@/types/idecicloForm";
import { CriterionCode, getScoreBreakdown } from "@/utils/idecicloAssessment";

export interface CriterionScorePreviewItem {
  code: CriterionCode;
  rating: string | null;
  points: number | null;
}

export const buildCriterionScorePreview = (
  data: IdecicloFormData,
  codes: CriterionCode[]
): CriterionScorePreviewItem[] => {
  const summary = getScoreBreakdown(data);

  return codes
    .map((code) => {
      const sectionKey = code[0];
      const rating = summary.resolvedRatings?.[code] ?? null;
      const points = summary.sections?.[sectionKey]?.items?.[code]?.points;

      if (!rating && typeof points !== "number") return null;
      return {
        code,
        rating,
        points: typeof points === "number" ? points : null,
      };
    })
    .filter(Boolean);
};
