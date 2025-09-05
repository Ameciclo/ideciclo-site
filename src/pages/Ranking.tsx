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
    const matchesCity =
      !cityFilter ||
      cityRanking.city.name.toLowerCase().includes(cityFilter.toLowerCase());
    const matchesState = !stateFilter || cityRanking.city.state === stateFilter;
    const matchesClassification =
      !classificationFilter ||
      cityRanking.classification === classificationFilter;
    return matchesCity && matchesState && matchesClassification;
  });

  // Obter estados únicos
  const uniqueStates = [...new Set(cities.map((c) => c.city.state))].sort();
  const allClassifications = ["A", "B", "C", "D"];

  return (
    <>
      {/* Header com Imagem de Capa */}
      <div
        className="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black"
        style={{
          backgroundImage: "url('/pages_covers/ideciclo-navcover.png')",
        }}
      ></div>

      {/* Breadcrumb */}
      <nav className="bg-gray-400 text-white px-4 py-2">
        <a href="/" className="hover:underline">
          Home
        </a>{" "}
        &gt; <span>Ranking</span>
      </nav>

      {/* Título e Filtros com Design Customizado */}
      <section className="mx-auto container">
        <div className="mx-auto text-center my-10 md:my-22 md:mb-6">
          <div className="flex gap-2 relative justify-center mb-10 mx-auto w-full 2xl:w-3/4 py-12">
            {/* SVG esquerdo */}
            <svg
              className="relative z-[1]"
              xmlns="http://www.w3.org/2000/svg"
              width="225"
              height="264"
              viewBox="0 0 225 264"
              fill="none"
            >
              <path
                d="M217.255 111.903C209.361 106.913 201.28 101.892 192.762 97.2537C175.867 88.0527 157.942 79.726 140.47 71.0154C121.391 61.5052 102.202 52.0696 83.2635 42.4315C71.7817 36.6102 60.5962 30.5118 49.3796 24.4453C37.383 17.9524 25.8387 11.0543 13.4989 4.89183C7.58635 1.94922 3.71747 0.467246 0.207397 0.445923L0.207397 263.543C2.51437 263.198 4.65903 262.465 6.44752 261.411C22.0478 253.628 38.3034 246.282 52.1721 236.889C55.6509 234.544 71.9845 226.612 75.5725 224.33C107.179 204.147 139.097 184.189 170.937 164.166C175.29 161.437 179.783 158.782 184.01 155.967C195.601 148.238 207.239 140.54 218.534 132.629L218.674 132.522C220.581 131.111 222.059 129.455 223.021 127.651C223.983 125.846 224.411 123.928 224.279 122.01C224.147 120.091 223.458 118.209 222.252 116.474C221.046 114.739 219.347 113.185 217.255 111.903Z"
                fill="#EFC345"
              />
            </svg>

            {/* Conteúdo central */}
            <div className="mx-auto flex flex-col justify-center align-middle gap-2 md:gap-5 relative z-[2]">
              <h1
                className="text-4xl md:text-5xl font-bold text-text-grey pb-8 bg-ideciclo-pink 
                         mx-auto px-7 py-6 rounded-[40px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)]"
              >
                Ranking das Cidades
              </h1>
            </div>

            {/* SVG direito */}
            <svg
              className="relative z-[1]"
              xmlns="http://www.w3.org/2000/svg"
              width="236"
              height="229"
              viewBox="0 0 236 229"
              fill="none"
            >
              <path
                d="M236 229L236 14.1282C226.709 10.9305 217.347 7.94763 207.915 5.17949C182.03 -2.37835 155.574 -0.89542 129.658 4.69881C113.314 8.13405 97.9542 15.0096 84.6729 24.836C80.3447 28.0473 75.8155 30.9723 71.6354 34.3779C55.1376 47.6732 41.8886 63.2286 34.2481 82.9465C30.9441 91.7266 27.0558 100.291 22.6076 108.586C11.066 129.199 3.62167 151.719 0.659843 174.98C-0.0181506 179.902 -0.174172 184.878 0.194221 189.83C1.1572 200.61 2.87154 211.307 3.90861 222.097C4.13083 224.428 4.43772 226.719 4.80811 229L236 229Z"
                fill="#5AC2E1"
              />
            </svg>

            {/* SVG de fundo */}
            <div className="absolute lg:translate-y-[-65px] translate-y-[0] z-[0]">
              <svg
                className="scale-y-[2] sm:scale-y-[1] w-full"
                xmlns="http://www.w3.org/2000/svg"
                width="847"
                height="373"
                viewBox="0 0 847 373"
                fill="none"
              >
                <g filter="url(#filter0_d_36_344)">
                  <path
                    d="M103.281 309.45C103.281 309.45 152.031 354.45 218.401 356.64C246.931 357.58 354.301 353.83 370.021 354.43C385.741 355.03 409.101 353.65 427.961 352.83C446.821 352.01 570.141 353.96 583.021 354.43C607.191 355.33 641.131 360.28 668.741 356.79C692.371 353.79 711.351 351.07 740.301 324.35L777.581 294.11C786.558 283.956 794.037 272.571 799.791 260.3L817.211 214.77C830.881 185.6 840.211 162.99 838.051 130.85L833.291 98.3801C832.656 88.3983 829.957 78.6566 825.367 69.7702C820.777 60.8837 814.394 53.0454 806.621 46.7501C788.621 32.2501 760.561 15.0801 721.801 6.19009C646.971 -10.9599 432.001 31.5101 279.621 9.74009C170.621 -5.80991 89.0913 33.2401 51.5113 56.7301C37.1216 65.7505 26.5972 79.7961 21.9813 96.1401L21.7513 96.9401C14.5713 122.26 5.62128 145.94 8.58128 171.94C10.4813 188.61 8.00128 248.13 54.8113 282.15L103.281 309.45Z"
                    fill="#E4E8EA"
                  />
                </g>
                <defs>
                  <filter
                    id="filter0_d_36_344"
                    x="-4"
                    y="-4"
                    width="855"
                    height="381"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_36_344"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_36_344"
                      result="shape"
                    />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>
      <section>
        {/* Filtros com Design Customizado */}
        <div className="flex flex-row justify-center items-end gap-2 md:gap-5 lg:gap-10 flex-grow">
          {/* Filtro por cidade */}
          <div className="relative rounded-lg flex-1 max-w-xs">
            <div className="absolute inset-0 z-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                viewBox="0 0 288 101"
                preserveAspectRatio="none"
                fill="none"
                className="drop-shadow-lg"
              >
                <path
                  d="M285.958 85.6596C285.958 97.0472 279.958 106.596 271.958 113.596C263.958 120.596 253.958 124.596 243.958 124.596L44.958 124.596C34.958 124.596 24.958 120.596 16.958 113.596C8.958 106.596 2.958 97.0472 2.958 85.6596L2.958 15.6596C2.958 4.27204 8.958 -5.27659 16.958 -12.2766C24.958 -19.2766 34.958 -23.2766 44.958 -23.2766L243.958 -23.2766C253.958 -23.2766 263.958 -19.2766 271.958 -12.2766C279.958 -5.27659 285.958 4.27204 285.958 15.6596L285.958 85.6596Z"
                  fill="#6DBFAC"
                />
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
          <div className="relative rounded-lg flex-1 max-w-xs">
            <div className="absolute inset-0 z-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                viewBox="0 0 288 101"
                preserveAspectRatio="none"
                fill="none"
                className="drop-shadow-lg"
              >
                <path
                  d="M285.958 85.6596C285.958 97.0472 279.958 106.596 271.958 113.596C263.958 120.596 253.958 124.596 243.958 124.596L44.958 124.596C34.958 124.596 24.958 120.596 16.958 113.596C8.958 106.596 2.958 97.0472 2.958 85.6596L2.958 15.6596C2.958 4.27204 8.958 -5.27659 16.958 -12.2766C24.958 -19.2766 34.958 -23.2766 44.958 -23.2766L243.958 -23.2766C253.958 -23.2766 263.958 -19.2766 271.958 -12.2766C279.958 -5.27659 285.958 4.27204 285.958 15.6596L285.958 85.6596Z"
                  fill="#6DBFAC"
                />
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
                {uniqueStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtro por classificação */}
          <div className="relative rounded-lg flex-1 max-w-xs">
            <div className="absolute inset-0 z-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                viewBox="0 0 288 101"
                preserveAspectRatio="none"
                fill="none"
                className="drop-shadow-lg"
              >
                <path
                  d="M285.958 85.6596C285.958 97.0472 279.958 106.596 271.958 113.596C263.958 120.596 253.958 124.596 243.958 124.596L44.958 124.596C34.958 124.596 24.958 120.596 16.958 113.596C8.958 106.596 2.958 97.0472 2.958 85.6596L2.958 15.6596C2.958 4.27204 8.958 -5.27659 16.958 -12.2766C24.958 -19.2766 34.958 -23.2766 44.958 -23.2766L243.958 -23.2766C253.958 -23.2766 263.958 -19.2766 271.958 -12.2766C279.958 -5.27659 285.958 4.27204 285.958 15.6596L285.958 85.6596Z"
                  fill="#6DBFAC"
                />
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
                {allClassifications.map((classification) => (
                  <option key={classification} value={classification}>
                    {classification}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
              <div
                key={cityRanking.city.id}
                className="rounded bg-white shadow-2xl ideciclo-card-hover"
              >
                <Link to={`/city-details/${cityRanking.city.id}`}>
                  <div className="flex flex-col bg-white divide-y divide-gray-100">
                    {/* Seção Posição */}
                    <div className="flex flex-col justify-center w-full p-4 text-center tracking-widest">
                      <h3 className="text-ideciclo-red font-bold text-sm">
                        POSIÇÃO
                      </h3>
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
                    <div
                      className="flex flex-col justify-center w-full p-4 text-center 
                                    uppercase tracking-widest"
                    >
                      <h3 className="font-bold text-lg">
                        {cityRanking.city.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {cityRanking.city.state}
                      </p>
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
            <p className="text-gray-500">
              Nenhuma cidade encontrada com os filtros aplicados.
            </p>
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
