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
    if (type.includes("compartilhada") || type.includes("calçada")) return "calcada";
    return "ciclofaixa";
  };

  const infraType = getInfraType();
  const isCiclorrota = infraType === "ciclorrota";
  const isCalcada = infraType === "calcada";
  const showE3 = !isCiclorrota && !isCalcada;
  const b3FinalRating = buildCriterionScorePreview(data, ["B3"])[0]?.rating;
  const b31LocalRating =
    infraType === "ciclofaixa"
      ? data.separation_devices_ciclofaixa || null
      : infraType === "ciclovia"
        ? data.separation_devices_ciclovia || null
        : infraType === "calcada"
          ? data.separation_devices_calcada || null
          : null;
  const bufferConcept =
    Number(data.lateral_spacing_width_m || 0) <= 0
      ? null
      : Number(data.velocity_kmh || 0) >= 50
        ? data.lateral_spacing_type === "apagada"
          ? "D"
          : Number(data.lateral_spacing_width_m || 0) > 1
            ? "A"
            : Number(data.lateral_spacing_width_m || 0) >= 0.4 &&
                Number(data.lateral_spacing_width_m || 0) <= 1
              ? "B"
              : Number(data.lateral_spacing_width_m || 0) >= 0.2 &&
                  Number(data.lateral_spacing_width_m || 0) < 0.4
                ? "C"
                : "D"
        : data.lateral_spacing_type === "apagada"
          ? "D"
          : Number(data.lateral_spacing_width_m || 0) > 0.7
            ? "A"
            : Number(data.lateral_spacing_width_m || 0) > 0.4 &&
                Number(data.lateral_spacing_width_m || 0) <= 0.7 &&
                ((infraType === "ciclovia") ||
                  ["A", "B", "C"].includes(data.separation_devices_ciclofaixa || "") ||
                  data.has_double_lateral_line)
              ? "B"
              : !(infraType === "ciclovia") &&
                  !["A", "B", "C"].includes(data.separation_devices_ciclofaixa || "") &&
                  !data.has_double_lateral_line
                ? "C"
                : "D";
  const b3LocalConceptBadge =
    b31LocalRating || bufferConcept ? (
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${matrixBadgeClassName(
          b3FinalRating
        )}`}
      >
        <span>{b31LocalRating || "–"}</span>
        <span className="mx-1.5 opacity-70">×</span>
        <span>{bufferConcept || "–"}</span>
      </span>
    ) : null;
  const e3FinalRating = buildCriterionScorePreview(data, ["E3"])[0]?.rating;
  const e3CompositeBadge =
    data.devices_conservation || data.spacing_conservation ? (
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${matrixBadgeClassName(
          e3FinalRating
        )}`}
      >
        <span>{data.devices_conservation || "–"}</span>
        <span className="mx-1.5 opacity-70">×</span>
        <span>{data.spacing_conservation || "–"}</span>
      </span>
    ) : null;
  const isTouched = (fields: string[]) => fields.some((field) => data.touched_fields?.[field]);
  const updateWorkflow = (criterion: string, value: "default" | "analysis") =>
    onDataChange({
      criterion_workflow_state: {
        ...(data.criterion_workflow_state || {}),
        [criterion]: value,
      },
    });

  return (
    <CriteriaAccordionGroup allValues={["b31", "e31", "e32"]} defaultOpenValues={isCiclorrota ? [] : ["b31"]} filter={filter} command={command}>
          {!isCiclorrota ? (
          <AssessmentCriterionAccordion
            value="b31"
            title="B.3.1. Delimitação e separação da infraestrutura"
            description="O conteúdo muda conforme a tipologia da estrutura escolhida."
            scorePreview={buildCriterionScorePreview(data, ["B3"])}
            extraBadges={b3LocalConceptBadge}
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
              value="e31"
              title="E.3.1. Estado de conservação dos dispositivos de separação"
              description="Primeira entrada do cálculo E.3, aplicada a ciclovias e ciclofaixas."
              scorePreview={buildCriterionScorePreview(data, ["E3"])}
              extraBadges={e3CompositeBadge}
              answered={isTouched(["devices_conservation"])}
              inAnalysis={data.criterion_workflow_state?.e31 === "analysis"}
              onAnalysisChange={(value) => updateWorkflow("e31", value ? "analysis" : "default")}
              onClear={() =>
                onDataChange({
                  devices_conservation: "",
                  touched_fields: {
                    devices_conservation: false,
                  },
                })
              }
              helpKey="E3"
            >
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
            </AssessmentCriterionAccordion>
          ) : null}

          {showE3 ? (
            <AssessmentCriterionAccordion
              value="e32"
              title="E.3.2. Estado de conservação da faixa de afastamento lateral"
              description="Segunda entrada do cálculo E.3, combinada com E.3.1 pela matriz do manual."
              scorePreview={buildCriterionScorePreview(data, ["E3"])}
              extraBadges={e3CompositeBadge}
              answered={isTouched(["spacing_conservation"])}
              inAnalysis={data.criterion_workflow_state?.e32 === "analysis"}
              onAnalysisChange={(value) => updateWorkflow("e32", value ? "analysis" : "default")}
              onClear={() =>
                onDataChange({
                  spacing_conservation: "",
                  touched_fields: {
                    spacing_conservation: false,
                  },
                })
              }
              helpKey="E3"
            >
              <ConceptCriteriaTable
                value={data.spacing_conservation || ""}
                onValueChange={(value) => handleRadioChange("spacing_conservation", value)}
                options={[
                  {
                    value: "A",
                    description: "Há demarcação em ótimo estado, visível em toda a extensão.",
                  },
                  {
                    value: "B",
                    description: "Há demarcação em bom estado em mais da metade do trecho.",
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
            </AssessmentCriterionAccordion>
          ) : null}
        </CriteriaAccordionGroup>
  );
};

export default Page5;
