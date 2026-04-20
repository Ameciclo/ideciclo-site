import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CRITERION_CODES,
  CriterionCode,
  IdecicloRating,
  getCriterionLabel,
  getScoreBreakdown,
  isCriterionApplicable,
} from "@/utils/idecicloAssessment";
import { IdecicloFormData } from "@/types/idecicloForm";

interface Page9Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  isOnline: boolean;
}

const SECTIONS: Array<{
  key: string;
  title: string;
  criteria: CriterionCode[];
}> = [
  { key: "A", title: "Planejamento Cicloviário", criteria: ["A1", "A2"] },
  { key: "B", title: "Projeto ao Longo da Estrutura", criteria: ["B1", "B2", "B3", "B4", "B5", "B6", "B7"] },
  { key: "C", title: "Projeto nas Interseções", criteria: ["C1", "C2", "C3"] },
  { key: "D", title: "Urbanidade", criteria: ["D1", "D2", "D3"] },
  { key: "E", title: "Manutenção", criteria: ["E1", "E2", "E3", "E4"] },
];

const RATINGS: IdecicloRating[] = ["A", "B", "C", "D"];

const ratingBadgeClassName = (rating: IdecicloRating | null | undefined) => {
  if (rating === "A") return "bg-emerald-100 text-emerald-800";
  if (rating === "B") return "bg-lime-100 text-lime-800";
  if (rating === "C") return "bg-amber-100 text-amber-900";
  if (rating === "D") return "bg-rose-100 text-rose-900";
  return "bg-slate-100 text-slate-700";
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
          <CardTitle>Revisão Final e Lógica de Pontuação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border p-4">
              <div className="text-sm text-muted-foreground">Nota do trecho</div>
              <div className="mt-1 text-3xl font-bold">{summary.total.toFixed(1)}/100</div>
              {summary.eliminated && (
                <p className="mt-2 text-sm text-rose-700">
                  A1 recebeu D e a estrutura foi eliminada pela regra do manual.
                </p>
              )}
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-sm text-muted-foreground">Tipologia considerada</div>
              <div className="mt-1 text-lg font-semibold capitalize">
                {summary.typology ? summary.typology.replaceAll("_", " ") : "Não definida"}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Os pesos são buscados do `form.json`, conforme a tipologia selecionada.
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-sm text-muted-foreground">Estado da conexão</div>
              <div className="mt-1 text-lg font-semibold">
                {isOnline ? "Online" : "Offline"}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                O rascunho fica salvo localmente no aparelho enquanto você preenche.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            Cada item abaixo pode ficar em modo `Automático`, usando os parâmetros preenchidos,
            ou em modo `Manual`, quando você quiser informar diretamente o conceito final de A a D.
          </div>
        </CardContent>
      </Card>

      {SECTIONS.map((section) => {
        const sectionSummary = summary.sections?.[section.key];

        return (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-4">
                <span>{section.key}. {section.title}</span>
                {sectionSummary && (
                  <Badge variant="outline">
                    {sectionSummary.score.toFixed(1)}/{sectionSummary.max}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {section.criteria
                .filter((criterion) => CRITERION_CODES.includes(criterion))
                .map((criterion) => {
                  const applicable = isCriterionApplicable(data, criterion);
                  const autoRating = summary.autoRatings[criterion];
                  const finalRating = summary.resolvedRatings[criterion];
                  const mode = data.rating_modes?.[criterion] === "manual" ? "manual" : "auto";
                  const itemSummary = sectionSummary?.items?.[criterion];

                  return (
                    <div
                      key={criterion}
                      className="rounded-xl border p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="font-medium">
                            {criterion}. {getCriterionLabel(criterion)}
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <Badge className={ratingBadgeClassName(autoRating)}>
                              Automático: {autoRating ?? "N/A"}
                            </Badge>
                            <Badge className={ratingBadgeClassName(finalRating)}>
                              Final: {finalRating ?? "N/A"}
                            </Badge>
                            {typeof itemSummary?.points === "number" && (
                              <Badge variant="outline">
                                {itemSummary.points > 0 ? `+${itemSummary.points}` : itemSummary.points} pts
                              </Badge>
                            )}
                          </div>
                          {!applicable && (
                            <p className="text-sm text-muted-foreground">
                              Este item não se aplica para a tipologia atual.
                            </p>
                          )}
                        </div>

                        {applicable && (
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
                        )}
                      </div>

                      {applicable && mode === "manual" && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {RATINGS.map((rating) => (
                            <Button
                              key={rating}
                              type="button"
                              variant={
                                data.manual_ratings?.[criterion] === rating ? "default" : "outline"
                              }
                              onClick={() => handleManualRatingChange(criterion, rating)}
                            >
                              {rating}
                            </Button>
                          ))}
                        </div>
                      )}
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
