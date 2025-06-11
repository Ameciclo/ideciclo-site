import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface Page3Props {
  data: any;
  onDataChange: (data: any) => void;
}

const Page3: React.FC<Page3Props> = ({ data, onDataChange }) => {
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

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">B.1.1. Largura da infraestrutura cicloviária</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="width_meters">Largura em metros:</Label>
              <Input
                id="width_meters"
                name="width_meters"
                type="number"
                step="0.1"
                value={data.width_meters || ""}
                onChange={handleChange}
              />
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
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">B.1.2. Medidas de moderação de velocidade (em ciclorrotas)</h3>
          <div className="space-y-4">
            <div>
              <Label>Medidas:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
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
                    onCheckedChange={(checked) => handleCheckboxChange("elevacao_intersecao", !!checked)}
                  />
                  <Label htmlFor="elevacao_intersecao">Elevação da interseção viária</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reducao_largura"
                    checked={(data.speed_measures || []).includes("reducao_largura")}
                    onCheckedChange={(checked) => handleCheckboxChange("reducao_largura", !!checked)}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default Page3;