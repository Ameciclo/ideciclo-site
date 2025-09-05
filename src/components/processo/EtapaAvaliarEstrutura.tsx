import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EtapaAvaliarEstruturaProps {
  cityData: any;
  onComplete: () => void;
}

const EtapaAvaliarEstrutura = ({ cityData, onComplete }: EtapaAvaliarEstruturaProps) => {
  const navigate = useNavigate();
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [isEvaluated, setIsEvaluated] = useState(false);

  useEffect(() => {
    // Check if there's a selected segment from previous step
    const segmentId = sessionStorage.getItem("selectedSegmentId");
    if (segmentId) {
      setSelectedSegmentId(segmentId);
      // Check if this segment has been evaluated (simplified check)
      const hasEvaluation = sessionStorage.getItem(`evaluation_${segmentId}`);
      setIsEvaluated(!!hasEvaluation);
    }
  }, []);

  const handleGoToForm = () => {
    if (selectedSegmentId) {
      navigate(`/refinar/formulario/${selectedSegmentId}`);
    } else {
      // Go to evaluation page to select a segment
      navigate("/avaliacao");
    }
  };

  const handleSkipEvaluation = () => {
    setIsEvaluated(true);
    onComplete();
  };

  const handleContinue = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Avaliar Estrutura</h3>
        <p className="text-gray-600">
          Preencha o formulário de avaliação detalhada da estrutura cicloviária selecionada.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Formulário de Avaliação</span>
            <Badge variant={isEvaluated ? "default" : "secondary"}>
              {isEvaluated ? "Avaliado" : "Pendente"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedSegmentId ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Estrutura Selecionada</h4>
                <p className="text-sm">ID: {selectedSegmentId}</p>
                <p className="text-sm">Cidade: {cityData?.cityName}, {cityData?.stateName}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">O formulário de avaliação inclui:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Dados gerais da estrutura</li>
                  <li>• Caracterização da infraestrutura</li>
                  <li>• Espaço útil de circulação</li>
                  <li>• Pavimento e conservação</li>
                  <li>• Delimitação da infraestrutura</li>
                  <li>• Sinalização horizontal e vertical</li>
                  <li>• Acessibilidade e interseções</li>
                  <li>• Iluminação e conforto</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleGoToForm} className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  {isEvaluated ? "Editar Avaliação" : "Iniciar Avaliação"}
                </Button>
                <Button variant="outline" onClick={handleSkipEvaluation}>
                  Pular Avaliação
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm">Nenhuma estrutura foi selecionada na etapa anterior.</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleGoToForm} className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Selecionar e Avaliar Estrutura
                </Button>
                <Button variant="outline" onClick={handleSkipEvaluation}>
                  Pular Avaliação
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isEvaluated && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Avaliação Concluída
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">A avaliação foi concluída com sucesso. Agora você pode ver os resultados.</p>
            <Button onClick={handleContinue} className="w-full">
              <ArrowRight className="h-4 w-4 mr-2" />
              Ver Resultados
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EtapaAvaliarEstrutura;