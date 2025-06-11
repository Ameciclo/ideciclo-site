import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Page4Props {
  data: any;
  onDataChange: (data: any) => void;
}

const Page4: React.FC<Page4Props> = ({ data, onDataChange }) => {
  const handleRadioChange = (name: string, value: string) => {
    onDataChange({ [name]: value });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">B.2. Tipo de pavimento da infraestrutura cicloviária</h3>
          <RadioGroup
            value={data.pavement_type || "betuminoso_cimenticio"}
            onValueChange={(value) => handleRadioChange("pavement_type", value)}
            className="grid grid-cols-1 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="betuminoso_cimenticio" id="betuminoso_cimenticio" />
              <Label htmlFor="betuminoso_cimenticio">Pisos betuminosos (asfalto) ou cimentícios (concreto)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="modular" id="modular" />
              <Label htmlFor="modular">Pisos modulares (blocos de concreto e similares)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pedras_irregulares" id="pedras_irregulares" />
              <Label htmlFor="pedras_irregulares">Pedras irregulares (portuguesas e similares), pisos com espaçamento (vãos)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="barro_grelhas" id="barro_grelhas" />
              <Label htmlFor="barro_grelhas">Pisos de barro; grelhas e chapas metálicas; pisos modulares soltos; pisos derrapantes</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">E.1. Estado de Conservação do pavimento da infraestrutura</h3>
          <RadioGroup
            value={data.conservation_state || "nivelado"}
            onValueChange={(value) => handleRadioChange("conservation_state", value)}
            className="grid grid-cols-1 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nivelado" id="nivelado" />
              <Label htmlFor="nivelado">Piso nivelado, sem ondulações</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="leve_desnivel" id="leve_desnivel" />
              <Label htmlFor="leve_desnivel">Piso com leve desnivelamento, que não requeira ao ciclista frear</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="desnivel_buraco" id="desnivel_buraco" />
              <Label htmlFor="desnivel_buraco">Piso com desnível transversal ou buraco raso; piso com desgaste até a metade de sua largura útil</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="degraus_buracos" id="degraus_buracos" />
              <Label htmlFor="degraus_buracos">Piso com degraus / buracos profundos; pou com desgaste superior à metade da largura útil</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default Page4;