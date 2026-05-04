import React from "react";
import AssessmentCriterionAccordion, {
  CriterionPagerConfig,
} from "@/components/AssessmentCriterionAccordion";
import ConceptCriteriaTable from "@/components/ConceptCriteriaTable";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { CriterionFilter } from "@/components/criteriaAccordionContext";
import { CyclingFurnitureKey, IdecicloFormData } from "@/types/idecicloForm";
import { Checkbox } from "@/components/ui/checkbox";
import { buildCriterionScorePreview } from "@/utils/criterionScorePreview";

const CYCLING_FURNITURE_OPTIONS = [
  {
    key: "bicicletarios",
    label: "Bicicletários de uso público",
    icon: "/icones/bicicletario.svg",
  },
  {
    key: "paraciclos",
    label: "Paraciclos",
    icon: "/icones/paraciclo.svg",
  },
  {
    key: "compartilhadas",
    label: "Sistemas de bicicletas compartilhadas",
    icon: "/icones/bike-sharing.svg",
  },
  {
    key: "estacoes",
    label: "Estações de autoatendimento",
    icon: "/icones/autoatendimento.svg",
  },
  {
    key: "bebedouros",
    label: "Bebedouros públicos",
    icon: "/icones/bebedouro.svg",
  },
] as const;

const EMPTY_FURNITURE_COUNTS: Partial<Record<CyclingFurnitureKey, number>> = {};

interface Page8Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  filter?: CriterionFilter;
  command?: { type: "expand" | "collapse"; nonce: number } | null;
  visibleValues?: Array<"d1" | "d2" | "d3">;
  blockPager?: CriterionPagerConfig;
  hideBlockPager?: boolean;
}

const Page8: React.FC<Page8Props> = ({
  data,
  onDataChange,
  filter,
  command,
  visibleValues,
  blockPager,
  hideBlockPager = false,
}) => {
  const canShow = (value: "d1" | "d2" | "d3") => !visibleValues || visibleValues.includes(value);
  const visibleAccordionValues = ["d1", "d2", "d3"].filter(canShow);
  const handleRadioChange = (name: string, value: string | boolean) => {
    onDataChange({ [name]: value });
  };
  const blockTouchKey = (index: number) => `block_d3_${index}`;
  const resetBlockTouchKeys = () =>
    Object.fromEntries(
      Array.from({ length: Math.max(0, Number(data.blocks_count || 0)) }, (_, index) => [
        blockTouchKey(index),
        false,
      ])
    );

  const handleFurnitureCountChange = (item: CyclingFurnitureKey, delta: number) => {
    const currentBlockIndex = blockPager?.currentIndex || 0;
    const blockCount = Math.max(0, Number(data.blocks_count || 0));
    const nextLength = Math.max(blockCount, currentBlockIndex + 1);
    const nextCountsByBlock = Array.from({ length: nextLength }, (_, index) =>
      index < (data.cycling_furniture_counts_by_block?.length || 0)
        ? { ...(data.cycling_furniture_counts_by_block?.[index] || EMPTY_FURNITURE_COUNTS) }
        : Object.fromEntries(
            (data.cycling_furniture_by_block?.[index] || []).map((value) => [value, 1])
          )
    );
    const currentCounts = { ...(nextCountsByBlock[currentBlockIndex] || EMPTY_FURNITURE_COUNTS) };
    const nextCount = Math.max(0, Number(currentCounts[item] || 0) + delta);

    if (nextCount > 0) {
      currentCounts[item] = nextCount;
    } else {
      delete currentCounts[item];
    }

    nextCountsByBlock[currentBlockIndex] = currentCounts;

    const nextNoFurnitureByBlock = Array.from({ length: nextLength }, (_, index) =>
      Boolean(data.no_cycling_furniture_by_block?.[index])
    );
    nextNoFurnitureByBlock[currentBlockIndex] = false;

    const nextByBlock = nextCountsByBlock.map((counts) =>
      Object.entries(counts)
        .filter(([, count]) => Number(count || 0) > 0)
        .map(([key]) => key)
    );

    const blocksWithFurniture = nextByBlock.filter((items) => items.length > 0).length;
    const aggregatedFurniture = Array.from(new Set(nextByBlock.flat()));

    onDataChange({
      blocks_with_cycling_furniture: blocksWithFurniture,
      cycling_furniture: aggregatedFurniture,
      cycling_furniture_by_block: nextByBlock,
      cycling_furniture_counts_by_block: nextCountsByBlock,
      no_cycling_furniture_by_block: nextNoFurnitureByBlock,
      touched_fields: {
        blocks_with_cycling_furniture: blocksWithFurniture > 0,
        cycling_furniture: aggregatedFurniture.length > 0,
        cycling_furniture_by_block: true,
        cycling_furniture_counts_by_block: true,
        no_cycling_furniture_by_block: nextNoFurnitureByBlock.some(Boolean),
        [blockTouchKey(currentBlockIndex)]: true,
      },
    });
  };

  const handleNoFurnitureChange = (checked: boolean) => {
    const currentBlockIndex = blockPager?.currentIndex || 0;
    const blockCount = Math.max(0, Number(data.blocks_count || 0));
    const nextLength = Math.max(blockCount, currentBlockIndex + 1);
    const nextCountsByBlock = Array.from({ length: nextLength }, (_, index) =>
      index < (data.cycling_furniture_counts_by_block?.length || 0)
        ? { ...(data.cycling_furniture_counts_by_block?.[index] || EMPTY_FURNITURE_COUNTS) }
        : Object.fromEntries(
            (data.cycling_furniture_by_block?.[index] || []).map((value) => [value, 1])
          )
    );
    const nextNoFurnitureByBlock = Array.from({ length: nextLength }, (_, index) =>
      Boolean(data.no_cycling_furniture_by_block?.[index])
    );

    nextNoFurnitureByBlock[currentBlockIndex] = checked;
    if (checked) {
      nextCountsByBlock[currentBlockIndex] = {};
    }

    const nextByBlock = nextCountsByBlock.map((counts) =>
      Object.entries(counts)
        .filter(([, count]) => Number(count || 0) > 0)
        .map(([key]) => key)
    );
    const blocksWithFurniture = nextByBlock.filter((items) => items.length > 0).length;
    const aggregatedFurniture = Array.from(new Set(nextByBlock.flat()));

    onDataChange({
      blocks_with_cycling_furniture: blocksWithFurniture,
      cycling_furniture: aggregatedFurniture,
      cycling_furniture_by_block: nextByBlock,
      cycling_furniture_counts_by_block: nextCountsByBlock,
      no_cycling_furniture_by_block: nextNoFurnitureByBlock,
      touched_fields: {
        blocks_with_cycling_furniture: blocksWithFurniture > 0,
        cycling_furniture: aggregatedFurniture.length > 0,
        cycling_furniture_by_block: true,
        cycling_furniture_counts_by_block: true,
        no_cycling_furniture_by_block: nextNoFurnitureByBlock.some(Boolean),
        [blockTouchKey(currentBlockIndex)]: true,
      },
    });
  };

  const currentBlockIndex = blockPager?.currentIndex || 0;
  const currentFurnitureCounts =
    data.cycling_furniture_counts_by_block?.[currentBlockIndex] ||
    Object.fromEntries(
      (data.cycling_furniture_by_block?.[currentBlockIndex] || data.cycling_furniture || []).map(
        (value) => [value, 1]
      )
    );
  const noFurnitureInCurrentBlock = Boolean(data.no_cycling_furniture_by_block?.[currentBlockIndex]);
  const isTouched = (fields: string[]) => fields.some((field) => data.touched_fields?.[field]);
  const updateWorkflow = (criterion: string, value: "default" | "analysis") =>
    onDataChange({
      criterion_workflow_state: {
        ...(data.criterion_workflow_state || {}),
        [criterion]: value,
      },
    });

  return (
    <CriteriaAccordionGroup
      allValues={visibleAccordionValues}
      defaultOpenValues={visibleAccordionValues}
      filter={filter}
      command={command}
    >
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
            answered={isTouched([
              "cycling_furniture_by_block",
              "cycling_furniture",
              "cycling_furniture_counts_by_block",
              "no_cycling_furniture_by_block",
            ])}
            inAnalysis={data.criterion_workflow_state?.d3 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("d3", value ? "analysis" : "default")}
            pager={blockPager}
            showPager={!hideBlockPager}
            helpKey="D3"
            onClear={() =>
              onDataChange({
                blocks_with_cycling_furniture: 0,
                cycling_furniture: [],
                cycling_furniture_by_block: [],
                cycling_furniture_counts_by_block: [],
                no_cycling_furniture_by_block: [],
                touched_fields: {
                  blocks_with_cycling_furniture: false,
                  cycling_furniture: false,
                  cycling_furniture_by_block: false,
                  cycling_furniture_counts_by_block: false,
                  no_cycling_furniture_by_block: false,
                  ...resetBlockTouchKeys(),
                },
              })
            }
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-slate-800">Sem mobiliário</div>
                </div>
                <Checkbox
                  id="no_cycling_furniture"
                  checked={noFurnitureInCurrentBlock}
                  onCheckedChange={(checked) => handleNoFurnitureChange(Boolean(checked))}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CYCLING_FURNITURE_OPTIONS.map((option) => {
                const count = Number(currentFurnitureCounts[option.key] || 0);
                const selected = count > 0;

                return (
                  <div
                    key={option.key}
                    className={`flex items-stretch overflow-hidden rounded-2xl border transition ${
                      selected
                        ? "border-emerald-300 bg-emerald-50 shadow-sm"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleFurnitureCountChange(option.key, 1)}
                      className="flex flex-1 items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50/50"
                    >
                      <img
                        src={option.icon}
                        alt=""
                        aria-hidden="true"
                        className="h-10 w-10 shrink-0 object-contain"
                      />
                      <div className="space-y-1">
                        <span className="block text-sm font-semibold text-slate-700">
                          {option.label}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {selected ? `Ocorrências: ${count}` : "Toque para marcar"}
                        </span>
                      </div>
                    </button>
                    {selected ? (
                      <button
                        type="button"
                        onClick={() => handleFurnitureCountChange(option.key, -1)}
                        className="flex w-11 shrink-0 items-center justify-center border-l border-emerald-200 bg-white/60 text-slate-500 transition hover:bg-white hover:text-emerald-700"
                        aria-label={`Remover ${option.label}`}
                        title={`Remover ${option.label}`}
                      >
                        <span className="text-lg font-semibold leading-none">×</span>
                      </button>
                    ) : null}
                  </div>
                );
              })}
              </div>
            </div>
          </AssessmentCriterionAccordion> : null}
        </CriteriaAccordionGroup>
  );
};

export default Page8;
