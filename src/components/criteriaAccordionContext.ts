import { createContext, useContext } from "react";

export type CriterionAnswerFilter = "all" | "answered" | "unanswered";
export type CriterionReviewFilter = "all" | "analysis";
export type CriterionFilterMode = "or" | "and";

export interface CriterionFilter {
  answer: CriterionAnswerFilter;
  review: CriterionReviewFilter;
  mode: CriterionFilterMode;
}

interface CriteriaAccordionContextValue {
  filter: CriterionFilter;
  descriptionsVisible: boolean;
  criterionMetaVisible: boolean;
}

export const CriteriaAccordionContext = createContext<CriteriaAccordionContextValue>({
  filter: {
    answer: "all",
    review: "all",
    mode: "or",
  },
  descriptionsVisible: true,
  criterionMetaVisible: true,
});

export const useCriteriaAccordionFilter = () => useContext(CriteriaAccordionContext);
