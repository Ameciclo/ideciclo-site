import { createContext, useContext } from "react";

export type CriterionAnswerFilter = "all" | "answered" | "unanswered";
export type CriterionReviewFilter = "all" | "analysis" | "reviewed";

export interface CriterionFilter {
  answer: CriterionAnswerFilter;
  review: CriterionReviewFilter;
}

interface CriteriaAccordionContextValue {
  filter: CriterionFilter;
}

export const CriteriaAccordionContext = createContext<CriteriaAccordionContextValue>({
  filter: {
    answer: "all",
    review: "all",
  },
});

export const useCriteriaAccordionFilter = () => useContext(CriteriaAccordionContext);
