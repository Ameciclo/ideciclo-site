
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const evaluationSchema = z.object({
  // General data
  researcher: z.string().min(2),
  date: z.string(),
  city: z.string().min(2),
  neighborhood: z.string().min(2),
  id: z.string(),
  segment_name: z.string().min(2),
  extension_m: z.number(),
  velocity_kmh: z.number(),
  start_point: z.string(),
  end_point: z.string(),
  road_hierarchy: z.string(),
  blocks_count: z.number(),
  intersections_count: z.number(),

  // A.1 General characterization
  infra_typology: z.string(),
  infra_flow: z.enum(["unidirectional", "bidirectional"]),
  position_on_road: z.string(),

  // B.1.1 Width
  width_meters: z.number(),
  includes_gutter: z.boolean(),

  // B.1.2 Speed measures
  speed_measures: z.array(z.string()),
  avg_distance_measures_m: z.number().optional(),

  // B.2 Pavement type
  pavement_type: z.string(),

  // E.1 Conservation state
  conservation_state: z.string(),

  // Additional fields for all sections...
  responses: z.record(z.any()).optional(),
});

interface EvaluationFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  segmentName: string;
  segmentType: string;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({
  onSubmit,
  initialData,
  segmentName,
  segmentType,
}) => {
  const form = useForm({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      researcher: "",
      date: new Date().toISOString().split("T")[0],
      city: "",
      neighborhood: "",
      id: "",
      segment_name: segmentName || "",
      extension_m: 0,
      velocity_kmh: 0,
      start_point: "",
      end_point: "",
      road_hierarchy: "",
      blocks_count: 0,
      intersections_count: 0,
      infra_typology: "",
      infra_flow: "unidirectional",
      position_on_road: "",
      width_meters: 0,
      includes_gutter: false,
      speed_measures: [],
      avg_distance_measures_m: 0,
      pavement_type: "",
      conservation_state: "",
      ...initialData,
    },
  });

  const handleSubmit = (data: any) => {
    // Combine all form data into the responses field
    const formData = {
      ...data,
      responses: data, // Store all responses in the jsonb field
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* General Data Section */}
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
              <Label htmlFor="researcher">Pesquisador(a):</Label>
              <Input {...form.register("researcher")} />
            </div>
            <div>
              <Label htmlFor="date">Data:</Label>
              <Input type="date" {...form.register("date")} />
            </div>
            <div>
              <Label htmlFor="city">Cidade:</Label>
              <Input {...form.register("city")} />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro:</Label>
              <Input {...form.register("neighborhood")} />
            </div>
            <div>
              <Label htmlFor="id">ID:</Label>
              <Input {...form.register("id")} />
            </div>
            <div>
              <Label htmlFor="segment_name">Nome Trecho:</Label>
              <Input {...form.register("segment_name")} />
            </div>
            <div>
              <Label htmlFor="extension_m">Extensão (m):</Label>
              <Input
                type="number"
                {...form.register("extension_m", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="velocity_kmh">Veloc(km/h):</Label>
              <Input
                type="number"
                {...form.register("velocity_kmh", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="start_point">Início do trecho:</Label>
              <Input {...form.register("start_point")} />
            </div>
            <div>
              <Label htmlFor="end_point">Fim do trecho:</Label>
              <Input {...form.register("end_point")} />
            </div>
            <div>
              <Label htmlFor="road_hierarchy">Hierarquia viária:</Label>
              <Input {...form.register("road_hierarchy")} />
            </div>
            <div>
              <Label htmlFor="blocks_count">N° quadras:</Label>
              <Input
                type="number"
                {...form.register("blocks_count", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="intersections_count">N° Interseções:</Label>
              <Input
                type="number"
                {...form.register("intersections_count", {
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* A.1 General Characterization */}
      <Card>
        <CardHeader>
          <CardTitle>A.1 Caracterização geral da infraestrutura cicloviária</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="infra_typology">Tipologia da infra:</Label>
            <Input {...form.register("infra_typology")} />
          </div>

          <div>
            <Label>Fluxo da infra:</Label>
            <Controller
              name="infra_flow"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
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
              )}
            />
          </div>

          <div>
            <Label>Posição na via:</Label>
            <Controller
              name="position_on_road"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
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
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* B.1.1 Width Section */}
      <Card>
        <CardHeader>
          <CardTitle>B.1.1. Largura da infraestrutura cicloviária</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="width_meters">Largura em metros:</Label>
            <Input
              type="number"
              step="0.1"
              {...form.register("width_meters", { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label>Inclui sarjeta:</Label>
            <Controller
              name="includes_gutter"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value ? "true" : "false"}
                  onValueChange={(value) => field.onChange(value === "true")}
                  className="flex gap-4"
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
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button type="submit" className="w-full">
        Salvar Avaliação
      </Button>
    </form>
  );
};

export default EvaluationForm;
