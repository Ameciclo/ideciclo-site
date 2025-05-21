import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { City, Segment, SegmentType } from "@/types";
import CitySelection from "@/components/CitySelection";
import OriginalSegmentsTable from "@/components/OriginalSegmentsTable";
import CityMap from "@/components/CityMap";
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
} from "@/services/api";
import { fetchFormBySegmentId } from "@/services/supabase";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, RefreshCw, Undo2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TableSortableWrapper from "@/components/TableSortableWrapper";

const Evaluate = () => {
  const [step, setStep] = useState<"selection" | "evaluation">("selection");
  const [cityId, setCityId] = useState<string>("");
  const [cityName, setCityName] = useState<string>("");
  const [stateName, setStateName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [city, setCity] = useState<Partial<City> | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [mergeData, setMergeData] = useState<{
    name: string;
    type: SegmentType;
  } | null>(null);
  const [mergeHistory, setMergeHistory] = useState<
    Array<{
      removedSegments: Segment[];
      mergedSegment: Segment;
    }>
  >([]);
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

  const loadStoredCityData = async (selectedCityId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to load city data from database/localStorage
      const storedData = await getStoredCityData(selectedCityId);

      if (storedData) {
        setCity(storedData.city);

        // For each segment, check if it has been evaluated by querying the database
        const enhancedSegments = [...storedData.segments];

        // Check evaluation status for each segment
        for (let i = 0; i < enhancedSegments.length; i++) {
          const segment = enhancedSegments[i];
          const form = await fetchFormBySegmentId(segment.id);

          if (form) {
            enhancedSegments[i] = {
              ...segment,
              evaluated: true,
              id_form: form.id,
            };
          }
        }

        setSegments(enhancedSegments);
        setStep("evaluation");
      } else {
        // If no stored data, we need to fetch it
        handleCitySelected(
          "",
          selectedCityId,
          localStorage.getItem("currentCityName") || "",
          localStorage.getItem("currentStateName") || ""
        );
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

      // Clear local storage for this city
      localStorage.removeItem(`city_${cityId}`);

      // Delete data from database (segments will cascade delete due to FK constraints)
      await supabase.from("cities").delete().eq("id", cityId);

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

      // Store data in database and localStorage
      await storeCityData(cityId, {
        city: updatedCity,
        segments: enhancedSegments,
      });

      // Clear merge history
      setMergeHistory([]);

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

      // Store current selection in localStorage
      localStorage.setItem("currentCityId", selectedCityId);
      localStorage.setItem("currentCityName", selectedCityName);
      localStorage.setItem("currentStateName", selectedStateName);

      // Check if data is in database/localStorage before making API calls
      const storedData = await getStoredCityData(selectedCityId);
      if (storedData) {
        setCity(storedData.city);
        const enhancedSegments = [...storedData.segments];
        setSegments(enhancedSegments);

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

        // For each segment, check if it has been evaluated
        const enhancedSegments = [...citySegments];

        // Check evaluation status for each segment
        for (let i = 0; i < enhancedSegments.length; i++) {
          const segment = enhancedSegments[i];
          const form = await fetchFormBySegmentId(segment.id);

          if (form) {
            enhancedSegments[i] = {
              ...segment,
              evaluated: true,
              id_form: form.id,
            };
          }
        }

        setSegments(enhancedSegments);

        // Store data in database and localStorage
        await storeCityData(selectedCityId, {
          city: newCity,
          segments: enhancedSegments,
        });

        toast({
          title: "Sucesso",
          description: `Dados de ${selectedCityName}/${selectedStateName} carregados com sucesso!`,
        });
      }

      // Move to evaluation step
      setStep("evaluation");
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

  const handleSelectSegment = (id: string, selected: boolean) => {
    setSegments((prevSegments) =>
      prevSegments.map((segment) =>
        segment.id === id ? { ...segment, selected } : segment
      )
    );
  };

  const handleMergeSegments = async () => {
    const selectedSegments = segments.filter((s) => s.selected);
    if (selectedSegments.length < 2) return;

    // Verificar se algum segmento selecionado já foi avaliado
    const hasEvaluated = selectedSegments.some((s) => s.evaluated);
    if (hasEvaluated) {
      toast({
        title: "Erro",
        description: "Segmentos já avaliados não podem ser mesclados",
        variant: "destructive",
      });
      return;
    }

    try {
      // Gerar um novo ID para o segmento mesclado
      const mergedId = `merged-${Date.now()}`;
      const totalLength = calculateMergedLength(selectedSegments);

      // Criar o novo segmento mesclado - utilizando o nome definido pelo usuário no diálogo de mesclagem
      const mergedSegment: Segment = {
        id: mergedId,
        id_cidade: cityId,
        name:
          mergeData?.name || `Segmento mesclado (${selectedSegments.length})`,
        type: mergeData?.type || selectedSegments[0].type,
        length: totalLength,
        neighborhood: selectedSegments[0].neighborhood,
        geometry: [], // Em uma implementação real, você mesclaria as geometrias
        selected: false,
        evaluated: false,
      };

      // Save to merge history before removing segments
      setMergeHistory((prev) => [
        ...prev,
        {
          removedSegments: [...selectedSegments],
          mergedSegment: { ...mergedSegment },
        },
      ]);

      // Remover os segmentos selecionados e adicionar o mesclado
      const idsToRemove = new Set(selectedSegments.map((s) => s.id));
      const updatedSegments = [
        ...segments.filter((s) => !idsToRemove.has(s.id)),
        mergedSegment,
      ];

      setSegments(updatedSegments);

      // Atualizar a lista no banco de dados e localStorage
      await storeCityData(cityId, {
        city: city as Partial<City>,
        segments: updatedSegments,
      });

      // Delete the removed segments from the database
      const segmentIds = selectedSegments.map((s) => s.id);
      if (segmentIds.length > 0) {
        await supabase.from("segments").delete().in("id", segmentIds);
      }

      toast({
        title: "Segmentos mesclados",
        description: `${
          selectedSegments.length
        } segmentos mesclados com extensão total de ${totalLength.toFixed(
          4
        )} km`,
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

  const handleUndoLastMerge = async () => {
    if (mergeHistory.length === 0) {
      toast({
        title: "Informação",
        description: "Não há fusões para desfazer",
      });
      return;
    }

    try {
      // Get the last merge operation
      const lastMerge = mergeHistory[mergeHistory.length - 1];

      // Remove the merged segment and add back the original segments
      const updatedSegments = segments.filter(
        (segment) => segment.id !== lastMerge.mergedSegment.id
      );
      const restoredSegments = [
        ...updatedSegments,
        ...lastMerge.removedSegments,
      ];

      // Update state
      setSegments(restoredSegments);

      // Update database and localStorage
      await storeCityData(cityId, {
        city: city as Partial<City>,
        segments: restoredSegments,
      });

      // Delete the merged segment from the database
      await supabase
        .from("segments")
        .delete()
        .eq("id", lastMerge.mergedSegment.id);

      // Update merge history
      setMergeHistory((prev) => prev.slice(0, -1));

      toast({
        title: "Fusão desfeita",
        description: "A última operação de mesclagem foi desfeita com sucesso",
      });
    } catch (error) {
      console.error("Erro ao desfazer mesclagem:", error);
      toast({
        title: "Erro",
        description: "Falha ao desfazer a mesclagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSegmentName = async (
    segmentId: string,
    newName: string
  ) => {
    try {
      // First update in the local state
      setSegments((prevSegments) =>
        prevSegments.map((segment) =>
          segment.id === segmentId ? { ...segment, name: newName } : segment
        )
      );

      // Also update in the database and localStorage
      await updateSegmentName(cityId, segmentId, newName);
    } catch (error) {
      console.error("Erro ao atualizar nome do segmento:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar o nome do segmento.",
        variant: "destructive",
      });
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

  const selectedSegmentsCount = segments.filter((s) => s.selected).length;

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

      {!isLoading && !error && step === "evaluation" && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {cityName}, {stateName}
                  </CardTitle>
                  <CardDescription>
                    Dados da infraestrutura cicloviária
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndoLastMerge}
                    disabled={mergeHistory.length === 0}
                  >
                    <Undo2 className="mr-2 h-4 w-4" />
                    Desfazer mesclagem
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetCityData}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Recarregar dados
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-semibold text-gray-500">
                    VIAS ESTRUTURAIS
                  </h4>
                  <p className="text-2xl font-bold">
                    {city?.vias_estruturais_km} km
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-semibold text-gray-500">
                    VIAS ALIMENTADORAS
                  </h4>
                  <p className="text-2xl font-bold">
                    {city?.vias_alimentadoras_km} km
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-semibold text-gray-500">
                    VIAS LOCAIS
                  </h4>
                  <p className="text-2xl font-bold">
                    {city?.vias_locais_km} km
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Segmentos</h3>

              <TableSortableWrapper
                segments={segments}
                showSortOptions={true}
                onSelectSegment={handleSelectSegment}
                onMergeSelected={handleMergeSegments}
                selectedSegmentsCount={selectedSegmentsCount}
                onMergeDataChange={setMergeData}
                onUpdateSegmentName={handleUpdateSegmentName}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Visualização do Mapa
              </h3>
              <CityMap segments={segments} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evaluate;
