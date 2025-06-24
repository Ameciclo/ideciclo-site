import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Page2Props {
  data: any;
  onDataChange: (data: any) => void;
  segmentType: string;
}

const Page2: React.FC<Page2Props> = ({ data, onDataChange, segmentType }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onDataChange({ [name]: value });
  };

  const handleRadioChange = (name: string, value: string) => {
    onDataChange({ [name]: value });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <Label htmlFor="infra_typology">Tipologia da infra:</Label>
          <Input
            id="infra_typology"
            name="infra_typology"
            value={data.infra_typology || segmentType || ""}
            readOnly
            disabled
            className="bg-gray-100"
          />
        </div>

        <div>
          <Label>Fluxo da infra:</Label>
          <RadioGroup
            value={data.infra_flow || "unidirectional"}
            onValueChange={(value) => handleRadioChange("infra_flow", value)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unidirectional" id="unidirectional" />
              <Label htmlFor="unidirectional">Unidirecional</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bidirectional" id="bidirectional" />
              <Label htmlFor="bidirectional">Bidirecional</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label>Posição na via:</Label>
          <RadioGroup
            value={data.position_on_road || "pista_calcada"}
            onValueChange={(value) => handleRadioChange("position_on_road", value)}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="canteiro" id="canteiro" />
              <Label htmlFor="canteiro">Sobre o canteiro</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pista_canteiro" id="pista_canteiro" />
              <Label htmlFor="pista_canteiro">Pista, junto ao canteiro</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pista_calcada" id="pista_calcada" />
              <Label htmlFor="pista_calcada">Pista, junto à calçada</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="calcada" id="calcada" />
              <Label htmlFor="calcada">Sobre a calçada</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="centro_pista" id="centro_pista" />
              <Label htmlFor="centro_pista">Centro da pista</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="isolada" id="isolada" />
              <Label htmlFor="isolada">Isolada</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default Page2;