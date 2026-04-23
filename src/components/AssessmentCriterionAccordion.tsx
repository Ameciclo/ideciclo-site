import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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

  const hidden =
    (filter === "answered" && !answered) ||
    (filter === "unanswered" && answered) ||
    (filter === "analysis" && !inAnalysis);

  if (hidden) return null;

  return (
    <AccordionItem
      value={value}
      id={`criterion-${value}`}
      className="overflow-hidden rounded-[24px] border border-slate-200 bg-background px-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">{title}</div>
              {description ? (
                <p className="mt-1 text-xs font-normal leading-5 text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Badge
                variant={answered ? "default" : "outline"}
                className="rounded-full px-3 py-1 text-xs"
              >
                {answered ? "Respondido" : "Não respondido"}
              </Badge>
              {inAnalysis ? (
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                  Em análise
                </Badge>
              ) : null}
              {helpKey ? <ManualHelpDialog helpKey={helpKey} compact /> : null}
              <AccordionTrigger className="h-9 w-9 rounded-full border border-slate-200 px-0 py-0 hover:bg-slate-50 hover:no-underline">
                <span className="sr-only">Expandir ou retrair critério</span>
              </AccordionTrigger>
            </div>
          </div>
        </div>
      </div>
      <AccordionContent className="pt-2 text-sm">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-slate-50 px-3 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Em análise</span>
            <Switch checked={inAnalysis} onCheckedChange={onAnalysisChange} />
          </div>
          {onClear ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full px-3 text-xs"
              onClick={onClear}
            >
              Limpar
            </Button>
          ) : null}
        </div>
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export default AssessmentCriterionAccordion;
