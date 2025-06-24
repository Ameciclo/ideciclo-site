import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Page6Props {
  data: any;
  onDataChange: (data: any) => void;
}

const Page6: React.FC<Page6Props> = ({ data, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    onDataChange({ [name]: processedValue });
  };

  const handleRadioChange = (name: string, value: string | boolean) => {
    onDataChange({ [name]: value });
  };

  // Determine infrastructure type
  const getInfraType = () => {
    const type = data.infra_typology?.toLowerCase() || "";
    if (type.includes("ciclofaixa")) return "ciclofaixa";
    if (type.includes("ciclovia")) return "ciclovia";
    if (type.includes("ciclorrota")) return "ciclorrota";
    if (type.includes("compartilhada")) return "compartilhada";
    return "ciclofaixa"; // Default
  };

  const infraType = getInfraType();
  const isCiclorrota = infraType === "ciclorrota";
  const isCicloviaOrCiclofaixa = infraType === "ciclovia" || infraType === "ciclofaixa";
  const isCompartilhadaOrCiclorrota = infraType === "compartilhada" || infraType === "ciclorrota";

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">B.4/E.3. Sinalização Horizontal e Vertical</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="block mb-2">B.4.1. Identificação do espaço de circulação de bicicletas:</Label>
              <RadioGroup
                value={data.space_identification || "pavimento_vermelho"}
                onValueChange={(value) => handleRadioChange("space_identification", value)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pavimento_vermelho" id="id_pavimento_vermelho" />
                  <Label htmlFor="id_pavimento_vermelho">Pavimento ou pintura total em tom vermelho ou ao menos nas aproximações de travessias de pedestres e áreas de conflito com outros modos.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="faixa_dois_bordos" id="id_faixa_dois_bordos" />
                  <Label htmlFor="id_faixa_dois_bordos">Faixa de contraste nos dois bordos da infraestrutura cicloviária em toda a extensão.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="faixa_um_bordo" id="id_faixa_um_bordo" />
                  <Label htmlFor="id_faixa_um_bordo">Faixa de contraste vermelha em apenas um dos bordos da infraestrutura cicloviária.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao_ha" id="id_nao_ha" />
                  <Label htmlFor="id_nao_ha">Não há pintura de contraste (vermelha) ou a pintura está muito danificada.</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="block mb-2">E.3.1. Estado de conservação da identificação do espaço cicloviário:</Label>
              <RadioGroup
                value={data.identification_conservation || "total_vermelho"}
                onValueChange={(value) => handleRadioChange("identification_conservation", value)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="total_vermelho" id="cons_total_vermelho" />
                  <Label htmlFor="cons_total_vermelho">Preenchimento total da área útil em tom vermelho (pavimento pigmentado ou pintura).</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mais_metade" id="cons_mais_metade" />
                  <Label htmlFor="cons_mais_metade">Identificação de mais da metade da infraestrutura ou ao menos nas aproximações de travessias de pedestres e área de conflito com outros modos.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="menos_metade" id="cons_menos_metade" />
                  <Label htmlFor="cons_menos_metade">Há sinalização identificação em menos da metade do trecho da infraestrutura cicloviária ou está muito danificada.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="apagada" id="cons_apagada" />
                  <Label htmlFor="cons_apagada">Praticamente apagada.</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        {isCiclorrota && (
          <div>
            <h3 className="text-lg font-medium mb-2">B.4.2. Inscrições no pavimento - pictogramas (para ciclorrotas)</h3>
            <div className="space-y-4">
              <div>
                <Label className="block mb-2">N° de pictogramas por quadra:</Label>
                <RadioGroup
                  value={data.pictograms_per_block?.toString() || "0"}
                  onValueChange={(value) => handleRadioChange("pictograms_per_block", parseInt(value))}
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

              <div>
                <Label className="block mb-2">Estado de conservação dos pictogramas (para ciclorrotas):</Label>
                <RadioGroup
                  value={data.pictograms_conservation || "visiveis"}
                  onValueChange={(value) => handleRadioChange("pictograms_conservation", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="visiveis" id="picto_visiveis" />
                    <Label htmlFor="picto_visiveis">Pictogramas visíveis em toda a extensão.</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="desgastados" id="picto_desgastados" />
                    <Label htmlFor="picto_desgastados">Pictogramas desgastados em toda a extensão.</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="menos_metade" id="picto_menos_metade" />
                    <Label htmlFor="picto_menos_metade">Há sinalização identificação em menos da metade do trecho da infraestrutura cicloviária ou está muito danificada.</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="apagados" id="picto_apagados" />
                    <Label htmlFor="picto_apagados">Praticamente apagados ou não há.</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )}

        <div>
          {isCicloviaOrCiclofaixa && (
            <h3 className="text-lg font-medium mb-2">B.4.3. Sinalização Vertical de Regulamentação: ciclovias ou ciclofaixas</h3>
          )}
          {isCompartilhadaOrCiclorrota && (
            <h3 className="text-lg font-medium mb-2">B.4.3. Sinalização Vertical de Regulamentação: ciclorrotas ou calçadas partilhadas</h3>
          )}
          <div className="space-y-4">
            <div>
              <Label className="block mb-2">N° de placas por quadra:</Label>
              <RadioGroup
                value={data.regulation_signs_per_block?.toString() || "0"}
                onValueChange={(value) => handleRadioChange("regulation_signs_per_block", parseInt(value))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="signs_0" />
                  <Label htmlFor="signs_0">0</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="signs_1" />
                  <Label htmlFor="signs_1">1 ou mais</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="block mb-2">Placas nos dois sentidos:</Label>
              <RadioGroup
                value={data.signs_both_directions ? "true" : "false"}
                onValueChange={(value) => handleRadioChange("signs_both_directions", value === "true")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="signs_both_yes" />
                  <Label htmlFor="signs_both_yes">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="signs_both_no" />
                  <Label htmlFor="signs_both_no">Não</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="block mb-2">Estado de conservação da sinalização vertical:</Label>
              <RadioGroup
                value={data.vertical_signs_conservation || "bom_estado"}
                onValueChange={(value) => handleRadioChange("vertical_signs_conservation", value)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bom_estado" id="signs_bom_estado" />
                  <Label htmlFor="signs_bom_estado">Placas e postes em bom estado de conservação.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="menos_metade_danos" id="signs_menos_metade_danos" />
                  <Label htmlFor="signs_menos_metade_danos">Menos da metade das placas com danos (sujeira, soltas, outras).</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bastante_danificadas" id="signs_bastante_danificadas" />
                  <Label htmlFor="signs_bastante_danificadas">Placas bastante danificadas ao longo do trecho.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao_ha" id="signs_nao_ha" />
                  <Label htmlFor="signs_nao_ha">Não há placas no trecho.</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Page6;