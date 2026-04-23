import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import AssessmentCriterionAccordion from "@/components/AssessmentCriterionAccordion";
import ConceptCriteriaTable from "@/components/ConceptCriteriaTable";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { CriterionFilter } from "@/components/criteriaAccordionContext";
import { IdecicloFormData } from "@/types/idecicloForm";
import { buildCriterionScorePreview } from "@/utils/criterionScorePreview";

interface Page7Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  filter?: CriterionFilter;
  command?: { type: "expand" | "collapse"; nonce: number } | null;
}

const Page7: React.FC<Page7Props> = ({ data, onDataChange, filter, command }) => {
  const normalizedTypology = (data.infra_typology || "").toLowerCase();
  const isCiclorrota = normalizedTypology.includes("ciclorrota");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    onDataChange({ [name]: processedValue });
  };

  const handleRadioChange = (name: string, value: string | boolean | number) => {
    onDataChange({ [name]: value });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    onDataChange({
      [name]: checked,
      no_risk_situations:
        checked ||
        Boolean(
          (name !== "bus_school_conflict" && data.bus_school_conflict) ||
            (name !== "horizontal_obstacles" && data.horizontal_obstacles) ||
            (name !== "vertical_obstacles" && data.vertical_obstacles) ||
            (name !== "side_change_mid_block" && data.side_change_mid_block) ||
            (name !== "opposite_flow_direction" && data.opposite_flow_direction)
        )
          ? false
          : data.no_risk_situations,
    });
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
  const updateWorkflow = (criterion: string, value: "default" | "analysis") =>
    onDataChange({
      criterion_workflow_state: {
        ...(data.criterion_workflow_state || {}),
        [criterion]: value,
      },
    });

  const renderCounter = ({
    label,
    value,
    onDecrease,
    onIncrease,
  }: {
    label: string;
    value: number;
    onDecrease: () => void;
    onIncrease: () => void;
  }) => (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="mb-3 text-sm font-medium text-slate-700">{label}</div>
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 w-9 rounded-full p-0"
          onClick={onDecrease}
          disabled={value <= 0}
        >
          -
        </Button>
        <div className="min-w-[44px] text-center text-xl font-bold text-slate-900">{value}</div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 w-9 rounded-full p-0"
          onClick={onIncrease}
        >
          +
        </Button>
      </div>
    </div>
  );

  const signalizedCrossingsCount = Number(data.signalized_crossings_count || 0);
  const blocksCount = Number(data.blocks_count || 0);
  const crossingsPerBlock = blocksCount > 0 ? signalizedCrossingsCount / blocksCount : 0;
  const hasAnyRiskSelected = Boolean(
    data.bus_school_conflict ||
      data.horizontal_obstacles ||
      data.vertical_obstacles ||
      data.side_change_mid_block ||
      data.opposite_flow_direction
  );

  return (
    <CriteriaAccordionGroup
          allValues={["b7", "b5", "c1e1", "c2", "c3"]}
          defaultOpenValues={["b7"]}
          filter={filter}
          command={command}
        >
          <AssessmentCriterionAccordion
            value="b7"
            title="B.7. Situações de risco ao longo da infraestrutura"
            description="Marque ocorrências que representem conflito, obstáculo ou descontinuidade."
            scorePreview={buildCriterionScorePreview(data, ["B7"])}
            answered={isTouched([
              "no_risk_situations",
              "bus_school_conflict",
              "horizontal_obstacles",
              "vertical_obstacles",
              "side_change_mid_block",
              "opposite_flow_direction",
            ])}
            inAnalysis={data.criterion_workflow_state?.b7 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("b7", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                no_risk_situations: false,
                bus_school_conflict: false,
                horizontal_obstacles: false,
                vertical_obstacles: false,
                side_change_mid_block: false,
                opposite_flow_direction: false,
                touched_fields: {
                  no_risk_situations: false,
                  bus_school_conflict: false,
                  horizontal_obstacles: false,
                  vertical_obstacles: false,
                  side_change_mid_block: false,
                  opposite_flow_direction: false,
                },
              })
            }
            helpKey="B7"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-slate-800">Sem situações de risco</div>
                  <p className="text-xs text-muted-foreground">
                    Ative quando nenhuma das situações abaixo estiver presente.
                  </p>
                </div>
                <Checkbox
                  id="no_risk_situations"
                  checked={Boolean(data.no_risk_situations) && !hasAnyRiskSelected}
                  onCheckedChange={(checked) => {
                    const active = Boolean(checked);
                    onDataChange({
                      no_risk_situations: active,
                      ...(active
                        ? {
                            bus_school_conflict: false,
                            horizontal_obstacles: false,
                            vertical_obstacles: false,
                            side_change_mid_block: false,
                            opposite_flow_direction: false,
                          }
                        : {}),
                    });
                  }}
                />
              </div>
              {!isCiclorrota ? (
                <label
                  htmlFor="bus_school_conflict"
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3"
                >
                  <Checkbox
                    id="bus_school_conflict"
                    checked={data.bus_school_conflict || false}
                    onCheckedChange={(checked) => handleCheckboxChange("bus_school_conflict", !!checked)}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Conflito com ponto de onibus ou escola
                  </span>
                </label>
              ) : null}
              <label
                htmlFor="horizontal_obstacles"
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3"
              >
                <Checkbox
                  id="horizontal_obstacles"
                  checked={data.horizontal_obstacles || false}
                  onCheckedChange={(checked) => handleCheckboxChange("horizontal_obstacles", !!checked)}
                />
                <span className="text-sm font-medium text-slate-700">
                  Obstaculos horizontais no trecho
                </span>
              </label>
              <label
                htmlFor="vertical_obstacles"
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3"
              >
                <Checkbox
                  id="vertical_obstacles"
                  checked={data.vertical_obstacles || false}
                  onCheckedChange={(checked) => handleCheckboxChange("vertical_obstacles", !!checked)}
                />
                <span className="text-sm font-medium text-slate-700">Obstaculos verticais no trecho</span>
              </label>
              {!isCiclorrota ? (
                <label
                  htmlFor="side_change_mid_block"
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3"
                >
                  <Checkbox
                    id="side_change_mid_block"
                    checked={data.side_change_mid_block || false}
                    onCheckedChange={(checked) => handleCheckboxChange("side_change_mid_block", !!checked)}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Mudanca de lado da infraestrutura no meio da quadra
                  </span>
                </label>
              ) : null}
              {!isCiclorrota ? (
                <label
                  htmlFor="opposite_flow_direction"
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3"
                >
                  <Checkbox
                    id="opposite_flow_direction"
                    checked={data.opposite_flow_direction || false}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("opposite_flow_direction", !!checked)
                    }
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Sentido de circulacao contrario ao fluxo veicular
                  </span>
                </label>
              ) : null}
            </div>
          </AssessmentCriterionAccordion>

          <AssessmentCriterionAccordion
            value="b5"
            title="B.5. Acessibilidade relativa ao uso do solo lindeiro"
            description="Conta travessias sinalizadas ao longo do trecho e relaciona com o numero de quadras."
            scorePreview={buildCriterionScorePreview(data, ["B5"])}
            answered={isTouched(["signalized_crossings_count"]) || signalizedCrossingsCount > 0}
            inAnalysis={data.criterion_workflow_state?.b5 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("b5", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                signalized_crossings_count: 0,
                touched_fields: {
                  signalized_crossings_count: false,
                },
              })
            }
            helpKey="B5"
          >
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
                {renderCounter({
                  label: "Travessias sinalizadas ao longo do trecho",
                  value: signalizedCrossingsCount,
                  onDecrease: () =>
                    onDataChange({
                      signalized_crossings_count: Math.max(0, signalizedCrossingsCount - 1),
                      touched_fields: { signalized_crossings_count: true },
                    }),
                  onIncrease: () =>
                    onDataChange({
                      signalized_crossings_count: signalizedCrossingsCount + 1,
                      touched_fields: { signalized_crossings_count: true },
                    }),
                })}

                <div className="rounded-2xl border p-4">
                  <div className="text-sm font-medium text-slate-700">Resumo automatico</div>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <div>
                      Quadras do trecho: <strong>{blocksCount}</strong>
                    </div>
                    <div>
                      Travessias por quadra: <strong>{crossingsPerBlock.toFixed(2).replace(".", ",")}</strong>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      A: 2 ou mais por quadra
                      <br />
                      B: 1 por quadra
                      <br />
                      C: menos de 1 por quadra, mas existe
                      <br />
                      D: nenhuma
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AssessmentCriterionAccordion>

          {!isCiclorrota ? (
            <AssessmentCriterionAccordion
              value="c1e1"
              title="C.1 / E.1. Sinalização horizontal cicloviária nas interseções"
              description="Combina presença da sinalização nas interseções e seu estado de conservação."
              scorePreview={buildCriterionScorePreview(data, ["C1", "E1"])}
              answered={isTouched(["intersection_signaling", "intersection_conservation"])}
              inAnalysis={data.criterion_workflow_state?.c1e1 === "analysis"}
              onAnalysisChange={(value) =>
                updateWorkflow("c1e1", value ? "analysis" : "default")
              }
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
              helpKey="c1e1"
            >
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Sinalização:</Label>
                  <ConceptCriteriaTable
                    value={data.intersection_signaling || ""}
                    onValueChange={(value) => handleRadioChange("intersection_signaling", value)}
                    options={[
                      {
                        value: "A",
                        description:
                          "Interseção apresenta pavimento vermelho na largura da infraestrutura e linhas tracejadas brancas.",
                      },
                      {
                        value: "B",
                        description:
                          "Pavimento em tom vermelho estreito ou pavimento vermelho sem linhas tracejadas.",
                      },
                      {
                        value: "C",
                        description: "Só linhas tracejadas ou só pictogramas.",
                      },
                      {
                        value: "D",
                        description: "Nenhuma sinalização.",
                      },
                    ]}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Estado de conservação da sinalização horizontal:</Label>
                  <ConceptCriteriaTable
                    value={data.intersection_conservation || ""}
                    onValueChange={(value) => handleRadioChange("intersection_conservation", value)}
                    options={[
                      {
                        value: "A",
                        description:
                          "Há sinalização em todas as interseções do trecho, visível em toda a extensão.",
                      },
                      {
                        value: "B",
                        description:
                          "Há sinalização em mais da metade das interseções e em bom estado.",
                      },
                      {
                        value: "C",
                        description:
                          "Há sinalização em menos da metade das interseções ou ela está muito danificada.",
                      },
                      {
                        value: "D",
                        description: "Praticamente apagada.",
                      },
                    ]}
                  />
                </div>
              </div>
            </AssessmentCriterionAccordion>
          ) : null}

          <AssessmentCriterionAccordion
            value="c2"
            title="C.2. Acessibilidade entre conexões cicloviárias"
            description="Indica se a ligação com outras estruturas é visível e pedalável."
            scorePreview={buildCriterionScorePreview(data, ["C2"])}
            answered={isTouched(["connection_accessibility"])}
            inAnalysis={data.criterion_workflow_state?.c2 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("c2", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                connection_accessibility: "",
                touched_fields: { connection_accessibility: false },
              })
            }
            helpKey="C2"
          >
            <ConceptCriteriaTable
              value={data.connection_accessibility || ""}
              onValueChange={(value) => handleRadioChange("connection_accessibility", value)}
              options={[
                {
                  value: "A",
                  description:
                    "A conexão é visível e tem acessibilidade física, com rampa pedalável quando há desnível.",
                },
                {
                  value: "D",
                  description:
                    "A conexão não é visível, não existe ou depende apenas de escadas/transposição ruim.",
                },
                {
                  value: "NA",
                  label: "N/A",
                  description: "Não se aplica, porque o trecho não possui conexão.",
                },
              ]}
            />
          </AssessmentCriterionAccordion>

          <AssessmentCriterionAccordion
            value="c3"
            title="C.3. Conflitos com circulação de modos motorizados"
            description="Marque os elementos presentes para caracterizar o tratamento do conflito."
            scorePreview={buildCriterionScorePreview(data, ["C3"])}
            answered={isTouched([
              "motorized_conflicts",
              "traffic_lanes_per_direction",
              "mixed_lane_width_m",
              "has_intersection_traffic_calming",
            ])}
            inAnalysis={data.criterion_workflow_state?.c3 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("c3", value ? "analysis" : "default")}
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
            helpKey="C3"
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
  );
};

export default Page7;
