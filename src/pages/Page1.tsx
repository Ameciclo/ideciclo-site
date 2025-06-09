import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Page1 = ({ data, onDataChange, segmentName, segmentType }) => {
  const handleInputChange = (field, value) => {
    onDataChange({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados Gerais</CardTitle>
        <CardDescription>
          Informações básicas sobre a avaliação do segmento {segmentName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="researcher">Pesquisador(a): *</Label>
            <Input
              id="researcher"
              value={data.researcher || ""}
              onChange={(e) => handleInputChange("researcher", e.target.value)}
              placeholder="Nome do pesquisador"
            />
          </div>

          <div>
            <Label htmlFor="date">Data: *</Label>
            <Input
              id="date"
              type="date"
              value={data.date || new Date().toISOString().split("T")[0]}
              onChange={(e) => handleInputChange("date", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="city">Cidade: *</Label>
            <Input
              id="city"
              value={data.city || ""}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="Nome da cidade"
            />
          </div>

          <div>
            <Label htmlFor="neighborhood">Bairro: *</Label>
            <Input
              id="neighborhood"
              value={data.neighborhood || ""}
              onChange={(e) =>
                handleInputChange("neighborhood", e.target.value)
              }
              placeholder="Nome do bairro"
            />
          </div>

          <div>
            <Label htmlFor="id">ID: *</Label>
            <Input
              id="id"
              value={data.id || ""}
              onChange={(e) => handleInputChange("id", e.target.value)}
              placeholder="Identificador do segmento"
            />
          </div>

          <div>
            <Label htmlFor="segment_name">Nome Trecho: *</Label>
            <Input
              id="segment_name"
              value={data.segment_name || segmentName || ""}
              onChange={(e) =>
                handleInputChange("segment_name", e.target.value)
              }
              placeholder="Nome do trecho"
            />
          </div>

          <div>
            <Label htmlFor="extension_m">Extensão (m): *</Label>
            <Input
              id="extension_m"
              type="number"
              value={data.extension_m || ""}
              onChange={(e) =>
                handleInputChange(
                  "extension_m",
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="Extensão em metros"
            />
          </div>

          <div>
            <Label htmlFor="velocity_kmh">Veloc(km/h): *</Label>
            <Input
              id="velocity_kmh"
              type="number"
              value={data.velocity_kmh || ""}
              onChange={(e) =>
                handleInputChange(
                  "velocity_kmh",
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="Velocidade em km/h"
            />
          </div>

          <div>
            <Label htmlFor="start_point">Início do trecho: *</Label>
            <Input
              id="start_point"
              value={data.start_point || ""}
              onChange={(e) => handleInputChange("start_point", e.target.value)}
              placeholder="Ponto de início"
            />
          </div>

          <div>
            <Label htmlFor="end_point">Fim do trecho: *</Label>
            <Input
              id="end_point"
              value={data.end_point || ""}
              onChange={(e) => handleInputChange("end_point", e.target.value)}
              placeholder="Ponto final"
            />
          </div>

          <div>
            <Label htmlFor="road_hierarchy">Hierarquia viária: *</Label>
            <Input
              id="road_hierarchy"
              value={data.road_hierarchy || ""}
              onChange={(e) =>
                handleInputChange("road_hierarchy", e.target.value)
              }
              placeholder="Tipo de hierarquia viária"
            />
          </div>

          <div>
            <Label htmlFor="blocks_count">N° quadras: *</Label>
            <Input
              id="blocks_count"
              type="number"
              value={data.blocks_count || ""}
              onChange={(e) =>
                handleInputChange("blocks_count", parseInt(e.target.value) || 0)
              }
              placeholder="Número de quadras"
            />
          </div>

          <div>
            <Label htmlFor="intersections_count">N° Interseções: *</Label>
            <Input
              id="intersections_count"
              type="number"
              value={data.intersections_count || ""}
              onChange={(e) =>
                handleInputChange(
                  "intersections_count",
                  parseInt(e.target.value) || 0
                )
              }
              placeholder="Número de interseções"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Page1;
