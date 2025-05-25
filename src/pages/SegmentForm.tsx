
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Segment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { saveFormToDB, fetchFormBySegmentId } from "@/services/supabase";
import EvaluationForm from "@/components/EvaluationForm";

const SegmentForm = () => {
  const { segmentId } = useParams<{ segmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [cityId, setCityId] = useState("");
  const [segmentName, setSegmentName] = useState("");
  const [segmentType, setSegmentType] = useState("");
  const [initialFormData, setInitialFormData] = useState(null);

  useEffect(() => {
    if (segmentId) {
      // Load segment data from localStorage
      const storedCityId = localStorage.getItem("currentCityId");
      if (storedCityId) {
        setCityId(storedCityId);
      }

      const storedData = localStorage.getItem(`city_${storedCityId}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const segment = parsedData.segments.find(
          (s: Segment) => s.id === segmentId
        );
        if (segment) {
          setSegmentName(segment.name);
          setSegmentType(segment.type);
        }
      }

      loadFormData();
    }
  }, [segmentId]);

  const navigateBack = () => {
    navigate("/avaliacao", { state: { preserveData: true } });
  };

  const saveForm = async (formData: any) => {
    setIsSaving(true);
    try {
      // Create the form object with responses stored in jsonb
      const form = {
        id: `form-${segmentId}`,
        segment_id: segmentId,
        city_id: cityId,
        researcher: formData.researcher,
        date: new Date(),
        street_name: formData.segment_name,
        neighborhood: formData.neighborhood,
        extension: formData.extension_m,
        start_point: formData.start_point,
        end_point: formData.end_point,
        hierarchy: formData.road_hierarchy,
        velocity: formData.velocity_kmh,
        blocks_count: formData.blocks_count,
        intersections_count: formData.intersections_count,
        observations: formData.observations || "",
        responses: formData, // Store all form data as jsonb
      };

      // Save to both localStorage (for backward compatibility) and database
      localStorage.setItem(`form_${segmentId}`, JSON.stringify(formData));

      // Mark this segment as evaluated in localStorage
      const evaluatedSegments = JSON.parse(
        localStorage.getItem("evaluatedSegments") || "[]"
      );
      if (!evaluatedSegments.includes(segmentId)) {
        evaluatedSegments.push(segmentId);
        localStorage.setItem(
          "evaluatedSegments",
          JSON.stringify(evaluatedSegments)
        );
      }

      // Save to the database
      const savedForm = await saveFormToDB(form);

      if (!savedForm) {
        throw new Error("Failed to save form to database");
      }

      // Show success toast
      toast({
        title: "Formulário salvo",
        description: "A avaliação foi salva com sucesso!",
      });

      // Navigate back to the evaluation page
      navigateBack();
    } catch (error) {
      console.error("Erro ao salvar o formulário:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Houve um erro ao salvar o formulário. Tente novamente.",
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
        setInitialFormData(formData.responses);
        return;
      }

      // If not in database, try localStorage as fallback
      const savedForm = localStorage.getItem(`form_${segmentId}`);
      if (savedForm) {
        setInitialFormData(JSON.parse(savedForm));
      }
    } catch (error) {
      console.error("Erro ao carregar dados do formulário:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Houve um erro ao carregar dados do formulário.",
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
          <EvaluationForm
            onSubmit={saveForm}
            initialData={initialFormData}
            segmentName={segmentName}
            segmentType={segmentType}
          />
          
          {isSaving && (
            <div className="mt-4 text-center">
              <span>Salvando...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SegmentForm;
