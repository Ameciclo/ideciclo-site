import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AssessmentCriterionAccordion from "@/components/AssessmentCriterionAccordion";
import ConceptCriteriaTable from "@/components/ConceptCriteriaTable";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { IdecicloFormData } from "@/types/idecicloForm";
import { buildCriterionScorePreview } from "@/utils/criterionScorePreview";

interface Page5Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
}

const Page5: React.FC<Page5Props> = ({ data, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    onDataChange({ [name]: processedValue });
  };

  const handleRadioChange = (name: string, value: string) => {
    onDataChange({ [name]: value });
  };

  const getInfraType = () => {
    const type = data.infra_typology?.toLowerCase() || "";
    if (type.includes("ciclofaixa")) return "ciclofaixa";
    if (type.includes("ciclovia")) return "ciclovia";
    if (type.includes("ciclorrota")) return "ciclorrota";
    if (type.includes("compartilhada") || type.includes("calçada")) return "calcada";
    return "ciclofaixa";
  };

  const infraType = getInfraType();
  const isCiclorrota = infraType === "ciclorrota";
  const isCalcada = infraType === "calcada";
  const showE3 = !isCiclorrota && !isCalcada;
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
        <CriteriaAccordionGroup allValues={["b31", "e3", "b32"]} defaultOpenValues={isCiclorrota ? [] : ["b31"]}>
          {!isCiclorrota ? (
          <AssessmentCriterionAccordion
            value="b31"
            title="B.3.1. Delimitação e separação da infraestrutura"
            description="O conteúdo muda conforme a tipologia da estrutura escolhida."
            scorePreview={buildCriterionScorePreview(data, ["B3"])}
            answered={isTouched([
              "separation_devices_ciclofaixa",
              "separation_devices_ciclovia",
              "separation_devices_calcada",
            ])}
            inAnalysis={data.criterion_workflow_state?.b31 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("b31", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                separation_devices_ciclofaixa: "",
                separation_devices_ciclovia: "",
                separation_devices_calcada: "",
                touched_fields: {
                  separation_devices_ciclofaixa: false,
                  separation_devices_ciclovia: false,
                  separation_devices_calcada: false,
                },
              })
            }
            helpKey="b31"
          >
            {infraType === "ciclofaixa" && (
              <div>
                <Label className="mb-2 block">Dispositivos de separação (ciclofaixa):</Label>
                <ConceptCriteriaTable
                  value={data.separation_devices_ciclofaixa || ""}
                  onValueChange={(value) =>
                    handleRadioChange("separation_devices_ciclofaixa", value)
                  }
                  options={[
                    {
                      value: "A",
                      description:
                        "Dispositivos (tachas, tachinhas ou balizadores) distanciados até 1 m entre si.",
                    },
                    {
                      value: "B",
                      description:
                        "Dispositivos distanciados entre 1,5 e 3 m entre si; trechos com aberturas pontuais para acessar estacionamento dentro dos lotes.",
                    },
                    {
                      value: "C",
                      description:
                        "Dispositivos distanciados a mais de 3,5 metros entre si; trechos com muitas aberturas para acessar estacionamentos dentro dos lotes.",
                    },
                    {
                      value: "D",
                      description: "Não há dispositivos na infraestrutura cicloviária.",
                    },
                  ]}
                />
              </div>
            )}

            {infraType === "ciclovia" && (
              <div>
                <Label className="mb-2 block">Dispositivos de separação (ciclovia):</Label>
                <ConceptCriteriaTable
                  value={data.separation_devices_ciclovia || ""}
                  onValueChange={(value) => handleRadioChange("separation_devices_ciclovia", value)}
                  options={[
                    {
                      value: "A",
                      description:
                        "Segregação total dos veículos motorizados (segregadores, ilhas físicas e níveis diferentes).",
                    },
                    {
                      value: "B",
                      description:
                        "Segregação total, com aberturas pontuais para acessar estacionamento dentro dos lotes ao longo do trecho.",
                    },
                    {
                      value: "C",
                      description:
                        "Elementos de segregação distanciados entre si até 2 m ao longo do trecho; com aberturas pontuais para acessar estacionamento dentro dos lotes ao longo do trecho.",
                    },
                    {
                      value: "D",
                      description:
                        "Elementos de segregação com distância superior a 2,5 m entre si ao longo do trecho; com muitas aberturas para acessar estacionamentos dentro dos lotes.",
                    },
                  ]}
                />
              </div>
            )}

            {infraType === "calcada" && (
              <div>
                <Label className="mb-2 block">Dispositivos de separação (calçada compartilhada):</Label>
                <ConceptCriteriaTable
                  value={data.separation_devices_calcada || ""}
                  onValueChange={(value) => handleRadioChange("separation_devices_calcada", value)}
                  options={[
                    {
                      value: "A",
                      description:
                        "Demarcação clara no piso que diferencia os espaços de circulação dos ciclistas, separado dos pedestres, com o uso de diferentes pavimentos.",
                    },
                    {
                      value: "B",
                      description:
                        "Demarcação dos espaços de pedestres e ciclistas em áreas separadas sobre um mesmo tipo de pavimento, por sinalização horizontal vermelha, marcas horizontais e pictogramas.",
                    },
                    {
                      value: "C",
                      description:
                        "Demarcação apenas com marca/linha horizontal ao longo do trecho; (ou) apenas pictogramas orientando fluxos de circulação.",
                    },
                    {
                      value: "D",
                      description:
                        "Não há delimitação ou diferenciação dos espaços de ciclistas e de pedestres.",
                    },
                  ]}
                />
              </div>
            )}
          </AssessmentCriterionAccordion>
          ) : null}

          {showE3 ? (
            <AssessmentCriterionAccordion
              value="e3"
              title="E.3. Estado de conservação dos dispositivos de separação"
              description="Avalia permanência e estado dos elementos de segregação ou separação."
              scorePreview={buildCriterionScorePreview(data, ["E3"])}
              answered={isTouched(["devices_conservation"])}
              inAnalysis={data.criterion_workflow_state?.e3 === "analysis"}
              onAnalysisChange={(value) => updateWorkflow("e3", value ? "analysis" : "default")}
              onClear={() =>
                onDataChange({
                  devices_conservation: "",
                  touched_fields: { devices_conservation: false },
                })
              }
              helpKey="E3"
            >
              <Label className="mb-2 block">
                Estado de conservação dos dispositivos de segregação ou separação:
              </Label>
              <ConceptCriteriaTable
                value={data.devices_conservation || ""}
                onValueChange={(value) => handleRadioChange("devices_conservation", value)}
                options={[
                  {
                    value: "A",
                    description:
                      "Há dispositivos de separação ou segregação em todo o trecho, visível em toda a extensão.",
                  },
                  {
                    value: "B",
                    description:
                      "Dispositivos em mais da metade do trecho em bom estado de conservação.",
                  },
                  {
                    value: "C",
                    description:
                      "Dispositivos em menos da metade do trecho ou estão muito danificados.",
                  },
                  {
                    value: "D",
                    description: "Praticamente não há dispositivos.",
                  },
                ]}
              />
            </AssessmentCriterionAccordion>
          ) : null}

          {(infraType === "ciclofaixa" || infraType === "ciclovia") && (
            <AssessmentCriterionAccordion
              value="b32"
              title="B.3.2. Afastamento lateral do fluxo veicular"
              description="Usado para estruturas segregadas ou separadas em relação ao tráfego motorizado."
              scorePreview={buildCriterionScorePreview(data, ["B3"])}
              answered={isTouched([
                "lateral_spacing_type",
                "lateral_spacing_width_m",
                "spacing_conservation",
              ])}
              inAnalysis={data.criterion_workflow_state?.b32 === "analysis"}
              onAnalysisChange={(value) =>
                updateWorkflow("b32", value ? "analysis" : "default")
              }
              onClear={() =>
                onDataChange({
                  lateral_spacing_type: "",
                  lateral_spacing_width_m: 0,
                  spacing_conservation: "",
                  touched_fields: {
                    lateral_spacing_type: false,
                    lateral_spacing_width_m: false,
                    spacing_conservation: false,
                  },
                })
              }
              helpKey="b32"
            >
              <div className="space-y-4">
                <div>
                  <Label>Afastamento:</Label>
                  <RadioGroup
                    value={data.lateral_spacing_type || ""}
                    onValueChange={(value) => handleRadioChange("lateral_spacing_type", value)}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="linha" id="spacing_linha" />
                      <Label htmlFor="spacing_linha">Somente linha de delimitação</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dispositivos" id="spacing_dispositivos" />
                      <Label htmlFor="spacing_dispositivos">
                        Existência de dispositivos de separação ou segregação
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="apagada" id="spacing_apagada" />
                      <Label htmlFor="spacing_apagada">Pintura apagada ou impossível avaliar</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="lateral_spacing_width_m">Largura do afastamento lateral (m):</Label>
                  <Input
                    id="lateral_spacing_width_m"
                    name="lateral_spacing_width_m"
                    type="number"
                    step="0.1"
                    value={data.lateral_spacing_width_m || ""}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label>Estado de conservação do afastamento lateral:</Label>
                  <ConceptCriteriaTable
                    value={data.spacing_conservation || ""}
                    onValueChange={(value) => handleRadioChange("spacing_conservation", value)}
                    options={[
                      {
                        value: "A",
                        description: "Há demarcação em ótimo estado, visível em toda a extensão.",
                      },
                      {
                        value: "B",
                        description:
                          "Há demarcação em bom estado em mais da metade do trecho.",
                      },
                      {
                        value: "C",
                        description:
                          "Há demarcação em menos da metade do trecho ou está muito danificada.",
                      },
                      {
                        value: "D",
                        description: "Praticamente inexiste.",
                      },
                    ]}
                  />
                </div>
              </div>
            </AssessmentCriterionAccordion>
          )}
        </CriteriaAccordionGroup>
      </CardContent>
    </Card>
  );
};

export default Page5;
