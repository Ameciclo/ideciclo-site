import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AssessmentCriterionAccordion, {
  CriterionPagerConfig,
} from "@/components/AssessmentCriterionAccordion";
import ConceptCriteriaTable from "@/components/ConceptCriteriaTable";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { CriterionFilter } from "@/components/criteriaAccordionContext";
import { IdecicloFormData, VerticalSignsConditionByBlock } from "@/types/idecicloForm";
import { buildCriterionScorePreview } from "@/utils/criterionScorePreview";
import { getMedianRating, IdecicloRating } from "@/utils/idecicloAssessment";

interface Page6Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  filter?: CriterionFilter;
  command?: { type: "expand" | "collapse"; nonce: number } | null;
  visibleValues?: Array<"b41" | "b42" | "e41" | "e42" | "b43" | "e43">;
  blockPager?: CriterionPagerConfig;
  hideBlockPager?: boolean;
}

const Page6: React.FC<Page6Props> = ({
  data,
  onDataChange,
  filter,
  command,
  visibleValues,
  blockPager,
  hideBlockPager = false,
}) => {
  const handleRadioChange = (name: string, value: string | boolean | number) => {
    onDataChange({ [name]: value });
  };
  const matrixBadgeClassName = (rating: string | null | undefined) => {
    if (rating === "A") return "border-transparent bg-[#b8e5db] text-[#163b38]";
    if (rating === "B") return "border-transparent bg-[#9fd3cb] text-[#163b38]";
    if (rating === "C") return "border-transparent bg-[#8fafad] text-[#163b38]";
    if (rating === "D") return "border-transparent bg-[#748987] text-white";
    return "border-slate-200 bg-white text-slate-700";
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
  const canShow = (value: "b41" | "b42" | "e41" | "e42" | "b43" | "e43") =>
    !visibleValues || visibleValues.includes(value);
  const visibleAccordionValues = ["b41", "b42", "e41", "e42", "b43", "e43"].filter(canShow);
  const isTouched = (fields: string[]) => fields.some((field) => data.touched_fields?.[field]);
  const chipClassName = (selected: boolean) =>
    `rounded-full border px-3 py-2 text-sm font-medium transition ${
      selected
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
    }`;
  const updateWorkflow = (criterion: string, value: "default" | "analysis") =>
    onDataChange({
      criterion_workflow_state: {
        ...(data.criterion_workflow_state || {}),
        [criterion]: value,
      },
    });
  const currentBlockIndex = blockPager?.currentIndex || 0;
  const getBlockValue = <T,>(values: T[] | undefined, firstBlockFallback: T, emptyFallback: T) => {
    if (Array.isArray(values) && currentBlockIndex < values.length) {
      return values[currentBlockIndex] ?? emptyFallback;
    }

    return currentBlockIndex === 0 ? firstBlockFallback : emptyFallback;
  };
  const currentRegulationSignsPerBlock = Number(
    getBlockValue(data.regulation_signs_per_block_by_block, Number(data.regulation_signs_per_block || 0), 0)
  );
  const currentSignsBothDirections = getBlockValue(
    data.signs_both_directions_by_block,
    data.signs_both_directions ?? null,
    null
  );
  const currentVerticalSignsCondition = getBlockValue(
    data.vertical_signs_conservation_by_block,
    "" as VerticalSignsConditionByBlock,
    "" as VerticalSignsConditionByBlock
  );
  const b4FinalRating = buildCriterionScorePreview(data, ["B4"])[0]?.rating;
  const e4FinalRating = buildCriterionScorePreview(data, ["E4"])[0]?.rating;
  const blockTouchKey = (criterion: "b41_signs" | "b41_directions" | "e41", index: number) =>
    `block_${criterion}_${index}`;
  const hasTouchedB41Signs = Boolean(
    data.touched_fields?.[blockTouchKey("b41_signs", currentBlockIndex)]
  );
  const hasTouchedB41Directions = Boolean(
    data.touched_fields?.[blockTouchKey("b41_directions", currentBlockIndex)]
  );
  const resetBlockTouchKeys = (criteria: Array<"b41_signs" | "b41_directions" | "e41">) =>
    Object.fromEntries(
      Array.from({ length: Math.max(0, Number(data.blocks_count || 0)) }, (_, index) =>
        criteria.map((criterion) => [blockTouchKey(criterion, index), false] as const)
      ).flat()
    );
  const calculateVerticalSignsRatingForBlock = (
    signsPerBlock: number,
    bothDirections: boolean | null
  ): IdecicloRating | null => {
    if (["ciclovia", "ciclofaixa"].includes(infraType)) {
      const requiredPerBlock = String(data.infra_flow || "") === "bidirectional" ? 2 : 1;

      if (signsPerBlock === 0) return "D";
      if (signsPerBlock >= requiredPerBlock && bothDirections === true) return "A";
      return "C";
    }

    if (signsPerBlock === 0) return "D";
    if (signsPerBlock >= 2 && bothDirections === true) return "A";
    if (signsPerBlock >= 1 && bothDirections === true) return "B";
    return "C";
  };
  const currentB41Rating = hasTouchedB41Signs
    ? calculateVerticalSignsRatingForBlock(
        currentRegulationSignsPerBlock,
        hasTouchedB41Directions ? currentSignsBothDirections : null
      )
    : null;
  const currentE41Rating =
    !hasTouchedB41Signs
      ? null
      : currentRegulationSignsPerBlock === 0
      ? "D"
      : currentVerticalSignsCondition === "good"
        ? "A"
        : currentVerticalSignsCondition === "damage"
          ? "C"
          : null;
  const b4CompositeBadge =
    !isCiclorrota && (currentB41Rating || data.space_identification) ? (
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${matrixBadgeClassName(
          b4FinalRating
        )}`}
      >
        <span>{currentB41Rating || "–"}</span>
        <span className="mx-1.5 opacity-70">×</span>
        <span>{data.space_identification || "–"}</span>
      </span>
    ) : null;
  const e4CompositeBadge =
    !isCiclorrota && (currentE41Rating || data.identification_conservation) ? (
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${matrixBadgeClassName(
          e4FinalRating
        )}`}
      >
        <span>{currentE41Rating || "–"}</span>
        <span className="mx-1.5 opacity-70">×</span>
        <span>{data.identification_conservation || "–"}</span>
      </span>
    ) : null;
  const setRegulationSignsByBlock = (
    nextSignsPerBlock: number,
    nextBothDirections: boolean | null = currentSignsBothDirections,
    touchedPart: "b41_signs" | "b41_directions" = "b41_signs"
  ) => {
    const blockCount = Math.max(0, Number(data.blocks_count || 0));
    const nextLength = Math.max(blockCount, currentBlockIndex + 1);
    const nextSignsPerBlockByBlock = Array.from({ length: nextLength }, (_, index) =>
      Number(data.regulation_signs_per_block_by_block?.[index] || 0)
    );
    const nextSignsBothDirectionsByBlock = Array.from({ length: nextLength }, (_, index) =>
      data.signs_both_directions_by_block?.[index] ?? null
    );

    nextSignsPerBlockByBlock[currentBlockIndex] = nextSignsPerBlock;
    nextSignsBothDirectionsByBlock[currentBlockIndex] = nextBothDirections;

    const blockRatings = nextSignsPerBlockByBlock.map((value, index) =>
      calculateVerticalSignsRatingForBlock(
        value,
        nextSignsBothDirectionsByBlock[index] ?? null
      )
    );

    onDataChange({
      regulation_signs_per_block_by_block: nextSignsPerBlockByBlock,
      signs_both_directions_by_block: nextSignsBothDirectionsByBlock,
      regulation_signs_per_block: nextSignsPerBlockByBlock.reduce(
        (max, value) => Math.max(max, Number(value || 0)),
        0
      ),
      signs_both_directions: nextSignsBothDirectionsByBlock.some((value) => value === true),
      touched_fields: {
        regulation_signs_per_block_by_block: true,
        signs_both_directions_by_block: true,
        regulation_signs_per_block: nextSignsPerBlockByBlock.some((value) => Number(value || 0) > 0),
        signs_both_directions: nextSignsBothDirectionsByBlock.some((value) => value !== null),
        [blockTouchKey(touchedPart, currentBlockIndex)]: true,
      },
      criterion_ratings: {
        ...(data.criterion_ratings || {}),
        B4: getMedianRating(blockRatings),
      },
    });
  };
  const setVerticalSignsConditionByBlock = (nextValue: VerticalSignsConditionByBlock) => {
    const blockCount = Math.max(0, Number(data.blocks_count || 0));
    const nextLength = Math.max(blockCount, currentBlockIndex + 1);
    const nextByBlock = Array.from({ length: nextLength }, (_, index) =>
      (data.vertical_signs_conservation_by_block?.[index] || "") as VerticalSignsConditionByBlock
    );
    nextByBlock[currentBlockIndex] = nextValue;

    const answeredConditions = nextByBlock.filter((value) => value !== "");
    const damagedConditions = answeredConditions.filter((value) => value === "damage").length;
    const totalAnsweredConditions = answeredConditions.length;
    const hasAnySigns = (data.regulation_signs_per_block || 0) > 0;

    const derivedConservation =
      !hasAnySigns
        ? "D"
        : totalAnsweredConditions === 0
          ? ""
          : damagedConditions === 0
            ? "A"
            : damagedConditions < totalAnsweredConditions / 2
              ? "B"
              : "C";

    onDataChange({
      vertical_signs_conservation_by_block: nextByBlock,
      vertical_signs_conservation: derivedConservation,
      touched_fields: {
        vertical_signs_conservation_by_block: true,
        vertical_signs_conservation: answeredConditions.length > 0 || !hasAnySigns,
        [blockTouchKey("e41", currentBlockIndex)]: true,
      },
    });
  };

  return (
    <CriteriaAccordionGroup
      allValues={visibleAccordionValues}
      defaultOpenValues={visibleAccordionValues}
      filter={filter}
      command={command}
    >
      {!isCiclorrota && canShow("b41") ? (
        <AssessmentCriterionAccordion
          value="b41"
          title="B.4.1. Sinalização vertical de regulamentação"
          description="Presença de placas de regulamentação ao longo do trecho."
          scorePreview={buildCriterionScorePreview(data, ["B4"])}
          extraBadges={b4CompositeBadge}
          answered={isTouched([
            "regulation_signs_per_block",
            "regulation_signs_per_block_by_block",
            "signs_both_directions",
            "signs_both_directions_by_block",
          ])}
          inAnalysis={data.criterion_workflow_state?.b41 === "analysis"}
          onAnalysisChange={(value) => updateWorkflow("b41", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                regulation_signs_per_block: 0,
                regulation_signs_per_block_by_block: [],
                signs_both_directions: null,
              signs_both_directions_by_block: [],
                touched_fields: {
                  regulation_signs_per_block: false,
                  regulation_signs_per_block_by_block: false,
                  signs_both_directions: false,
                  signs_both_directions_by_block: false,
                  ...resetBlockTouchKeys(["b41_signs", "b41_directions"]),
                },
              })
            }
          helpKey="b41"
          pager={blockPager}
          showPager={!hideBlockPager}
        >
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">N° de placas por quadra:</Label>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2].map((value) => (
                  <button
                    key={`signs-${value}`}
                    type="button"
                    className={chipClassName(
                      hasTouchedB41Signs && currentRegulationSignsPerBlock === value
                    )}
                    onClick={() => setRegulationSignsByBlock(value, currentSignsBothDirections, "b41_signs")}
                  >
                    {value === 2 ? "2+" : value}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Placas nos dois sentidos:</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Sim", value: true },
                  { label: "Não", value: false },
                ].map((option) => (
                  <button
                    key={`directions-${option.label}`}
                    type="button"
                    className={chipClassName(currentSignsBothDirections === option.value)}
                    onClick={() =>
                      setRegulationSignsByBlock(
                        currentRegulationSignsPerBlock,
                        option.value,
                        "b41_directions"
                      )
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AssessmentCriterionAccordion>
      ) : null}

      {!isCiclorrota && canShow("b42") ? (
        <AssessmentCriterionAccordion
          value="b42"
          title="B.4.2. Identificação do espaço de circulação de bicicletas"
          description="Pintura, contraste e reconhecimento visual do espaço cicloviário."
          scorePreview={buildCriterionScorePreview(data, ["B4"])}
          extraBadges={b4CompositeBadge}
          answered={isTouched(["space_identification"])}
          inAnalysis={data.criterion_workflow_state?.b42 === "analysis"}
          onAnalysisChange={(value) => updateWorkflow("b42", value ? "analysis" : "default")}
          onClear={() =>
            onDataChange({ space_identification: "", touched_fields: { space_identification: false } })
          }
          helpKey="b42"
        >
          <ConceptCriteriaTable
            value={data.space_identification || ""}
            onValueChange={(value) => handleRadioChange("space_identification", value)}
            options={[
              {
                value: "A",
                description:
                  "Pavimento ou pintura total em tom vermelho ou ao menos nas aproximações de travessias de pedestres e áreas de conflito com outros modos.",
              },
              {
                value: "B",
                description:
                  "Faixa de contraste nos dois bordos da infraestrutura cicloviária em toda a extensão.",
              },
              {
                value: "C",
                description:
                  "Faixa de contraste vermelha em apenas um dos bordos da infraestrutura cicloviária.",
              },
              {
                value: "D",
                description:
                  "Não há pintura de contraste (vermelha) ou a pintura está muito danificada.",
              },
            ]}
          />
        </AssessmentCriterionAccordion>
      ) : null}

      {!isCiclorrota && canShow("e41") ? (
        <AssessmentCriterionAccordion
          value="e41"
          title="E.4.1. Estado de conservação da sinalização vertical"
          description="Entrada de conservação da sinalização vertical para avaliação por quadra."
          scorePreview={buildCriterionScorePreview(data, ["E4"])}
          extraBadges={e4CompositeBadge}
          answered={isTouched([
            "vertical_signs_conservation",
            "vertical_signs_conservation_by_block",
          ])}
          inAnalysis={data.criterion_workflow_state?.e41 === "analysis"}
          onAnalysisChange={(value) => updateWorkflow("e41", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                vertical_signs_conservation: "",
                vertical_signs_conservation_by_block: [],
                touched_fields: {
                  vertical_signs_conservation: false,
                  vertical_signs_conservation_by_block: false,
                  ...resetBlockTouchKeys(["e41"]),
                },
              })
            }
          helpKey="e42"
          pager={blockPager}
          showPager={!hideBlockPager}
        >
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Estado de conservação na quadra</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Bom", value: "good" as const },
                  { label: "Danos", value: "damage" as const },
                ].map((option) => (
                  <button
                    key={`vertical-signs-condition-${option.value}`}
                    type="button"
                    className={chipClassName(currentVerticalSignsCondition === option.value)}
                    onClick={() => setVerticalSignsConditionByBlock(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AssessmentCriterionAccordion>
      ) : null}

      {!isCiclorrota && canShow("e42") ? (
        <AssessmentCriterionAccordion
          value="e42"
          title="E.4.2. Estado de conservação da identificação do espaço cicloviário"
          description="Entrada de conservação da identificação do espaço para o cálculo de E.4."
          scorePreview={buildCriterionScorePreview(data, ["E4"])}
          extraBadges={e4CompositeBadge}
          answered={isTouched(["identification_conservation"])}
          inAnalysis={data.criterion_workflow_state?.e42 === "analysis"}
          onAnalysisChange={(value) => updateWorkflow("e42", value ? "analysis" : "default")}
          onClear={() =>
            onDataChange({
              identification_conservation: "",
              touched_fields: { identification_conservation: false },
            })
          }
          helpKey="e41"
        >
          <ConceptCriteriaTable
            value={data.identification_conservation || ""}
            onValueChange={(value) => handleRadioChange("identification_conservation", value)}
            options={[
              {
                value: "A",
                description:
                  "Boa identificação da infraestrutura cicloviária, com preenchimento total da área útil em tom vermelho (pavimento pigmentado ou pintura).",
              },
              {
                value: "B",
                description:
                  "Há identificação de mais da metade da infraestrutura ou ao menos nas aproximações de travessias de pedestres e áreas de conflito com outros modos.",
              },
              {
                value: "C",
                description:
                  "Há identificação em menos da metade do trecho da infraestrutura cicloviária ou está muito danificada.",
              },
              {
                value: "D",
                description: "Praticamente apagada.",
              },
            ]}
          />
        </AssessmentCriterionAccordion>
      ) : null}

      {isCiclorrota && canShow("b43") ? (
        <AssessmentCriterionAccordion
          value="b43"
          title="B.4.3. Inscrições no pavimento - pictogramas"
          description="Critério específico para ciclorrotas."
          scorePreview={buildCriterionScorePreview(data, ["B4"])}
          answered={isTouched([
            "pictograms_per_block",
            "pictograms_cover_all_blocks",
          ])}
          inAnalysis={data.criterion_workflow_state?.b43 === "analysis"}
          onAnalysisChange={(value) => updateWorkflow("b43", value ? "analysis" : "default")}
          onClear={() =>
            onDataChange({
              pictograms_per_block: 0,
              pictograms_cover_all_blocks: false,
              touched_fields: {
                pictograms_per_block: false,
                pictograms_cover_all_blocks: false,
              },
            })
          }
          helpKey="b43"
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
          </div>
        </AssessmentCriterionAccordion>
      ) : null}

      {isCiclorrota && canShow("e43") ? (
        <AssessmentCriterionAccordion
          value="e43"
          title="E.4.3. Estado de conservação das inscrições no pavimento"
          description="Avalia a conservação dos pictogramas e inscrições no pavimento em ciclorrotas."
          scorePreview={buildCriterionScorePreview(data, ["E4"])}
          answered={isTouched(["pictograms_conservation"])}
          inAnalysis={data.criterion_workflow_state?.e43 === "analysis"}
          onAnalysisChange={(value) => updateWorkflow("e43", value ? "analysis" : "default")}
          onClear={() =>
            onDataChange({
              pictograms_conservation: "",
              touched_fields: {
                pictograms_conservation: false,
              },
            })
          }
          helpKey="e43"
        >
          <ConceptCriteriaTable
            value={data.pictograms_conservation || ""}
            onValueChange={(value) => handleRadioChange("pictograms_conservation", value)}
            options={[
              {
                value: "A",
                description: "Pictogramas visíveis em toda a extensão.",
              },
              {
                value: "B",
                description: "Não se aplica.",
              },
              {
                value: "C",
                description: "Pictogramas desgastados em toda a extensão.",
              },
              {
                value: "D",
                description: "Praticamente apagados ou não há.",
              },
            ]}
          />
        </AssessmentCriterionAccordion>
      ) : null}

    </CriteriaAccordionGroup>
  );
};

export default Page6;
