
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { City, Segment, SegmentType } from "@/types";
import CitySelection from "@/components/CitySelection";
import SegmentsTable from "@/components/SegmentsTable";
import CityMap from "@/components/CityMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchCityHighwayStats, fetchCityWays, calculateCityStats, convertToSegments, calculateMergedLength } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const Evaluate = () => {
  const [step, setStep] = useState<'selection' | 'evaluation'>('selection');
  const [cityId, setCityId] = useState<string>("");
  const [cityName, setCityName] = useState<string>("");
  const [stateName, setStateName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [city, setCity] = useState<Partial<City> | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mergeData, setMergeData] = useState<{
    name: string;
    type: SegmentType;
  } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCitySelected = async (stateId: string, selectedCityId: string, selectedCityName: string, selectedStateName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setCityId(selectedCityId);
      setCityName(selectedCityName);
      setStateName(selectedStateName);

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
        ...cityStats
      };
      
      setCity(newCity);

      // Fetch segments
      const waysData = await fetchCityWays(selectedCityId);
      const citySegments = convertToSegments(waysData, selectedCityId);
      
      // Em um cenário real, você buscaria do backend quais segmentos já foram avaliados
      // Para fins de demonstração, vamos simular que alguns segmentos já foram avaliados
      const enhancedSegments = citySegments.map((segment, index) => {
        // Simulando que alguns segmentos já foram avaliados (apenas para demonstração)
        const evaluated = index % 7 === 0; // A cada 7 segmentos, um é considerado avaliado
        return {
          ...segment,
          evaluated,
          id_form: evaluated ? `form-${segment.id}` : undefined
        };
      });
      
      setSegments(enhancedSegments);

      toast({
        title: "Sucesso",
        description: `Dados de ${selectedCityName}/${selectedStateName} carregados com sucesso!`,
      });

      // Move to evaluation step
      setStep('evaluation');
    } catch (error) {
      console.error("Erro ao processar cidade:", error);
      const errorMessage = error instanceof Error ? error.message : "Falha ao processar os dados da cidade";
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
    setSegments(prevSegments => 
      prevSegments.map(segment => 
        segment.id === id ? { ...segment, selected } : segment
      )
    );
  };

  const handleMergeSegments = () => {
    const selectedSegments = segments.filter(s => s.selected);
    if (selectedSegments.length < 2) return;
    
    // Verificar se algum segmento selecionado já foi avaliado
    const hasEvaluated = selectedSegments.some(s => s.evaluated);
    if (hasEvaluated) {
      toast({
        title: "Erro",
        description: "Segmentos já avaliados não podem ser mesclados",
        variant: "destructive",
      });
      return;
    }
    
    // Em uma aplicação real, você implementaria a lógica de mesclagem aqui
    // usando os dados do mergeData que foram selecionados pelo usuário no diálogo
    const totalLength = calculateMergedLength(selectedSegments);
    
    toast({
      title: "Segmentos mesclados",
      description: `${selectedSegments.length} segmentos mesclados com extensão total de ${totalLength.toFixed(4)} km`,
    });
    
    // Depois de mesclar, desmarcar todos os segmentos
    setSegments(prevSegments => 
      prevSegments.map(segment => ({ ...segment, selected: false }))
    );
  };

  const handleBackToStart = () => {
    navigate("/");
  };

  const handleRetry = () => {
    if (cityId && stateName) {
      handleCitySelected("", cityId, cityName, stateName);
    } else {
      setError(null);
      setStep('selection');
    }
  };

  const selectedSegmentsCount = segments.filter(s => s.selected).length;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Avaliação de Infraestrutura Cicloviária</h2>
        <Button variant="outline" onClick={handleBackToStart}>Voltar ao Início</Button>
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

      {!isLoading && !error && step === 'selection' && (
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Cidade</CardTitle>
            <CardDescription>
              Escolha o estado e a cidade para iniciar a avaliação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CitySelection onCitySelected={handleCitySelected} />
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && step === 'evaluation' && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{cityName}, {stateName}</CardTitle>
              <CardDescription>
                Dados da infraestrutura cicloviária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-semibold text-gray-500">VIAS ESTRUTURAIS</h4>
                  <p className="text-2xl font-bold">{city?.vias_estruturais_km} km</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-semibold text-gray-500">VIAS ALIMENTADORAS</h4>
                  <p className="text-2xl font-bold">{city?.vias_alimentadoras_km} km</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-semibold text-gray-500">VIAS LOCAIS</h4>
                  <p className="text-2xl font-bold">{city?.vias_locais_km} km</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <SegmentsTable 
                segments={segments}
                onSelectSegment={handleSelectSegment}
                onMergeSelected={handleMergeSegments}
                selectedSegmentsCount={selectedSegmentsCount}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Visualização do Mapa</h3>
              <CityMap segments={segments} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evaluate;
