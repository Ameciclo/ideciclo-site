import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Download, CheckCircle } from "lucide-react";
import CitySelection from "@/components/CitySelection";
import { useToast } from "@/hooks/use-toast";
import {
  fetchCityHighwayStats,
  fetchCityWays,
  calculateCityStats,
  convertToSegments,
  getStoredCityData,
  storeCityData,
} from "@/services/api";

interface EtapaBaixarDadosProps {
  onComplete: (data: any) => void;
}

const EtapaBaixarDados = ({ onComplete }: EtapaBaixarDadosProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cityData, setCityData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCitySelected = async (
    stateId: string,
    cityId: string,
    cityName: string,
    stateName: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if data already exists
      const storedData = await getStoredCityData(cityId);
      if (storedData) {
        setCityData({
          cityId,
          cityName,
          stateName,
          city: storedData.city,
          segments: storedData.segments,
        });
        
        toast({
          title: "Dados encontrados",
          description: `Dados de ${cityName}/${stateName} já estão disponíveis!`,
        });
        return;
      }

      // Fetch new data
      const highwayStats = await fetchCityHighwayStats(cityId);
      const cityStats = calculateCityStats(highwayStats);

      const newCity = {
        id: cityId,
        name: cityName,
        state: stateName,
        extensao_avaliada: 0,
        ideciclo: 0,
        ...cityStats,
      };

      const waysData = await fetchCityWays(cityId);
      const segments = convertToSegments(waysData, cityId);

      // Store data
      await storeCityData(cityId, {
        city: newCity,
        segments,
      });

      const data = {
        cityId,
        cityName,
        stateName,
        city: newCity,
        segments,
      };

      setCityData(data);
      
      toast({
        title: "Dados baixados",
        description: `Dados de ${cityName}/${stateName} baixados com sucesso!`,
      });

    } catch (error) {
      console.error("Erro ao baixar dados:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      toast({
        title: "Erro",
        description: "Falha ao baixar os dados da cidade",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (cityData) {
      onComplete(cityData);
    }
  };

  // Auto-complete if data is already loaded
  if (cityData && !isLoading) {
    // Small delay to show the success state
    setTimeout(() => {
      if (cityData) {
        onComplete(cityData);
      }
    }, 1000);
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Selecione uma cidade</h3>
        <p className="text-gray-600">
          Escolha a cidade que deseja avaliar. Os dados da infraestrutura cicloviária serão baixados automaticamente.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Baixando dados da cidade...</p>
          </div>
        </div>
      )}

      {!cityData && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Baixar Dados da Cidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CitySelection onCitySelected={handleCitySelected} />
          </CardContent>
        </Card>
      )}

      {cityData && !isLoading && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Dados Baixados com Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Cidade:</strong> {cityData.cityName}, {cityData.stateName}</p>
              <p><strong>Segmentos encontrados:</strong> {cityData.segments?.length || 0}</p>
              <p><strong>Extensão total:</strong> {cityData.city?.extensao_total?.toFixed(2) || 0} km</p>
            </div>
            
            <div className="mt-6">
              <Button onClick={handleContinue} className="w-full">
                Continuar para Refinamento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EtapaBaixarDados;