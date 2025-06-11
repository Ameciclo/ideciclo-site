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
                value={data.separation_devices_ciclofaixa || "nao_ha"}
                onValueChange={(value) => handleRadioChange("separation_devices_ciclofaixa", value)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ate_1m" id="ciclofaixa_ate_1m" />
                  <Label htmlFor="ciclofaixa_ate_1m">Dispositivos (tachas, tachinhas ou balizadores) distanciados até 1 m entre si.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1_5_3m" id="ciclofaixa_1_5_3m" />
                  <Label htmlFor="ciclofaixa_1_5_3m">Dispositivos distanciados entre 1,5 e 3 m entre si; trechos com aberturas pontuais para acessar estacionamento dentro dos lotes.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mais_3_5m" id="ciclofaixa_mais_3_5m" />
                  <Label htmlFor="ciclofaixa_mais_3_5m">Dispositivos distanciados a mais de 3,5 metros entre si; trechos com muitas aberturas para acessar estacionamentos dentro dos lotes.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao_ha" id="ciclofaixa_nao_ha" />
                  <Label htmlFor="ciclofaixa_nao_ha">Não há dispositivos na infraestrutura cicloviária.</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {infraType === "ciclovia" && (
            <div>
              <Label className="block mb-2">Dispositivos de Separação (Ciclovia):</Label>
              <RadioGroup
                value={data.separation_devices_ciclovia || "total"}
                onValueChange={(value) => handleRadioChange("separation_devices_ciclovia", value)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="total" id="ciclovia_total" />
                  <Label htmlFor="ciclovia_total">Segregação total dos veículos motorizados (segregadores, ilhas físicas e níveis diferentes)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="total_aberturas" id="ciclovia_total_aberturas" />
                  <Label htmlFor="ciclovia_total_aberturas">Segregação total, com aberturas pontuais para acessar estacionamento dentro dos lotes ao longo do trecho.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ate_2m" id="ciclovia_ate_2m" />
                  <Label htmlFor="ciclovia_ate_2m">Elementos de segregação distanciados entre si até 2 m ao longo do trecho; com aberturas pontuais para acessar estacionamento dentro dos lotes ao longo do trecho.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mais_2_5m" id="ciclovia_mais_2_5m" />
                  <Label htmlFor="ciclovia_mais_2_5m">Elementos de segregação com distância superior a 2,5 m entre si ao longo do trecho; com muitas aberturas para acessar estacionamentos dentro dos lotes.</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {infraType === "calcada" && (
            <div>
              <Label className="block mb-2">Dispositivos de Separação (Calçada Compartilhada):</Label>
              <RadioGroup
                value={data.separation_devices_calcada || "nao_ha"}
                onValueChange={(value) => handleRadioChange("separation_devices_calcada", value)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="demarcacao_clara" id="calcada_demarcacao_clara" />
                  <Label htmlFor="calcada_demarcacao_clara">Demarcação clara no piso que diferencia os espaços de circulação dos ciclistas, separado dos pedestres, com o uso de diferentes pavimentos.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="demarcacao_separada" id="calcada_demarcacao_separada" />
                  <Label htmlFor="calcada_demarcacao_separada">Demarcação dos espaços de pedestres e ciclistas em áreas separadas sobre um mesmo tipo de pavimento, por sinalização horizontal vermelha, marcas horizontais e pictogramas.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="linha_pictograma" id="calcada_linha_pictograma" />
                  <Label htmlFor="calcada_linha_pictograma">Demarcação apenas com marca/linha horizontal ao longo do trecho; (ou) apenas pictogramas orientando fluxos de circulação.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao_ha" id="calcada_nao_ha" />
                  <Label htmlFor="calcada_nao_ha">Não há delimitação ou diferenciação dos espaços de ciclistas e de pedestres.</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="mt-4">
            <Label className="block mb-2">Estado de conservação dos dispositivos de segregação ou separação:</Label>
            <RadioGroup
              value={data.devices_conservation || "todo_trecho"}
              onValueChange={(value) => handleRadioChange("devices_conservation", value)}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="todo_trecho" id="devices_todo_trecho" />
                <Label htmlFor="devices_todo_trecho">Há dispositivos de separação ou segregação em todo o trecho, visível em toda a extensão.</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mais_metade" id="devices_mais_metade" />
                <Label htmlFor="devices_mais_metade">Dispositivos em mais da metade do trecho em bom estado de conservação.</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="menos_metade" id="devices_menos_metade" />
                <Label htmlFor="devices_menos_metade">Dispositivos em menos da metade do trecho ou estão muito danificados.</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nao_ha" id="devices_nao_ha" />
                <Label htmlFor="devices_nao_ha">Praticamente não há dispositivos.</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

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
                value={data.spacing_conservation || "otimo"}
                onValueChange={(value) => handleRadioChange("spacing_conservation", value)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="otimo" id="spacing_otimo" />
                  <Label htmlFor="spacing_otimo">Há demarcação em ótimo estado, visível em toda a extensão.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bom_mais_metade" id="spacing_bom_mais_metade" />
                  <Label htmlFor="spacing_bom_mais_metade">Há demarcação em bom estado em mais da metade do trecho.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="menos_metade" id="spacing_menos_metade" />
                  <Label htmlFor="spacing_menos_metade">Há demarcação em menos da metade do trecho ou está muito danificada.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inexiste" id="spacing_inexiste" />
                  <Label htmlFor="spacing_inexiste">Praticamente inexiste</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Page5;