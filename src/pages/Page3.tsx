import React, { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import AssessmentCriterionAccordion from "@/components/AssessmentCriterionAccordion";
import CriteriaAccordionGroup from "@/components/CriteriaAccordionGroup";
import { IdecicloFormData } from "@/types/idecicloForm";
import { buildCriterionScorePreview } from "@/utils/criterionScorePreview";

interface Page3Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
}

const Page3: React.FC<Page3Props> = ({ data, onDataChange }) => {
  const [widthDraftCm, setWidthDraftCm] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    onDataChange({ [name]: processedValue });
  };

  const handleRadioChange = (name: string, value: boolean) => {
    onDataChange({ [name]: value });
  };

  const handleCheckboxChange = (measure: string, checked: boolean) => {
    const currentMeasures = [...(data.speed_measures || [])];
    if (checked) {
      if (!currentMeasures.includes(measure)) {
        currentMeasures.push(measure);
      }
    } else {
      const index = currentMeasures.indexOf(measure);
      if (index !== -1) {
        currentMeasures.splice(index, 1);
      }
    }
    onDataChange({ speed_measures: currentMeasures });
  };

  const isTouched = (fields: string[]) => fields.some((field) => data.touched_fields?.[field]);
  const updateWorkflow = (criterion: string, value: "default" | "analysis") =>
    onDataChange({
      criterion_workflow_state: {
        ...(data.criterion_workflow_state || {}),
        [criterion]: value,
      },
    });
  const widthMeasurements = useMemo(
    () => (Array.isArray(data.width_measurements_m) ? data.width_measurements_m : []),
    [data.width_measurements_m]
  );
  const widthAverage = useMemo(() => {
    if (widthMeasurements.length === 0) return data.width_meters || 0;
    const total = widthMeasurements.reduce((sum, measurement) => sum + measurement, 0);
    return total / widthMeasurements.length;
  }, [data.width_meters, widthMeasurements]);

  const formatMeters = (value: number) => value.toFixed(2).replace(".", ",");

  const addWidthMeasurement = () => {
    const parsedCentimeters = Number(widthDraftCm.replace(",", "."));
    if (!Number.isFinite(parsedCentimeters) || parsedCentimeters <= 0) return;

    const measurementMeters = parsedCentimeters / 100;
    const nextMeasurements = [...widthMeasurements, measurementMeters];
    const nextAverage =
      nextMeasurements.reduce((sum, measurement) => sum + measurement, 0) /
      nextMeasurements.length;

    onDataChange({
      width_measurements_m: nextMeasurements,
      width_meters: Number(nextAverage.toFixed(4)),
      touched_fields: {
        width_measurements_m: true,
        width_meters: true,
      },
    });
    setWidthDraftCm("");
  };

  const removeWidthMeasurement = (indexToRemove: number) => {
    const nextMeasurements = widthMeasurements.filter((_, index) => index !== indexToRemove);
    const nextAverage =
      nextMeasurements.length > 0
        ? nextMeasurements.reduce((sum, measurement) => sum + measurement, 0) /
          nextMeasurements.length
        : 0;

    onDataChange({
      width_measurements_m: nextMeasurements,
      width_meters: Number(nextAverage.toFixed(4)),
      touched_fields: {
        width_measurements_m: nextMeasurements.length > 0,
        width_meters: nextMeasurements.length > 0,
      },
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <CriteriaAccordionGroup allValues={["b11", "b12"]} defaultOpenValues={["b11"]}>
          <AssessmentCriterionAccordion
            value="b11"
            title="B.1.1. Largura da infraestrutura cicloviária"
            description="Permite informar a largura medida para cálculo automático do conceito."
            scorePreview={buildCriterionScorePreview(data, ["B1"])}
            answered={
              widthMeasurements.length > 0 ||
              data.width_meters > 0 ||
              isTouched(["width_meters", "width_measurements_m", "includes_gutter"])
            }
            inAnalysis={data.criterion_workflow_state?.b11 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("b11", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                width_meters: 0,
                width_measurements_m: [],
                includes_gutter: false,
                touched_fields: {
                  width_meters: false,
                  width_measurements_m: false,
                  includes_gutter: false,
                },
              })
            }
            helpKey="B1"
          >
            <div className="space-y-4">
              <div className="rounded-xl border p-4">
                <Label htmlFor="width_measurement_cm" className="mb-3 block">
                  Adicionar medição de largura
                </Label>
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="flex-1">
                    <Input
                      id="width_measurement_cm"
                      inputMode="decimal"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Ex.: 235"
                      value={widthDraftCm}
                      onChange={(event) => setWidthDraftCm(event.target.value)}
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Digite em centímetros para permitir precisão centimétrica. Ex.: 235 = 2,35 m.
                    </p>
                  </div>
                  <Button type="button" className="md:self-start" onClick={addWidthMeasurement}>
                    Adicionar medida
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <div className="text-sm font-medium text-foreground">Média calculada</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900">
                    {formatMeters(widthAverage)} m
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Essa média é o valor usado no cálculo automático do critério.
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="text-sm font-medium text-foreground">Histórico de medições</div>
                  {widthMeasurements.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {widthMeasurements.map((measurement, index) => (
                        <button
                          key={`${measurement}-${index}`}
                          type="button"
                          onClick={() => removeWidthMeasurement(index)}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          {index + 1}. {formatMeters(measurement)} m ×
                        </button>
                      ))}
                    </div>
                  ) : data.width_meters > 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Há uma média registrada de {formatMeters(data.width_meters)} m, mas ainda sem
                      histórico individual de medições.
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Nenhuma medição adicionada ainda.
                    </p>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Toque em uma medição para removê-la do cálculo.
                  </p>
                </div>
              </div>

              <div>
                <Label>Inclui sarjeta:</Label>
                <RadioGroup
                  value={data.includes_gutter ? "true" : "false"}
                  onValueChange={(value) => handleRadioChange("includes_gutter", value === "true")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="gutter_yes" />
                    <Label htmlFor="gutter_yes">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="gutter_no" />
                    <Label htmlFor="gutter_no">Não</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </AssessmentCriterionAccordion>

          <AssessmentCriterionAccordion
            value="b12"
            title="B.1.2. Medidas de moderação de velocidade"
            description="Aplicável especialmente a ciclorrotas, com seleção de medidas e distância média entre elas."
            scorePreview={buildCriterionScorePreview(data, ["B6"])}
            answered={isTouched(["speed_measures", "avg_distance_measures_m"])}
            inAnalysis={data.criterion_workflow_state?.b12 === "analysis"}
            onAnalysisChange={(value) => updateWorkflow("b12", value ? "analysis" : "default")}
            onClear={() =>
              onDataChange({
                speed_measures: [],
                avg_distance_measures_m: 0,
                touched_fields: { speed_measures: false, avg_distance_measures_m: false },
              })
            }
            helpKey="B6"
          >
            <div className="space-y-4">
              <div>
                <Label>Medidas:</Label>
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lombada"
                      checked={(data.speed_measures || []).includes("lombada")}
                      onCheckedChange={(checked) => handleCheckboxChange("lombada", !!checked)}
                    />
                    <Label htmlFor="lombada">Lombada, quebra-molas, ondulações transv.</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="valas"
                      checked={(data.speed_measures || []).includes("valas")}
                      onCheckedChange={(checked) => handleCheckboxChange("valas", !!checked)}
                    />
                    <Label htmlFor="valas">Valas transversais</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="faixa_elevada"
                      checked={(data.speed_measures || []).includes("faixa_elevada")}
                      onCheckedChange={(checked) => handleCheckboxChange("faixa_elevada", !!checked)}
                    />
                    <Label htmlFor="faixa_elevada">Faixa de travessia elevada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="elevacao_intersecao"
                      checked={(data.speed_measures || []).includes("elevacao_intersecao")}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("elevacao_intersecao", !!checked)
                      }
                    />
                    <Label htmlFor="elevacao_intersecao">Elevação da interseção viária</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reducao_largura"
                      checked={(data.speed_measures || []).includes("reducao_largura")}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("reducao_largura", !!checked)
                      }
                    />
                    <Label htmlFor="reducao_largura">Redução das larguras das faixas</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="avg_distance_measures_m">Distância média entre medidas (m):</Label>
                <Input
                  id="avg_distance_measures_m"
                  name="avg_distance_measures_m"
                  type="number"
                  value={data.avg_distance_measures_m || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </AssessmentCriterionAccordion>
        </CriteriaAccordionGroup>
      </CardContent>
    </Card>
  );
};

export default Page3;
