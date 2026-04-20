import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AssessmentCriterionAccordionProps {
  value: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const AssessmentCriterionAccordion: React.FC<AssessmentCriterionAccordionProps> = ({
  value,
  title,
  description,
  children,
}) => (
  <AccordionItem value={value} className="rounded-xl border bg-background px-4">
    <AccordionTrigger className="hover:no-underline">
      <div className="text-left">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {description ? (
          <p className="mt-1 text-xs font-normal text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </AccordionTrigger>
    <AccordionContent className="pt-2 text-sm">{children}</AccordionContent>
  </AccordionItem>
);

export default AssessmentCriterionAccordion;
