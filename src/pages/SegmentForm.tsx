
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
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

// Exemplo de schema de validação para o formulário
const formSchema = z.object({
  researcher: z.string().min(2, { message: "Nome do pesquisador é obrigatório" }),
  date: z.string().min(1, { message: "Data é obrigatória" }),
  street_name: z.string().min(1, { message: "Nome da rua é obrigatório" }),
  neighborhood: z.string().min(1, { message: "Bairro é obrigatório" }),
  extension: z.string().min(1, { message: "Extensão é obrigatória" }),
  start_point: z.string().min(1, { message: "Ponto inicial é obrigatório" }),
  end_point: z.string().min(1, { message: "Ponto final é obrigatório" }),
  road_hierarchy: z.string().min(1, { message: "Hierarquia viária é obrigatória" }),
  
  // Campos do formulário baseado nas imagens
  infra_type: z.enum(["ciclofaixa", "ciclovia", "ciclorrota", "compartilhada"]),
  road_position: z.enum(["sobre_canteiro", "centro_pista", "sobre_calcada", "isolada"]),
  flow_type: z.enum(["unidirecional", "bidirecional"]),
  
  // Campos adicionais podem ser expandidos com base nas imagens fornecidas
  width_meters: z.string().optional(),
  has_jersey: z.boolean().default(false),
  has_speed_bumps: z.boolean().default(false),
  has_elevated_crossing: z.boolean().default(false),
  
  // Estado de conservação
  pavement_type: z.enum(["asfalto", "concreto", "blocos", "pedras", "terra"]),
  pavement_condition: z.enum(["bom", "leve_desgaste", "buracos", "derrapante"]),
  
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
  const location = useLocation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      researcher: "",
      date: new Date().toISOString().split('T')[0],
      street_name: "",
      neighborhood: "",
      extension: "",
      start_point: "",
      end_point: "",
      road_hierarchy: "",
      infra_type: "ciclofaixa",
      road_position: "sobre_canteiro",
      flow_type: "unidirecional",
      width_meters: "",
      has_jersey: false,
      has_speed_bumps: false,
      has_elevated_crossing: false,
      pavement_type: "asfalto",
      pavement_condition: "bom",
      observations: "",
    },
  });

  // Carregar os dados do segmento quando a página carregar
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
          // Em um cenário real, você buscaria os dados do segmento do backend
          // Aqui vamos simular com dados fictícios
          segmentData = {
            id: segmentId,
            name: `Segmento ${segmentId.substring(0, 5)}`,
            type: "ciclofaixa",
            length: 1.2345,
            neighborhood: "Centro",
          };
          
          // Armazenar no localStorage
          localStorage.setItem(`segment_${segmentId}`, JSON.stringify(segmentData));
        }
        
        setSegment(segmentData);
        
        // Preencher o formulário com os dados do segmento
        form.setValue("street_name", segmentData.name);
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
      
      // Simular o envio para o backend
      console.log("Dados do formulário:", values);
      
      // Salvar os dados no localStorage
      const segmentData = {
        ...segment,
        evaluated: true,
        id_form: `form-${segmentId}`,
        formData: values
      };
      
      localStorage.setItem(`segment_${segmentId}`, JSON.stringify(segmentData));
      
      // Atualizar a lista de segmentos avaliados no localStorage
      const evaluatedSegments = JSON.parse(localStorage.getItem('evaluatedSegments') || '[]');
      if (!evaluatedSegments.includes(segmentId)) {
        evaluatedSegments.push(segmentId);
        localStorage.setItem('evaluatedSegments', JSON.stringify(evaluatedSegments));
      }
      
      // Simular um atraso de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Sucesso",
        description: "Formulário enviado com sucesso!",
      });
      
      // Voltar para a página de avaliação com a planilha
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
    // Navegar de volta para a página com a planilha
    navigate("/avaliar", { state: { preserveData: true } });
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isReadOnly ? "Visualização de Avaliação" : "Formulário de Avaliação de Segmento"}
        </h2>
        <Button variant="outline" onClick={handleCancel}>Voltar</Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{segment?.name || "Carregando..."}</CardTitle>
          <CardDescription>
            {isReadOnly 
              ? "Visualização dos dados avaliados para este segmento" 
              : "Preencha os dados para avaliar este segmento"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Seção: Dados básicos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados do Pesquisador</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="researcher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pesquisador(a)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do pesquisador" readOnly={isReadOnly} 
                            className={isReadOnly ? "bg-gray-100" : ""} />
                        </FormControl>
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
                        <FormControl>
                          <Input type="date" {...field} readOnly={isReadOnly} 
                            className={isReadOnly ? "bg-gray-100" : ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Seção: Dados do trecho */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados do Trecho</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="street_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Trecho</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome da via" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Bairro" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="extension"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extensão (km)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.001" min="0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="road_hierarchy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hierarquia Viária</FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="start_point"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Início do Trecho</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ponto inicial" />
                        </FormControl>
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
                        <FormControl>
                          <Input {...field} placeholder="Ponto final" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Seção: Caracterização geral da infraestrutura */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Caracterização da Infraestrutura Cicloviária</h3>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Tipologia da Infraestrutura</h4>
                  <FormField
                    control={form.control}
                    name="infra_type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Posição na Via</h4>
                  <FormField
                    control={form.control}
                    name="road_position"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sobre_canteiro" id="position-1" />
                              <Label htmlFor="position-1">Sobre o canteiro</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="centro_pista" id="position-2" />
                              <Label htmlFor="position-2">Centro da pista</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sobre_calcada" id="position-3" />
                              <Label htmlFor="position-3">Sobre a calçada</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="isolada" id="position-4" />
                              <Label htmlFor="position-4">Isolada em relação à via</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Fluxo da Infraestrutura</h4>
                  <FormField
                    control={form.control}
                    name="flow_type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Seção: Largura e características físicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Espaço Útil de Circulação</h3>
                
                <FormField
                  control={form.control}
                  name="width_meters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largura em metros</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" min="0" placeholder="Ex: 2.5" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <h4 className="font-medium">Medidas de moderação de velocidade</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="has_speed_bumps"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
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
                      name="has_jersey"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
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
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
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
                </div>
              </div>

              <Separator />

              {/* Seção: Tipo de pavimento */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pavimento da Infraestrutura</h3>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Tipo de Pavimento</h4>
                  <FormField
                    control={form.control}
                    name="pavement_type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="asfalto" id="pav-1" />
                              <Label htmlFor="pav-1">Pisos betuminosos (asfalto)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="concreto" id="pav-2" />
                              <Label htmlFor="pav-2">Pisos de concreto</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="blocos" id="pav-3" />
                              <Label htmlFor="pav-3">Pisos modulares (blocos)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="pedras" id="pav-4" />
                              <Label htmlFor="pav-4">Pedras irregulares (paralelepípedos)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="terra" id="pav-5" />
                              <Label htmlFor="pav-5">Pisos de terra/grelha</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Estado de Conservação</h4>
                  <FormField
                    control={form.control}
                    name="pavement_condition"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bom" id="cond-1" />
                              <Label htmlFor="cond-1">Piso nivelado, sem ondulações</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="leve_desgaste" id="cond-2" />
                              <Label htmlFor="cond-2">Piso com leve desnivelamento</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="buracos" id="cond-3" />
                              <Label htmlFor="cond-3">Piso com desníveis/buracos</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="derrapante" id="cond-4" />
                              <Label htmlFor="cond-4">Piso derrapante/muito degradado</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Seção: Observações */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Observações</h3>
                <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações adicionais</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Adicione observações relevantes sobre o segmento"
                          className={`min-h-[120px] ${isReadOnly ? "bg-gray-100" : ""}`}
                          readOnly={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {!isReadOnly && (
                <div className="flex justify-end space-x-4 pt-4">
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
