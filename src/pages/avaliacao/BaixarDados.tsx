import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  ArrowRight,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { fetchAllStoredCities } from "@/services/database";
import {
  fetchStates,
  fetchCities,
  fetchCityHighwayStats,
  fetchCityWays,
  calculateCityStats,
  convertToSegments,
  getStoredCityData,
  storeCityData,
} from "@/services/api";
import { City, IBGEState, IBGECity } from "@/types";
import { useToast } from "@/hooks/use-toast";

const BaixarDados = () => {
  const navigate = useNavigate();
  const [storedCities, setStoredCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [cityData, setCityData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [citiesData, statesData] = await Promise.all([
          fetchAllStoredCities(),
          fetchStates(),
        ]);
        setStoredCities(citiesData);
        setStates(statesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleStateChange = async (stateId: string) => {
    setSelectedState(stateId);
    setSelectedCity("");
    setCities([]);

    if (!stateId) return;

    try {
      const citiesData = await fetchCities(stateId);
      setCities(citiesData);
    } catch (error) {
      console.error("Error loading cities:", error);
    }
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
  };

  const handleSubmit = async () => {
    if (!selectedState || !selectedCity) return;

    const state = states.find((s) => s.id.toString() === selectedState);
    const city = cities.find((c) => c.id.toString() === selectedCity);

    if (!state || !city) return;

    try {
      setIsLoading(true);
      setError(null);

      const storedData = await getStoredCityData(selectedCity);
      if (storedData) {
        const data = {
          cityId: selectedCity,
          cityName: city.nome,
          stateName: state.sigla,
          city: storedData.city,
          segments: storedData.segments,
        };
        setCityData(data);
        handleComplete(data);
        return;
      }

      const highwayStats = await fetchCityHighwayStats(selectedCity);
      const cityStats = calculateCityStats(highwayStats);

      const newCity = {
        id: selectedCity,
        name: city.nome,
        state: state.sigla,
        extensao_avaliada: 0,
        ideciclo: 0,
        ...cityStats,
      };

      const waysData = await fetchCityWays(selectedCity);
      const segments = convertToSegments(waysData, selectedCity);

      await storeCityData(selectedCity, {
        city: newCity,
        segments,
      });

      const data = {
        cityId: selectedCity,
        cityName: city.nome,
        stateName: state.sigla,
        city: newCity,
        segments,
      };

      setCityData(data);
      handleComplete(data);

      toast({
        title: "Dados baixados",
        description: `Dados de ${city.nome}/${state.sigla} baixados com sucesso!`,
      });
    } catch (error) {
      console.error("Erro ao baixar dados:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      toast({
        title: "Erro",
        description: "Falha ao baixar os dados da cidade",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = (data: any) => {
    sessionStorage.setItem("cityData", JSON.stringify(data));
    setTimeout(() => navigate("/avaliacao/refinar-dados"), 1500);
  };

  const handleCitySelect = (city: City) => {
    const cityData = {
      cityId: city.id,
      cityName: city.name,
      stateName: city.state,
      city: city,
    };
    sessionStorage.setItem("cityData", JSON.stringify(cityData));
    navigate("/avaliacao/refinar-dados");
  };

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
        &gt;{" "}
        <a href="/avaliacao" className="hover:underline">
          Avaliação
        </a>{" "}
        &gt; <span>Baixar Dados</span>
      </nav>

      {/* Título com Design Customizado */}
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
                Baixar Dados
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

      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-600 text-lg">
            Selecione uma cidade e baixe os dados da infraestrutura cicloviária
          </p>
          <Button variant="outline" onClick={() => navigate("/avaliacao")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar às Etapas
          </Button>
        </div>

        {storedCities.length > 0 && (
          <section className="mb-12">
            <div className="flex gap-2 relative justify-center mb-8 mx-auto w-full max-w-md">
              <div className="mx-auto flex flex-col justify-center align-middle gap-2 relative z-[2]">
                <h2
                  className="text-2xl md:text-3xl font-bold text-text-grey bg-ideciclo-blue 
                           mx-auto px-6 py-4 rounded-[40px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] text-white"
                >
                  Cidades Já Baixadas
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {storedCities.map((city) => (
                <div
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className="rounded bg-white shadow-2xl ideciclo-card-hover cursor-pointer"
                >
                  <div className="flex flex-col bg-white divide-y divide-gray-100">
                    <div className="flex flex-col justify-center w-full p-4 text-center tracking-widest">
                      <h3 className="text-ideciclo-red font-bold text-sm">
                        EXTENSÃO
                      </h3>
                      <h3 className="text-3xl mt-1 font-bold text-ideciclo-blue">
                        {(
                          city.extensao_total ||
                          city.vias_estruturais_km +
                            city.vias_alimentadoras_km +
                            city.vias_locais_km ||
                          0
                        ).toFixed(1)}{" "}
                        km
                      </h3>
                    </div>

                    <div className="flex flex-col justify-center w-full p-4 text-center uppercase tracking-widest">
                      <h3 className="font-bold text-lg">{city.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{city.state}</p>
                      <div className="flex justify-center items-center mt-3 gap-2">
                        <ArrowRight className="h-4 w-4 text-ideciclo-blue" />
                        <span className="text-xs text-ideciclo-blue font-semibold">
                          REFINAR
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex gap-2 relative justify-center mb-8 mx-auto w-full">
            <div className="mx-auto flex flex-col justify-center align-middle gap-2 relative z-[2]">
              <h2
                className="text-2xl md:text-3xl font-bold text-text-grey bg-ideciclo-yellow 
                         mx-auto px-6 py-4 rounded-[40px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)]"
              >
                Baixar dados de outra cidade
              </h2>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="rounded bg-white shadow-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Download className="h-6 w-6 text-ideciclo-blue" />
                <h3 className="text-xl font-semibold">
                  Selecionar Estado e Cidade
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Seleção de Estado com estilo customizado */}
                <div className="relative">
                  <div className="absolute inset-0 z-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      height="100%"
                      viewBox="0 0 288 120"
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
                  <div className="relative z-10 text-white font-bold rounded px-6 pb-8 pt-4">
                    <label className="block text-sm mb-3 uppercase tracking-wide">
                      Estado:
                    </label>
                    <select
                      className="block appearance-none text-black font-bold w-full bg-white 
                               border border-gray-400 hover:border-gray-500 px-4 py-3 pr-8 
                               rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                      onChange={(e) => handleStateChange(e.target.value)}
                      value={selectedState}
                    >
                      <option value="">Selecione um estado</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id.toString()}>
                          {state.nome} - {state.sigla}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Seleção de Cidade com estilo customizado */}
                <div className="relative">
                  <div className="absolute inset-0 z-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      height="100%"
                      viewBox="0 0 288 120"
                      preserveAspectRatio="none"
                      fill="none"
                      className="drop-shadow-lg"
                    >
                      <path
                        d="M285.958 85.6596C285.958 97.0472 279.958 106.596 271.958 113.596C263.958 120.596 253.958 124.596 243.958 124.596L44.958 124.596C34.958 124.596 24.958 120.596 16.958 113.596C8.958 106.596 2.958 97.0472 2.958 85.6596L2.958 15.6596C2.958 4.27204 8.958 -5.27659 16.958 -12.2766C24.958 -19.2766 34.958 -23.2766 44.958 -23.2766L243.958 -23.2766C253.958 -23.2766 263.958 -19.2766 271.958 -12.2766C279.958 -5.27659 285.958 4.27204 285.958 15.6596L285.958 85.6596Z"
                        fill="#5AC2E1"
                      />
                    </svg>
                  </div>
                  <div className="relative z-10 text-white font-bold rounded px-6 pb-8 pt-4">
                    <label className="block text-sm mb-3 uppercase tracking-wide">
                      Cidade:
                    </label>
                    <select
                      className="block appearance-none text-black font-bold w-full bg-white 
                               border border-gray-400 hover:border-gray-500 px-4 py-3 pr-8 
                               rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                      onChange={(e) => handleCityChange(e.target.value)}
                      value={selectedCity}
                      disabled={!selectedState || cities.length === 0}
                    >
                      <option value="">Selecione uma cidade</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id.toString()}>
                          {city.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Botão de ação */}
              <div className="mt-8 text-center">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !selectedState || !selectedCity}
                  className="bg-ideciclo-blue hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-[20px] shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Baixando dados...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Baixar Dados da Cidade
                    </>
                  )}
                </Button>
              </div>

              {/* Estado de sucesso */}
              {cityData && (
                <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h4 className="text-lg font-semibold text-green-700">
                      Dados Baixados com Sucesso!
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Cidade:</strong> {cityData.cityName},{" "}
                      {cityData.stateName}
                    </p>
                    <p>
                      <strong>Segmentos encontrados:</strong>{" "}
                      {cityData.segments?.length || 0}
                    </p>
                    <p>
                      <strong>Extensão total:</strong>{" "}
                      {cityData.city?.extensao_total?.toFixed(2) || 0} km
                    </p>
                  </div>
                </div>
              )}

              {/* Estado de erro */}
              {error && (
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BaixarDados;
