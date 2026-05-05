import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AssessmentCriterionAccordion from "@/components/AssessmentCriterionAccordion";
import ConceptCriteriaTable from "@/components/ConceptCriteriaTable";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { CriterionFilter } from "@/components/criteriaAccordionContext";
import { IdecicloFormData } from "@/types/idecicloForm";
import { buildCriterionScorePreview } from "@/utils/criterionScorePreview";

interface Page4Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  originalPavementType?: string;
  originalPavementSource?: string;
  filter?: CriterionFilter;
  command?: { type: "expand" | "collapse"; nonce: number } | null;
}

const Page4: React.FC<Page4Props> = ({
  data,
  onDataChange,
  originalPavementType,
  originalPavementSource,
  filter,
  command,
}) => {
  const [allowPavementEdit, setAllowPavementEdit] = useState(false);

  useEffect(() => {
    if (!originalPavementType) {
      setAllowPavementEdit(true);
    }
  }, [originalPavementType]);

  const handleRadioChange = (name: string, value: string) => {
    onDataChange({ [name]: value });
  };

  const handlePavementEditToggle = (checked: boolean) => {
    setAllowPavementEdit(checked);

    if (!checked) {
      onDataChange({
        pavement_type: originalPavementType || "",
      });
    }
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
    <CriteriaAccordionGroup
      allValues={["b2", "e2"]}
      defaultOpenValues={["b2", "e2"]}
      filter={filter}
      command={command}
    >
          <AssessmentCriterionAccordion
            value="b2"
            title="B.2. Tipo de pavimento da infraestrutura cicloviária"
            description="Classificação do material predominante do pavimento."
            scorePreview={buildCriterionScorePreview(data, ["B2"])}
            answered={Boolean(data.pavement_type) || isTouched(["pavement_type"])}
            inAnalysis={data.criterion_workflow_state?.b2 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("b2", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                pavement_type: originalPavementType || "",
                touched_fields: { pavement_type: false },
              })
            }
            helpKey="b2"
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <Label className="text-base font-semibold text-slate-900">Tipo de pavimento</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Quando houver `surface` no OSM, o conceito é sugerido automaticamente e pode ser corrigido em campo.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="allow_pavement_edit" className="text-sm">
                    Corrigir pavimento em campo
                  </Label>
                  <Switch
                    id="allow_pavement_edit"
                    checked={allowPavementEdit}
                    onCheckedChange={handlePavementEditToggle}
                  />
                </div>
              </div>

              {originalPavementSource ? (
                <p className="text-sm text-muted-foreground">
                  Referência original do OSM: <strong>{originalPavementSource}</strong>
                </p>
              ) : null}

              <ConceptCriteriaTable
                value={data.pavement_type || ""}
                onValueChange={(value) => handleRadioChange("pavement_type", value)}
                disabled={!allowPavementEdit}
                options={[
                  {
                    value: "A",
                    description: "Pisos betuminosos (asfalto) ou cimentícios (concreto).",
                  },
                  {
                    value: "B",
                    description:
                      "Pisos modulares (blocos de concreto e similares) bem assentados.",
                  },
                  {
                    value: "C",
                    description:
                      "Pisos de pedras irregulares (pedras portuguesas, paralelepípedo e similares), pisos com espaçamento (tampas de bueiros em calçadas, sobre córregos e similares).",
                  },
                  {
                    value: "D",
                    description:
                      "Pisos de barro ou similares; grelhas e chapas metálicas; pisos modulares soltos; pisos derrapantes.",
                  },
                ]}
              />
            </div>
          </AssessmentCriterionAccordion>

          <AssessmentCriterionAccordion
            value="e2"
            title="E.2. Estado de conservação do pavimento"
            description="Avalia a integridade da superfície e a qualidade de rodagem."
            scorePreview={buildCriterionScorePreview(data, ["E2"])}
            answered={isTouched(["conservation_state"])}
            inAnalysis={data.criterion_workflow_state?.e2 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("e2", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                conservation_state: "",
                touched_fields: { conservation_state: false },
              })
            }
            helpKey="E2"
          >
            <ConceptCriteriaTable
              value={data.conservation_state || ""}
              onValueChange={(value) => handleRadioChange("conservation_state", value)}
              options={[
                {
                  value: "A",
                  description: "Piso nivelado, sem ondulações.",
                },
                {
                  value: "B",
                  description:
                    "Piso com leve desnivelamento, que não requeira ao ciclista frear.",
                },
                {
                  value: "C",
                  description:
                    "Piso com desnível transversal ou buraco raso; piso com desgaste até a metade de sua largura útil.",
                },
                {
                  value: "D",
                  description:
                    "Piso com degraus / buracos profundos; piso com desgaste superior à metade da largura útil.",
                },
              ]}
            />
          </AssessmentCriterionAccordion>
        </CriteriaAccordionGroup>
  );
};

export default Page4;
