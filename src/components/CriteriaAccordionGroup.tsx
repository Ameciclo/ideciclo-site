import React, { useMemo, useRef, useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import {
  CriteriaAccordionContext,
  CriterionFilter,
  useCriteriaAccordionFilter,
} from "@/components/criteriaAccordionContext";

interface CriteriaAccordionGroupProps {
  allValues: string[];
  defaultOpenValues?: string[];
  filter?: CriterionFilter;
  command?: {
    type: "expand" | "collapse";
    nonce: number;
  } | null;
  children: React.ReactNode;
}

const CriteriaAccordionGroup: React.FC<CriteriaAccordionGroupProps> = ({
  allValues,
  defaultOpenValues,
  filter = { answer: "all", review: "all", mode: "or" },
  command,
  children,
}) => {
  const [openValues, setOpenValues] = useState<string[]>(defaultOpenValues || allValues);
  const allValuesRef = useRef(allValues);
  const parentContext = useCriteriaAccordionFilter();

  const contextValue = useMemo(
    () => ({
      filter,
      descriptionsVisible: parentContext.descriptionsVisible,
      criterionMetaVisible: parentContext.criterionMetaVisible,
    }),
    [filter, parentContext.descriptionsVisible, parentContext.criterionMetaVisible]
  );

  React.useEffect(() => {
    allValuesRef.current = allValues;
  }, [allValues]);

  React.useEffect(() => {
    if (!command) return;
    setOpenValues(command.type === "expand" ? allValuesRef.current : []);
  }, [command]);

  return (
    <CriteriaAccordionContext.Provider value={contextValue}>
      <Accordion type="multiple" value={openValues} onValueChange={setOpenValues} className="space-y-4">
        {children}
      </Accordion>
    </CriteriaAccordionContext.Provider>
  );
};

export default CriteriaAccordionGroup;
