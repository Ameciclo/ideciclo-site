import React from "react";
import { Label } from "@/components/ui/label";
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
  const handleRadioChange = (name: string, value: string | boolean) => {
    onDataChange({ [name]: value });
  };

  const handleFurnitureCheckboxChange = (item: string, checked: boolean) => {
    const currentBlockIndex = blockPager?.currentIndex || 0;
    const blockCount = Math.max(0, Number(data.blocks_count || 0));
    const currentItems = Array.isArray(data.cycling_furniture_by_block?.[currentBlockIndex])
      ? [...(data.cycling_furniture_by_block?.[currentBlockIndex] || [])]
      : [...(data.cycling_furniture || [])];

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

    const nextLength = Math.max(blockCount, currentBlockIndex + 1);
    const nextByBlock = Array.from({ length: nextLength }, (_, index) =>
      Array.isArray(data.cycling_furniture_by_block?.[index])
        ? [...(data.cycling_furniture_by_block?.[index] || [])]
        : []
    );

    nextByBlock[currentBlockIndex] = currentItems;

    const blocksWithFurniture = nextByBlock.filter((items) => items.length > 0).length;
    const aggregatedFurniture = Array.from(new Set(nextByBlock.flat()));

    onDataChange({
      blocks_with_cycling_furniture: blocksWithFurniture,
      cycling_furniture: aggregatedFurniture,
      cycling_furniture_by_block: nextByBlock,
      touched_fields: {
        blocks_with_cycling_furniture: blocksWithFurniture > 0,
        cycling_furniture: aggregatedFurniture.length > 0,
        cycling_furniture_by_block: true,
      },
    });
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
            answered={isTouched(["cycling_furniture_by_block", "cycling_furniture"])}
            inAnalysis={data.criterion_workflow_state?.d3 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("d3", value ? "analysis" : "default")}
            pager={blockPager}
            helpKey="D3"
            onClear={() =>
              onDataChange({
                blocks_with_cycling_furniture: 0,
                cycling_furniture: [],
                cycling_furniture_by_block: [],
                touched_fields: {
                  blocks_with_cycling_furniture: false,
                  cycling_furniture: false,
                  cycling_furniture_by_block: false,
                },
              })
            }
          >
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furniture_bicicletarios"
                  checked={Boolean(
                    data.cycling_furniture_by_block?.[blockPager?.currentIndex || 0]?.includes(
                      "bicicletarios"
                    )
                  )}
                  onCheckedChange={(checked) =>
                    handleFurnitureCheckboxChange("bicicletarios", !!checked)
                  }
                />
                <Label htmlFor="furniture_bicicletarios">Bicicletários de uso público</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furniture_estacoes"
                  checked={Boolean(
                    data.cycling_furniture_by_block?.[blockPager?.currentIndex || 0]?.includes(
                      "estacoes"
                    )
                  )}
                  onCheckedChange={(checked) => handleFurnitureCheckboxChange("estacoes", !!checked)}
                />
                <Label htmlFor="furniture_estacoes">Estações de autoatendimento</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furniture_paraciclos"
                  checked={Boolean(
                    data.cycling_furniture_by_block?.[blockPager?.currentIndex || 0]?.includes(
                      "paraciclos"
                    )
                  )}
                  onCheckedChange={(checked) =>
                    handleFurnitureCheckboxChange("paraciclos", !!checked)
                  }
                />
                <Label htmlFor="furniture_paraciclos">Paraciclos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furniture_bebedouros"
                  checked={Boolean(
                    data.cycling_furniture_by_block?.[blockPager?.currentIndex || 0]?.includes(
                      "bebedouros"
                    )
                  )}
                  onCheckedChange={(checked) =>
                    handleFurnitureCheckboxChange("bebedouros", !!checked)
                  }
                />
                <Label htmlFor="furniture_bebedouros">Bebedouros públicos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furniture_compartilhadas"
                  checked={Boolean(
                    data.cycling_furniture_by_block?.[blockPager?.currentIndex || 0]?.includes(
                      "compartilhadas"
                    )
                  )}
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
