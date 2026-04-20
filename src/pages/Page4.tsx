import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AssessmentCriterionAccordion from "@/components/AssessmentCriterionAccordion";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { IdecicloFormData } from "@/types/idecicloForm";
import { buildCriterionScorePreview } from "@/utils/criterionScorePreview";

interface Page4Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
}

const Page4: React.FC<Page4Props> = ({ data, onDataChange }) => {
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
    <Card>
      <CardContent className="pt-6">
        <CriteriaAccordionGroup allValues={["b2", "e2"]} defaultOpenValues={["b2"]}>
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
            <RadioGroup
              value={data.pavement_type || ""}
              onValueChange={(value) => handleRadioChange("pavement_type", value)}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A" id="pavement_A" />
                <Label htmlFor="pavement_A">
                  Pisos betuminosos (asfalto) ou cimentícios (concreto)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="B" id="pavement_B" />
                <Label htmlFor="pavement_B">Pisos modulares (blocos de concreto e similares)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="C" id="pavement_C" />
                <Label htmlFor="pavement_C">
                  Pedras irregulares (portuguesas e similares), pisos com espaçamento (vãos)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="D" id="pavement_D" />
                <Label htmlFor="pavement_D">
                  Pisos de barro; grelhas e chapas metálicas; pisos modulares soltos; pisos
                  derrapantes
                </Label>
              </div>
            </RadioGroup>
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
            <RadioGroup
              value={data.conservation_state || ""}
              onValueChange={(value) => handleRadioChange("conservation_state", value)}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A" id="conservation_A" />
                <Label htmlFor="conservation_A">Piso nivelado, sem ondulações</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="B" id="conservation_B" />
                <Label htmlFor="conservation_B">
                  Piso com leve desnivelamento, que não requeira ao ciclista frear
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="C" id="conservation_C" />
                <Label htmlFor="conservation_C">
                  Piso com desnível transversal ou buraco raso; piso com desgaste até a metade de
                  sua largura útil
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="D" id="conservation_D" />
                <Label htmlFor="conservation_D">
                  Piso com degraus / buracos profundos; pou com desgaste superior à metade da
                  largura útil
                </Label>
              </div>
            </RadioGroup>
          </AssessmentCriterionAccordion>
        </CriteriaAccordionGroup>
      </CardContent>
    </Card>
  );
};

export default Page4;
