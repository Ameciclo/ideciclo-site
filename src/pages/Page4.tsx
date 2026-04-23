import React from "react";
import { Label } from "@/components/ui/label";
import AssessmentCriterionAccordion from "@/components/AssessmentCriterionAccordion";
import ConceptCriteriaTable from "@/components/ConceptCriteriaTable";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { CriterionFilter } from "@/components/criteriaAccordionContext";
import { IdecicloFormData } from "@/types/idecicloForm";
import { buildCriterionScorePreview } from "@/utils/criterionScorePreview";

interface Page4Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  filter?: CriterionFilter;
  command?: { type: "expand" | "collapse"; nonce: number } | null;
}

const Page4: React.FC<Page4Props> = ({ data, onDataChange, filter, command }) => {
  const handleRadioChange = (name: string, value: string) => {
    onDataChange({ [name]: value });
  };

  const isTouched = (fields: string[]) => fields.some((field) => data.touched_fields?.[field]);
  const updateWorkflow = (criterion: string, value: "default" | "analysis") =>
    onDataChange({
      criterion_workflow_state: {
        ...(data.criterion_workflow_state || {}),
        [criterion]: value,
      },
    });

  return (
    <CriteriaAccordionGroup allValues={["b2", "e2"]} defaultOpenValues={["b2"]} filter={filter} command={command}>
          <AssessmentCriterionAccordion
            value="b2"
            title="B.2. Tipo de pavimento da infraestrutura cicloviária"
            description="Classificação do material predominante do pavimento."
            scorePreview={buildCriterionScorePreview(data, ["B2"])}
            answered={isTouched(["pavement_type"])}
            inAnalysis={data.criterion_workflow_state?.b2 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("b2", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                pavement_type: "",
                touched_fields: { pavement_type: false },
              })
            }
            helpKey="b2"
          >
            <ConceptCriteriaTable
              value={data.pavement_type || ""}
              onValueChange={(value) => handleRadioChange("pavement_type", value)}
              options={[
                {
                  value: "A",
                  description: "Pisos betuminosos (asfalto) ou cimentícios (concreto).",
                },
                {
                  value: "B",
                  description: "Pisos modulares (blocos de concreto e similares).",
                },
                {
                  value: "C",
                  description:
                    "Pedras irregulares (portuguesas e similares), pisos com espaçamento (vãos).",
                },
                {
                  value: "D",
                  description:
                    "Pisos de barro; grelhas e chapas metálicas; pisos modulares soltos; pisos derrapantes.",
                },
              ]}
            />
          </AssessmentCriterionAccordion>

          <AssessmentCriterionAccordion
            value="e2"
            title="E.2. Estado de conservação do pavimento"
            description="Avalia a integridade da superfície e a qualidade de rodagem."
            scorePreview={buildCriterionScorePreview(data, ["E2"])}
            answered={isTouched(["conservation_state"])}
            inAnalysis={data.criterion_workflow_state?.e2 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("e2", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                conservation_state: "",
                touched_fields: { conservation_state: false },
              })
            }
            helpKey="E2"
          >
            <ConceptCriteriaTable
              value={data.conservation_state || ""}
              onValueChange={(value) => handleRadioChange("conservation_state", value)}
              options={[
                {
                  value: "A",
                  description: "Piso nivelado, sem ondulações.",
                },
                {
                  value: "B",
                  description:
                    "Piso com leve desnivelamento, que não requeira ao ciclista frear.",
                },
                {
                  value: "C",
                  description:
                    "Piso com desnível transversal ou buraco raso; piso com desgaste até a metade de sua largura útil.",
                },
                {
                  value: "D",
                  description:
                    "Piso com degraus / buracos profundos; piso com desgaste superior à metade da largura útil.",
                },
              ]}
            />
          </AssessmentCriterionAccordion>
        </CriteriaAccordionGroup>
  );
};

export default Page4;
