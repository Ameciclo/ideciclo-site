import React from "react";
import { Label } from "@/components/ui/label";
import AssessmentCriterionAccordion from "@/components/AssessmentCriterionAccordion";
import ConceptCriteriaTable from "@/components/ConceptCriteriaTable";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { CriterionFilter } from "@/components/criteriaAccordionContext";
import { IdecicloFormData } from "@/types/idecicloForm";
import { buildCriterionScorePreview } from "@/utils/criterionScorePreview";

interface Page5Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  filter?: CriterionFilter;
  command?: { type: "expand" | "collapse"; nonce: number } | null;
}

const Page5: React.FC<Page5Props> = ({ data, onDataChange, filter, command }) => {
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
    <CriteriaAccordionGroup allValues={["b31", "e3"]} defaultOpenValues={isCiclorrota ? [] : ["b31"]} filter={filter} command={command}>
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
            <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              O conceito final de B.3 e calculado internamente a partir desta resposta e do buffer
              lateral informado em B.1. Para calçada partilhada, B.3 equivale diretamente a B.3.1.
            </div>

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
              title="E.3. Conservação dos elementos de delimitação"
              description="Aplicável a ciclovias e ciclofaixas, com resultado final calculado por matriz entre E.3.1 e E.3.2."
              scorePreview={buildCriterionScorePreview(data, ["E3"])}
              answered={isTouched(["devices_conservation", "spacing_conservation"])}
              inAnalysis={data.criterion_workflow_state?.e3 === "analysis"}
              onAnalysisChange={(value) => updateWorkflow("e3", value ? "analysis" : "default")}
              onClear={() =>
                onDataChange({
                  devices_conservation: "",
                  spacing_conservation: "",
                  touched_fields: {
                    devices_conservation: false,
                    spacing_conservation: false,
                  },
                })
              }
              helpKey="E3"
            >
              <div className="space-y-6">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  O conceito final de <strong>E.3</strong> e calculado pela combinacao entre
                  <strong> E.3.1</strong> e <strong>E.3.2</strong>.
                </div>

                <div>
                  <Label className="mb-2 block">
                    E.3.1. Estado de conservação dos dispositivos de separação
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
                </div>

                <div>
                  <Label className="mb-2 block">
                    E.3.2. Estado de conservação da faixa de afastamento lateral
                  </Label>
                  <ConceptCriteriaTable
                    value={data.spacing_conservation || ""}
                    onValueChange={(value) => handleRadioChange("spacing_conservation", value)}
                    options={[
                      {
                        value: "A",
                        description:
                          "Há demarcação em ótimo estado, visível em toda a extensão.",
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
          ) : null}
        </CriteriaAccordionGroup>
  );
};

export default Page5;
