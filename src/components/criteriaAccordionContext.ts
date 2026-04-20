import { createContext, useContext } from "react";

export type CriterionFilter = "all" | "answered" | "unanswered" | "analysis";

interface CriteriaAccordionContextValue {
  filter: CriterionFilter;
}

export const CriteriaAccordionContext = createContext<CriteriaAccordionContextValue>({
  filter: "all",
});

export const useCriteriaAccordionFilter = () => useContext(CriteriaAccordionContext);
