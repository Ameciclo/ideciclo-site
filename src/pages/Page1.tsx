import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface Page1Props {
  data: any;
  onDataChange: (data: any) => void;
  segmentName: string;
  segmentType: string;
}

const Page1: React.FC<Page1Props> = ({ data, onDataChange, segmentName }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    onDataChange({ [name]: processedValue });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="researcher">Pesquisador(a):</Label>
            <Input
              id="researcher"
              name="researcher"
              value={data.researcher || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="date">Data:</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={data.date || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="city">Cidade:</Label>
            <Input
              id="city"
              name="city"
              value={data.city || ""}
              readOnly
              disabled
              className="bg-gray-100"
            />
          </div>
          <div>
            <Label htmlFor="neighborhood">Bairro:</Label>
            <Input
              id="neighborhood"
              name="neighborhood"
              value={data.neighborhood || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="id">ID:</Label>
            <Input
              id="id"
              name="id"
              value={data.id || ""}
              readOnly
              disabled
              className="bg-gray-100"
            />
          </div>
          <div>
            <Label htmlFor="segment_name">Nome Trecho:</Label>
            <Input
              id="segment_name"
              name="segment_name"
              value={data.segment_name || segmentName || ""}
              readOnly
              disabled
              className="bg-gray-100"
            />
          </div>
          <div>
            <Label htmlFor="extension_m">Extensão (m):</Label>
            <Input
              id="extension_m"
              name="extension_m"
              type="number"
              value={data.extension_m || ""}
              readOnly
              disabled
              className="bg-gray-100"
            />
          </div>
          <div>
            <Label htmlFor="velocity_kmh">Veloc(km/h):</Label>
            <Input
              id="velocity_kmh"
              name="velocity_kmh"
              type="number"
              value={data.velocity_kmh || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="start_point">Início do trecho:</Label>
            <Input
              id="start_point"
              name="start_point"
              value={data.start_point || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="end_point">Fim do trecho:</Label>
            <Input
              id="end_point"
              name="end_point"
              value={data.end_point || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="road_hierarchy">Hierarquia viária:</Label>
            <Input
              id="road_hierarchy"
              name="road_hierarchy"
              value={data.road_hierarchy || ""}
              readOnly
              disabled
              className="bg-gray-100"
            />
          </div>
          <div>
            <Label htmlFor="blocks_count">N° quadras:</Label>
            <Input
              id="blocks_count"
              name="blocks_count"
              type="number"
              value={data.blocks_count || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="intersections_count">N° Interseções:</Label>
            <Input
              id="intersections_count"
              name="intersections_count"
              type="number"
              value={data.intersections_count || ""}
              onChange={handleChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Page1;