import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ManualHelpDialog from "@/components/ManualHelpDialog";
import {
  CriterionCode,
  IdecicloRating,
  getCriterionLabel,
  getScoreBreakdown,
  isCriterionApplicable,
} from "@/utils/idecicloAssessment";
import { getCriterionRatingScale } from "@/utils/criterionRatingDescriptions";
import { getCriterionEvidence } from "@/utils/idecicloReview";
import { IdecicloFormData } from "@/types/idecicloForm";
import { cn } from "@/lib/utils";

interface Page9Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
}

const SECTIONS: Array<{
  key: string;
  tone: "a" | "b" | "c" | "d" | "e";
  title: string;
  criteria: CriterionCode[];
}> = [
  { key: "A", tone: "a", title: "A. Planejamento Cicloviário", criteria: ["A1", "A2"] },
  {
    key: "B",
    tone: "b",
    title: "B. Projeto Cicloviário ao Longo da Quadra",
    criteria: ["B1", "B2", "B3", "B4", "B5", "B6", "B7"],
  },
  { key: "C", tone: "c", title: "C. Projeto Cicloviário nas Interseções", criteria: ["C1", "C2", "C3"] },
  { key: "D", tone: "d", title: "D. Urbanidade", criteria: ["D1", "D2", "D3"] },
  { key: "E", tone: "e", title: "E. Manutenção", criteria: ["E1", "E2", "E3", "E4"] },
];

const RATINGS: IdecicloRating[] = ["A", "B", "C", "D"];

const formatWholeNumber = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "0";
  return String(Math.round(value));
};

const getCriterionDisplaySourceLabel = () => "Campo";

const getCriterionPointsTag = (
  criterion: CriterionCode,
  points?: number | null,
  maxPoints?: number | null
) => {
  if (criterion === "A1") return "0/-100 pts";
  if (criterion === "B7") return "0/-36 pts";
  if (typeof points !== "number") return null;
  return `${formatWholeNumber(points)}/${formatWholeNumber(maxPoints)} pts`;
};

const getCriterionPointsPanel = (
  criterion: CriterionCode,
  points?: number | null,
  maxPoints?: number | null
) => {
  if (criterion === "A1") {
    return {
      primary: "0",
      secondary: "/-100",
    };
  }

  if (criterion === "B7") {
    return {
      primary: "0",
      secondary: "/-36",
    };
  }

  if (typeof points !== "number") return null;
  return {
    primary: formatWholeNumber(points),
    secondary: `/${formatWholeNumber(maxPoints)}`,
  };
};

const ratingBadgeClassName = (rating: IdecicloRating | null | undefined) => {
  if (rating === "A") return "border-transparent bg-[#b8e5db] text-[#163b38]";
  if (rating === "B") return "border-transparent bg-[#9fd3cb] text-[#163b38]";
  if (rating === "C") return "border-transparent bg-[#8fafad] text-[#163b38]";
  if (rating === "D") return "border-transparent bg-[#748987] text-white";
  return "bg-slate-100 text-slate-700";
};

const ratingChipClassName = (
  rating: IdecicloRating,
  {
    selected,
    interactive = false,
    manual = false,
  }: { selected: boolean; interactive?: boolean; manual?: boolean }
) => {
  const selectedClass =
    rating === "A"
      ? "border-[#b8e5db] bg-[#b8e5db] text-[#163b38]"
      : rating === "B"
        ? "border-[#9fd3cb] bg-[#9fd3cb] text-[#163b38]"
        : rating === "C"
          ? "border-[#8fafad] bg-[#8fafad] text-[#163b38]"
          : "border-[#748987] bg-[#748987] text-white";

  return cn(
    "inline-flex min-w-[54px] items-center justify-center rounded-md border px-3 py-2 text-sm font-bold transition-all",
    selected ? selectedClass : "border-slate-200 bg-slate-100 text-slate-400 opacity-55",
    interactive ? "cursor-pointer hover:opacity-85" : "cursor-default",
    manual && selected ? "ring-2 ring-amber-300 ring-offset-2 ring-offset-background" : null
  );
};

const Page9: React.FC<Page9Props> = ({ data, onDataChange }) => {
  const summary = getScoreBreakdown(data);

  const handleModeChange = (criterion: CriterionCode, enabled: boolean) => {
    const autoRating = summary.autoRatings[criterion];
    const shouldSeedManualRating = enabled && !data.manual_ratings?.[criterion] && autoRating;

    onDataChange({
      rating_modes: {
        ...(data.rating_modes || {}),
        [criterion]: enabled ? "manual" : "auto",
      },
      ...(shouldSeedManualRating
        ? {
            manual_ratings: {
              ...(data.manual_ratings || {}),
              [criterion]: autoRating,
            },
          }
        : {}),
    });
  };

  const handleManualRatingChange = (criterion: CriterionCode, rating: IdecicloRating) => {
    onDataChange({
      manual_ratings: {
        ...(data.manual_ratings || {}),
        [criterion]: rating,
      },
    });
  };

  return (
    <div className="space-y-6">
      {SECTIONS.map((section) => {
        const sectionSummary = summary.sections?.[section.key];

        return (
          <Card key={section.key}>
            <CardHeader className="space-y-4">
              <div className={`ideciclo-axis-ribbon ideciclo-axis-ribbon-${section.tone}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xl font-bold tracking-tight text-black md:text-2xl">
                    {section.title}
                  </span>
                  {sectionSummary ? (
                    <Badge variant="secondary" className="px-3 py-2 text-lg font-black">
                      {formatWholeNumber(sectionSummary.score)}/{formatWholeNumber(sectionSummary.max)}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {section.criteria.map((criterion) => {
                const applicable = isCriterionApplicable(data, criterion);
                const autoRating = summary.autoRatings[criterion];
                const finalRating = summary.resolvedRatings[criterion];
                const mode = data.rating_modes?.[criterion] === "manual" ? "manual" : "auto";
                const manualEnabled = mode === "manual";
                const itemSummary = sectionSummary?.items?.[criterion];
                const evidence = getCriterionEvidence(criterion, data);
                const ratingScale = getCriterionRatingScale(criterion, data);
                const finalRatingDescription = finalRating
                  ? ratingScale.find((item) => item.rating === finalRating)
                  : null;
                const pointsTag = getCriterionPointsTag(
                  criterion,
                  itemSummary?.points,
                  itemSummary?.maxPoints
                );
                const pointsPanel = getCriterionPointsPanel(
                  criterion,
                  itemSummary?.points,
                  itemSummary?.maxPoints
                );

                return (
                  <div key={criterion} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-medium">
                            {criterion}. {getCriterionLabel(criterion)}
                          </div>
                          <ManualHelpDialog helpKey={criterion} compact />
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <Badge className={ratingBadgeClassName(autoRating)}>
                            {getCriterionDisplaySourceLabel()}: {autoRating ?? "N/A"}
                          </Badge>
                          <Badge
                            className={cn(
                              ratingBadgeClassName(finalRating),
                              manualEnabled ? "ring-2 ring-amber-300 ring-offset-2 ring-offset-background" : null
                            )}
                          >
                            Final: {finalRating ?? "N/A"}
                          </Badge>
                          {manualEnabled ? <Badge variant="outline">Manual ligado</Badge> : null}
                          {pointsTag ? (
                            <Badge variant="outline" className="text-sm">
                              {pointsTag}
                            </Badge>
                          ) : null}
                        </div>
                        {!applicable ? (
                          <p className="text-sm text-muted-foreground">
                            Este item não se aplica para a tipologia atual.
                          </p>
                        ) : null}
                      </div>

                      {applicable ? (
                        <div className="flex items-center gap-3 rounded-full border border-slate-200 px-3 py-2">
                          <Label htmlFor={`manual-rating-${criterion}`} className="text-sm font-medium">
                            Ajuste manual
                          </Label>
                          <Switch
                            id={`manual-rating-${criterion}`}
                            checked={manualEnabled}
                            onCheckedChange={(checked) => handleModeChange(criterion, checked)}
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                          <div className="text-sm font-medium text-slate-700">Conceito final</div>
                          {pointsPanel ? (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
                              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                Pontuação
                              </div>
                              <div className="text-2xl font-black text-slate-900">
                                {pointsPanel.primary}
                                <span className="text-base font-semibold text-slate-500">
                                  {pointsPanel.secondary}
                                </span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {RATINGS.map((rating) => (
                            <Button
                              key={rating}
                              type="button"
                              variant="outline"
                              aria-pressed={finalRating === rating}
                              aria-disabled={!manualEnabled}
                              className={ratingChipClassName(rating, {
                                selected: finalRating === rating,
                                interactive: manualEnabled,
                                manual: manualEnabled && data.manual_ratings?.[criterion] === rating,
                              })}
                              onClick={() => {
                                if (!manualEnabled) return;
                                handleManualRatingChange(criterion, rating);
                              }}
                            >
                              {rating}
                            </Button>
                          ))}
                        </div>
                        {manualEnabled ? (
                          <p className="mt-2 text-xs text-amber-800">
                            Clique na escala para ajustar manualmente este conceito.
                          </p>
                        ) : null}
                      </div>

                      {finalRatingDescription ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="mb-2 text-sm font-medium text-slate-700">
                            Texto da nota final
                          </div>
                          <div className="flex items-start gap-3">
                            <Badge className={ratingBadgeClassName(finalRatingDescription.rating)}>
                              {finalRatingDescription.rating}
                            </Badge>
                            <p className="text-sm leading-6 text-slate-700">
                              {finalRatingDescription.description}
                            </p>
                          </div>
                        </div>
                      ) : null}

                      <details className="rounded-xl border border-slate-200 bg-white p-4">
                        <summary className="cursor-pointer list-none text-sm font-medium text-slate-700">
                          Ver escala completa A-D
                        </summary>
                        <div className="mt-4 space-y-2">
                          {ratingScale.map((item) => (
                            <div
                              key={`${criterion}-${item.rating}`}
                              className={cn(
                                "flex items-start gap-3 rounded-lg border p-3",
                                item.rating === finalRating
                                  ? "border-slate-900 bg-slate-50"
                                  : "border-slate-200 bg-white",
                                item.unavailable ? "opacity-70" : null
                              )}
                            >
                              <Badge className={ratingBadgeClassName(item.rating)}>
                                {item.rating}
                              </Badge>
                              <p className="text-sm leading-6 text-slate-700">
                                {item.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </details>

                      <div className="border-t border-slate-200 pt-4">
                        <div className="mb-2 text-sm font-medium text-slate-700">
                          Elementos considerados para esta nota
                        </div>
                        <ul className="space-y-1 text-sm text-slate-700">
                          {evidence.map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Page9;
