import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchSegmentsByCity } from "@/services/database";

interface EtapaEscolherEstruturaProps {
  cityData: any;
  onComplete: (segmentId?: string) => void;
}

const EtapaEscolherEstrutura = ({ cityData, onComplete }: EtapaEscolherEstruturaProps) => {
  const navigate = useNavigate();
  const [segments, setSegments] = useState<any[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSegments = async () => {
      if (cityData?.cityId) {
        try {
          const data = await fetchSegmentsByCity(cityData.cityId);
          setSegments(data);
        } catch (error) {
          console.error("Error loading segments:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadSegments();
  }, [cityData]);

  const handleSelectSegment = (segment: any) => {
    setSelectedSegment(segment);
    // Store selected segment in sessionStorage for the evaluation
    sessionStorage.setItem("selectedSegmentId", segment.id);
    sessionStorage.setItem("selectedCityId", cityData.cityId);
  };

  const handleGoToEvaluation = () => {
    if (selectedSegment) {
      // Store segment ID for the evaluation form
      sessionStorage.setItem("selectedSegmentId", selectedSegment.id);
      navigate("/avaliacao/avaliar-estrutura");
    }
  };

  const handleContinue = () => {
    if (selectedSegment) {
      sessionStorage.setItem("selectedSegmentId", selectedSegment.id);
      onComplete(selectedSegment.id);
    }
  };

  if (!cityData) {
    return (
      <div className="text-center py-8">
        <p>Nenhum dado de cidade disponível. Volte à etapa anterior.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Escolher Estrutura para Avaliar</h3>
        <p className="text-gray-600">
          Selecione uma estrutura cicloviária específica para realizar a avaliação detalhada.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estruturas Disponíveis em {cityData.cityName}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Carregando estruturas...</p>
            </div>
          ) : segments.length === 0 ? (
            <div className="text-center py-8">
              <p>Nenhuma estrutura encontrada para esta cidade.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSegment?.id === segment.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleSelectSegment(segment)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{segment.name || segment.id}</h4>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{segment.type}</Badge>
                        {segment.classification && (
                          <Badge variant="secondary">{segment.classification}</Badge>
                        )}
                        <Badge variant={segment.evaluated ? "default" : "secondary"}>
                          {segment.evaluated ? "Avaliado" : "Não avaliado"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Extensão: {segment.length?.toFixed(2) || 0} m
                      </p>
                    </div>
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedSegment && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-700">Estrutura Selecionada</span>
              </div>
              <p><strong>Nome:</strong> {selectedSegment.name || selectedSegment.id}</p>
              <p><strong>Tipo:</strong> {selectedSegment.type}</p>
              <p><strong>Extensão:</strong> {selectedSegment.length?.toFixed(2) || 0} m</p>
              
              <div className="flex gap-3 mt-4">
                <Button onClick={handleGoToEvaluation} className="flex-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  Avaliar com IDECICLO
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EtapaEscolherEstrutura;