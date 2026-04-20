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
    <AccordionItem value={value} className="rounded-xl border bg-background px-4">
      <div className="flex items-start gap-2">
        <AccordionTrigger className="flex-1 hover:no-underline">
          <div className="flex w-full flex-col gap-3 text-left md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">{title}</div>
              {description ? (
                <p className="mt-1 text-xs font-normal text-muted-foreground">{description}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={answered ? "default" : "outline"}>
                {answered ? "Respondido" : "Não respondido"}
              </Badge>
              {inAnalysis ? <Badge variant="secondary">Em análise</Badge> : null}
            </div>
          </div>
        </AccordionTrigger>
        {helpKey ? (
          <div className="pt-3">
            <ManualHelpDialog helpKey={helpKey} compact />
          </div>
        ) : null}
      </div>
      <AccordionContent className="pt-2 text-sm">
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-dashed px-3 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Em análise</span>
            <Switch checked={inAnalysis} onCheckedChange={onAnalysisChange} />
          </div>
          {onClear ? (
            <Button type="button" variant="outline" size="sm" onClick={onClear}>
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
