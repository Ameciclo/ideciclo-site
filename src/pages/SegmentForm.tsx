import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, Segment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { saveFormToDB, fetchFormBySegmentId } from "@/services/supabase";

const formSchema = z.object({
  researcher: z.string().min(2, {
    message: "O nome do pesquisador deve ter pelo menos 2 caracteres.",
  }),
  date: z.date(),
  streetName: z.string().min(2, {
    message: "O nome da rua deve ter pelo menos 2 caracteres.",
  }),
  neighborhood: z.string().min(2, {
    message: "O bairro deve ter pelo menos 2 caracteres.",
  }),
  extension: z.number(),
  startPoint: z.string().min(2, {
    message: "O ponto inicial deve ter pelo menos 2 caracteres.",
  }),
  endPoint: z.string().min(2, {
    message: "O ponto final deve ter pelo menos 2 caracteres.",
  }),
  hierarchy: z.string(),
  velocity: z.number(),
  blocksCount: z.number(),
  intersectionsCount: z.number(),
  observations: z.string(),
});

const SegmentForm = () => {
  const { segmentId } = useParams<{ segmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [cityId, setCityId] = useState("");
  const [segmentName, setSegmentName] = useState("");
  const [segmentType, setSegmentType] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      researcher: "",
      date: new Date(),
      streetName: "",
      neighborhood: "",
      extension: 0,
      startPoint: "",
      endPoint: "",
      hierarchy: "",
      velocity: 0,
      blocksCount: 0,
      intersectionsCount: 0,
      observations: "",
    },
  });

  useEffect(() => {
    if (segmentId) {
      // Load segment data from localStorage
      const storedCityId = localStorage.getItem('currentCityId');
      if (storedCityId) {
        setCityId(storedCityId);
      }
      
      const storedData = localStorage.getItem(`city_${storedCityId}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const segment = parsedData.segments.find((s: Segment) => s.id === segmentId);
        if (segment) {
          setSegmentName(segment.name);
          setSegmentType(segment.type);
        }
      }
      
      loadFormData();
    }
  }, [segmentId]);

  const setDefaultValues = (values: any) => {
    form.setValue("researcher", values.researcher || "");
    form.setValue("streetName", values.streetName || "");
    form.setValue("neighborhood", values.neighborhood || "");
    form.setValue("extension", values.extension || 0);
    form.setValue("startPoint", values.startPoint || "");
    form.setValue("endPoint", values.endPoint || "");
    form.setValue("hierarchy", values.hierarchy || "");
    form.setValue("velocity", values.velocity || 0);
    form.setValue("blocksCount", values.blocksCount || 0);
    form.setValue("intersectionsCount", values.intersectionsCount || 0);
    form.setValue("observations", values.observations || "");
  };

  const navigateBack = () => {
    navigate("/avaliar", { state: { preserveData: true } });
  };

  const saveForm = async (formData: any) => {
    setIsSaving(true);
    try {
      // Create the form object
      const form = {
        id: `form-${segmentId}`,
        segment_id: segmentId,
        city_id: cityId,
        researcher: formData.researcher,
        date: new Date(),
        street_name: formData.streetName,
        neighborhood: formData.neighborhood,
        extension: formData.extension,
        start_point: formData.startPoint,
        end_point: formData.endPoint,
        hierarchy: formData.hierarchy,
        velocity: formData.velocity,
        blocks_count: formData.blocksCount,
        intersections_count: formData.intersectionsCount,
        observations: formData.observations,
        responses: formData // Store the raw form data for now
      };

      // Save to both localStorage (for backward compatibility) and database
      localStorage.setItem(`form_${segmentId}`, JSON.stringify(formData));
      
      // Mark this segment as evaluated in localStorage
      const evaluatedSegments = JSON.parse(localStorage.getItem('evaluatedSegments') || '[]');
      if (!evaluatedSegments.includes(segmentId)) {
        evaluatedSegments.push(segmentId);
        localStorage.setItem('evaluatedSegments', JSON.stringify(evaluatedSegments));
      }
      
      // Save to the database
      const savedForm = await saveFormToDB(form);
      
      if (!savedForm) {
        throw new Error("Failed to save form to database");
      }
      
      // Show success toast
      toast({
        title: "Formulário salvo",
        description: "A avaliação foi salva com sucesso!"
      });
      
      // Navigate back to the evaluation page
      navigateBack();
    } catch (error) {
      console.error('Erro ao salvar o formulário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Houve um erro ao salvar o formulário. Tente novamente."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadFormData = async () => {
    try {
      // First try to get from the database
      const formData = await fetchFormBySegmentId(segmentId);
      
      if (formData && formData.responses) {
        // Use the responses object from the database
        setDefaultValues(formData.responses);
        return;
      }
      
      // If not in database, try localStorage as fallback
      const savedForm = localStorage.getItem(`form_${segmentId}`);
      if (savedForm) {
        setDefaultValues(JSON.parse(savedForm));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do formulário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Houve um erro ao carregar dados do formulário."
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Formulário de Avaliação</h2>
        <Button variant="outline" onClick={navigateBack}>
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segmento: {segmentName}</CardTitle>
          <CardDescription>
            Preencha os dados para avaliar o segmento do tipo {segmentType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(saveForm)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="researcher">Nome do Pesquisador</Label>
                <Input
                  id="researcher"
                  type="text"
                  placeholder="Digite o nome do pesquisador"
                  {...form.register("researcher")}
                />
                {form.formState.errors.researcher && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.researcher.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  {...form.register("date")}
                />
                {form.formState.errors.date && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.date.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="streetName">Nome da Rua</Label>
              <Input
                id="streetName"
                type="text"
                placeholder="Digite o nome da rua"
                {...form.register("streetName")}
              />
              {form.formState.errors.streetName && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.streetName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                type="text"
                placeholder="Digite o bairro"
                {...form.register("neighborhood")}
              />
              {form.formState.errors.neighborhood && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.neighborhood.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="extension">Extensão (metros)</Label>
                <Input
                  id="extension"
                  type="number"
                  placeholder="Digite a extensão em metros"
                  {...form.register("extension", { valueAsNumber: true })}
                />
                {form.formState.errors.extension && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.extension.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="velocity">Velocidade (km/h)</Label>
                <Input
                  id="velocity"
                  type="number"
                  placeholder="Digite a velocidade em km/h"
                  {...form.register("velocity", { valueAsNumber: true })}
                />
                {form.formState.errors.velocity && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.velocity.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="blocksCount">Número de Quadras</Label>
                <Input
                  id="blocksCount"
                  type="number"
                  placeholder="Digite o número de quadras"
                  {...form.register("blocksCount", { valueAsNumber: true })}
                />
                {form.formState.errors.blocksCount && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.blocksCount.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startPoint">Ponto Inicial</Label>
                <Input
                  id="startPoint"
                  type="text"
                  placeholder="Digite o ponto inicial"
                  {...form.register("startPoint")}
                />
                {form.formState.errors.startPoint && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.startPoint.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="endPoint">Ponto Final</Label>
                <Input
                  id="endPoint"
                  type="text"
                  placeholder="Digite o ponto final"
                  {...form.register("endPoint")}
                />
                {form.formState.errors.endPoint && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.endPoint.message}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="hierarchy">Hierarquia da via</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a hierarquia da via" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="alimentadora">Alimentadora</SelectItem>
                  <SelectItem value="estrutural">Estrutural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Como você avalia a segurança do tráfego neste segmento?</Label>
              <RadioGroup className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="muito-seguro" id="r1" />
                  <Label htmlFor="r1">Muito seguro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="seguro" id="r2" />
                  <Label htmlFor="r2">Seguro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pouco-seguro" id="r3" />
                  <Label htmlFor="r3">Pouco seguro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nada-seguro" id="r4" />
                  <Label htmlFor="r4">Nada seguro</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="intersectionsCount">Número de Interseções</Label>
              <Input
                id="intersectionsCount"
                type="number"
                placeholder="Digite o número de interseções"
                {...form.register("intersectionsCount", { valueAsNumber: true })}
              />
              {form.formState.errors.intersectionsCount && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.intersectionsCount.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                placeholder="Digite suas observações"
                {...form.register("observations")}
              />
              {form.formState.errors.observations && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.observations.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SegmentForm;
