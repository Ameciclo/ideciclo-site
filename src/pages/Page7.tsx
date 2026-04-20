import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import AssessmentCriterionAccordion from "@/components/AssessmentCriterionAccordion";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { IdecicloFormData } from "@/types/idecicloForm";

interface Page7Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
}

const Page7: React.FC<Page7Props> = ({ data, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    onDataChange({ [name]: processedValue });
  };

  const handleRadioChange = (name: string, value: string | boolean | number) => {
    onDataChange({ [name]: value });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    onDataChange({ [name]: checked });
  };

  const handleConflictCheckboxChange = (conflict: string, checked: boolean) => {
    const currentConflicts = [...(data.motorized_conflicts || [])];
    if (checked) {
      if (!currentConflicts.includes(conflict)) {
        currentConflicts.push(conflict);
      }
    } else {
      const index = currentConflicts.indexOf(conflict);
      if (index !== -1) {
        currentConflicts.splice(index, 1);
      }
    }
    onDataChange({ motorized_conflicts: currentConflicts });
  };
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
          allValues={["b5", "b7", "c1e1", "c2", "c3"]}
          defaultOpenValues={["b5"]}
        >
          <AssessmentCriterionAccordion
            value="b5"
            title="B.5. Acessibilidade relativa ao uso do solo lindeiro"
            description="Considera travessias e permeabilidade do trecho frente aos usos do entorno."
            answered={isTouched(["traffic_lanes_count", "signalized_crossings_per_block"])}
            workflowState={data.criterion_workflow_state?.b5}
            onWorkflowStateChange={(value) => updateWorkflow("b5", value)}
            onClear={() =>
              onDataChange({
                traffic_lanes_count: 0,
                signalized_crossings_per_block: 0,
                touched_fields: {
                  traffic_lanes_count: false,
                  signalized_crossings_per_block: false,
                },
              })
            }
          >
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">N° de faixas de rolamento:</Label>
                <RadioGroup
                  value={data.traffic_lanes_count?.toString() || "2"}
                  onValueChange={(value) =>
                    handleRadioChange("traffic_lanes_count", parseInt(value, 10))
                  }
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="lanes_1" />
                    <Label htmlFor="lanes_1">1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="lanes_2" />
                    <Label htmlFor="lanes_2">2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="lanes_3" />
                    <Label htmlFor="lanes_3">3</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="lanes_4" />
                    <Label htmlFor="lanes_4">4</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="lanes_5" />
                    <Label htmlFor="lanes_5">5</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6" id="lanes_6" />
                    <Label htmlFor="lanes_6">6 ou mais</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">N° de travessias sinalizadas na quadra:</Label>
                <RadioGroup
                  value={data.signalized_crossings_per_block?.toString() || "0"}
                  onValueChange={(value) =>
                    handleRadioChange("signalized_crossings_per_block", parseInt(value, 10))
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="crossings_0" />
                    <Label htmlFor="crossings_0">Não há</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="crossings_1" />
                    <Label htmlFor="crossings_1">1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="crossings_2" />
                    <Label htmlFor="crossings_2">2 ou mais</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </AssessmentCriterionAccordion>

          <AssessmentCriterionAccordion
            value="b7"
            title="B.7. Situações de risco ao longo da infraestrutura"
            description="Marque ocorrências que representem conflito, obstáculo ou descontinuidade."
            answered={isTouched([
              "bus_school_conflict",
              "horizontal_obstacles",
              "vertical_obstacles",
              "side_change_mid_block",
              "opposite_flow_direction",
            ])}
            workflowState={data.criterion_workflow_state?.b7}
            onWorkflowStateChange={(value) => updateWorkflow("b7", value)}
            onClear={() =>
              onDataChange({
                bus_school_conflict: false,
                horizontal_obstacles: false,
                vertical_obstacles: false,
                side_change_mid_block: false,
                opposite_flow_direction: false,
                touched_fields: {
                  bus_school_conflict: false,
                  horizontal_obstacles: false,
                  vertical_obstacles: false,
                  side_change_mid_block: false,
                  opposite_flow_direction: false,
                },
              })
            }
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bus_school_conflict"
                  checked={data.bus_school_conflict || false}
                  onCheckedChange={(checked) => handleCheckboxChange("bus_school_conflict", !!checked)}
                />
                <Label htmlFor="bus_school_conflict">Conflito com paire ônibus ou paire escola</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="horizontal_obstacles"
                  checked={data.horizontal_obstacles || false}
                  onCheckedChange={(checked) => handleCheckboxChange("horizontal_obstacles", !!checked)}
                />
                <Label htmlFor="horizontal_obstacles">Obstáculos horizontais no trecho</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vertical_obstacles"
                  checked={data.vertical_obstacles || false}
                  onCheckedChange={(checked) => handleCheckboxChange("vertical_obstacles", !!checked)}
                />
                <Label htmlFor="vertical_obstacles">Obstáculos verticais no trecho</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="side_change_mid_block"
                  checked={data.side_change_mid_block || false}
                  onCheckedChange={(checked) => handleCheckboxChange("side_change_mid_block", !!checked)}
                />
                <Label htmlFor="side_change_mid_block">
                  Mudança de lado da infraestrutura no meio da quadra
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="opposite_flow_direction"
                  checked={data.opposite_flow_direction || false}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("opposite_flow_direction", !!checked)
                  }
                />
                <Label htmlFor="opposite_flow_direction">
                  Sentido de circulação da infraestrutura contrário ao fluxo veicular
                </Label>
              </div>
            </div>
          </AssessmentCriterionAccordion>

          <AssessmentCriterionAccordion
            value="c1e1"
            title="C.1 / E.1. Sinalização horizontal cicloviária nas interseções"
            description="Combina presença da sinalização nas interseções e seu estado de conservação."
            answered={isTouched(["intersection_signaling", "intersection_conservation"])}
            workflowState={data.criterion_workflow_state?.c1e1}
            onWorkflowStateChange={(value) => updateWorkflow("c1e1", value)}
            onClear={() =>
              onDataChange({
                intersection_signaling: "",
                intersection_conservation: "",
                touched_fields: {
                  intersection_signaling: false,
                  intersection_conservation: false,
                },
              })
            }
          >
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Sinalização:</Label>
                <RadioGroup
                  value={data.intersection_signaling || ""}
                  onValueChange={(value) => handleRadioChange("intersection_signaling", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="int_A" />
                    <Label htmlFor="int_A">
                      Interseção apresenta pavimento vermelho na largura da infra e linhas
                      tracejadas brancas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="int_B" />
                    <Label htmlFor="int_B">
                      Pavimento em tom vermelho estreito ou pavimento vermelho sem linhas tracejadas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="C" id="int_C" />
                    <Label htmlFor="int_C">Só linhas tracejadadas ou só pictogramas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="D" id="int_D" />
                    <Label htmlFor="int_D">Nenhuma sinalização</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">Estado de conservação da sinalização horizontal:</Label>
                <RadioGroup
                  value={data.intersection_conservation || ""}
                  onValueChange={(value) => handleRadioChange("intersection_conservation", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="int_cons_A" />
                    <Label htmlFor="int_cons_A">
                      Há sinalização em todas as interseções do trecho, visível em toda a extensão
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="int_cons_B" />
                    <Label htmlFor="int_cons_B">
                      Há sinalização em mais da metade das interseções e em bom estado
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="C" id="int_cons_C" />
                    <Label htmlFor="int_cons_C">
                      Há sinalização em menos da metade das interseções ou ela está muito danificada
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="D" id="int_cons_D" />
                    <Label htmlFor="int_cons_D">Praticamente apagada</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </AssessmentCriterionAccordion>

          <AssessmentCriterionAccordion
            value="c2"
            title="C.2. Acessibilidade entre conexões cicloviárias"
            description="Indica se a ligação com outras estruturas é visível e pedalável."
            answered={isTouched(["connection_accessibility"])}
            workflowState={data.criterion_workflow_state?.c2}
            onWorkflowStateChange={(value) => updateWorkflow("c2", value)}
            onClear={() =>
              onDataChange({
                connection_accessibility: "",
                touched_fields: { connection_accessibility: false },
              })
            }
          >
            <RadioGroup
              value={data.connection_accessibility || ""}
              onValueChange={(value) => handleRadioChange("connection_accessibility", value)}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A" id="conn_A" />
                <Label htmlFor="conn_A">
                  A conexão é visível e tem acessibilidade física, com rampa pedalável quando há
                  desnível
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="D" id="conn_D" />
                <Label htmlFor="conn_D">
                  A conexão não é visível, não existe ou depende apenas de escadas/transposição ruim
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NA" id="conn_NA" />
                <Label htmlFor="conn_NA">Não se aplica, porque o trecho não possui conexão</Label>
              </div>
            </RadioGroup>
          </AssessmentCriterionAccordion>

          <AssessmentCriterionAccordion
            value="c3"
            title="C.3. Conflitos com circulação de modos motorizados"
            description="Marque os elementos presentes para caracterizar o tratamento do conflito."
            answered={isTouched([
              "motorized_conflicts",
              "traffic_lanes_per_direction",
              "mixed_lane_width_m",
              "has_intersection_traffic_calming",
            ])}
            workflowState={data.criterion_workflow_state?.c3}
            onWorkflowStateChange={(value) => updateWorkflow("c3", value)}
            onClear={() =>
              onDataChange({
                motorized_conflicts: [],
                traffic_lanes_per_direction: 1,
                mixed_lane_width_m: 2.7,
                has_intersection_traffic_calming: false,
                touched_fields: {
                  motorized_conflicts: false,
                  traffic_lanes_per_direction: false,
                  mixed_lane_width_m: false,
                  has_intersection_traffic_calming: false,
                },
              })
            }
          >
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conflict_no_conversion"
                  checked={(data.motorized_conflicts || []).includes("no_conversion")}
                  onCheckedChange={(checked) =>
                    handleConflictCheckboxChange("no_conversion", !!checked)
                  }
                />
                <Label htmlFor="conflict_no_conversion">
                  Não há conversão de modos motorizados sobre a infraestrutura cicloviária.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conflict_conversion"
                  checked={(data.motorized_conflicts || []).includes("conversion")}
                  onCheckedChange={(checked) =>
                    handleConflictCheckboxChange("conversion", !!checked)
                  }
                />
                <Label htmlFor="conflict_conversion">
                  Há conversão de modos motorizados sobre a infraestrutura cicloviária.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conflict_exclusive_signal"
                  checked={(data.motorized_conflicts || []).includes("exclusive_signal")}
                  onCheckedChange={(checked) =>
                    handleConflictCheckboxChange("exclusive_signal", !!checked)
                  }
                />
                <Label htmlFor="conflict_exclusive_signal">
                  Há estágio semafórico com tempo exclusivo para ciclistas.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conflict_protection"
                  checked={(data.motorized_conflicts || []).includes("protection")}
                  onCheckedChange={(checked) =>
                    handleConflictCheckboxChange("protection", !!checked)
                  }
                />
                <Label htmlFor="conflict_protection">
                  Há medidas de proteção para os ciclistas nas esquinas.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conflict_pedestrian_signal"
                  checked={(data.motorized_conflicts || []).includes("pedestrian_signal")}
                  onCheckedChange={(checked) =>
                    handleConflictCheckboxChange("pedestrian_signal", !!checked)
                  }
                />
                <Label htmlFor="conflict_pedestrian_signal">
                  Há estágio semafórico de pedestres, que possibilita a circulação conjunta.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conflict_traffic_calming"
                  checked={(data.motorized_conflicts || []).includes("traffic_calming")}
                  onCheckedChange={(checked) =>
                    handleConflictCheckboxChange("traffic_calming", !!checked)
                  }
                />
                <Label htmlFor="conflict_traffic_calming">
                  Há medidas de acalmamento de tráfego na via, mas não orientadas para a condição de
                  travessia de ciclistas.
                </Label>
              </div>
            </div>

            {String(data.infra_typology || "")
              .toLowerCase()
              .includes("ciclorrota") && (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="traffic_lanes_per_direction">Faixas mistas por sentido:</Label>
                  <Input
                    id="traffic_lanes_per_direction"
                    name="traffic_lanes_per_direction"
                    type="number"
                    value={data.traffic_lanes_per_direction || ""}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="mixed_lane_width_m">Largura da faixa mista (m):</Label>
                  <Input
                    id="mixed_lane_width_m"
                    name="mixed_lane_width_m"
                    type="number"
                    step="0.1"
                    value={data.mixed_lane_width_m || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex items-end pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_intersection_traffic_calming"
                      checked={data.has_intersection_traffic_calming || false}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("has_intersection_traffic_calming", !!checked)
                      }
                    />
                    <Label htmlFor="has_intersection_traffic_calming">
                      Há moderação no cruzamento
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </AssessmentCriterionAccordion>
        </CriteriaAccordionGroup>
      </CardContent>
    </Card>
  );
};

export default Page7;
