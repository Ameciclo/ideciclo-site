import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface Page8Props {
  data: any;
  onDataChange: (data: any) => void;
}

const Page8: React.FC<Page8Props> = ({ data, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    onDataChange({ [name]: processedValue });
  };

  const handleRadioChange = (name: string, value: string | boolean) => {
    onDataChange({ [name]: value });
  };

  const handleFurnitureCheckboxChange = (item: string, checked: boolean) => {
    const currentItems = [...(data.cycling_furniture || [])];
    if (checked) {
      if (!currentItems.includes(item)) {
        currentItems.push(item);
      }
    } else {
      const index = currentItems.indexOf(item);
      if (index !== -1) {
        currentItems.splice(index, 1);
      }
    }
    onDataChange({ cycling_furniture: currentItems });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">D.1. Iluminação Pública</h3>
          <div className="space-y-4">
            <div>
              <Label className="block mb-2">Tipo de poste:</Label>
              <RadioGroup
                value={data.lighting_post_type || "convencionais"}
                onValueChange={(value) => handleRadioChange("lighting_post_type", value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pedestonais" id="post_pedestonais" />
                  <Label htmlFor="post_pedestonais">Postes peatonais</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="convencionais" id="post_convencionais" />
                  <Label htmlFor="post_convencionais">Postes convencionais</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="lighting_distance_m">Distância entre postes (m):</Label>
              <Input
                id="lighting_distance_m"
                name="lighting_distance_m"
                type="number"
                value={data.lighting_distance_m || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label className="block mb-2">Direcionados à infraestrutura cicloviária:</Label>
              <RadioGroup
                value={data.lighting_directed ? "true" : "false"}
                onValueChange={(value) => handleRadioChange("lighting_directed", value === "true")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="directed_yes" />
                  <Label htmlFor="directed_yes">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="directed_no" />
                  <Label htmlFor="directed_no">Não</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="block mb-2">Barreiras abaixo do poste que limitam a iluminação:</Label>
              <RadioGroup
                value={data.lighting_barriers ? "true" : "false"}
                onValueChange={(value) => handleRadioChange("lighting_barriers", value === "true")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="barriers_yes" />
                  <Label htmlFor="barriers_yes">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="barriers_no" />
                  <Label htmlFor="barriers_no">Não</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="block mb-2">Distância dos postes à infraestrutura:</Label>
              <RadioGroup
                value={data.lighting_distance_to_infra || "junto"}
                onValueChange={(value) => handleRadioChange("lighting_distance_to_infra", value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="junto" id="distance_junto" />
                  <Label htmlFor="distance_junto">Postes juntos à infraestrutura</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mais_5m" id="distance_mais_5m" />
                  <Label htmlFor="distance_mais_5m">Postes a mais de 5 m da infraestrutura</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">D.2. Conforto Térmico (Sombreamento)</h3>
          <div className="space-y-4">
            <div>
              <Label className="block mb-2">Há sombreamento:</Label>
              <RadioGroup
                value={data.shading_coverage || "nao_ha"}
                onValueChange={(value) => handleRadioChange("shading_coverage", value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="toda_extensao" id="shade_toda_extensao" />
                  <Label htmlFor="shade_toda_extensao">Toda extensão</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mais_metade" id="shade_mais_metade" />
                  <Label htmlFor="shade_mais_metade">Mais da metade</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="menos_metade" id="shade_menos_metade" />
                  <Label htmlFor="shade_menos_metade">Menos da metade</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao_ha" id="shade_nao_ha" />
                  <Label htmlFor="shade_nao_ha">Não há</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="block mb-2">Arborização:</Label>
              <RadioGroup
                value={data.vegetation_size || "baixo"}
                onValueChange={(value) => handleRadioChange("vegetation_size", value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="alto" id="veg_alto" />
                  <Label htmlFor="veg_alto">Porte alto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medio" id="veg_medio" />
                  <Label htmlFor="veg_medio">Médio porte</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="baixo" id="veg_baixo" />
                  <Label htmlFor="veg_baixo">Baixo porte</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">D.3. Mobiliário Cicloviário</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="furniture_bicicletarios"
                checked={(data.cycling_furniture || []).includes("bicicletarios")}
                onCheckedChange={(checked) => handleFurnitureCheckboxChange("bicicletarios", !!checked)}
              />
              <Label htmlFor="furniture_bicicletarios">Bicicletários de uso público</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="furniture_estacoes"
                checked={(data.cycling_furniture || []).includes("estacoes")}
                onCheckedChange={(checked) => handleFurnitureCheckboxChange("estacoes", !!checked)}
              />
              <Label htmlFor="furniture_estacoes">Estações de autoatendimento</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="furniture_paraciclos"
                checked={(data.cycling_furniture || []).includes("paraciclos")}
                onCheckedChange={(checked) => handleFurnitureCheckboxChange("paraciclos", !!checked)}
              />
              <Label htmlFor="furniture_paraciclos">Paraciclos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="furniture_bebedouros"
                checked={(data.cycling_furniture || []).includes("bebedouros")}
                onCheckedChange={(checked) => handleFurnitureCheckboxChange("bebedouros", !!checked)}
              />
              <Label htmlFor="furniture_bebedouros">Bebedouros públicos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="furniture_compartilhadas"
                checked={(data.cycling_furniture || []).includes("compartilhadas")}
                onCheckedChange={(checked) => handleFurnitureCheckboxChange("compartilhadas", !!checked)}
              />
              <Label htmlFor="furniture_compartilhadas">Sistemas de bicicletas compartilhadas</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Page8;