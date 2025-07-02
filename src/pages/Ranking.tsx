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
  
  // Função para testar o cálculo com um formulário específico
  const testSingleForm = () => {
    try {
      // Exemplo de formulário de Olinda
      const testForm: Form = {
        id: "1265657166",
        city_id: "olinda",
        segment_id: "test-segment",
        researcher: "",
        date: "2025-07-02",
        street_name: "Ciclovia da PE-15",
        neighborhood: "",
        extension: 1.9679,
        start_point: "",
        end_point: "",
        hierarchy: "estrutural",
        observations: "",
        created_at: new Date(),
        updated_at: new Date(),
        velocity: 0,
        blocks_count: 0,
        intersections_count: 0,
        responses: {
          city: "Olinda",
          date: "2025-07-02",
          end_point: "",
          infra_flow: "unidirectional",
          researcher: "",
          extension_m: 1.9679,
          start_point: "",
          blocks_count: 0,
          neighborhood: "",
          segment_name: "Ciclovia da PE-15",
          velocity_kmh: 0,
          width_meters: 0,
          pavement_type: "A",
          classification: "estrutural",
          infra_typology: "Ciclovia",
          road_hierarchy: "estrutural",
          speed_measures: [],
          includes_gutter: false,
          vegetation_size: "C",
          position_on_road: "pista_calcada",
          shading_coverage: "D",
          cycling_furniture: [],
          lighting_barriers: false,
          lighting_directed: false,
          conservation_state: "A",
          lighting_post_type: "B",
          vertical_obstacles: false,
          bus_school_conflict: false,
          intersections_count: 0,
          lighting_distance_m: 0,
          motorized_conflicts: [],
          traffic_lanes_count: 2,
          devices_conservation: "A",
          horizontal_obstacles: false,
          lateral_spacing_type: "linha",
          pictograms_per_block: 0,
          space_identification: "A",
          spacing_conservation: "A",
          side_change_mid_block: false,
          signs_both_directions: false,
          intersection_signaling: "A",
          avg_distance_measures_m: 0,
          lateral_spacing_width_m: 0,
          opposite_flow_direction: false,
          pictograms_conservation: "A",
          connection_accessibility: "A",
          intersection_conservation: "A",
          lighting_distance_to_infra: "A",
          regulation_signs_per_block: 0,
          separation_devices_calcada: "D",
          identification_conservation: "A",
          separation_devices_ciclovia: "A",
          vertical_signs_conservation: "A",
          separation_devices_ciclofaixa: "D",
          signalized_crossings_per_block: 0
        }
      };
      
      // Criar um segmento de teste
      const testSegment: Segment = {
        id: "test-segment",
        id_cidade: "olinda",
        name: "Ciclovia da PE-15",
        type: "Ciclovia" as any,
        length: 1.9679,
        geometry: null,
        selected: true,
        evaluated: true,
        classification: "estrutural"
      };
      
      // Analisar o formulário em detalhes
      const formAnalysis = debugFormRating(testForm);
      console.log("Form rating analysis:", formAnalysis);
      
      // Calcular o IDECICLO apenas para este formulário
      const ideciclo = calculateIdeciclo([testSegment], [testForm]);
      const classification = getIdecicloClassification(ideciclo);
      
      setDebugResult(`
        Form Rating: ${(formAnalysis.rating * 100).toFixed(1)}% (${getIdecicloClassification(formAnalysis.rating)})
        IDECICLO: ${(ideciclo * 100).toFixed(1)}% (${classification})
        
        Critérios com nota D:
        ${Object.entries(formAnalysis.details.criteria)
          .filter(([_, data]: [string, any]) => data.response === 'D')
          .map(([key, _]: [string, any]) => `- ${key}`)
          .join('\n')}
      `);
    } catch (error) {
      console.error("Erro ao testar formulário:", error);
      setDebugResult(`Erro: ${error}`);
    }
  };

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
      
      {/* Debug section */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Ferramentas de Debug</h3>
        <Button onClick={testSingleForm} className="bg-blue-500 hover:bg-blue-600 text-white">
          Testar Formulário de Olinda
        </Button>
        {debugResult && (
          <div className="mt-3 p-3 bg-white rounded border">
            <p className="font-mono">{debugResult}</p>
          </div>
        )}
      </div>

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
                    {cityRanking.segments?.filter(s => s.evaluated).length || 0}
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
