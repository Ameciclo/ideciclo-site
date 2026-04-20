import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { IdecicloFormData } from "@/types/idecicloForm";

interface Page1Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
}

const Page1: React.FC<Page1Props> = ({ data, onDataChange }) => {
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
          <div>
            <Label htmlFor="relevant_intersections_count">
              Interseções com arteriais/coletoras:
            </Label>
            <Input
              id="relevant_intersections_count"
              name="relevant_intersections_count"
              type="number"
              value={data.relevant_intersections_count || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="connected_intersections_count">
              Dessas, quantas conectam com outra infra:
            </Label>
            <Input
              id="connected_intersections_count"
              name="connected_intersections_count"
              type="number"
              value={data.connected_intersections_count || ""}
              onChange={handleChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Page1;
