import React, { useState } from "react";
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
  CardFooter,
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
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  position_on_road: z.enum(["canteiro", "pista_canteiro", "pista_calcada", "calcada", "centro_pista", "isolada"]),

  // B.1.1 Width
  width_meters: z.number(),
  includes_gutter: z.boolean(),

  // B.1.2 Speed measures
  speed_measures: z.array(z.string()),
  avg_distance_measures_m: z.number().optional(),

  // B.2 Pavement type
  pavement_type: z.enum(["betuminoso_cimenticio", "modular", "pedras_irregulares", "barro_grelhas"]),

  // E.1 Conservation state
  conservation_state: z.enum(["nivelado", "leve_desnivel", "desnivel_buraco", "degraus_buracos"]),

  // B.3/E.2 Infrastructure delimitation
  separation_devices_ciclofaixa: z.enum(["ate_1m", "1_5_3m", "mais_3_5m", "nao_ha"]).optional(),
  separation_devices_ciclovia: z.enum(["total", "total_aberturas", "ate_2m", "mais_2_5m"]).optional(),
  separation_devices_calcada: z.enum(["demarcacao_clara", "demarcacao_separada", "linha_pictograma", "nao_ha"]).optional(),
  
  // E.2.1 Conservation state of separation devices
  devices_conservation: z.enum(["todo_trecho", "mais_metade", "menos_metade", "nao_ha"]),
  
  // B.3.2 Lateral spacing
  lateral_spacing_type: z.enum(["linha", "dispositivos"]),
  lateral_spacing_width_m: z.number(),
  
  // E.2.1 Conservation state of lateral spacing
  spacing_conservation: z.enum(["otimo", "bom_mais_metade", "menos_metade", "inexiste"]),
  
  // B.4/E.3 Horizontal and vertical signaling
  space_identification: z.enum(["pavimento_vermelho", "faixa_dois_bordos", "faixa_um_bordo", "nao_ha"]),
  identification_conservation: z.enum(["total_vermelho", "mais_metade", "menos_metade", "apagada"]),
  
  // B.4.2 Pictograms
  pictograms_per_block: z.number(),
  pictograms_conservation: z.enum(["visiveis", "desgastados", "menos_metade", "apagados"]),
  
  // B.4.3 Vertical signaling
  regulation_signs_per_block: z.number(),
  signs_both_directions: z.boolean(),
  vertical_signs_conservation: z.enum(["bom_estado", "menos_metade_danos", "bastante_danificadas", "nao_ha"]),
  
  // B.5 Accessibility
  traffic_lanes_count: z.number(),
  signalized_crossings_per_block: z.number(),
  
  // B.6 Risk situations
  bus_school_conflict: z.boolean(),
  horizontal_obstacles: z.boolean(),
  vertical_obstacles: z.boolean(),
  side_change_mid_block: z.boolean(),
  opposite_flow_direction: z.boolean(),
  
  // C.1/E.4 Intersection signaling
  intersection_signaling: z.enum(["vermelho_tracejadas", "vermelho_estreito", "tracejadas_pictogramas", "nenhuma"]),
  intersection_conservation: z.enum(["bom_estado", "danificada", "nao_ha"]),
  
  // C.2 Connection accessibility
  connection_accessibility: z.enum(["universal_visivel", "degraus", "nao_visivel"]),
  
  // C.3 Conflicts with motorized circulation
  motorized_conflicts: z.array(z.string()),
  
  // D.1 Public lighting
  lighting_post_type: z.enum(["pedestonais", "convencionais"]),
  lighting_distance_m: z.number(),
  lighting_directed: z.boolean(),
  lighting_barriers: z.boolean(),
  lighting_distance_to_infra: z.enum(["junto", "mais_5m"]),
  
  // D.2 Thermal comfort
  shading_coverage: z.enum(["toda_extensao", "mais_metade", "menos_metade", "nao_ha"]),
  vegetation_size: z.enum(["alto", "medio", "baixo"]),
  
  // D.3 Cycling furniture
  cycling_furniture: z.array(z.string()),

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
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 8; // Total number of form pages
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
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
      infra_typology: segmentType || "",
      infra_flow: "unidirectional",
      position_on_road: "pista_calcada",
      width_meters: 0,
      includes_gutter: false,
      speed_measures: [],
      avg_distance_measures_m: 0,
      pavement_type: "betuminoso_cimenticio",
      conservation_state: "nivelado",
      separation_devices_ciclofaixa: "nao_ha",
      separation_devices_ciclovia: "total",
      separation_devices_calcada: "nao_ha",
      devices_conservation: "todo_trecho",
      lateral_spacing_type: "linha",
      lateral_spacing_width_m: 0,
      spacing_conservation: "otimo",
      space_identification: "pavimento_vermelho",
      identification_conservation: "total_vermelho",
      pictograms_per_block: 0,
      pictograms_conservation: "visiveis",
      regulation_signs_per_block: 0,
      signs_both_directions: false,
      vertical_signs_conservation: "bom_estado",
      traffic_lanes_count: 2,
      signalized_crossings_per_block: 0,
      bus_school_conflict: false,
      horizontal_obstacles: false,
      vertical_obstacles: false,
      side_change_mid_block: false,
      opposite_flow_direction: false,
      intersection_signaling: "vermelho_tracejadas",
      intersection_conservation: "bom_estado",
      connection_accessibility: "universal_visivel",
      motorized_conflicts: [],
      lighting_post_type: "convencionais",
      lighting_distance_m: 0,
      lighting_directed: false,
      lighting_barriers: false,
      lighting_distance_to_infra: "junto",
      shading_coverage: "nao_ha",
      vegetation_size: "baixo",
      cycling_furniture: [],
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
      {/* Page 1: General Data */}
      {currentPage === 1 && (
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
          <CardFooter className="flex justify-between">
            <div></div>
            <Button type="button" onClick={nextPage}>
              Próximo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Page 2: A.1 General Characterization */}
      {currentPage === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>
              A.1 Caracterização geral da infraestrutura cicloviária
            </CardTitle>
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
                      <RadioGroupItem
                        value="unidirectional"
                        id="unidirectional"
                      />
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
                      <RadioGroupItem
                        value="pista_canteiro"
                        id="pista_canteiro"
                      />
                      <Label htmlFor="pista_canteiro">
                        Pista, junto ao canteiro
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pista_calcada" id="pista_calcada" />
                      <Label htmlFor="pista_calcada">
                        Pista, junto à calçada
                      </Label>
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
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevPage}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button type="button" onClick={nextPage}>
              Próximo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Page 3: B.1 Width and Speed Measures */}
      {currentPage === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>B.1. Espaço Útil de Circulação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">B.1.1. Largura da infraestrutura cicloviária</h3>
              <div className="space-y-4">
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
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">B.1.2. Medidas de moderação de velocidade (em ciclorrotas)</h3>
              <div className="space-y-4">
                <div>
                  <Label>Medidas:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <Controller
                      name="speed_measures"
                      control={form.control}
                      render={({ field }) => (
                        <>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="lombada"
                              checked={field.value.includes("lombada")}
                              onCheckedChange={(checked) => {
                                const newValue = [...field.value];
                                if (checked) {
                                  newValue.push("lombada");
                                } else {
                                  const index = newValue.indexOf("lombada");
                                  if (index !== -1) newValue.splice(index, 1);
                                }
                                field.onChange(newValue);
                              }}
                            />
                            <Label htmlFor="lombada">Lombada, quebra-molas, ondulações transv.</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="valas"
                              checked={field.value.includes("valas")}
                              onCheckedChange={(checked) => {
                                const newValue = [...field.value];
                                if (checked) {
                                  newValue.push("valas");
                                } else {
                                  const index = newValue.indexOf("valas");
                                  if (index !== -1) newValue.splice(index, 1);
                                }
                                field.onChange(newValue);
                              }}
                            />
                            <Label htmlFor="valas">Valas transversais</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="faixa_elevada"
                              checked={field.value.includes("faixa_elevada")}
                              onCheckedChange={(checked) => {
                                const newValue = [...field.value];
                                if (checked) {
                                  newValue.push("faixa_elevada");
                                } else {
                                  const index = newValue.indexOf("faixa_elevada");
                                  if (index !== -1) newValue.splice(index, 1);
                                }
                                field.onChange(newValue);
                              }}
                            />
                            <Label htmlFor="faixa_elevada">Faixa de travessia elevada</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="elevacao_intersecao"
                              checked={field.value.includes("elevacao_intersecao")}
                              onCheckedChange={(checked) => {
                                const newValue = [...field.value];
                                if (checked) {
                                  newValue.push("elevacao_intersecao");
                                } else {
                                  const index = newValue.indexOf("elevacao_intersecao");
                                  if (index !== -1) newValue.splice(index, 1);
                                }
                                field.onChange(newValue);
                              }}
                            />
                            <Label htmlFor="elevacao_intersecao">Elevação da interseção viária</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="reducao_largura"
                              checked={field.value.includes("reducao_largura")}
                              onCheckedChange={(checked) => {
                                const newValue = [...field.value];
                                if (checked) {
                                  newValue.push("reducao_largura");
                                } else {
                                  const index = newValue.indexOf("reducao_largura");
                                  if (index !== -1) newValue.splice(index, 1);
                                }
                                field.onChange(newValue);
                              }}
                            />
                            <Label htmlFor="reducao_largura">Redução das larguras das faixas</Label>
                          </div>
                        </>
                      )}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="avg_distance_measures_m">Distância média entre medidas (m):</Label>
                  <Input
                    type="number"
                    {...form.register("avg_distance_measures_m", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevPage}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button type="button" onClick={nextPage}>
              Próximo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Page 4: B.2 Pavement Type and E.1 Conservation */}
      {currentPage === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>B.2/E.1 Pavimento e Estado de Conservação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">B.2. Tipo de pavimento da infraestrutura cicloviária</h3>
              <Controller
                name="pavement_type"
                control={form.control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="betuminoso_cimenticio" id="betuminoso_cimenticio" />
                      <Label htmlFor="betuminoso_cimenticio">Pisos betuminosos (asfalto) ou cimentícios (concreto)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="modular" id="modular" />
                      <Label htmlFor="modular">Pisos modulares (blocos de concreto e similares)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pedras_irregulares" id="pedras_irregulares" />
                      <Label htmlFor="pedras_irregulares">Pedras irregulares (portuguesas e similares), pisos com espaçamento (vãos)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="barro_grelhas" id="barro_grelhas" />
                      <Label htmlFor="barro_grelhas">Pisos de barro; grelhas e chapas metálicas; pisos modulares soltos; pisos derrapantes</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">E.1. Estado de Conservação do pavimento da infraestrutura</h3>
              <Controller
                name="conservation_state"
                control={form.control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nivelado" id="nivelado" />
                      <Label htmlFor="nivelado">Piso nivelado, sem ondulações</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="leve_desnivel" id="leve_desnivel" />
                      <Label htmlFor="leve_desnivel">Piso com leve desnivelamento, que não requeira ao ciclista frear</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="desnivel_buraco" id="desnivel_buraco" />
                      <Label htmlFor="desnivel_buraco">Piso com desnível transversal ou buraco raso; piso com desgaste até a metade de sua largura útil</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="degraus_buracos" id="degraus_buracos" />
                      <Label htmlFor="degraus_buracos">Piso com degraus / buracos profundos; pou com desgaste superior à metade da largura útil</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevPage}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button type="button" onClick={nextPage}>
              Próximo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Additional pages would go here */}
      
      {/* Last page with submit button */}
      {currentPage === totalPages && (
        <Card>
          <CardHeader>
            <CardTitle>Finalizar Avaliação</CardTitle>
            <CardDescription>
              Revise os dados antes de enviar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Todos os campos foram preenchidos. Clique em "Salvar Avaliação" para finalizar.</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevPage}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button type="submit">
              Salvar Avaliação
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Navigation indicator */}
      <div className="flex justify-center items-center gap-1 pt-2">
        {Array.from({ length: totalPages }).map((_, index) => (
          <div 
            key={index}
            className={`h-2 w-2 rounded-full ${
              currentPage === index + 1 ? "bg-primary" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </form>
  );
};

export default EvaluationForm;
