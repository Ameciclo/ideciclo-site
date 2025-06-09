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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Segment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { saveFormToDB, fetchFormBySegmentId } from "@/services/supabase";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

// Import your page components here
import Page1 from "./Page1";
import Page2 from "./Page2";
import Page3 from "./Page3";

const SegmentForm = () => {
  const { segmentId } = useParams<{ segmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState({});
  const [pageValidation, setPageValidation] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Segment info
  const [cityId, setCityId] = useState("");
  const [segmentName, setSegmentName] = useState("");
  const [segmentType, setSegmentType] = useState("");

  // Page configuration - Add/modify pages here
  const pages = [
    {
      id: "dados-gerais",
      title: "Dados Gerais",
      description: "Informações básicas sobre a avaliação",
      component: Page1,
      requiredFields: [
        "researcher",
        "date",
        "city",
        "neighborhood",
        "id",
        "segment_name",
        "extension_m",
        "velocity_kmh",
        "start_point",
        "end_point",
        "road_hierarchy",
        "blocks_count",
        "intersections_count",
      ],
    },
    {
      id: "section-a",
      title: "A. Caracterização Geral",
      description: "Caracterização geral da infraestrutura cicloviária",
      component: Page2,
      requiredFields: ["infra_typology", "infra_flow", "position_on_road"],
    },
    {
      id: "section-b",
      title: "B. Dimensões e Pavimento",
      description: "Largura da infraestrutura e características do pavimento",
      component: Page3,
      requiredFields: [
        "width_meters",
        "includes_gutter",
        "pavement_type",
        "conservation_state",
      ],
    },
  ];

  useEffect(() => {
    if (segmentId) {
      loadSegmentInfo();
      loadFormData();
    }
  }, [segmentId]);

  const loadSegmentInfo = () => {
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
  };

  const loadFormData = async () => {
    try {
      const formDataFromDB = await fetchFormBySegmentId(segmentId);

      if (formDataFromDB && formDataFromDB.responses) {
        setFormData(formDataFromDB.responses);
        validateAllPages(formDataFromDB.responses);
        return;
      }

      const savedForm = localStorage.getItem(`form_${segmentId}`);
      if (savedForm) {
        const parsedData = JSON.parse(savedForm);
        setFormData(parsedData);
        validateAllPages(parsedData);
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

  const validatePage = (pageIndex, data = formData) => {
    const page = pages[pageIndex];
    if (!page) return false;

    const isValid = page.requiredFields.every((field) => {
      const value = data[field];
      return value !== undefined && value !== null && value !== "";
    });

    setPageValidation((prev) => ({
      ...prev,
      [pageIndex]: isValid,
    }));

    return isValid;
  };

  const validateAllPages = (data = formData) => {
    const validation = {};
    pages.forEach((page, index) => {
      validation[index] = page.requiredFields.every((field) => {
        const value = data[field];
        return value !== undefined && value !== null && value !== "";
      });
    });
    setPageValidation(validation);
  };

  const updateFormData = (pageData) => {
    const newFormData = { ...formData, ...pageData };
    setFormData(newFormData);
    validateAllPages(newFormData);

    // Auto-save to localStorage
    localStorage.setItem(`form_${segmentId}`, JSON.stringify(newFormData));
  };

  const canGoNext = () => {
    return pageValidation[currentPage] === true;
  };

  const canGoPrevious = () => {
    return currentPage > 0;
  };

  const canSubmit = () => {
    return Object.keys(pageValidation).every(
      (key) =>
        pages[key]?.requiredFields.length === 0 || pageValidation[key] === true
    );
  };

  const nextPage = () => {
    if (canGoNext() && currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (!canGoNext()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description:
          "Preencha todos os campos obrigatórios antes de continuar.",
      });
    }
  };

  const previousPage = () => {
    if (canGoPrevious()) {
      setCurrentPage(currentPage - 1);
    }
  };

  const navigateBack = () => {
    navigate("/avaliacao", { state: { preserveData: true } });
  };

  const submitForm = async () => {
    if (!canSubmit()) {
      toast({
        variant: "destructive",
        title: "Formulário incompleto",
        description: "Complete todas as páginas obrigatórias antes de enviar.",
      });
      return;
    }

    setIsSaving(true);
    try {
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
        responses: formData,
      };

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

      const savedForm = await saveFormToDB(form);

      if (!savedForm) {
        throw new Error("Failed to save form to database");
      }

      toast({
        title: "Formulário salvo",
        description: "A avaliação foi salva com sucesso!",
      });

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

  const renderCurrentPage = () => {
    const currentPageData = pages[currentPage];
    if (!currentPageData) return null;

    // If component is available, render it
    if (currentPageData.component) {
      const PageComponent = currentPageData.component;
      return (
        <PageComponent
          data={formData}
          onDataChange={updateFormData}
          segmentName={segmentName}
          segmentType={segmentType}
        />
      );
    }

    // Placeholder for when component is not yet created
    return (
      <div className="min-h-[400px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium mb-2">{currentPageData.title}</p>
          <p className="text-sm mb-2">
            Crie o componente: <code>./pages/{currentPageData.id}.jsx</code>
          </p>
          <p className="text-xs">
            Campos obrigatórios:{" "}
            {currentPageData.requiredFields.join(", ") || "Nenhum"}
          </p>
        </div>
      </div>
    );
  };

  const currentPageData = pages[currentPage];
  const progress = ((currentPage + 1) / pages.length) * 100;

  if (!currentPageData) {
    return <div>Página não encontrada</div>;
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Formulário de Avaliação</h2>
          <p className="text-muted-foreground mt-1">
            Segmento: {segmentName} ({segmentType})
          </p>
        </div>
        <Button variant="outline" onClick={navigateBack}>
          Voltar
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Página {currentPage + 1} de {pages.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% completo
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Page Navigation Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {pages.map((page, index) => (
          <div
            key={page.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm whitespace-nowrap ${
              index === currentPage
                ? "bg-primary text-primary-foreground"
                : index < currentPage || pageValidation[index]
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-muted"
            }`}
          >
            {pageValidation[index] && index !== currentPage && (
              <CheckCircle className="h-4 w-4" />
            )}
            <span>{page.title}</span>
          </div>
        ))}
      </div>

      {/* Main Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {currentPageData.title}
            <Badge
              variant={pageValidation[currentPage] ? "default" : "secondary"}
            >
              {pageValidation[currentPage] ? "Completa" : "Pendente"}
            </Badge>
          </CardTitle>
          <CardDescription>{currentPageData.description}</CardDescription>
        </CardHeader>
        <CardContent>{renderCurrentPage()}</CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={previousPage}
          disabled={!canGoPrevious()}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {currentPage < pages.length - 1 ? (
            <Button
              onClick={nextPage}
              disabled={!canGoNext()}
              className="flex items-center gap-2"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={submitForm}
              disabled={!canSubmit() || isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? "Salvando..." : "Finalizar Avaliação"}
            </Button>
          )}
        </div>
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Debug Info:</h4>
          <p className="text-sm">
            Current Page: {currentPage} ({currentPageData.id})
          </p>
          <p className="text-sm">
            Page Valid: {String(pageValidation[currentPage])}
          </p>
          <p className="text-sm">Can Submit: {String(canSubmit())}</p>
          <p className="text-sm">
            Form Data Keys: {Object.keys(formData).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
};

export default SegmentForm;
