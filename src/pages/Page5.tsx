import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AssessmentCriterionAccordion from "@/components/AssessmentCriterionAccordion";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { IdecicloFormData } from "@/types/idecicloForm";

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
    if (type.includes("compartilhada") || type.includes("calçada")) return "calcada";
    return "ciclofaixa";
  };

  const infraType = getInfraType();
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
        <CriteriaAccordionGroup allValues={["b31", "e3", "b32"]} defaultOpenValues={["b31"]}>
          <AssessmentCriterionAccordion
            value="b31"
            title="B.3.1. Delimitação e separação da infraestrutura"
            description="O conteúdo muda conforme a tipologia da estrutura escolhida."
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
                <RadioGroup
                  value={data.separation_devices_ciclofaixa || ""}
                  onValueChange={(value) =>
                    handleRadioChange("separation_devices_ciclofaixa", value)
                  }
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="ciclofaixa_A" />
                    <Label htmlFor="ciclofaixa_A">
                      Dispositivos (tachas, tachinhas ou balizadores) distanciados até 1 m entre si.
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="ciclofaixa_B" />
                    <Label htmlFor="ciclofaixa_B">
                      Dispositivos distanciados entre 1,5 e 3 m entre si; trechos com aberturas
                      pontuais para acessar estacionamento dentro dos lotes.
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="C" id="ciclofaixa_C" />
                    <Label htmlFor="ciclofaixa_C">
                      Dispositivos distanciados a mais de 3,5 metros entre si; trechos com muitas
                      aberturas para acessar estacionamentos dentro dos lotes.
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="D" id="ciclofaixa_D" />
                    <Label htmlFor="ciclofaixa_D">
                      Não há dispositivos na infraestrutura cicloviária.
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {infraType === "ciclovia" && (
              <div>
                <Label className="mb-2 block">Dispositivos de separação (ciclovia):</Label>
                <RadioGroup
                  value={data.separation_devices_ciclovia || ""}
                  onValueChange={(value) => handleRadioChange("separation_devices_ciclovia", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="ciclovia_A" />
                    <Label htmlFor="ciclovia_A">
                      Segregação total dos veículos motorizados (segregadores, ilhas físicas e níveis
                      diferentes)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="ciclovia_B" />
                    <Label htmlFor="ciclovia_B">
                      Segregação total, com aberturas pontuais para acessar estacionamento dentro dos
                      lotes ao longo do trecho.
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="C" id="ciclovia_C" />
                    <Label htmlFor="ciclovia_C">
                      Elementos de segregação distanciados entre si até 2 m ao longo do trecho; com
                      aberturas pontuais para acessar estacionamento dentro dos lotes ao longo do
                      trecho.
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="D" id="ciclovia_D" />
                    <Label htmlFor="ciclovia_D">
                      Elementos de segregação com distância superior a 2,5 m entre si ao longo do
                      trecho; com muitas aberturas para acessar estacionamentos dentro dos lotes.
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {infraType === "calcada" && (
              <div>
                <Label className="mb-2 block">Dispositivos de separação (calçada compartilhada):</Label>
                <RadioGroup
                  value={data.separation_devices_calcada || ""}
                  onValueChange={(value) => handleRadioChange("separation_devices_calcada", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="calcada_A" />
                    <Label htmlFor="calcada_A">
                      Demarcação clara no piso que diferencia os espaços de circulação dos ciclistas,
                      separado dos pedestres, com o uso de diferentes pavimentos.
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="calcada_B" />
                    <Label htmlFor="calcada_B">
                      Demarcação dos espaços de pedestres e ciclistas em áreas separadas sobre um
                      mesmo tipo de pavimento, por sinalização horizontal vermelha, marcas horizontais
                      e pictogramas.
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="C" id="calcada_C" />
                    <Label htmlFor="calcada_C">
                      Demarcação apenas com marca/linha horizontal ao longo do trecho; (ou) apenas
                      pictogramas orientando fluxos de circulação.
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="D" id="calcada_D" />
                    <Label htmlFor="calcada_D">
                      Não há delimitação ou diferenciação dos espaços de ciclistas e de pedestres.
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </AssessmentCriterionAccordion>

          <AssessmentCriterionAccordion
            value="e3"
            title="E.3. Estado de conservação dos dispositivos de separação"
            description="Avalia permanência e estado dos elementos de segregação ou separação."
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
            <RadioGroup
              value={data.devices_conservation || ""}
              onValueChange={(value) => handleRadioChange("devices_conservation", value)}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A" id="devices_A" />
                <Label htmlFor="devices_A">
                  Há dispositivos de separação ou segregação em todo o trecho, visível em toda a
                  extensão.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="B" id="devices_B" />
                <Label htmlFor="devices_B">
                  Dispositivos em mais da metade do trecho em bom estado de conservação.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="C" id="devices_C" />
                <Label htmlFor="devices_C">
                  Dispositivos em menos da metade do trecho ou estão muito danificados.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="D" id="devices_D" />
                <Label htmlFor="devices_D">Praticamente não há dispositivos.</Label>
              </div>
            </RadioGroup>
          </AssessmentCriterionAccordion>

          {(infraType === "ciclofaixa" || infraType === "ciclovia") && (
            <AssessmentCriterionAccordion
              value="b32"
              title="B.3.2. Afastamento lateral do fluxo veicular"
              description="Usado para estruturas segregadas ou separadas em relação ao tráfego motorizado."
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
                  <RadioGroup
                    value={data.spacing_conservation || ""}
                    onValueChange={(value) => handleRadioChange("spacing_conservation", value)}
                    className="grid grid-cols-1 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="A" id="spacing_A" />
                      <Label htmlFor="spacing_A">
                        Há demarcação em ótimo estado, visível em toda a extensão.
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="B" id="spacing_B" />
                      <Label htmlFor="spacing_B">
                        Há demarcação em bom estado em mais da metade do trecho.
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="C" id="spacing_C" />
                      <Label htmlFor="spacing_C">
                        Há demarcação em menos da metade do trecho ou está muito danificada.
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="D" id="spacing_D" />
                      <Label htmlFor="spacing_D">Praticamente inexiste</Label>
                    </div>
                  </RadioGroup>
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
