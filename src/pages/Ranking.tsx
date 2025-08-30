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
  const [cityFilter, setCityFilter] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [classificationFilter, setClassificationFilter] = useState<string>("");

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

  // Filtrar cidades baseado nos filtros
  const filteredCities = cities.filter((cityRanking) => {
    const matchesCity = !cityFilter || cityRanking.city.name.toLowerCase().includes(cityFilter.toLowerCase());
    const matchesState = !stateFilter || cityRanking.city.state === stateFilter;
    const matchesClassification = !classificationFilter || cityRanking.classification === classificationFilter;
    return matchesCity && matchesState && matchesClassification;
  });

  // Obter estados únicos
  const uniqueStates = [...new Set(cities.map(c => c.city.state))].sort();
  const allClassifications = ['A', 'B', 'C', 'D'];

  return (
    <>
      {/* Header com Imagem de Capa */}
      <div className="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black"
           style={{backgroundImage: "url('/pages_covers/ideciclo-navcover.png')"}}>
      </div>
      
      {/* Breadcrumb */}
      <nav className="bg-gray-400 text-white px-4 py-2">
        <a href="/" className="hover:underline">Home</a> &gt; <span>Ranking</span>
      </nav>

      {/* Título e Filtros com Design Customizado */}
      <section className="flex gap-2 relative justify-center mb-10 mx-auto w-full 2xl:w-3/4 py-12">
        {/* SVG esquerdo */}
        <svg className="relative z-[1] hidden lg:block" xmlns="http://www.w3.org/2000/svg" 
             width="225" height="264" viewBox="0 0 225 264" fill="none">
          <path d="M217.255 111.903C209.361 106.913 199.255 103.903 188.255 103.903L36.255 103.903C25.255 103.903 15.149 106.913 7.255 111.903C-0.639 116.893 -4.255 123.903 -4.255 131.903L-4.255 232.903C-4.255 240.903 -0.639 247.913 7.255 252.903C15.149 257.893 25.255 260.903 36.255 260.903L188.255 260.903C199.255 260.903 209.361 257.893 217.255 252.903C225.149 247.913 228.765 240.903 228.765 232.903L228.765 131.903C228.765 123.903 225.149 116.893 217.255 111.903Z" fill="#EFC345"/>
        </svg>
        
        {/* Conteúdo central */}
        <div className="mx-auto flex flex-col justify-center align-middle gap-2 md:gap-5 relative z-[2]">
          <h1 className="text-4xl md:text-5xl font-bold text-text-grey pb-8 bg-ideciclo-pink 
                         mx-auto px-7 py-6 rounded-[40px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)]">
            Ranking das Cidades
          </h1>
          
          {/* Filtros com Design Customizado */}
          <div className="flex flex-wrap align-baseline gap-0 md:gap-10 justify-center flex-grow mx-auto">
            {/* Filtro por cidade */}
            <div className="relative rounded-lg mx-4 m-4 xl:m-8 max-w-md">
              <div className="absolute inset-0 z-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" 
                     viewBox="0 0 288 101" preserveAspectRatio="none" fill="none"
                     className="drop-shadow-lg">
                  <path d="M285.958 85.6596C285.958 97.0472 279.958 106.596 271.958 113.596C263.958 120.596 253.958 124.596 243.958 124.596L44.958 124.596C34.958 124.596 24.958 120.596 16.958 113.596C8.958 106.596 2.958 97.0472 2.958 85.6596L2.958 15.6596C2.958 4.27204 8.958 -5.27659 16.958 -12.2766C24.958 -19.2766 34.958 -23.2766 44.958 -23.2766L243.958 -23.2766C253.958 -23.2766 263.958 -19.2766 271.958 -12.2766C279.958 -5.27659 285.958 4.27204 285.958 15.6596L285.958 85.6596Z" fill="#6DBFAC"/>
                </svg>
              </div>
              <div className="relative z-10 text-white font-bold rounded px-4 pb-6 pt-2 mx-4">
                <label className="block text-sm mb-2">por cidade:</label>
                <input
                  type="text"
                  placeholder="Digite o nome..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="block appearance-none text-black font-bold w-full bg-white 
                           border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 
                           rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
            
            {/* Filtro por estado */}
            <div className="relative rounded-lg mx-4 m-4 xl:m-8 max-w-md">
              <div className="absolute inset-0 z-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" 
                     viewBox="0 0 288 101" preserveAspectRatio="none" fill="none"
                     className="drop-shadow-lg">
                  <path d="M285.958 85.6596C285.958 97.0472 279.958 106.596 271.958 113.596C263.958 120.596 253.958 124.596 243.958 124.596L44.958 124.596C34.958 124.596 24.958 120.596 16.958 113.596C8.958 106.596 2.958 97.0472 2.958 85.6596L2.958 15.6596C2.958 4.27204 8.958 -5.27659 16.958 -12.2766C24.958 -19.2766 34.958 -23.2766 44.958 -23.2766L243.958 -23.2766C253.958 -23.2766 263.958 -19.2766 271.958 -12.2766C279.958 -5.27659 285.958 4.27204 285.958 15.6596L285.958 85.6596Z" fill="#6DBFAC"/>
                </svg>
              </div>
              <div className="relative z-10 text-white font-bold rounded px-4 pb-6 pt-2 mx-4">
                <label className="block text-sm mb-2">por estado:</label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="block appearance-none text-black font-bold w-full bg-white 
                           border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 
                           rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Todas</option>
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Filtro por classificação */}
            <div className="relative rounded-lg mx-4 m-4 xl:m-8 max-w-md">
              <div className="absolute inset-0 z-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" 
                     viewBox="0 0 288 101" preserveAspectRatio="none" fill="none"
                     className="drop-shadow-lg">
                  <path d="M285.958 85.6596C285.958 97.0472 279.958 106.596 271.958 113.596C263.958 120.596 253.958 124.596 243.958 124.596L44.958 124.596C34.958 124.596 24.958 120.596 16.958 113.596C8.958 106.596 2.958 97.0472 2.958 85.6596L2.958 15.6596C2.958 4.27204 8.958 -5.27659 16.958 -12.2766C24.958 -19.2766 34.958 -23.2766 44.958 -23.2766L243.958 -23.2766C253.958 -23.2766 263.958 -19.2766 271.958 -12.2766C279.958 -5.27659 285.958 4.27204 285.958 15.6596L285.958 85.6596Z" fill="#6DBFAC"/>
                </svg>
              </div>
              <div className="relative z-10 text-white font-bold rounded px-4 pb-6 pt-2 mx-4">
                <label className="block text-sm mb-2">por classificação:</label>
                <select
                  value={classificationFilter}
                  onChange={(e) => setClassificationFilter(e.target.value)}
                  className="block appearance-none text-black font-bold w-full bg-white 
                           border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 
                           rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Todas</option>
                  {allClassifications.map(classification => (
                    <option key={classification} value={classification}>{classification}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* SVG direito */}
        <svg className="relative z-[1] hidden lg:block" xmlns="http://www.w3.org/2000/svg" 
             width="236" height="229" viewBox="0 0 236 229" fill="none">
          <path d="M236 229L236 14.1282C226.709 10.9305 215.709 9.1282 204.709 9.1282L31.709 9.1282C20.709 9.1282 9.709 10.9305 0.418 14.1282L0.418 229L236 229Z" fill="#5AC2E1"/>
        </svg>
        
        {/* SVG de fundo */}
        <div className="absolute lg:translate-y-[-65px] translate-y-[0] z-[0]">
          <svg className="scale-y-[2] sm:scale-y-[1] w-full" xmlns="http://www.w3.org/2000/svg" 
               width="847" height="373" viewBox="0 0 847 373" fill="none">
            <path d="M103.281 309.45C103.281 309.45 103.281 309.45 103.281 309.45L743.719 309.45C743.719 309.45 743.719 309.45 743.719 309.45L743.719 63.55C743.719 63.55 743.719 63.55 743.719 63.55L103.281 63.55C103.281 63.55 103.281 63.55 103.281 63.55L103.281 309.45Z" fill="#E4E8EA"/>
          </svg>
        </div>
      </section>

      <div className="container py-8">

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ideciclo-blue"></div>
          </div>
        ) : filteredCities.length > 0 ? (
          <section className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-auto gap-10 my-10">
            {filteredCities.map((cityRanking, index) => (
              <div key={cityRanking.city.id} className="rounded bg-white shadow-2xl ideciclo-card-hover">
                <Link to={`/city-details/${cityRanking.city.id}`}>
                  <div className="flex flex-col bg-white divide-y divide-gray-100">
                    
                    {/* Seção Posição */}
                    <div className="flex flex-col justify-center w-full p-4 text-center tracking-widest">
                      <h3 className="text-ideciclo-red font-bold text-sm">POSIÇÃO</h3>
                      <h3 className="text-3xl mt-1 font-bold text-ideciclo-blue">
                        #{index + 1}
                      </h3>
                    </div>
                    
                    {/* Seção Nota */}
                    <div className="flex flex-col justify-center w-full p-6 text-center tracking-widest">
                      <h3 className="text-ideciclo-red font-bold">IDECICLO</h3>
                      <h3 className="text-4xl mt-2 font-bold">
                        {cityRanking.ideciclo.toFixed(1)}
                      </h3>
                    </div>
                    
                    {/* Seção Cidade */}
                    <div className="flex flex-col justify-center w-full p-4 text-center 
                                    uppercase tracking-widest">
                      <h3 className="font-bold text-lg">{cityRanking.city.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{cityRanking.city.state}</p>
                      <div className="flex justify-center mt-3">
                        <span
                          className={`inline-block w-10 h-10 rounded-full text-white font-bold flex items-center justify-center text-lg
                          ${
                            cityRanking.classification === "A"
                              ? "bg-green-500"
                              : cityRanking.classification === "B"
                              ? "bg-ideciclo-blue"
                              : cityRanking.classification === "C"
                              ? "bg-ideciclo-yellow text-text-grey"
                              : "bg-ideciclo-red"
                          }`}
                        >
                          {cityRanking.classification}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </section>
        ) : cities.length > 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma cidade encontrada com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma cidade avaliada ainda.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Ranking;
