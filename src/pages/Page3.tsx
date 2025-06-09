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

const Page3 = ({ data, onDataChange, segmentName, segmentType }) => {
  const handleInputChange = (field, value) => {
    onDataChange({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>B.1.1. Largura da infraestrutura cicloviária</CardTitle>
        <CardDescription>
          Características dimensionais e de pavimentação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="width_meters">Largura em metros: *</Label>
          <Input
            id="width_meters"
            type="number"
            step="0.1"
            value={data.width_meters || ""}
            onChange={(e) =>
              handleInputChange("width_meters", parseFloat(e.target.value) || 0)
            }
            placeholder="Largura em metros (ex: 2.5)"
          />
        </div>

        <div>
          <Label className="text-base font-medium">Inclui sarjeta: *</Label>
          <RadioGroup
            value={
              data.includes_gutter !== undefined
                ? data.includes_gutter
                  ? "true"
                  : "false"
                : ""
            }
            onValueChange={(value) =>
              handleInputChange("includes_gutter", value === "true")
            }
            className="flex gap-6 mt-2"
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

        <div>
          <Label htmlFor="pavement_type">Tipo de pavimento: *</Label>
          <Input
            id="pavement_type"
            value={data.pavement_type || ""}
            onChange={(e) => handleInputChange("pavement_type", e.target.value)}
            placeholder="Tipo de pavimento (ex: Asfalto, Concreto, etc.)"
          />
        </div>

        <div>
          <Label htmlFor="conservation_state">Estado de conservação: *</Label>
          <Input
            id="conservation_state"
            value={data.conservation_state || ""}
            onChange={(e) =>
              handleInputChange("conservation_state", e.target.value)
            }
            placeholder="Estado de conservação (ex: Bom, Regular, Ruim)"
          />
        </div>

        <div>
          <Label htmlFor="avg_distance_measures_m">
            Distância média entre medidas de moderação (m):
          </Label>
          <Input
            id="avg_distance_measures_m"
            type="number"
            step="0.1"
            value={data.avg_distance_measures_m || ""}
            onChange={(e) =>
              handleInputChange(
                "avg_distance_measures_m",
                parseFloat(e.target.value) || 0
              )
            }
            placeholder="Distância em metros (opcional)"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Page3;
