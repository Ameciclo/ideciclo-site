import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Page5Props {
  data: any;
  onDataChange: (data: any) => void;
}

const Page5: React.FC<Page5Props> = ({ data, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    onDataChange({ [name]: processedValue });
  };

  const handleRadioChange = (name: string, value: string) => {
    onDataChange({ [name]: value });
  };

  // Determine which separation devices section to show based on infra_typology
  const getInfraType = () => {
    const type = data.infra_typology?.toLowerCase() || "";
    if (type.includes("ciclofaixa")) return "ciclofaixa";
    if (type.includes("ciclovia")) return "ciclovia";
    if (type.includes("compartilhada") || type.includes("calçada")) return "calcada";
    return "ciclofaixa"; // Default
  };

  const infraType = getInfraType();

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">B.3/E.2. Delimitação da Infraestrutura Cicloviária</h3>
          
          {infraType === "ciclofaixa" && (
            <div>
              <Label className="block mb-2">Dispositivos de Separação (Ciclofaixa):</Label>
              <RadioGroup
                value={data.separation_devices_ciclofaixa || "D"}
                onValueChange={(value) => handleRadioChange("separation_devices_ciclofaixa", value)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="A" id="ciclofaixa_A" />
                  <Label htmlFor="ciclofaixa_A">Dispositivos (tachas, tachinhas ou balizadores) distanciados até 1 m entre si.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="B" id="ciclofaixa_B" />
                  <Label htmlFor="ciclofaixa_B">Dispositivos distanciados entre 1,5 e 3 m entre si; trechos com aberturas pontuais para acessar estacionamento dentro dos lotes.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="C" id="ciclofaixa_C" />
                  <Label htmlFor="ciclofaixa_C">Dispositivos distanciados a mais de 3,5 metros entre si; trechos com muitas aberturas para acessar estacionamentos dentro dos lotes.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="D" id="ciclofaixa_D" />
                  <Label htmlFor="ciclofaixa_D">Não há dispositivos na infraestrutura cicloviária.</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {infraType === "ciclovia" && (
            <div>
              <Label className="block mb-2">Dispositivos de Separação (Ciclovia):</Label>
              <RadioGroup
                value={data.separation_devices_ciclovia || "A"}
                onValueChange={(value) => handleRadioChange("separation_devices_ciclovia", value)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="A" id="ciclovia_A" />
                  <Label htmlFor="ciclovia_A">Segregação total dos veículos motorizados (segregadores, ilhas físicas e níveis diferentes)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="B" id="ciclovia_B" />
                  <Label htmlFor="ciclovia_B">Segregação total, com aberturas pontuais para acessar estacionamento dentro dos lotes ao longo do trecho.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="C" id="ciclovia_C" />
                  <Label htmlFor="ciclovia_C">Elementos de segregação distanciados entre si até 2 m ao longo do trecho; com aberturas pontuais para acessar estacionamento dentro dos lotes ao longo do trecho.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="D" id="ciclovia_D" />
                  <Label htmlFor="ciclovia_D">Elementos de segregação com distância superior a 2,5 m entre si ao longo do trecho; com muitas aberturas para acessar estacionamentos dentro dos lotes.</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {infraType === "calcada" && (
            <div>
              <Label className="block mb-2">Dispositivos de Separação (Calçada Compartilhada):</Label>
              <RadioGroup
                value={data.separation_devices_calcada || "D"}
                onValueChange={(value) => handleRadioChange("separation_devices_calcada", value)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="A" id="calcada_A" />
                  <Label htmlFor="calcada_A">Demarcação clara no piso que diferencia os espaços de circulação dos ciclistas, separado dos pedestres, com o uso de diferentes pavimentos.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="B" id="calcada_B" />
                  <Label htmlFor="calcada_B">Demarcação dos espaços de pedestres e ciclistas em áreas separadas sobre um mesmo tipo de pavimento, por sinalização horizontal vermelha, marcas horizontais e pictogramas.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="C" id="calcada_C" />
                  <Label htmlFor="calcada_C">Demarcação apenas com marca/linha horizontal ao longo do trecho; (ou) apenas pictogramas orientando fluxos de circulação.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="D" id="calcada_D" />
                  <Label htmlFor="calcada_D">Não há delimitação ou diferenciação dos espaços de ciclistas e de pedestres.</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="mt-4">
            <Label className="block mb-2">Estado de conservação dos dispositivos de segregação ou separação:</Label>
            <RadioGroup
              value={data.devices_conservation || "A"}
              onValueChange={(value) => handleRadioChange("devices_conservation", value)}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A" id="devices_A" />
                <Label htmlFor="devices_A">Há dispositivos de separação ou segregação em todo o trecho, visível em toda a extensão.</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="B" id="devices_B" />
                <Label htmlFor="devices_B">Dispositivos em mais da metade do trecho em bom estado de conservação.</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="C" id="devices_C" />
                <Label htmlFor="devices_C">Dispositivos em menos da metade do trecho ou estão muito danificados.</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="D" id="devices_D" />
                <Label htmlFor="devices_D">Praticamente não há dispositivos.</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {(infraType === "ciclofaixa" || infraType === "ciclovia") && (
          <div>
            <h3 className="text-lg font-medium mb-2">B.3.2. Afastamento lateral do fluxo veicular</h3>
            <div className="space-y-4">
              <div>
                <Label>Afastamento:</Label>
                <RadioGroup
                  value={data.lateral_spacing_type || "linha"}
                  onValueChange={(value) => handleRadioChange("lateral_spacing_type", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="linha" id="spacing_linha" />
                    <Label htmlFor="spacing_linha">Somente linha de delimitação</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dispositivos" id="spacing_dispositivos" />
                    <Label htmlFor="spacing_dispositivos">Existência de dispositivos de separação ou segregação</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="lateral_spacing_width_m">Largura do afastamento lateral (m):</Label>
                <Input
                  id="lateral_spacing_width_m"
                  name="lateral_spacing_width_m"
                  type="number"
                  step="0.1"
                  value={data.lateral_spacing_width_m || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Estado de conservação do afastamento lateral:</Label>
                <RadioGroup
                  value={data.spacing_conservation || "A"}
                  onValueChange={(value) => handleRadioChange("spacing_conservation", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="spacing_A" />
                    <Label htmlFor="spacing_A">Há demarcação em ótimo estado, visível em toda a extensão.</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="spacing_B" />
                    <Label htmlFor="spacing_B">Há demarcação em bom estado em mais da metade do trecho.</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="C" id="spacing_C" />
                    <Label htmlFor="spacing_C">Há demarcação em menos da metade do trecho ou está muito danificada.</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="D" id="spacing_D" />
                    <Label htmlFor="spacing_D">Praticamente inexiste</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Page5;