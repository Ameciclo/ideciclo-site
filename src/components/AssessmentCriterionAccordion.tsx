import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CriterionWorkflowState } from "@/types/idecicloForm";
import { useCriteriaAccordionFilter } from "@/components/CriteriaAccordionGroup";

interface AssessmentCriterionAccordionProps {
  value: string;
  title: string;
  description?: string;
  answered?: boolean;
  workflowState?: CriterionWorkflowState;
  onWorkflowStateChange?: (value: CriterionWorkflowState) => void;
  onClear?: () => void;
  children: React.ReactNode;
}

const AssessmentCriterionAccordion: React.FC<AssessmentCriterionAccordionProps> = ({
  value,
  title,
  description,
  answered = false,
  workflowState = "default",
  onWorkflowStateChange,
  onClear,
  children,
}) => {
  const { filter } = useCriteriaAccordionFilter();

  const hidden =
    (filter === "answered" && !answered) ||
    (filter === "unanswered" && answered) ||
    (filter === "analysis" && workflowState !== "analysis") ||
    (filter === "review" && workflowState !== "review");

  if (hidden) return null;

  return (
    <AccordionItem value={value} className="rounded-xl border bg-background px-4">
      <AccordionTrigger className="hover:no-underline">
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
            {workflowState === "analysis" ? <Badge variant="secondary">Em análise</Badge> : null}
            {workflowState === "review" ? <Badge variant="secondary">Revisão</Badge> : null}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2 text-sm">
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-dashed px-3 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Situação</span>
            <Select
              value={workflowState}
              onValueChange={(nextValue) =>
                onWorkflowStateChange?.(nextValue as CriterionWorkflowState)
              }
            >
              <SelectTrigger className="w-[180px]" onClick={(event) => event.stopPropagation()}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Concluído</SelectItem>
                <SelectItem value="analysis">Em análise</SelectItem>
                <SelectItem value="review">Revisão</SelectItem>
              </SelectContent>
            </Select>
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
