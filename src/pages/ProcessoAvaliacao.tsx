import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProcessoAvaliacao } from "@/hooks/use-processo-avaliacao";

// Import step components
import EtapaBaixarDados from "@/components/processo/EtapaBaixarDados";
import EtapaRefinarDados from "@/components/processo/EtapaRefinarDados";
import EtapaEscolherEstrutura from "@/components/processo/EtapaEscolherEstrutura";
import EtapaAvaliarEstrutura from "@/components/processo/EtapaAvaliarEstrutura";
import EtapaResultados from "@/components/processo/EtapaResultados";

interface ProcessStep {
  id: number;
  title: string;
  description: string;
}

const ProcessoAvaliacao = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    cityData,
    setCurrentStep,
    completeStep,
    updateCityData,
    resetProcess,
    isStepCompleted,
  } = useProcessoAvaliacao();
  
  const steps: ProcessStep[] = [
    {
      id: 1,
      title: "Baixar Dados",
      description: "Selecione uma cidade e baixe os dados da infraestrutura cicloviária",
    },
    {
      id: 2,
      title: "Refinar Dados",
      description: "Ajuste e melhore os dados baixados da cidade",
    },
    {
      id: 3,
      title: "Escolher Estrutura",
      description: "Selecione uma estrutura específica para avaliar",
    },
    {
      id: 4,
      title: "Avaliar Estrutura",
      description: "Preencha o formulário de avaliação da estrutura",
    },
    {
      id: 5,
      title: "Ver Resultados",
      description: "Visualize a nota calculada e o índice da cidade",
    },
  ];

  const nextStep = () => {
    if (currentStep < 5) {
      completeStep(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep - 1) / 4) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <EtapaBaixarDados 
            onComplete={(data) => {
              updateCityData(data);
              nextStep();
            }}
          />
        );
      case 2:
        return (
          <EtapaRefinarDados 
            cityData={cityData}
            onComplete={() => nextStep()}
          />
        );
      case 3:
        return (
          <EtapaEscolherEstrutura 
            cityData={cityData}
            onComplete={() => nextStep()}
          />
        );
      case 4:
        return (
          <EtapaAvaliarEstrutura 
            cityData={cityData}
            onComplete={() => nextStep()}
          />
        );
      case 5:
        return (
          <EtapaResultados 
            cityData={cityData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Processo de Avaliação IDECICLO</h1>
          <p className="text-gray-600 mt-2">
            Siga as etapas para avaliar a infraestrutura cicloviária de uma cidade
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/")}>
          Voltar ao Início
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium">Progresso</span>
          <span className="text-sm text-gray-500">
            Etapa {currentStep} de 5
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`flex items-center cursor-pointer ${
                  step.id === currentStep ? 'text-blue-600' : 
                  isStepCompleted(step.id) ? 'text-green-600' : 'text-gray-400'
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className="flex flex-col items-center">
                  {isStepCompleted(step.id) ? (
                    <CheckCircle className="h-8 w-8 mb-2" />
                  ) : (
                    <Circle className={`h-8 w-8 mb-2 ${
                      step.id === currentStep ? 'fill-current' : ''
                    }`} />
                  )}
                  <div className="text-center">
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs text-gray-500 max-w-24 leading-tight">
                      {step.description}
                    </div>
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 mx-4 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="min-h-[500px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {steps[currentStep - 1].title}
                <Badge variant={isStepCompleted(currentStep) ? "default" : "secondary"}>
                  {isStepCompleted(currentStep) ? "Concluída" : "Em andamento"}
                </Badge>
              </CardTitle>
              <p className="text-gray-600 mt-1">
                {steps[currentStep - 1].description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Etapa Anterior
        </Button>
        
        {currentStep < 5 && (
          <Button 
            onClick={nextStep}
            disabled={!isStepCompleted(currentStep)}
          >
            Próxima Etapa
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        
        {currentStep === 1 && (
          <Button 
            variant="outline"
            onClick={resetProcess}
          >
            Reiniciar Processo
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProcessoAvaliacao;