import React, { createContext, useContext, useMemo, useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CriterionFilter = "all" | "answered" | "unanswered" | "analysis" | "review";

interface CriteriaAccordionContextValue {
  filter: CriterionFilter;
}

const CriteriaAccordionContext = createContext<CriteriaAccordionContextValue>({
  filter: "all",
});

export const useCriteriaAccordionFilter = () => useContext(CriteriaAccordionContext);

interface CriteriaAccordionGroupProps {
  allValues: string[];
  defaultOpenValues?: string[];
  children: React.ReactNode;
}

const CriteriaAccordionGroup: React.FC<CriteriaAccordionGroupProps> = ({
  allValues,
  defaultOpenValues,
  children,
}) => {
  const [openValues, setOpenValues] = useState<string[]>(defaultOpenValues || allValues);
  const [filter, setFilter] = useState<CriterionFilter>("all");

  const contextValue = useMemo(() => ({ filter }), [filter]);

  return (
    <CriteriaAccordionContext.Provider value={contextValue}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-lg border border-dashed px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpenValues(allValues)}>
              Expandir tudo
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpenValues([])}>
              Retrair tudo
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Filtro</span>
            <Select value={filter} onValueChange={(value) => setFilter(value as CriterionFilter)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filtrar critérios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="answered">Respondidos</SelectItem>
                <SelectItem value="unanswered">Não respondidos</SelectItem>
                <SelectItem value="analysis">Em análise</SelectItem>
                <SelectItem value="review">Revisão</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Accordion type="multiple" value={openValues} onValueChange={setOpenValues} className="space-y-4">
          {children}
        </Accordion>
      </div>
    </CriteriaAccordionContext.Provider>
  );
};

export default CriteriaAccordionGroup;
