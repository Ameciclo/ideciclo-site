import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IdecicloFormData } from "@/types/idecicloForm";

interface Page1Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
}

const SPEED_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];

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
          <div className="md:col-span-2">
            <Label className="mb-3 block">Velocidade máxima regulamentada:</Label>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
              {SPEED_OPTIONS.map((speed) => {
                const isSelected = data.velocity_kmh === speed;

                return (
                  <Button
                    key={speed}
                    type="button"
                    variant="ghost"
                    className={`h-auto flex-col gap-2 rounded-2xl border px-3 py-3 transition-all ${
                      isSelected
                        ? "border-emerald-700 bg-emerald-50 shadow-sm opacity-100"
                        : "border-slate-200 bg-white opacity-45 hover:opacity-85"
                    }`}
                    onClick={() => onDataChange({ velocity_kmh: speed })}
                  >
                    <img
                      src={`/icones/${speed}-speed.svg`}
                      alt={`${speed} km/h`}
                      className="h-16 w-16 object-contain"
                    />
                    <span className="text-sm font-semibold text-slate-700">{speed} km/h</span>
                  </Button>
                );
              })}
            </div>
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
