import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import AssessmentCriterionAccordion from "@/components/AssessmentCriterionAccordion";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { IdecicloFormData } from "@/types/idecicloForm";

interface Page6Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
}

const Page6: React.FC<Page6Props> = ({ data, onDataChange }) => {
  const handleRadioChange = (name: string, value: string | boolean | number) => {
    onDataChange({ [name]: value });
  };

  const getInfraType = () => {
    const type = data.infra_typology?.toLowerCase() || "";
    if (type.includes("ciclofaixa")) return "ciclofaixa";
    if (type.includes("ciclovia")) return "ciclovia";
    if (type.includes("ciclorrota")) return "ciclorrota";
    if (type.includes("compartilhada")) return "compartilhada";
    return "ciclofaixa";
  };

  const infraType = getInfraType();
  const isCiclorrota = infraType === "ciclorrota";
  const isCicloviaOrCiclofaixa = infraType === "ciclovia" || infraType === "ciclofaixa";
  const isTouched = (fields: string[]) => fields.some((field) => data.touched_fields?.[field]);
  const updateWorkflow = (criterion: string, value: "default" | "analysis" | "review") =>
    onDataChange({
      criterion_workflow_state: {
        ...(data.criterion_workflow_state || {}),
        [criterion]: value,
      },
    });

  return (
    <Card>
      <CardContent className="pt-6">
        <CriteriaAccordionGroup
          allValues={["b41", "e41", "b42", "b43"]}
          defaultOpenValues={["b41"]}
        >
          <AssessmentCriterionAccordion
            value="b41"
            title="B.4.1. Identificação do espaço de circulação de bicicletas"
            description="Pintura, contraste e reconhecimento visual do espaço cicloviário."
            answered={isTouched(["space_identification"])}
            workflowState={data.criterion_workflow_state?.b41}
            onWorkflowStateChange={(value) => updateWorkflow("b41", value)}
            onClear={() => onDataChange({ space_identification: "", touched_fields: { space_identification: false } })}
          >
            <RadioGroup
              value={data.space_identification || ""}
              onValueChange={(value) => handleRadioChange("space_identification", value)}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A" id="id_A" />
                <Label htmlFor="id_A">
                  Pavimento ou pintura total em tom vermelho ou ao menos nas aproximações de
                  travessias de pedestres e áreas de conflito com outros modos.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="B" id="id_B" />
                <Label htmlFor="id_B">
                  Faixa de contraste nos dois bordos da infraestrutura cicloviária em toda a
                  extensão.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="C" id="id_C" />
                <Label htmlFor="id_C">
                  Faixa de contraste vermelha em apenas um dos bordos da infraestrutura cicloviária.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="D" id="id_D" />
                <Label htmlFor="id_D">
                  Não há pintura de contraste (vermelha) ou a pintura está muito danificada.
                </Label>
              </div>
            </RadioGroup>
          </AssessmentCriterionAccordion>

          <AssessmentCriterionAccordion
            value="e41"
            title="E.4.1. Estado de conservação da identificação do espaço cicloviário"
            description="Avalia desgaste e permanência da sinalização horizontal principal."
            answered={isTouched(["identification_conservation"])}
            workflowState={data.criterion_workflow_state?.e41}
            onWorkflowStateChange={(value) => updateWorkflow("e41", value)}
            onClear={() =>
              onDataChange({
                identification_conservation: "",
                touched_fields: { identification_conservation: false },
              })
            }
          >
            <RadioGroup
              value={data.identification_conservation || ""}
              onValueChange={(value) => handleRadioChange("identification_conservation", value)}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A" id="cons_A" />
                <Label htmlFor="cons_A">
                  Preenchimento total da área útil em tom vermelho (pavimento pigmentado ou
                  pintura).
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="B" id="cons_B" />
                <Label htmlFor="cons_B">
                  Identificação de mais da metade da infraestrutura ou ao menos nas aproximações de
                  travessias de pedestres e área de conflito com outros modos.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="C" id="cons_C" />
                <Label htmlFor="cons_C">
                  Há sinalização identificação em menos da metade do trecho da infraestrutura
                  cicloviária ou está muito danificada.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="D" id="cons_D" />
                <Label htmlFor="cons_D">Praticamente apagada.</Label>
              </div>
            </RadioGroup>
          </AssessmentCriterionAccordion>

          {isCiclorrota && (
            <AssessmentCriterionAccordion
              value="b42"
              title="B.4.2. Inscrições no pavimento - pictogramas"
              description="Critério específico para ciclorrotas."
              answered={isTouched([
                "pictograms_per_block",
                "pictograms_cover_all_blocks",
                "pictograms_conservation",
              ])}
              workflowState={data.criterion_workflow_state?.b42}
              onWorkflowStateChange={(value) => updateWorkflow("b42", value)}
              onClear={() =>
                onDataChange({
                  pictograms_per_block: 0,
                  pictograms_cover_all_blocks: false,
                  pictograms_conservation: "",
                  touched_fields: {
                    pictograms_per_block: false,
                    pictograms_cover_all_blocks: false,
                    pictograms_conservation: false,
                  },
                })
              }
            >
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">N° de pictogramas por quadra:</Label>
                  <RadioGroup
                    value={data.pictograms_per_block?.toString() || "0"}
                    onValueChange={(value) =>
                      handleRadioChange("pictograms_per_block", parseInt(value, 10))
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="picto_0" />
                      <Label htmlFor="picto_0">0</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="picto_1" />
                      <Label htmlFor="picto_1">1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="picto_2" />
                      <Label htmlFor="picto_2">2</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pictograms_cover_all_blocks"
                    checked={data.pictograms_cover_all_blocks || false}
                    onCheckedChange={(checked) =>
                      handleRadioChange("pictograms_cover_all_blocks", !!checked)
                    }
                  />
                  <Label htmlFor="pictograms_cover_all_blocks">
                    Os pictogramas aparecem em todas as quadras do trecho
                  </Label>
                </div>

                <div>
                  <Label className="mb-2 block">Estado de conservação dos pictogramas:</Label>
                  <RadioGroup
                    value={data.pictograms_conservation || ""}
                    onValueChange={(value) => handleRadioChange("pictograms_conservation", value)}
                    className="grid grid-cols-1 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="A" id="picto_A" />
                      <Label htmlFor="picto_A">Pictogramas visíveis em toda a extensão.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="B" id="picto_B" />
                      <Label htmlFor="picto_B">Pictogramas desgastados em toda a extensão.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="C" id="picto_C" />
                      <Label htmlFor="picto_C">
                        Há sinalização em menos da metade do trecho da infraestrutura cicloviária ou
                        está muito danificada.
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="D" id="picto_D" />
                      <Label htmlFor="picto_D">Praticamente apagados ou não há.</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </AssessmentCriterionAccordion>
          )}

          <AssessmentCriterionAccordion
            value="b43"
            title="B.4.3. Sinalização vertical de regulamentação"
            description={
              isCicloviaOrCiclofaixa
                ? "Aplicado a ciclovias e ciclofaixas."
                : "Aplicado a ciclorrotas e calçadas partilhadas."
            }
            answered={isTouched([
              "regulation_signs_per_block",
              "signs_both_directions",
              "vertical_signs_conservation",
            ])}
            workflowState={data.criterion_workflow_state?.b43}
            onWorkflowStateChange={(value) => updateWorkflow("b43", value)}
            onClear={() =>
              onDataChange({
                regulation_signs_per_block: 0,
                signs_both_directions: null,
                vertical_signs_conservation: "",
                touched_fields: {
                  regulation_signs_per_block: false,
                  signs_both_directions: false,
                  vertical_signs_conservation: false,
                },
              })
            }
          >
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">N° de placas por quadra:</Label>
                <RadioGroup
                  value={data.regulation_signs_per_block?.toString() || "0"}
                  onValueChange={(value) =>
                    handleRadioChange("regulation_signs_per_block", parseInt(value, 10))
                  }
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="signs_0" />
                    <Label htmlFor="signs_0">0</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="signs_1" />
                    <Label htmlFor="signs_1">1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="signs_2" />
                    <Label htmlFor="signs_2">2 ou mais</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">Placas nos dois sentidos:</Label>
                <RadioGroup
                  value={
                    data.signs_both_directions === null
                      ? ""
                      : data.signs_both_directions
                        ? "true"
                        : "false"
                  }
                  onValueChange={(value) =>
                    handleRadioChange("signs_both_directions", value === "true")
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="signs_both_yes" />
                    <Label htmlFor="signs_both_yes">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="signs_both_no" />
                    <Label htmlFor="signs_both_no">Não</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">Estado de conservação da sinalização vertical:</Label>
                <RadioGroup
                  value={data.vertical_signs_conservation || ""}
                  onValueChange={(value) => handleRadioChange("vertical_signs_conservation", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="signs_A" />
                    <Label htmlFor="signs_A">Placas e postes em bom estado de conservação.</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="signs_B" />
                    <Label htmlFor="signs_B">
                      Menos da metade das placas com danos (sujeira, soltas, outras).
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="C" id="signs_C" />
                    <Label htmlFor="signs_C">Placas bastante danificadas ao longo do trecho.</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="D" id="signs_D" />
                    <Label htmlFor="signs_D">Não há placas no trecho.</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </AssessmentCriterionAccordion>
        </CriteriaAccordionGroup>
      </CardContent>
    </Card>
  );
};

export default Page6;
