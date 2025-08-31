import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Edit, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EtapaRefinarDadosProps {
  cityData: any;
  onComplete: () => void;
}

const EtapaRefinarDados = ({ cityData, onComplete }: EtapaRefinarDadosProps) => {
  const navigate = useNavigate();
  const [isRefined, setIsRefined] = useState(false);

  useEffect(() => {
    // Check if data has been refined (simplified check)
    if (cityData?.segments?.some((s: any) => s.name !== s.id)) {
      setIsRefined(true);
    }
  }, [cityData]);

  const handleGoToRefine = () => {
    // Navigate to refine page with city data
    navigate("/refinar", {
      state: {
        preserveData: true,
        cityId: cityData.cityId,
        cityName: cityData.cityName,
        stateName: cityData.stateName,
      }
    });
  };

  const handleSkipRefinement = () => {
    setIsRefined(true);
    onComplete();
  };

  const handleContinue = () => {
    onComplete();
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
        <h3 className="text-xl font-semibold mb-2">Refinar Dados da Cidade</h3>
        <p className="text-gray-600">
          Ajuste os nomes dos segmentos, mescle trechos similares e melhore a qualidade dos dados.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dados da Cidade: {cityData.cityName}, {cityData.stateName}</span>
            <Badge variant={isRefined ? "default" : "secondary"}>
              {isRefined ? "Refinado" : "Não refinado"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Segmentos encontrados</p>
              <p className="text-2xl font-bold">{cityData.segments?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Extensão total</p>
              <p className="text-2xl font-bold">{cityData.city?.extensao_total?.toFixed(2) || 0} km</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">O que você pode fazer no refinamento:</h4>
              <ul className="text-sm space-y-1">
                <li>• Renomear segmentos com nomes mais descritivos</li>
                <li>• Mesclar segmentos que fazem parte da mesma via</li>
                <li>• Remover segmentos irrelevantes</li>
                <li>• Ajustar classificações dos segmentos</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleGoToRefine} className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Ir para Refinamento
              </Button>
              <Button variant="outline" onClick={handleSkipRefinement}>
                Pular Refinamento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isRefined && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Dados Refinados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Os dados foram refinados e estão prontos para a próxima etapa.</p>
            <Button onClick={handleContinue} className="w-full">
              <ArrowRight className="h-4 w-4 mr-2" />
              Continuar para Seleção de Estrutura
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EtapaRefinarDados;