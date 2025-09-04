import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EtapaRefinarDados from "@/components/processo/EtapaRefinarDados";
import { useState, useEffect } from "react";

const RefinarDados = () => {
  const navigate = useNavigate();
  const [cityData, setCityData] = useState<any>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("cityData");
    if (storedData) {
      setCityData(JSON.parse(storedData));
    }
  }, []);

  const handleComplete = () => {
    navigate("/avaliacao/escolher-estrutura");
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Refinar Dados</h1>
          <p className="text-gray-600">
            Ajuste e melhore os dados baixados da cidade
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/avaliacao")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar às Etapas
        </Button>
      </div>

      <EtapaRefinarDados cityData={cityData} onComplete={handleComplete} />
    </div>
  );
};

export default RefinarDados;