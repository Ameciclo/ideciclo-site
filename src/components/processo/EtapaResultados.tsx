import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, FileText, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchCityFromDB, fetchSegmentsByCity } from "@/services/database";

interface EtapaResultadosProps {
  cityData: any;
}

const EtapaResultados = ({ cityData }: EtapaResultadosProps) => {
  const navigate = useNavigate();
  const [cityStats, setCityStats] = useState<any>(null);
  const [evaluatedSegments, setEvaluatedSegments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (cityData?.cityId) {
        try {
          // Load city data
          const city = await fetchCityFromDB(cityData.cityId);
          setCityStats(city);

          // Load evaluated segments
          const segments = await fetchSegmentsByCity(cityData.cityId);
          const evaluated = segments.filter(s => s.evaluated);
          setEvaluatedSegments(evaluated);
        } catch (error) {
          console.error("Error loading results:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadResults();
  }, [cityData]);

  const handleGoToRanking = () => {
    navigate("/ranking");
  };

  const handleStartOver = () => {
    // Clear session storage and restart process
    sessionStorage.clear();
    navigate("/processo-avaliacao");
  };

  const handleGoToEvaluation = () => {
    navigate("/avaliacao");
  };

  if (!cityData) {
    return (
      <div className="text-center py-8">
        <p>Nenhum dado de cidade disponível.</p>
      </div>
    );
  }

  const idecicloScore = cityStats?.ideciclo || 0;
  const extensaoAvaliada = cityStats?.extensao_avaliada || 0;
  const extensaoTotal = cityStats?.extensao_total || 0;
  const percentualAvaliado = extensaoTotal > 0 ? (extensaoAvaliada / extensaoTotal) * 100 : 0;

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excelente";
    if (score >= 6) return "Bom";
    if (score >= 4) return "Regular";
    return "Ruim";
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Resultados da Avaliação</h3>
        <p className="text-gray-600">
          Veja a nota calculada e o índice IDECICLO da cidade avaliada.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Carregando resultados...</p>
        </div>
      ) : (
        <>
          {/* IDECICLO Score */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Índice IDECICLO - {cityData.cityName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className={`text-6xl font-bold ${getScoreColor(idecicloScore)}`}>
                  {idecicloScore.toFixed(2)}
                </div>
                <div className="text-lg text-gray-600 mt-2">
                  {getScoreLabel(idecicloScore)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{evaluatedSegments.length}</p>
                  <p className="text-sm text-gray-600">Segmentos Avaliados</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{extensaoAvaliada.toFixed(2)} km</p>
                  <p className="text-sm text-gray-600">Extensão Avaliada</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{percentualAvaliado.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Cobertura</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluated Segments */}
          {evaluatedSegments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Segmentos Avaliados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {evaluatedSegments.map((segment) => (
                    <div key={segment.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{segment.name || segment.id}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{segment.type}</Badge>
                          <Badge variant="default">Avaliado</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{segment.length?.toFixed(2) || 0} m</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={handleGoToRanking} className="flex flex-col items-center p-6 h-auto">
                  <TrendingUp className="h-8 w-8 mb-2" />
                  <span>Ver Ranking</span>
                  <span className="text-xs text-gray-500 mt-1">Compare com outras cidades</span>
                </Button>

                <Button onClick={handleGoToEvaluation} variant="outline" className="flex flex-col items-center p-6 h-auto">
                  <FileText className="h-8 w-8 mb-2" />
                  <span>Avaliar Mais</span>
                  <span className="text-xs text-gray-500 mt-1">Avalie outros segmentos</span>
                </Button>

                <Button onClick={handleStartOver} variant="outline" className="flex flex-col items-center p-6 h-auto">
                  <RotateCcw className="h-8 w-8 mb-2" />
                  <span>Nova Cidade</span>
                  <span className="text-xs text-gray-500 mt-1">Comece uma nova avaliação</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h4 className="font-semibold mb-2">Processo Concluído!</h4>
                <p className="text-sm text-gray-600">
                  Você completou o processo de avaliação IDECICLO para {cityData.cityName}, {cityData.stateName}.
                  {evaluatedSegments.length > 0 
                    ? ` Foram avaliados ${evaluatedSegments.length} segmentos, resultando em um índice de ${idecicloScore.toFixed(2)}.`
                    : " Para obter um índice mais preciso, avalie mais segmentos da cidade."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default EtapaResultados;