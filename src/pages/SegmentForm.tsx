
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormValue
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Printer } from "lucide-react";
import html2pdf from 'html2pdf.js';

// Schema de validação para o formulário completo
const formSchema = z.object({
  // Informações básicas
  researcher: z.string().min(2, { message: "Nome do pesquisador é obrigatório" }),
  date: z.string().min(1, { message: "Data é obrigatória" }),
  city: z.string().optional(),
  neighborhood: z.string().min(1, { message: "Bairro é obrigatório" }),
  segment_id: z.string().optional(),
  street_name: z.string().min(1, { message: "Nome da rua é obrigatório" }),
  extension: z.string().min(1, { message: "Extensão é obrigatória" }),
  speed_limit: z.string().optional(),
  start_point: z.string().min(1, { message: "Ponto inicial é obrigatório" }),
  end_point: z.string().min(1, { message: "Ponto final é obrigatório" }),
  road_hierarchy: z.string().min(1, { message: "Hierarquia viária é obrigatória" }),
  blocks_count: z.string().optional(),
  intersections_count: z.string().optional(),
  
  // Caracterização geral
  infra_type: z.enum(["ciclofaixa", "ciclovia", "ciclorrota", "compartilhada"]),
  flow_type: z.enum(["unidirecional", "bidirecional"]),
  road_position: z.enum([
    "sobre_canteiro", 
    "pista_junto_canteiro", 
    "centro_pista", 
    "pista_junto_calcada", 
    "sobre_calcada", 
    "isolada"
  ]),
  
  // Espaço útil
  width_meters: z.string().optional(),
  includes_gutter: z.boolean().default(false),
  
  // Medidas de moderação
  has_speed_bumps: z.boolean().default(false),
  has_transversal_trenches: z.boolean().default(false),
  has_elevated_crossing: z.boolean().default(false),
  has_elevated_intersection: z.boolean().default(false),
  has_reduced_lanes: z.boolean().default(false),
  moderation_distance: z.string().optional(),
  
  // Pavimento
  pavement_type: z.enum(["asfalto_concreto", "blocos", "pedras_irregulares", "terra_grelha"]),
  pavement_condition: z.enum(["nivelado", "leve_desnivelamento", "desniveis_buracos", "degraus_buracos"]),
  
  // Delimitação - Ciclofaixa
  ciclofaixa_separation: z.enum(["dispositivos_1m", "dispositivos_1_5_3m", "dispositivos_mais_3_5m", "sem_dispositivos"]).optional(),
  
  // Delimitação - Ciclovia
  ciclovia_separation: z.enum(["segregacao_total", "segregacao_aberturas", "elementos_2m", "elementos_mais_2_5m"]).optional(),
  
  // Delimitação - Calçada partilhada
  calcada_separation: z.enum(["demarcacao_pavimentos", "demarcacao_mesmo_pavimento", "linha_pictogramas", "sem_delimitacao"]).optional(),
  
  // Estado de conservação dos dispositivos
  separation_conservation: z.enum(["todo_trecho", "mais_metade", "menos_metade", "sem_dispositivos"]).optional(),
  
  // Afastamento lateral
  lateral_distance_type: z.enum(["linha_delimitacao", "dispositivos_separacao"]).optional(),
  lateral_distance_meters: z.string().optional(),
  lateral_distance_conservation: z.enum(["otimo_estado", "bom_estado", "danificada", "inexistente"]).optional(),
  
  // Sinalização horizontal e vertical
  space_identification: z.enum(["pavimento_vermelho", "faixa_contraste_dois", "faixa_contraste_um", "sem_pintura"]).optional(),
  space_identification_conservation: z.enum(["total_area", "mais_metade", "menos_metade", "apagada"]).optional(),
  
  // Pictogramas
  pictograms_per_block: z.enum(["zero", "um", "dois"]).optional(),
  pictograms_conservation: z.enum(["visiveis", "desgastados", "menos_metade", "apagados"]).optional(),
  
  // Sinalização vertical - ciclovias/ciclofaixas
  signs_per_block_cv: z.enum(["zero", "um_ou_mais"]).optional(),
  signs_both_directions_cv: z.boolean().default(false),
  
  // Sinalização vertical - ciclorrotas/calçadas
  signs_per_block_cr: z.enum(["zero", "um", "dois_ou_mais"]).optional(),
  signs_both_directions_cr: z.boolean().default(false),
  
  // Estado de conservação da sinalização vertical
  vertical_signs_conservation: z.enum(["bom_estado", "menos_metade_danificada", "bastante_danificadas", "sem_placas"]).optional(),
  
  // Acessibilidade ao uso do solo
  lanes_count: z.enum(["um", "dois", "tres", "quatro", "cinco", "seis_ou_mais"]).optional(),
  crossings_per_block: z.enum(["nenhuma", "uma", "duas_ou_mais"]).optional(),
  
  // Situações de risco
  risk_bus_stop: z.boolean().default(false),
  risk_horizontal_obstacles: z.boolean().default(false),
  risk_vertical_obstacles: z.boolean().default(false),
  risk_side_change: z.boolean().default(false), 
  risk_contrary_flow: z.boolean().default(false),
  
  // Sinalização nas interseções
  intersection_marking: z.enum(["pavimento_linhas", "pavimento_sem_linhas", "linhas_ou_pictogramas", "sem_sinalizacao"]).optional(),
  intersection_marking_conservation: z.enum(["bom_estado", "danificada", "sem_sinalizacao"]).optional(),
  
  // Acessibilidade entre conexões
  connections_accessibility: z.enum(["acessibilidade_universal", "degraus_com_canaletas", "conexao_invisivel"]).optional(),
  
  // Conflitos com modos motorizados
  conflicts_no_conversion: z.boolean().default(false),
  conflicts_has_conversion: z.boolean().default(false),
  conflicts_exclusive_time: z.boolean().default(false),
  conflicts_corner_protection: z.boolean().default(false),
  conflicts_pedestrian_time: z.boolean().default(false),
  conflicts_traffic_calming: z.boolean().default(false),
  
  // Iluminação pública
  lighting_type: z.enum(["peatonais", "convencionais"]).optional(),
  lighting_distance: z.string().optional(),
  lighting_directed: z.boolean().default(false),
  lighting_barriers: z.boolean().default(false),
  lighting_position: z.enum(["junto_infra", "mais_5m"]).optional(),
  
  // Conforto térmico
  shading: z.enum(["toda_extensao", "mais_metade", "menos_metade", "nao_ha"]).optional(),
  trees_size: z.enum(["porte_alto", "medio_porte", "baixo_porte"]).optional(),
  
  // Mobiliário cicloviário
  furniture_bike_racks: z.boolean().default(false),
  furniture_bike_parking: z.boolean().default(false), 
  furniture_bike_sharing: z.boolean().default(false),
  furniture_service_stations: z.boolean().default(false),
  furniture_drinking_fountains: z.boolean().default(false),
  
  // Observações gerais
  observations: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SegmentForm = () => {
  const { segmentId } = useParams<{ segmentId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [segment, setSegment] = useState<any>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      researcher: "",
      date: new Date().toISOString().split('T')[0],
      city: "",
      neighborhood: "",
      segment_id: "",
      street_name: "",
      extension: "",
      speed_limit: "",
      start_point: "",
      end_point: "",
      road_hierarchy: "",
      blocks_count: "",
      intersections_count: "",
      infra_type: "ciclofaixa",
      flow_type: "unidirecional",
      road_position: "sobre_canteiro",
      width_meters: "",
      includes_gutter: false,
      has_speed_bumps: false,
      has_transversal_trenches: false,
      has_elevated_crossing: false,
      has_elevated_intersection: false,
      has_reduced_lanes: false,
      moderation_distance: "",
      pavement_type: "asfalto_concreto",
      pavement_condition: "nivelado",
    },
  });

  // Carregar os dados do segmento
  useEffect(() => {
    const fetchSegmentData = async () => {
      if (!segmentId) return;
      
      try {
        setIsLoading(true);
        
        // Tentar recuperar do localStorage primeiro
        const storedData = localStorage.getItem(`segment_${segmentId}`);
        let segmentData;
        
        if (storedData) {
          segmentData = JSON.parse(storedData);
          
          // Verificar se o segmento já foi avaliado
          if (segmentData.evaluated && segmentData.formData) {
            setIsReadOnly(true);
            
            // Preencher o formulário com os dados salvos
            Object.entries(segmentData.formData).forEach(([key, value]) => {
              form.setValue(key as any, value as any);
            });
            
            console.log("Formulário preenchido com dados salvos:", segmentData.formData);
          }
        } else {
          segmentData = {
            id: segmentId,
            name: `Segmento ${segmentId.substring(0, 5)}`,
            type: "ciclofaixa",
            length: 1.2345,
            neighborhood: "Centro",
          };
          
          localStorage.setItem(`segment_${segmentId}`, JSON.stringify(segmentData));
        }
        
        setSegment(segmentData);
        
        // Usar o nome correto da via na tag, não "Segmento XXXXX"
        form.setValue("street_name", segmentData.name || "");
        form.setValue("segment_id", segmentId || "");
        form.setValue("extension", segmentData.length?.toString() || "");
        form.setValue("neighborhood", segmentData.neighborhood || "");
        form.setValue("infra_type", segmentData.type as any);
        
      } catch (error) {
        console.error("Erro ao carregar dados do segmento:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados do segmento",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSegmentData();
  }, [segmentId, form, toast]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      // Salvar os dados no localStorage
      const segmentData = {
        ...segment,
        evaluated: true,
        id_form: `form-${segmentId}`,
        formData: values
      };
      
      localStorage.setItem(`segment_${segmentId}`, JSON.stringify(segmentData));
      
      // Atualizar a lista de segmentos avaliados
      const evaluatedSegments = JSON.parse(localStorage.getItem('evaluatedSegments') || '[]');
      if (!evaluatedSegments.includes(segmentId)) {
        evaluatedSegments.push(segmentId);
        localStorage.setItem('evaluatedSegments', JSON.stringify(evaluatedSegments));
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Sucesso",
        description: "Formulário enviado com sucesso!",
      });
      
      navigate("/avaliar", { state: { preserveData: true } });
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast({
        title: "Erro",
        description: "Falha ao enviar formulário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/avaliar", { state: { preserveData: true } });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!formRef.current) return;
    
    const element = formRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `avaliacao_segmento_${segmentId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    toast({
      title: "Gerando PDF",
      description: "Aguarde enquanto o PDF é gerado...",
    });
    
    html2pdf().set(opt).from(element).save().then(() => {
      toast({
        title: "PDF Gerado",
        description: "O arquivo PDF foi gerado com sucesso!",
      });
    });
  };

  // Função para renderizar campos somente leitura
  const renderReadOnlyField = (label: string, value: any) => {
    if (value === undefined || value === null || value === '') return null;
    
    let displayValue: string | React.ReactNode = value;
    
    // Para campos booleanos
    if (typeof value === 'boolean') {
      displayValue = value ? 'Sim' : 'Não';
    }
    
    return (
      <div className="mb-2">
        <div className="text-sm font-medium">{label}</div>
        <div className="bg-muted p-2 rounded-md text-sm">{displayValue}</div>
      </div>
    );
  };

  return (
    <div className="container py-8 print:py-2">
      <div className="flex justify-between items-center mb-6 print:mb-2">
        <h2 className="text-2xl font-bold print:text-xl">
          {isReadOnly ? "Visualização de Avaliação" : "Formulário de Avaliação de Segmento"}
        </h2>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handleCancel}>
            Voltar
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <Card className="mb-8 print:shadow-none print:border-none">
        <CardHeader className="print:py-2">
          <CardTitle className="print:text-lg">{segment?.name || "Carregando..."}</CardTitle>
          <CardDescription className="print:text-sm">
            {isReadOnly 
              ? "Dados avaliados para este segmento" 
              : "Preencha os dados para avaliar este segmento"}
          </CardDescription>
        </CardHeader>
        <CardContent className="print:pt-0" ref={formRef}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 print:space-y-2">
              {/* Seção: Dados básicos */}
              <div className="space-y-4 print:space-y-2">
                <h3 className="text-lg font-semibold print:text-base">Dados do Pesquisador e Localização</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:gap-2">
                  <FormField
                    control={form.control}
                    name="researcher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pesquisador(a)</FormLabel>
                        {isReadOnly ? (
                          <FormValue>{field.value}</FormValue>
                        ) : (
                          <FormControl>
                            <Input {...field} placeholder="Nome do pesquisador" />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        {isReadOnly ? (
                          <FormValue>{field.value}</FormValue>
                        ) : (
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        {isReadOnly ? (
                          <FormValue>{field.value}</FormValue>
                        ) : (
                          <FormControl>
                            <Input {...field} placeholder="Nome da cidade" />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:gap-2">
                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        {isReadOnly ? (
                          <FormValue>{field.value}</FormValue>
                        ) : (
                          <FormControl>
                            <Input {...field} placeholder="Bairro" />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="segment_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID do Segmento</FormLabel>
                        {isReadOnly ? (
                          <FormValue>{field.value}</FormValue>
                        ) : (
                          <FormControl>
                            <Input {...field} readOnly className="bg-muted" />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="print:hidden" />

              {/* Seção: Dados do trecho */}
              <div className="space-y-4 print:space-y-2">
                <h3 className="text-lg font-semibold print:text-base">Dados do Trecho</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                  <FormField
                    control={form.control}
                    name="street_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Trecho</FormLabel>
                        {isReadOnly ? (
                          <FormValue>{field.value}</FormValue>
                        ) : (
                          <FormControl>
                            <Input {...field} placeholder="Nome da via" />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="extension"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Extensão (m)</FormLabel>
                          {isReadOnly ? (
                            <FormValue>{field.value}</FormValue>
                          ) : (
                            <FormControl>
                              <Input {...field} type="number" step="0.001" min="0" />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="speed_limit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Veloc. (km/h)</FormLabel>
                          {isReadOnly ? (
                            <FormValue>{field.value}</FormValue>
                          ) : (
                            <FormControl>
                              <Input {...field} type="number" step="1" min="0" />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="start_point"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Início do Trecho</FormLabel>
                        {isReadOnly ? (
                          <FormValue>{field.value}</FormValue>
                        ) : (
                          <FormControl>
                            <Input {...field} placeholder="Ponto inicial" />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_point"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fim do Trecho</FormLabel>
                        {isReadOnly ? (
                          <FormValue>{field.value}</FormValue>
                        ) : (
                          <FormControl>
                            <Input {...field} placeholder="Ponto final" />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:gap-2">
                  <FormField
                    control={form.control}
                    name="road_hierarchy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hierarquia Viária</FormLabel>
                        {isReadOnly ? (
                          <FormValue>
                            {field.value === "estrutural" ? "Via Estrutural" : 
                             field.value === "alimentadora" ? "Via Alimentadora" : 
                             field.value === "local" ? "Via Local" : field.value}
                          </FormValue>
                        ) : (
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                              {...field}
                            >
                              <option value="">Selecione...</option>
                              <option value="estrutural">Via Estrutural</option>
                              <option value="alimentadora">Via Alimentadora</option>
                              <option value="local">Via Local</option>
                            </select>
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="blocks_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>N° de quadras</FormLabel>
                        {isReadOnly ? (
                          <FormValue>{field.value}</FormValue>
                        ) : (
                          <FormControl>
                            <Input {...field} type="number" min="0" />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="intersections_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>N° de interseções</FormLabel>
                        {isReadOnly ? (
                          <FormValue>{field.value}</FormValue>
                        ) : (
                          <FormControl>
                            <Input {...field} type="number" min="0" />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="print:hidden" />

              {/* Seção: Caracterização geral da infraestrutura */}
              <div className="space-y-4 print:space-y-2">
                <h3 className="text-lg font-semibold print:text-base">Caracterização da Infraestrutura Cicloviária</h3>
                
                <div className="space-y-4 print:space-y-2">
                  <h4 className="font-medium print:text-sm">Tipologia da Infraestrutura</h4>
                  <FormField
                    control={form.control}
                    name="infra_type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        {isReadOnly ? (
                          <FormValue>
                            {field.value === "ciclofaixa" ? "Ciclofaixa" : 
                             field.value === "ciclovia" ? "Ciclovia" : 
                             field.value === "ciclorrota" ? "Ciclorrota" : 
                             field.value === "compartilhada" ? "Via Compartilhada" : ""}
                          </FormValue>
                        ) : (
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-2 gap-4 print:gap-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ciclofaixa" id="infra-type-1" />
                                <Label htmlFor="infra-type-1">Ciclofaixa</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ciclovia" id="infra-type-2" />
                                <Label htmlFor="infra-type-2">Ciclovia</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ciclorrota" id="infra-type-3" />
                                <Label htmlFor="infra-type-3">Ciclorrota</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="compartilhada" id="infra-type-4" />
                                <Label htmlFor="infra-type-4">Via Compartilhada</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 print:space-y-2">
                  <h4 className="font-medium print:text-sm">Fluxo da Infraestrutura</h4>
                  <FormField
                    control={form.control}
                    name="flow_type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        {isReadOnly ? (
                          <FormValue>
                            {field.value === "unidirecional" ? "Unidirecional" : 
                             field.value === "bidirecional" ? "Bidirecional" : ""}
                          </FormValue>
                        ) : (
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-row space-x-8"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="unidirecional" id="flow-1" />
                                <Label htmlFor="flow-1">Unidirecional</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="bidirecional" id="flow-2" />
                                <Label htmlFor="flow-2">Bidirecional</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 print:space-y-2">
                  <h4 className="font-medium print:text-sm">Posição na Via</h4>
                  <FormField
                    control={form.control}
                    name="road_position"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        {isReadOnly ? (
                          <FormValue>
                            {field.value === "sobre_canteiro" ? "Sobre o canteiro" : 
                             field.value === "pista_junto_canteiro" ? "Pista, junto ao canteiro" :
                             field.value === "centro_pista" ? "Centro da pista" : 
                             field.value === "pista_junto_calcada" ? "Pista, junto à calçada" :
                             field.value === "sobre_calcada" ? "Sobre a calçada" : 
                             field.value === "isolada" ? "Isolada em relação à via" : ""}
                          </FormValue>
                        ) : (
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-2 gap-4 print:gap-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sobre_canteiro" id="position-1" />
                                <Label htmlFor="position-1">Sobre o canteiro</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pista_junto_canteiro" id="position-2" />
                                <Label htmlFor="position-2">Pista, junto ao canteiro</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="centro_pista" id="position-3" />
                                <Label htmlFor="position-3">Centro da pista</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pista_junto_calcada" id="position-4" />
                                <Label htmlFor="position-4">Pista, junto à calçada</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sobre_calcada" id="position-5" />
                                <Label htmlFor="position-5">Sobre a calçada</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="isolada" id="position-6" />
                                <Label htmlFor="position-6">Isolada em relação à via</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="print:hidden" />

              {/* Seção: Largura e características físicas */}
              <div className="space-y-4 print:space-y-2">
                <h3 className="text-lg font-semibold print:text-base">B.1. Espaço Útil de Circulação</h3>
                
                <div className="space-y-4 print:space-y-2">
                  <h4 className="font-medium print:text-sm">B.1.1. Largura da infraestrutura cicloviária</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="width_meters"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Largura em metros</FormLabel>
                          {isReadOnly ? (
                            <FormValue>{field.value}</FormValue>
                          ) : (
                            <FormControl>
                              <Input {...field} type="number" step="0.01" min="0" placeholder="Ex: 2.5" />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="includes_gutter"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-8">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Inclui sarjeta
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 print:space-y-1">
                  <h4 className="font-medium print:text-sm">B.1.2. Medidas de moderação de velocidade</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="has_speed_bumps"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isReadOnly}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Lombada, quebra-molas
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="has_transversal_trenches"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isReadOnly}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Valas transversais
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="has_elevated_crossing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isReadOnly}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Faixa de travessia elevada
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div>
                      <FormField
                        control={form.control}
                        name="has_elevated_intersection"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isReadOnly}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Elevação da interseção viária
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="has_reduced_lanes"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isReadOnly}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Redução das larguras das faixas
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="moderation_distance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Distância média entre medidas (m)</FormLabel>
                            {isReadOnly ? (
                              <FormValue>{field.value}</FormValue>
                            ) : (
                              <FormControl>
                                <Input {...field} type="number" min="0" />
                              </FormControl>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="print:hidden" />

              {/* Seção: Tipo de pavimento */}
              <div className="space-y-4 print:space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 print:text-base">B.2. Tipo de pavimento</h3>
                    
                    <FormField
                      control={form.control}
                      name="pavement_type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          {isReadOnly ? (
                            <FormValue>
                              {field.value === "asfalto_concreto" ? "Pisos betuminosos (asfalto) ou cimentícios (concreto)" : 
                              field.value === "blocos" ? "Pisos modulares (blocos de concreto e similares)" : 
                              field.value === "pedras_irregulares" ? "Pedras irregulares (portuguesas e similares)" : 
                              field.value === "terra_grelha" ? "Pisos de barro; grelhas e chapas metálicas" : ""}
                            </FormValue>
                          ) : (
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="asfalto_concreto" id="pav-1" />
                                  <Label htmlFor="pav-1">Pisos betuminosos (asfalto) ou cimentícios (concreto)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="blocos" id="pav-2" />
                                  <Label htmlFor="pav-2">Pisos modulares (blocos de concreto e similares)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="pedras_irregulares" id="pav-3" />
                                  <Label htmlFor="pav-3">Pedras irregulares (portuguesas e similares)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="terra_grelha" id="pav-4" />
                                  <Label htmlFor="pav-4">Pisos de barro; grelhas e chapas metálicas</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4 print:text-base">E.1. Estado de Conservação do pavimento</h3>
                    
                    <FormField
                      control={form.control}
                      name="pavement_condition"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          {isReadOnly ? (
                            <FormValue>
                              {field.value === "nivelado" ? "Piso nivelado, sem ondulações" : 
                              field.value === "leve_desnivelamento" ? "Piso com leve desnivelamento" : 
                              field.value === "desniveis_buracos" ? "Piso com desnível transversal ou buraco raso" : 
                              field.value === "degraus_buracos" ? "Piso com degraus / buracos profundos" : ""}
                            </FormValue>
                          ) : (
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="nivelado" id="cond-1" />
                                  <Label htmlFor="cond-1">Piso nivelado, sem ondulações</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="leve_desnivelamento" id="cond-2" />
                                  <Label htmlFor="cond-2">Piso com leve desnivelamento</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="desniveis_buracos" id="cond-3" />
                                  <Label htmlFor="cond-3">Piso com desnível transversal ou buraco raso</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="degraus_buracos" id="cond-4" />
                                  <Label htmlFor="cond-4">Piso com degraus / buracos profundos</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Seções adicionais aqui - Truncando para não exceder o limite de resposta */}
              {/* Todos os demais campos do formulário seriam adicionados aqui seguindo o mesmo padrão */}

              <Separator className="print:hidden" />

              {/* Seção: Situações de Risco */}
              <div className="space-y-4 print:space-y-2">
                <h3 className="text-lg font-semibold print:text-base">B.6. Situações de Risco ao longo da Infraestrutura</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="risk_bus_stop"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Conflito com ponto de ônibus ou ponto de escola
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="risk_horizontal_obstacles"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Obstáculos horizontais no trecho
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="risk_vertical_obstacles"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Obstáculos verticais no trecho
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="risk_side_change"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Mudança de lado da infraestrutura no meio da quadra
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="risk_contrary_flow"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Sentido de circulação da infraestrutura contrário ao fluxo veicular
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="print:hidden" />

              {/* Seção: Observações */}
              <div className="space-y-4 print:space-y-2">
                <h3 className="text-lg font-semibold print:text-base">Observações</h3>
                <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações adicionais</FormLabel>
                      {isReadOnly ? (
                        <FormValue className="min-h-[60px]">{field.value}</FormValue>
                      ) : (
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Adicione observações relevantes sobre o segmento"
                            className="min-h-[120px]"
                          />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {!isReadOnly && (
                <div className="flex justify-end space-x-4 pt-4 print:hidden">
                  <Button variant="outline" type="button" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Enviando..." : "Enviar Avaliação"}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SegmentForm;
