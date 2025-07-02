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
            value={data.pavement_type || "A"}
            onValueChange={(value) => handleRadioChange("pavement_type", value)}
            className="grid grid-cols-1 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="A" id="pavement_A" />
              <Label htmlFor="pavement_A">Pisos betuminosos (asfalto) ou cimentícios (concreto)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="B" id="pavement_B" />
              <Label htmlFor="pavement_B">Pisos modulares (blocos de concreto e similares)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="C" id="pavement_C" />
              <Label htmlFor="pavement_C">Pedras irregulares (portuguesas e similares), pisos com espaçamento (vãos)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="D" id="pavement_D" />
              <Label htmlFor="pavement_D">Pisos de barro; grelhas e chapas metálicas; pisos modulares soltos; pisos derrapantes</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">E.1. Estado de Conservação do pavimento da infraestrutura</h3>
          <RadioGroup
            value={data.conservation_state || "A"}
            onValueChange={(value) => handleRadioChange("conservation_state", value)}
            className="grid grid-cols-1 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="A" id="conservation_A" />
              <Label htmlFor="conservation_A">Piso nivelado, sem ondulações</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="B" id="conservation_B" />
              <Label htmlFor="conservation_B">Piso com leve desnivelamento, que não requeira ao ciclista frear</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="C" id="conservation_C" />
              <Label htmlFor="conservation_C">Piso com desnível transversal ou buraco raso; piso com desgaste até a metade de sua largura útil</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="D" id="conservation_D" />
              <Label htmlFor="conservation_D">Piso com degraus / buracos profundos; pou com desgaste superior à metade da largura útil</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default Page4;