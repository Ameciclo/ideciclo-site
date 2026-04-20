import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import AssessmentCriterionAccordion from "@/components/AssessmentCriterionAccordion";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { IdecicloFormData } from "@/types/idecicloForm";

interface Page8Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
}

const Page8: React.FC<Page8Props> = ({ data, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    onDataChange({ [name]: processedValue });
  };

  const handleRadioChange = (name: string, value: string | boolean) => {
    onDataChange({ [name]: value });
  };

  const handleFurnitureCheckboxChange = (item: string, checked: boolean) => {
    const currentItems = [...(data.cycling_furniture || [])];
    if (checked) {
      if (!currentItems.includes(item)) {
        currentItems.push(item);
      }
    } else {
      const index = currentItems.indexOf(item);
      if (index !== -1) {
        currentItems.splice(index, 1);
      }
    }
    onDataChange({ cycling_furniture: currentItems });
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
        <CriteriaAccordionGroup allValues={["d1", "d2", "d3"]} defaultOpenValues={["d1"]}>
          <AssessmentCriterionAccordion
            value="d1"
            title="D.1. Iluminação pública"
            description="Condições de iluminação ao longo do trecho cicloviário."
            answered={isTouched([
              "has_lighting_posts",
              "lighting_post_type",
              "lighting_distance_m",
              "lighting_directed",
              "lighting_barriers",
              "lighting_distance_to_infra",
            ])}
            inAnalysis={data.criterion_workflow_state?.d1 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("d1", value ? "analysis" : "default")}
            helpKey="D1"
            onClear={() =>
              onDataChange({
                has_lighting_posts: null,
                lighting_post_type: "",
                lighting_distance_m: 0,
                lighting_directed: null,
                lighting_barriers: null,
                lighting_distance_to_infra: "",
                touched_fields: {
                  has_lighting_posts: false,
                  lighting_post_type: false,
                  lighting_distance_m: false,
                  lighting_directed: false,
                  lighting_barriers: false,
                  lighting_distance_to_infra: false,
                },
              })
            }
          >
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Existem postes ao longo do trecho?</Label>
                <RadioGroup
                  value={
                    data.has_lighting_posts === null
                      ? ""
                      : data.has_lighting_posts === false
                        ? "false"
                        : "true"
                  }
                  onValueChange={(value) => handleRadioChange("has_lighting_posts", value === "true")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="posts_yes" />
                    <Label htmlFor="posts_yes">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="posts_no" />
                    <Label htmlFor="posts_no">Não</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">Tipo de poste:</Label>
                <RadioGroup
                  value={data.lighting_post_type || ""}
                  onValueChange={(value) => handleRadioChange("lighting_post_type", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="post_A" />
                    <Label htmlFor="post_A">Postes peatonais</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="post_B" />
                    <Label htmlFor="post_B">Postes convencionais</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="lighting_distance_m">Distância entre postes (m):</Label>
                <Input
                  id="lighting_distance_m"
                  name="lighting_distance_m"
                  type="number"
                  value={data.lighting_distance_m || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label className="mb-2 block">Direcionados à infraestrutura cicloviária:</Label>
                <RadioGroup
                  value={
                    data.lighting_directed === null
                      ? ""
                      : data.lighting_directed
                        ? "true"
                        : "false"
                  }
                  onValueChange={(value) => handleRadioChange("lighting_directed", value === "true")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="directed_yes" />
                    <Label htmlFor="directed_yes">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="directed_no" />
                    <Label htmlFor="directed_no">Não</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">
                  Barreiras abaixo do poste que limitam a iluminação:
                </Label>
                <RadioGroup
                  value={
                    data.lighting_barriers === null
                      ? ""
                      : data.lighting_barriers
                        ? "true"
                        : "false"
                  }
                  onValueChange={(value) => handleRadioChange("lighting_barriers", value === "true")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="barriers_yes" />
                    <Label htmlFor="barriers_yes">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="barriers_no" />
                    <Label htmlFor="barriers_no">Não</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">Distância dos postes à infraestrutura:</Label>
                <RadioGroup
                  value={data.lighting_distance_to_infra || ""}
                  onValueChange={(value) => handleRadioChange("lighting_distance_to_infra", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="distance_A" />
                    <Label htmlFor="distance_A">Postes juntos à infraestrutura</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="distance_B" />
                    <Label htmlFor="distance_B">Postes a mais de 5 m da infraestrutura</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </AssessmentCriterionAccordion>

          <AssessmentCriterionAccordion
            value="d2"
            title="D.2. Conforto térmico (sombreamento)"
            description="Cobertura de sombra e porte da arborização do trecho."
            answered={isTouched(["shading_coverage", "vegetation_size"])}
            inAnalysis={data.criterion_workflow_state?.d2 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("d2", value ? "analysis" : "default")}
            helpKey="D2"
            onClear={() =>
              onDataChange({
                shading_coverage: "",
                vegetation_size: "",
                touched_fields: { shading_coverage: false, vegetation_size: false },
              })
            }
          >
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Há sombreamento:</Label>
                <RadioGroup
                  value={data.shading_coverage || ""}
                  onValueChange={(value) => handleRadioChange("shading_coverage", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="shade_A" />
                    <Label htmlFor="shade_A">Toda extensão</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="shade_B" />
                    <Label htmlFor="shade_B">Mais da metade</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="C" id="shade_C" />
                    <Label htmlFor="shade_C">Menos da metade</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="D" id="shade_D" />
                    <Label htmlFor="shade_D">Não há</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">Arborização:</Label>
                <RadioGroup
                  value={data.vegetation_size || ""}
                  onValueChange={(value) => handleRadioChange("vegetation_size", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="veg_A" />
                    <Label htmlFor="veg_A">Porte alto</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="veg_B" />
                    <Label htmlFor="veg_B">Médio porte</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="C" id="veg_C" />
                    <Label htmlFor="veg_C">Baixo porte</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </AssessmentCriterionAccordion>

          <AssessmentCriterionAccordion
            value="d3"
            title="D.3. Mobiliário cicloviário"
            description="Presença de equipamentos de apoio ao uso da bicicleta."
            answered={isTouched(["blocks_with_cycling_furniture", "cycling_furniture"])}
            inAnalysis={data.criterion_workflow_state?.d3 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("d3", value ? "analysis" : "default")}
            helpKey="D3"
            onClear={() =>
              onDataChange({
                blocks_with_cycling_furniture: 0,
                cycling_furniture: [],
                touched_fields: {
                  blocks_with_cycling_furniture: false,
                  cycling_furniture: false,
                },
              })
            }
          >
            <div className="mb-4">
              <Label htmlFor="blocks_with_cycling_furniture">
                Quantas quadras do trecho têm ao menos um mobiliário cicloviário?
              </Label>
              <Input
                id="blocks_with_cycling_furniture"
                name="blocks_with_cycling_furniture"
                type="number"
                value={data.blocks_with_cycling_furniture || ""}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furniture_bicicletarios"
                  checked={(data.cycling_furniture || []).includes("bicicletarios")}
                  onCheckedChange={(checked) =>
                    handleFurnitureCheckboxChange("bicicletarios", !!checked)
                  }
                />
                <Label htmlFor="furniture_bicicletarios">Bicicletários de uso público</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furniture_estacoes"
                  checked={(data.cycling_furniture || []).includes("estacoes")}
                  onCheckedChange={(checked) => handleFurnitureCheckboxChange("estacoes", !!checked)}
                />
                <Label htmlFor="furniture_estacoes">Estações de autoatendimento</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furniture_paraciclos"
                  checked={(data.cycling_furniture || []).includes("paraciclos")}
                  onCheckedChange={(checked) =>
                    handleFurnitureCheckboxChange("paraciclos", !!checked)
                  }
                />
                <Label htmlFor="furniture_paraciclos">Paraciclos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furniture_bebedouros"
                  checked={(data.cycling_furniture || []).includes("bebedouros")}
                  onCheckedChange={(checked) =>
                    handleFurnitureCheckboxChange("bebedouros", !!checked)
                  }
                />
                <Label htmlFor="furniture_bebedouros">Bebedouros públicos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furniture_compartilhadas"
                  checked={(data.cycling_furniture || []).includes("compartilhadas")}
                  onCheckedChange={(checked) =>
                    handleFurnitureCheckboxChange("compartilhadas", !!checked)
                  }
                />
                <Label htmlFor="furniture_compartilhadas">
                  Sistemas de bicicletas compartilhadas
                </Label>
              </div>
            </div>
          </AssessmentCriterionAccordion>
        </CriteriaAccordionGroup>
      </CardContent>
    </Card>
  );
};

export default Page8;
