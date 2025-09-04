import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EtapaBaixarDados from "@/components/processo/EtapaBaixarDados";

const BaixarDados = () => {
  const navigate = useNavigate();

  const handleComplete = (data: any) => {
    // Store data and navigate to next step
    sessionStorage.setItem("cityData", JSON.stringify(data));
    navigate("/avaliacao/refinar-dados");
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Baixar Dados</h1>
          <p className="text-gray-600">
            Selecione uma cidade e baixe os dados da infraestrutura cicloviária
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/avaliacao")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar às Etapas
        </Button>
      </div>

      <EtapaBaixarDados onComplete={handleComplete} />
    </div>
  );
};

export default BaixarDados;