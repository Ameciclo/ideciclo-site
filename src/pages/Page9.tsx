import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ManualHelpDialog from "@/components/ManualHelpDialog";
import {
  CriterionCode,
  IdecicloRating,
  getCriterionLabel,
  getScoreBreakdown,
  isCriterionApplicable,
} from "@/utils/idecicloAssessment";
import { getCriterionEvidence } from "@/utils/idecicloReview";
import { IdecicloFormData } from "@/types/idecicloForm";

interface Page9Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  isOnline: boolean;
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

const ratingBadgeClassName = (rating: IdecicloRating | null | undefined) => {
  if (rating === "A") return "bg-emerald-100 text-emerald-800";
  if (rating === "B") return "bg-lime-100 text-lime-800";
  if (rating === "C") return "bg-amber-100 text-amber-900";
  if (rating === "D") return "bg-rose-100 text-rose-900";
  return "bg-slate-100 text-slate-700";
};

const ratingChipClassName = (rating: IdecicloRating, selected: boolean) => {
  const selectedClass =
    rating === "A"
      ? "bg-emerald-500 text-white"
      : rating === "B"
        ? "bg-lime-500 text-slate-950"
        : rating === "C"
          ? "bg-amber-400 text-slate-950"
          : "bg-rose-500 text-white";

  return `inline-flex min-w-[42px] items-center justify-center rounded-full px-3 py-1 text-sm font-bold transition-all ${
    selected ? selectedClass : "bg-slate-100 text-slate-400 opacity-50"
  }`;
};

const Page9: React.FC<Page9Props> = ({ data, onDataChange, isOnline }) => {
  const summary = getScoreBreakdown(data);

  const handleModeChange = (criterion: CriterionCode, mode: "auto" | "manual") => {
    onDataChange({
      rating_modes: {
        ...(data.rating_modes || {}),
        [criterion]: mode,
      },
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
      <Card>
        <CardHeader>
          <CardTitle>Resumo da revisão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border p-4">
              <div className="text-sm text-muted-foreground">Nota do trecho</div>
              <div className="mt-1 text-3xl font-bold">{summary.total.toFixed(1)}/100</div>
              {summary.eliminated ? (
                <p className="mt-2 text-sm text-rose-700">
                  A1 recebeu D e a estrutura foi eliminada pela regra do manual.
                </p>
              ) : null}
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-sm text-muted-foreground">Tipologia considerada</div>
              <div className="mt-1 text-lg font-semibold capitalize">
                {summary.typology ? summary.typology.replaceAll("_", " ") : "Não definida"}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                O cálculo final utiliza os pesos do `form.json` para a tipologia escolhida.
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-sm text-muted-foreground">Estado da conexão</div>
              <div className="mt-1 text-lg font-semibold">{isOnline ? "Online" : "Offline"}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Mesmo offline, o rascunho fica salvo localmente até o envio.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            Nesta segunda página você confere o conceito automático, vê os parâmetros que levaram a
            cada nota e pode trocar o critério para `Manual` quando quiser sobrescrever o cálculo.
          </div>
        </CardContent>
      </Card>

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
                    <Badge variant="secondary">
                      {sectionSummary.score.toFixed(1)}/{sectionSummary.max}
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
                const itemSummary = sectionSummary?.items?.[criterion];
                const evidence = getCriterionEvidence(criterion, data);

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
                            Automático: {autoRating ?? "N/A"}
                          </Badge>
                          <Badge className={ratingBadgeClassName(finalRating)}>
                            Final: {finalRating ?? "N/A"}
                          </Badge>
                          {typeof itemSummary?.points === "number" ? (
                            <Badge variant="outline">
                              {itemSummary.points > 0 ? `+${itemSummary.points}` : itemSummary.points} pts
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
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant={mode === "auto" ? "default" : "outline"}
                            onClick={() => handleModeChange(criterion, "auto")}
                          >
                            Automático
                          </Button>
                          <Button
                            type="button"
                            variant={mode === "manual" ? "default" : "outline"}
                            onClick={() => handleModeChange(criterion, "manual")}
                          >
                            Manual
                          </Button>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="mb-2 text-sm font-medium text-slate-700">Conceito final</div>
                        <div className="flex flex-wrap gap-2">
                          {RATINGS.map((rating) => (
                            <span key={rating} className={ratingChipClassName(rating, finalRating === rating)}>
                              {rating}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
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

                    {applicable && mode === "manual" ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {RATINGS.map((rating) => (
                          <Button
                            key={rating}
                            type="button"
                            variant={data.manual_ratings?.[criterion] === rating ? "default" : "outline"}
                            onClick={() => handleManualRatingChange(criterion, rating)}
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>
                    ) : null}
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
