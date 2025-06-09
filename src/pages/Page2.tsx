import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Page2 = ({ data, onDataChange, segmentName, segmentType }) => {
  const handleInputChange = (field, value) => {
    onDataChange({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          A.1 Caracterização geral da infraestrutura cicloviária
        </CardTitle>
        <CardDescription>
          Características gerais da infraestrutura do segmento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="infra_typology">Tipologia da infra: *</Label>
          <Input
            id="infra_typology"
            value={data.infra_typology || ""}
            onChange={(e) =>
              handleInputChange("infra_typology", e.target.value)
            }
            placeholder="Tipo de infraestrutura"
          />
        </div>

        <div>
          <Label className="text-base font-medium">Fluxo da infra: *</Label>
          <RadioGroup
            value={data.infra_flow || ""}
            onValueChange={(value) => handleInputChange("infra_flow", value)}
            className="flex gap-6 mt-2"
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
          <Label className="text-base font-medium">Posição na via: *</Label>
          <RadioGroup
            value={data.position_on_road || ""}
            onValueChange={(value) =>
              handleInputChange("position_on_road", value)
            }
            className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2"
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
