import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import AssessmentCriterionAccordion, {
  CriterionPagerConfig,
} from "@/components/AssessmentCriterionAccordion";
import ConceptCriteriaTable from "@/components/ConceptCriteriaTable";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { CriterionFilter } from "@/components/criteriaAccordionContext";
import { IdecicloFormData } from "@/types/idecicloForm";
import { buildCriterionScorePreview } from "@/utils/criterionScorePreview";

interface Page8Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  filter?: CriterionFilter;
  command?: { type: "expand" | "collapse"; nonce: number } | null;
  visibleValues?: Array<"d1" | "d2" | "d3">;
  blockPager?: CriterionPagerConfig;
}

const Page8: React.FC<Page8Props> = ({
  data,
  onDataChange,
  filter,
  command,
  visibleValues,
  blockPager,
}) => {
  const canShow = (value: "d1" | "d2" | "d3") => !visibleValues || visibleValues.includes(value);
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
    <CriteriaAccordionGroup allValues={["d1", "d2", "d3"].filter(canShow)} defaultOpenValues={["d1", "d2"].filter(canShow)} filter={filter} command={command}>
          {canShow("d1") ? <AssessmentCriterionAccordion
            value="d1"
            title="D.1. Iluminação pública"
            description="Condições de iluminação ao longo do trecho cicloviário."
            scorePreview={buildCriterionScorePreview(data, ["D1"])}
            answered={isTouched(["lighting_rating"])}
            inAnalysis={data.criterion_workflow_state?.d1 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("d1", value ? "analysis" : "default")}
            helpKey="D1"
            onClear={() =>
              onDataChange({
                lighting_rating: "",
                touched_fields: {
                  lighting_rating: false,
                },
              })
            }
          >
            <ConceptCriteriaTable
              value={data.lighting_rating || ""}
              onValueChange={(value) => handleRadioChange("lighting_rating", value)}
              options={[
                {
                  value: "A",
                  description:
                    "Há postes de iluminação peatonais ou exclusivos para a infraestrutura cicloviária, instalados próximos e direcionados à estrutura, com espaçamento máximo de 30 metros entre os postes.",
                },
                {
                  value: "B",
                  description:
                    "Há postes de iluminação ao lado da infraestrutura cicloviária, direcionados à via; distanciamento entre 30 e 50 metros entre postes.",
                },
                {
                  value: "C",
                  description:
                    "Há postes na via, com distanciamento superior a 5 metros da infraestrutura cicloviária, e distanciamento superior a 50 metros entre os postes; há postes próximos à infraestrutura cicloviária com barreiras abaixo que impedem a iluminação direta da infraestrutura (ex: coberturas, árvores).",
                },
                {
                  value: "D",
                  description: "Não há postes de iluminação no trecho analisado.",
                },
              ]}
            />
          </AssessmentCriterionAccordion> : null}

          {canShow("d2") ? <AssessmentCriterionAccordion
            value="d2"
            title="D.2. Conforto térmico (sombreamento)"
            description="Avalia a presença de sombra ao longo da extensão da infraestrutura."
            scorePreview={buildCriterionScorePreview(data, ["D2"])}
            answered={isTouched(["shading_coverage"])}
            inAnalysis={data.criterion_workflow_state?.d2 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("d2", value ? "analysis" : "default")}
            helpKey="D2"
            onClear={() =>
              onDataChange({
                shading_coverage: "",
                touched_fields: { shading_coverage: false },
              })
            }
          >
            <ConceptCriteriaTable
              value={data.shading_coverage || ""}
              onValueChange={(value) => handleRadioChange("shading_coverage", value)}
              options={[
                {
                  value: "A",
                  description: "Há sombreamento em praticamente toda a extensão.",
                },
                {
                  value: "B",
                  description:
                    "Há sombra em mais da metade da extensão; há arborização de baixo porte em quase todo o trecho.",
                },
                {
                  value: "C",
                  description: "Há sombra em menos da metade da extensão.",
                },
                {
                  value: "D",
                  description: "Não há ou praticamente não há sombra.",
                },
              ]}
            />
          </AssessmentCriterionAccordion> : null}

          {canShow("d3") ? <AssessmentCriterionAccordion
            value="d3"
            title="D.3. Mobiliário cicloviário"
            description="Presença de equipamentos de apoio ao uso da bicicleta."
            scorePreview={buildCriterionScorePreview(data, ["D3"])}
            answered={isTouched(["blocks_with_cycling_furniture", "cycling_furniture"])}
            inAnalysis={data.criterion_workflow_state?.d3 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("d3", value ? "analysis" : "default")}
            pager={blockPager}
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
          </AssessmentCriterionAccordion> : null}
        </CriteriaAccordionGroup>
  );
};

export default Page8;
