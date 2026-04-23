import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brush, Pin } from "lucide-react";
import ManualHelpDialog from "@/components/ManualHelpDialog";
import { useCriteriaAccordionFilter } from "@/components/criteriaAccordionContext";

interface AssessmentCriterionAccordionProps {
  value: string;
  title: string;
  description?: string;
  scorePreview?: unknown;
  answered?: boolean;
  inAnalysis?: boolean;
  onAnalysisChange?: (value: boolean) => void;
  onClear?: () => void;
  helpKey?: string;
  children: React.ReactNode;
}

const AssessmentCriterionAccordion: React.FC<AssessmentCriterionAccordionProps> = ({
  value,
  title,
  description,
  answered = false,
  inAnalysis = false,
  onAnalysisChange,
  onClear,
  helpKey,
  children,
}) => {
  const { filter } = useCriteriaAccordionFilter();
  const handleClear = () => {
    if (!onClear) return;

    const confirmed = window.confirm(
      "Tem certeza que quer limpar as respostas deste item?"
    );

    if (confirmed) {
      onClear();
    }
  };

  const hidden =
    (filter.answer === "answered" && !answered) ||
    (filter.answer === "unanswered" && answered && !inAnalysis) ||
    (filter.review === "analysis" && !inAnalysis) ||
    (filter.review === "reviewed" && inAnalysis);

  if (hidden) return null;

  return (
    <AccordionItem
      value={value}
      id={`criterion-${value}`}
      className="overflow-hidden rounded-[24px] border border-slate-200 bg-background px-4 shadow-sm"
    >
      <div className="py-4">
        <AccordionTrigger className="w-full py-0 text-left hover:no-underline [&>svg]:ml-3">
          <div className="min-w-0 pr-2">
            <div className="text-sm font-semibold text-foreground">{title}</div>
            {description ? (
              <p className="mt-1 text-xs font-normal leading-5 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </AccordionTrigger>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={`rounded-full px-3 py-1 text-xs ${
              answered
                ? "border-emerald-700 bg-emerald-700 text-white"
                : "border-rose-600 bg-rose-600 text-white"
            }`}
          >
            {answered ? "Respondido" : "Pendente"}
          </Badge>
          {onAnalysisChange ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-pressed={inAnalysis}
              title={inAnalysis ? "Desafixar item" : "Fixar item"}
              className={`h-8 w-8 rounded-full ${
                inAnalysis
                  ? "border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-100/90"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
              onClick={(event) => {
                event.stopPropagation();
                onAnalysisChange(!inAnalysis);
              }}
            >
              <Pin className={`h-4 w-4 ${inAnalysis ? "fill-current" : ""}`} />
              <span className="sr-only">{inAnalysis ? "Desafixar item" : "Fixar item"}</span>
            </Button>
          ) : null}
          {onClear ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleClear}
              title="Limpar respostas deste item"
            >
              <Brush className="h-4 w-4" />
              <span className="sr-only">Limpar respostas deste item</span>
            </Button>
          ) : null}
          {helpKey ? <ManualHelpDialog helpKey={helpKey} compact /> : null}
        </div>
      </div>
      <AccordionContent className="pt-2 text-sm">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export default AssessmentCriterionAccordion;
