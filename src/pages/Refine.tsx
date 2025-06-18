import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { City, Segment, SegmentType } from "@/types";
import CitySelection from "@/components/CitySelection";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  fetchCityHighwayStats,
  fetchCityWays,
  calculateCityStats,
  convertToSegments,
  calculateMergedLength,
  getStoredCityData,
  storeCityData,
  updateSegmentName,
  mergeGeometry,
  storeSegment,
  removeSegments,
  mergeSegmentsInDB,
  unmergeSegments,
  deleteMultipleSegments,
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Undo2,
  Map,
  TableIcon,
} from "lucide-react";
import { deleteCityFromDB } from "@/services/database";
import MergeSegmentsDialog from "@/components/MergeSegmentsDialog";
import { CityInfrastructureCard } from "@/components/CityInfrastructureCard";
import { RefinementTableSortableWrapper } from "@/components/RefinementTableSortableWrapper";

const Refine = () => {
  const [step, setStep] = useState<"selection" | "refinement">("selection");
  const [cityId, setCityId] = useState<string>("");
  const [cityName, setCityName] = useState<string>("");
  const [stateName, setStateName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [city, setCity] = useState<Partial<City> | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mergeDialogOpen, setMergeDialogOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if we're returning from form with preserved data
  useEffect(() => {
    const state = location.state as { preserveData?: boolean } | undefined;

    if (state?.preserveData) {
      const storedCityId = localStorage.getItem("currentCityId");
      if (storedCityId) {
        const storedCityName = localStorage.getItem("currentCityName") || "";
        const storedStateName = localStorage.getItem("currentStateName") || "";

        setCityId(storedCityId);
        setCityName(storedCityName);
        setStateName(storedStateName);

        if (step === "selection") {
          loadStoredCityData(storedCityId);
        }
      }
    }
  }, [location, step]);

  const loadLocalSegments = (cityId: string): Segment[] | null => {
    try {
      const cachedSegmentsKey = `segments_${cityId}`;
      const cachedSegmentsJson = localStorage.getItem(cachedSegmentsKey);
      if (cachedSegmentsJson) {
        return JSON.parse(cachedSegmentsJson);
      }
    } catch (error) {
      console.error("Error loading segments from local storage:", error);
    }
    return null;
  };

  const saveLocalSegments = (cityId: string, segments: Segment[]) => {
    try {
      const cachedSegmentsKey = `segments_${cityId}`;
      localStorage.setItem(cachedSegmentsKey, JSON.stringify(segments));
    } catch (error) {
      console.error("Error saving segments to local storage:", error);
    }
  };

  const loadStoredCityData = async (selectedCityId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // First try to load from local storage for instant response
      const localSegments = loadLocalSegments(selectedCityId);
      if (localSegments) {
        setSegments(localSegments);
      }

      // Then try to load from database for fresh data
      const storedData = await getStoredCityData(selectedCityId);

      if (storedData) {
        setCity(storedData.city);
        setSegments([...storedData.segments]);

        // Update local storage with fresh data
        saveLocalSegments(selectedCityId, storedData.segments);

        setStep("refinement");
      }
    } catch (error) {
      console.error("Erro ao carregar dados armazenados:", error);
      setError("Falha ao carregar dados armazenados");
    } finally {
      setIsLoading(false);
    }
  };

  const resetCityData = async () => {
    if (!cityId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Delete data from database (segments will cascade delete due to FK constraints)
      await deleteCityFromDB(cityId);

      // Refetch data from API
      const highwayStats = await fetchCityHighwayStats(cityId);
      const cityStats = calculateCityStats(highwayStats);

      // Create updated city record
      const updatedCity: Partial<City> = {
        id: cityId,
        name: cityName,
        state: stateName,
        extensao_avaliada: 0,
        ideciclo: 0,
        ...cityStats,
      };

      setCity(updatedCity);

      // Fetch segments
      const waysData = await fetchCityWays(cityId);
      const citySegments = convertToSegments(waysData, cityId);

      const enhancedSegments = citySegments.map((segment) => {
        return {
          ...segment,
          evaluated: false,
          id_form: undefined,
        };
      });

      setSegments(enhancedSegments);

      // Update local storage
      saveLocalSegments(cityId, enhancedSegments);

      // Store data in database
      await storeCityData(cityId, {
        city: updatedCity,
        segments: enhancedSegments,
      });

      toast({
        title: "Dados recarregados",
        description: `Dados de ${cityName}/${stateName} foram recarregados com sucesso da API!`,
      });
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Falha ao recarregar os dados da cidade";
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySelected = async (
    stateId: string,
    selectedCityId: string,
    selectedCityName: string,
    selectedStateName: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      setCityId(selectedCityId);
      setCityName(selectedCityName);
      setStateName(selectedStateName);

      // First try to load from local storage for instant response
      const localSegments = loadLocalSegments(selectedCityId);
      if (localSegments) {
        setSegments(localSegments);
      }

      // Check if data is in database before making API calls
      const storedData = await getStoredCityData(selectedCityId);

      if (storedData) {
        setCity(storedData.city);
        const enhancedSegments = [...storedData.segments];
        setSegments(enhancedSegments);

        // Update local storage with fresh data
        saveLocalSegments(selectedCityId, enhancedSegments);

        toast({
          title: "Dados carregados",
          description: `Dados de ${selectedCityName}/${selectedStateName} carregados do armazenamento!`,
        });
      } else {
        // Fetch highway stats
        const highwayStats = await fetchCityHighwayStats(selectedCityId);
        const cityStats = calculateCityStats(highwayStats);

        // Create city record
        const newCity: Partial<City> = {
          id: selectedCityId,
          name: selectedCityName,
          state: selectedStateName,
          extensao_avaliada: 0,
          ideciclo: 0,
          ...cityStats,
        };

        setCity(newCity);

        // Fetch segments
        const waysData = await fetchCityWays(selectedCityId);
        const citySegments = convertToSegments(waysData, selectedCityId);
        const enhancedSegments = [...citySegments];

        setSegments(enhancedSegments);

        // Store data in local storage
        saveLocalSegments(selectedCityId, enhancedSegments);

        // Store data in database
        await storeCityData(selectedCityId, {
          city: newCity,
          segments: enhancedSegments,
        });

        toast({
          title: "Sucesso",
          description: `Dados de ${selectedCityName}/${selectedStateName} carregados com sucesso!`,
        });
      }

      // Move to refinement step
      setStep("refinement");
    } catch (error) {
      console.error("Erro ao processar cidade:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Falha ao processar os dados da cidade";
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToStart = () => {
    navigate("/");
  };

  const handleRetry = () => {
    if (cityId && stateName) {
      handleCitySelected("", cityId, cityName, stateName);
    } else {
      setError(null);
      setStep("selection");
    }
  };

  const handleUpdateSegmentName = async (
    segmentId: string,
    newName: string
  ) => {
    try {
      // Update in the database
      await updateSegmentName(cityId, segmentId, newName);

      // Update state for UI
      setSegments((prevSegments) =>
        prevSegments.map((seg) =>
          seg.id === segmentId ? { ...seg, name: newName } : seg
        )
      );

      // Update local storage
      const updatedSegments = segments.map((seg) =>
        seg.id === segmentId ? { ...seg, name: newName } : seg
      );
      saveLocalSegments(cityId, updatedSegments);
    } catch (error) {
      console.error("Erro ao atualizar nome do segmento:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar o nome do segmento.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSegment = async (segmentId: string) => {
    try {
      // Remove from database
      await removeSegments([segmentId]);

      // Update state
      const updatedSegments = segments.filter(
        (segment) => segment.id !== segmentId
      );
      setSegments(updatedSegments);

      // Update local storage
      saveLocalSegments(cityId, updatedSegments);

      toast({
        title: "Segmento removido",
        description: "O segmento foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao remover segmento:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover o segmento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSelectSegment = (id: string, selected: boolean) => {
    const updatedSegments = segments.map((segment) =>
      segment.id === id ? { ...segment, selected } : segment
    );
    setSegments(updatedSegments);
    saveLocalSegments(cityId, updatedSegments);
  };

  const handleSelectAllSegments = (segmentIds: string[], selected: boolean) => {
    const updatedSegments = segments.map((segment) =>
      segmentIds.includes(segment.id) ? { ...segment, selected } : segment
    );
    setSegments(updatedSegments);
    saveLocalSegments(cityId, updatedSegments);
  };

  const handleMergeButtonClick = () =>
    Promise.resolve().then(() => {
      if (selectedSegmentsCount >= 2) {
        setMergeDialogOpen(true);
      }
    });
    
  const handleDeleteMultipleSegments = async () => {
    if (selectedSegmentsCount === 0) return;
    
    const selectedSegmentIds = segments
      .filter(s => s.selected)
      .map(s => s.id);
      
    try {
      await deleteMultipleSegments(selectedSegmentIds);
      
      // Update the UI by removing the deleted segments
      const updatedSegments = segments.filter(segment => !segment.selected);
      setSegments(updatedSegments);
      
      // Update local storage
      saveLocalSegments(cityId, updatedSegments);
      
      toast({
        title: "Segmentos removidos",
        description: `${selectedSegmentIds.length} segmentos foram removidos com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao remover múltiplos segmentos:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover os segmentos selecionados.",
        variant: "destructive",
      });
    }
  };

  const handleMergeSegments = async (
    mergedName: string,
    mergedType: SegmentType
  ) => {
    const selectedSegments = segments.filter((s) => s.selected);
    if (selectedSegments.length < 2) return;

    try {
      console.log(
        "Merging segments:",
        selectedSegments.map((s) => s.id)
      );

      // Use the enhanced merging logic that handles both regular and merged segments
      await mergeSegmentsInDB(selectedSegments, mergedName, mergedType);

      // Refresh segments from database to get the updated structure
      const storedData = await getStoredCityData(cityId);
      if (storedData) {
        console.log(
          "Refreshed segments after merge:",
          storedData.segments.length
        );
        
        // Simply use the segments from the database and reset selection state
        const updatedSegments = storedData.segments.map(segment => ({
          ...segment,
          selected: false // Reset selection state after merge
        }));
        
        setSegments(updatedSegments);
        saveLocalSegments(cityId, updatedSegments);
      }

      toast({
        title: "Segmentos mesclados",
        description: `${selectedSegments.length} segmentos mesclados com sucesso`,
      });
    } catch (error) {
      console.error("Erro ao mesclar segmentos:", error);
      toast({
        title: "Erro",
        description: "Falha ao mesclar os segmentos. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUnmergeSegments = async (
    parentSegmentId: string,
    segmentIds: string[]
  ) => {
    try {
      console.log("Unmerging segments:", parentSegmentId, segmentIds);

      await unmergeSegments(parentSegmentId, segmentIds);

      // Refresh segments from database to get the updated structure
      const storedData = await getStoredCityData(cityId);
      if (storedData) {
        console.log(
          "Refreshed segments after unmerge:",
          storedData.segments.length
        );
        
        // Simply use the segments from the database and reset selection state
        const updatedSegments = storedData.segments.map(segment => ({
          ...segment,
          selected: false // Reset selection state after unmerge
        }));
        
        setSegments(updatedSegments);
        saveLocalSegments(cityId, updatedSegments);
      }

      toast({
        title: "Segmentos desmesclados",
        description: "Os segmentos foram desmesclados com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao desmesclar segmentos:", error);
      toast({
        title: "Erro",
        description: "Falha ao desmesclar os segmentos.",
        variant: "destructive",
      });
    }
  };

  const selectedSegmentsCount = segments.filter((s) => s.selected).length;
  const selectedSegments = segments.filter((s) => s.selected);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Refinar Dados de Infraestrutura Cicloviária
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackToStart}>
            Voltar ao Início
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Tentar novamente
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p>Carregando dados... Por favor aguarde.</p>
          </div>
        </div>
      )}

      {!isLoading && !error && step === "selection" && (
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Cidade</CardTitle>
            <CardDescription>
              Escolha o estado e a cidade para refinar os dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CitySelection onCitySelected={handleCitySelected} />
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && step === "refinement" && (
        <div className="space-y-8">
          <CityInfrastructureCard
            cityName={cityName}
            stateName={stateName}
            city={city}
          />

          <div className="flex flex-col gap-8">
            <div>
              {/* <h3 className="text-lg font-semibold mb-4">Segmentos</h3> */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {selectedSegmentsCount > 0 && (
                  <>
                    <Button
                      onClick={handleMergeButtonClick}
                      disabled={selectedSegmentsCount < 2}
                    >
                      Mesclar {selectedSegmentsCount} segmentos
                    </Button>
                    <Button
                      onClick={handleDeleteMultipleSegments}
                      variant="destructive"
                    >
                      Excluir {selectedSegmentsCount} segmentos
                    </Button>
                  </>
                )}
              </div>
              <MergeSegmentsDialog
                open={mergeDialogOpen}
                onOpenChange={setMergeDialogOpen}
                selectedSegments={selectedSegments}
                onConfirm={handleMergeSegments}
              />
              <RefinementTableSortableWrapper
                segments={segments}
                onSelectSegment={handleSelectSegment}
                onSelectAllSegments={handleSelectAllSegments}
                selectedSegments={selectedSegments}
                onMergeSelected={handleMergeButtonClick}
                onUpdateSegmentName={handleUpdateSegmentName}
                onDeleteSegment={handleDeleteSegment}
                onUnmergeSegments={handleUnmergeSegments}
              />

              <div className="mt-8 flex justify-end">
                <Button
                  variant="outline"
                  onClick={resetCityData}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Resetar dados
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Refine;
