import { useEffect, useState } from "react";
import {
  fetchCityFromDB,
  fetchFormsByCityId,
  fetchSegmentsFromDB,
} from "@/services/database";
import {
  calculateIdeciclo,
  getIdecicloClassification,
  getIdecicloDescription,
  debugFormRating,
} from "@/utils/idecicloCalculator";
import { City, Form, Segment } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CityRanking {
  city: City;
  ideciclo: number;
  classification: string;
  description: string;
  segments: Segment[];
}

const Ranking = () => {
  const [cities, setCities] = useState<CityRanking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [debugResult, setDebugResult] = useState<string>("");

  useEffect(() => {
    const loadCitiesData = async () => {
      try {
        setLoading(true);

        // Buscar todas as cidades que têm formulários
        const citiesWithForms = await fetchCitiesWithForms();

        // Calcular o IDECICLO para cada cidade
        const citiesRanking = await Promise.all(
          citiesWithForms.map(async (city) => {
            const forms = await fetchFormsByCityId(city.id);
            const segments = await fetchSegmentsFromDB(city.id);

            // Calcular o IDECICLO
            const ideciclo = calculateIdeciclo(segments, forms);
            const classification = getIdecicloClassification(ideciclo);
            const description = getIdecicloDescription(classification);

            return {
              city,
              ideciclo,
              classification,
              description,
              segments,
            };
          })
        );

        // Ordenar as cidades pelo valor do IDECICLO (do maior para o menor)
        const sortedCities = citiesRanking.sort(
          (a, b) => b.ideciclo - a.ideciclo
        );

        setCities(sortedCities);
      } catch (error) {
        console.error("Erro ao carregar dados das cidades:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCitiesData();
  }, []);

  // Função auxiliar para buscar cidades que têm formulários
  const fetchCitiesWithForms = async (): Promise<City[]> => {
    // Esta é uma implementação simplificada
    // Idealmente, você teria uma consulta no banco de dados para buscar diretamente as cidades com formulários

    // Por enquanto, vamos buscar todas as cidades e filtrar depois
    const { data: citiesData } = await supabase.from("cities").select("*");

    if (!citiesData) return [];

    const citiesWithForms = await Promise.all(
      citiesData.map(async (cityData) => {
        const forms = await fetchFormsByCityId(cityData.id);
        return {
          city: {
            id: cityData.id,
            name: cityData.name,
            state: cityData.state,
            extensao_avaliada: cityData.extensao_avaliada || 0,
            ideciclo: cityData.ideciclo || 0,
            vias_estruturais_km: cityData.vias_estruturais_km || 0,
            vias_alimentadoras_km: cityData.vias_alimentadoras_km || 0,
            vias_locais_km: cityData.vias_locais_km || 0,
          },
          hasForms: forms.length > 0,
        };
      })
    );

    return citiesWithForms
      .filter((item) => item.hasForms)
      .map((item) => item.city);
  };

  return (
    <div className="container py-8">
      <h2 className="text-2xl font-bold mb-6">Ranking de Cidades</h2>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : cities.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Posição</th>
                <th className="px-4 py-2 border-b">Cidade</th>
                <th className="px-4 py-2 border-b">Estado</th>
                <th className="px-4 py-2 border-b">IDECICLO</th>
                <th className="px-4 py-2 border-b">Classificação</th>
                <th className="px-4 py-2 border-b">Descrição</th>
                <th className="px-4 py-2 border-b">Segmentos Avaliados</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((cityRanking, index) => (
                <tr
                  key={cityRanking.city.id}
                  className={index % 2 === 0 ? "bg-gray-50" : ""}
                >
                  <td className="px-4 py-2 border-b text-center">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {cityRanking.city.name}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {cityRanking.city.state}
                  </td>
                  <td className="px-4 py-2 border-b text-center">
                    {(cityRanking.ideciclo * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-2 border-b text-center">
                    <span
                      className={`inline-block w-8 h-8 rounded-full text-white font-bold flex items-center justify-center
                      ${
                        cityRanking.classification === "A"
                          ? "bg-green-500"
                          : cityRanking.classification === "B"
                          ? "bg-blue-500"
                          : cityRanking.classification === "C"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    >
                      {cityRanking.classification}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b">
                    {cityRanking.description}
                  </td>
                  <td className="px-4 py-2 border-b text-center">
                    {cityRanking.segments?.filter((s) => s.evaluated).length ||
                      0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhuma cidade avaliada ainda.</p>
        </div>
      )}

      <div className="mt-8 prose max-w-none">
        <h3 className="text-xl font-semibold">Sobre o IDECICLO</h3>
        <p>
          O IDECICLO é um índice que avalia a qualidade da infraestrutura
          cicloviária de uma cidade, considerando não apenas a existência de
          ciclovias, mas também sua qualidade.
        </p>
        <p>
          Cada segmento de infraestrutura é avaliado e recebe uma nota de A a D,
          onde:
        </p>
        <ul>
          <li>
            <strong>A (Excelente)</strong>: Infraestrutura de alta qualidade
          </li>
          <li>
            <strong>B (Bom)</strong>: Infraestrutura de boa qualidade
          </li>
          <li>
            <strong>C (Regular)</strong>: Infraestrutura de qualidade média
          </li>
          <li>
            <strong>D (Ruim)</strong>: Infraestrutura inadequada ou inexistente
          </li>
        </ul>
        <p>
          O cálculo considera diferentes tipos de malha viária (Estrutural,
          Alimentadora e Local) com pesos diferentes, resultando em um índice
          que representa o nível de cobertura e qualidade da infraestrutura
          cicloviária da cidade.
        </p>
      </div>
    </div>
  );
};

export default Ranking;
