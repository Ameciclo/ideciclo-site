import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCityFromDB, fetchSegmentsFromDB } from "@/services/database";
import { City, Segment } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CityDetails = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const [city, setCity] = useState<City | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadCityData = async () => {
      if (!cityId) return;

      try {
        setLoading(true);
        const cityData = await fetchCityFromDB(cityId);
        const segmentsData = await fetchSegmentsFromDB(cityId);

        setCity(cityData);
        setSegments(segmentsData);
      } catch (error) {
        console.error("Erro ao carregar dados da cidade:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCityData();
  }, [cityId]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-gray-500">Cidade não encontrada.</p>
          <Link to="/ranking">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Ranking
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link to="/ranking">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Ranking
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">
          Detalhes de {city.name}, {city.state}
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Informações da Cidade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Nome:</strong> {city.name}</p>
            <p><strong>Estado:</strong> {city.state}</p>
          </div>
          <div>
            <p><strong>Extensão Avaliada:</strong> {city.extensao_avaliada} km</p>
            <p><strong>IDECICLO:</strong> {(city.ideciclo * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Segmentos Avaliados</h3>
        {segments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 border-b text-left">Nome do Segmento</th>
                  <th className="px-4 py-2 border-b text-left">Tipo de Via</th>
                  <th className="px-4 py-2 border-b text-center">Extensão (km)</th>
                  <th className="px-4 py-2 border-b text-center">Avaliado</th>
                  <th className="px-4 py-2 border-b text-center">Nota</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((segment) => (
                  <tr key={segment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{segment.name}</td>
                    <td className="px-4 py-2 border-b">{segment.road_type}</td>
                    <td className="px-4 py-2 border-b text-center">{segment.extension}</td>
                    <td className="px-4 py-2 border-b text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          segment.evaluated
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {segment.evaluated ? "Sim" : "Não"}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b text-center">
                      {segment.evaluated && segment.rating !== undefined
                        ? segment.rating.toFixed(2)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Nenhum segmento encontrado para esta cidade.</p>
        )}
      </div>
    </div>
  );
};

export default CityDetails;