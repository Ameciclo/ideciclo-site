import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EtapaResultados from "@/components/processo/EtapaResultados";
import { useState, useEffect } from "react";

const Resultados = () => {
  const navigate = useNavigate();
  const [cityData, setCityData] = useState<any>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("cityData");
    if (storedData) {
      setCityData(JSON.parse(storedData));
    }
  }, []);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resultados</h1>
          <p className="text-gray-600">
            Visualize a nota calculada e o índice IDECICLO da cidade
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/avaliacao")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar às Etapas
        </Button>
      </div>

      <EtapaResultados cityData={cityData} />
    </div>
  );
};

export default Resultados;