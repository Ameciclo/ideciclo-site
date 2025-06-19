import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import Page1 from "./Page1";
import Page2 from "./Page2";
import Page3 from "./Page3";
import Page4 from "./Page4";
import Page5 from "./Page5";
import Page6 from "./Page6";
import Page7 from "./Page7";
import Page8 from "./Page8";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchFormById, 
  getFormBySegmentId, 
  fetchSegmentById, 
  updateFormInDB, 
  createFormInDB, 
  updateSegmentEvaluationStatus 
} from "@/services/database";

const SegmentForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { segmentId, formId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [existingFormId, setExistingFormId] = useState<string | null>(
    formId || null
  );
  const [formData, setFormData] = useState({
    researcher: "",
    date: new Date().toISOString().split("T")[0],
    city: "",
    neighborhood: "",
    id: segmentId || "",
    segment_name: "",
    extension_m: 0,
    velocity_kmh: 0,
    start_point: "",
    end_point: "",
    road_hierarchy: "",
    blocks_count: 0,
    intersections_count: 0,
    infra_typology: "",
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
  });

  const totalPages = 8;

  // Fetch segment and form data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      console.log("SegmentForm: Starting data fetch with segmentId:", segmentId, "formId:", formId);
      
      // Check if we have segment data in location state
      const segmentDataFromState = location.state?.segmentData;
      console.log("SegmentForm: Segment data from location state:", segmentDataFromState);
      
      try {
        // If formId is provided directly, fetch the form first
        if (formId) {
          console.log("SegmentForm: Fetching form by ID:", formId);
          const formData = await fetchFormById(formId);
          console.log("SegmentForm: Form data received:", formData);

          if (!formData) {
            console.error("SegmentForm: Form not found");
            throw new Error("Form not found");
          }

          // Set the segment ID from the form data
          const segmentIdFromForm = formData.segment_id;
          console.log("SegmentForm: Setting form data with segment ID:", segmentIdFromForm);

          setExistingFormId(formId);
          setFormData({
            ...formData.responses,
            id: segmentIdFromForm,
          });
        }
        // If only segmentId is provided
        else if (segmentId) {
          console.log("SegmentForm: Checking if segmentId is a form ID:", segmentId);
          // First check if this segmentId is actually a form ID
          const formBySegmentId = await getFormBySegmentId(segmentId);
          console.log("SegmentForm: Form by segment ID result:", formBySegmentId);

          if (formBySegmentId) {
            // We found a form with this segment ID
            console.log("SegmentForm: Found form for segment:", formBySegmentId.id);
            setExistingFormId(formBySegmentId.id);
            setFormData({
              ...formBySegmentId.responses,
              id: segmentId,
            });
          } else {
            // If we have segment data from state, use it directly
            if (segmentDataFromState) {
              console.log("SegmentForm: Using segment data from state:", segmentDataFromState);
              setFormData((prevData) => ({
                ...prevData,
                id: segmentId,
                segment_name: segmentDataFromState.name || "",
                infra_typology: segmentDataFromState.type || "",
                classification: segmentDataFromState.classification || undefined,
              }));
            } else {
              // Otherwise, get the segment details from the database
              console.log("SegmentForm: Fetching segment details for:", segmentId);
              const segmentData = await fetchSegmentById(segmentId);
              console.log("SegmentForm: Segment data received:", segmentData);

              if (!segmentData) {
                console.error("SegmentForm: Segment not found");
                throw new Error("Segment not found");
              }

              // Check if this segment has an associated form
              if (segmentData.id_form) {
                console.log("SegmentForm: Segment has associated form:", segmentData.id_form);
                const formData = await fetchFormById(segmentData.id_form);
                console.log("SegmentForm: Associated form data:", formData);

                if (!formData) {
                  console.error("SegmentForm: Associated form not found");
                  throw new Error("Form not found");
                }

                // If we have form data, populate the form with it
                setExistingFormId(formData.id);
                setFormData({
                  ...formData.responses,
                  id: segmentId,
                });
              } else {
                // If no form exists yet, just populate basic segment info
                console.log("SegmentForm: No form exists, populating with segment info:", {
                  id: segmentId,
                  name: segmentData.name,
                  type: segmentData.type,
                  classification: segmentData.classification
                });
                
                setFormData((prevData) => ({
                  ...prevData,
                  id: segmentId,
                  segment_name: segmentData.name || "",
                  infra_typology: segmentData.type || "",
                  // Safely handle the new classification field
                  classification: segmentData.classification || undefined,
                }));
              }
            }
          }
        } else {
          console.error("SegmentForm: No segmentId or formId provided");
        }
      } catch (error) {
        console.error("SegmentForm: Error fetching data:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [segmentId, formId, toast, location.state]);

  const handleDataChange = (newData: any) => {
    setFormData({ ...formData, ...newData });
  };

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

  const handleSubmit = async () => {
    try {
      // Get city ID from sessionStorage
      const cityId = sessionStorage.getItem("selectedCityId");

      if (!cityId) {
        throw new Error("Cidade não selecionada");
      }

      if (!segmentId) {
        throw new Error("ID do segmento não encontrado");
      }

      // Determine if we're updating or creating
      const isUpdating = !!existingFormId;

      // Prepare form data for database
      const formToSave = {
        segment_id: segmentId,
        city_id: cityId,
        researcher: formData.researcher || "",
        responses: formData, // Store all form data in the responses JSONB field
      };

      let result;

      if (isUpdating) {
        // Update existing form
        console.log("Updating existing form:", existingFormId);
        result = await updateFormInDB(existingFormId, formToSave);
      } else {
        // Create new form with unique ID
        const formId = `form-${segmentId}-${Date.now()}`;
        console.log("Creating new form:", formId);
        result = await createFormInDB({ ...formToSave, id: formId });

        // Update the segment to mark it as evaluated
        await updateSegmentEvaluationStatus(segmentId, formId);

        if (!result) {
          console.error("Error updating segment evaluation status");
        }
      }

      if (result.error) {
        console.error("Error saving form:", result.error);
        throw new Error(
          "Falha ao salvar o formulário: " + result.error.message
        );
      }

      toast({
        title: isUpdating ? "Avaliação atualizada" : "Avaliação salva",
        description: "Os dados foram salvos com sucesso no banco de dados.",
      });

      // Navigate back
      navigate(-1);
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao salvar os dados.",
        variant: "destructive",
      });
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 1:
        return "Dados Gerais";
      case 2:
        return "Caracterização da Infraestrutura";
      case 3:
        return "Espaço Útil de Circulação";
      case 4:
        return "Pavimento e Estado de Conservação";
      case 5:
        return "Delimitação da Infraestrutura";
      case 6:
        return "Sinalização Horizontal e Vertical";
      case 7:
        return "Acessibilidade e Interseções";
      case 8:
        return "Iluminação e Conforto";
      default:
        return "Avaliação de Segmento";
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {existingFormId ? "Editar Avaliação" : "Nova Avaliação"} de Segmento
        </h2>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>

      {isLoading ? (
        <Card className="mb-6 p-6 flex justify-center items-center">
          <p>Carregando dados do segmento...</p>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{getPageTitle()}</CardTitle>
            <CardDescription>
              Página {currentPage} de {totalPages}
            </CardDescription>
          </CardHeader>

          {currentPage === 1 && (
            <Page1
              data={formData}
              onDataChange={handleDataChange}
              segmentName={formData.segment_name}
              segmentType={formData.infra_typology}
            />
          )}

          {currentPage === 2 && (
            <Page2
              data={formData}
              onDataChange={handleDataChange}
              segmentType={formData.infra_typology}
            />
          )}

          {currentPage === 3 && (
            <Page3 data={formData} onDataChange={handleDataChange} />
          )}

          {currentPage === 4 && (
            <Page4 data={formData} onDataChange={handleDataChange} />
          )}

          {currentPage === 5 && (
            <Page5 data={formData} onDataChange={handleDataChange} />
          )}

          {currentPage === 6 && (
            <Page6 data={formData} onDataChange={handleDataChange} />
          )}

          {currentPage === 7 && (
            <Page7 data={formData} onDataChange={handleDataChange} />
          )}

          {currentPage === 8 && (
            <Page8 data={formData} onDataChange={handleDataChange} />
          )}

          <CardFooter className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>

            {currentPage < totalPages ? (
              <Button onClick={nextPage}>
                Próximo <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <Save className="mr-2 h-4 w-4" /> Salvar Avaliação
              </Button>
            )}
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
            onClick={() => setCurrentPage(index + 1)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </div>
    </div>
  );
};

export default SegmentForm;
