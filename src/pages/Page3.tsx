import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import AssessmentCriterionAccordion from "@/components/AssessmentCriterionAccordion";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { IdecicloFormData } from "@/types/idecicloForm";

interface Page3Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
}

const Page3: React.FC<Page3Props> = ({ data, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    onDataChange({ [name]: processedValue });
  };

  const handleRadioChange = (name: string, value: boolean) => {
    onDataChange({ [name]: value });
  };

  const handleCheckboxChange = (measure: string, checked: boolean) => {
    const currentMeasures = [...(data.speed_measures || [])];
    if (checked) {
      if (!currentMeasures.includes(measure)) {
        currentMeasures.push(measure);
      }
    } else {
      const index = currentMeasures.indexOf(measure);
      if (index !== -1) {
        currentMeasures.splice(index, 1);
      }
    }
    onDataChange({ speed_measures: currentMeasures });
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
        <CriteriaAccordionGroup allValues={["b11", "b12"]} defaultOpenValues={["b11"]}>
          <AssessmentCriterionAccordion
            value="b11"
            title="B.1.1. Largura da infraestrutura cicloviária"
            description="Permite informar a largura medida para cálculo automático do conceito."
            answered={isTouched(["width_meters", "includes_gutter"])}
            inAnalysis={data.criterion_workflow_state?.b11 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("b11", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                width_meters: 0,
                includes_gutter: false,
                touched_fields: { width_meters: false, includes_gutter: false },
              })
            }
            helpKey="B1"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="width_meters">Largura em metros:</Label>
                <Input
                  id="width_meters"
                  name="width_meters"
                  type="number"
                  step="0.1"
                  value={data.width_meters || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Inclui sarjeta:</Label>
                <RadioGroup
                  value={data.includes_gutter ? "true" : "false"}
                  onValueChange={(value) => handleRadioChange("includes_gutter", value === "true")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="gutter_yes" />
                    <Label htmlFor="gutter_yes">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="gutter_no" />
                    <Label htmlFor="gutter_no">Não</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </AssessmentCriterionAccordion>

          <AssessmentCriterionAccordion
            value="b12"
            title="B.1.2. Medidas de moderação de velocidade"
            description="Aplicável especialmente a ciclorrotas, com seleção de medidas e distância média entre elas."
            answered={isTouched(["speed_measures", "avg_distance_measures_m"])}
            inAnalysis={data.criterion_workflow_state?.b12 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("b12", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                speed_measures: [],
                avg_distance_measures_m: 0,
                touched_fields: { speed_measures: false, avg_distance_measures_m: false },
              })
            }
            helpKey="B6"
          >
            <div className="space-y-4">
              <div>
                <Label>Medidas:</Label>
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lombada"
                      checked={(data.speed_measures || []).includes("lombada")}
                      onCheckedChange={(checked) => handleCheckboxChange("lombada", !!checked)}
                    />
                    <Label htmlFor="lombada">Lombada, quebra-molas, ondulações transv.</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="valas"
                      checked={(data.speed_measures || []).includes("valas")}
                      onCheckedChange={(checked) => handleCheckboxChange("valas", !!checked)}
                    />
                    <Label htmlFor="valas">Valas transversais</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="faixa_elevada"
                      checked={(data.speed_measures || []).includes("faixa_elevada")}
                      onCheckedChange={(checked) => handleCheckboxChange("faixa_elevada", !!checked)}
                    />
                    <Label htmlFor="faixa_elevada">Faixa de travessia elevada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="elevacao_intersecao"
                      checked={(data.speed_measures || []).includes("elevacao_intersecao")}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("elevacao_intersecao", !!checked)
                      }
                    />
                    <Label htmlFor="elevacao_intersecao">Elevação da interseção viária</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reducao_largura"
                      checked={(data.speed_measures || []).includes("reducao_largura")}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("reducao_largura", !!checked)
                      }
                    />
                    <Label htmlFor="reducao_largura">Redução das larguras das faixas</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="avg_distance_measures_m">Distância média entre medidas (m):</Label>
                <Input
                  id="avg_distance_measures_m"
                  name="avg_distance_measures_m"
                  type="number"
                  value={data.avg_distance_measures_m || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </AssessmentCriterionAccordion>
        </CriteriaAccordionGroup>
      </CardContent>
    </Card>
  );
};

export default Page3;
