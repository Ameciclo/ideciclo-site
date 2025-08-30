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
      <>
        <div className="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black"
             style={{backgroundImage: "url('/pages_covers/ideciclo-navcover.png')"}}>
        </div>
        <nav className="bg-gray-400 text-white px-4 py-2">
          <a href="/" className="hover:underline">Home</a> {">"} 
          <a href="/ranking" className="hover:underline">Ranking</a> {">"} 
          <span>Detalhes</span>
        </nav>
        <div className="container py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ideciclo-blue"></div>
          </div>
        </div>
      </>
    );
  }

  if (!city) {
    return (
      <>
        <div className="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black"
             style={{backgroundImage: "url('/pages_covers/ideciclo-navcover.png')"}}>
        </div>
        <nav className="bg-gray-400 text-white px-4 py-2">
          <a href="/" className="hover:underline">Home</a> {">"} 
          <a href="/ranking" className="hover:underline">Ranking</a> {">"} 
          <span>Detalhes</span>
        </nav>
        <div className="container py-8">
          <div className="text-center">
            <p className="text-gray-500">Cidade não encontrada.</p>
            <Link to="/ranking">
              <Button className="mt-4 bg-ideciclo-teal hover:bg-ideciclo-blue text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Ranking
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header com Imagem de Capa */}
      <div className="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black"
           style={{backgroundImage: "url('/pages_covers/ideciclo-navcover.png')"}}>
      </div>
      
      {/* Breadcrumb */}
      <nav className="bg-gray-400 text-white px-4 py-2">
        <a href="/" className="hover:underline">Home</a> {">"} 
        <a href="/ranking" className="hover:underline">Ranking</a> {">"} 
        <span>{city.name}</span>
      </nav>

      {/* Estatísticas da Cidade Selecionada - Estilo Subpágina */}
      <section className="relative z-1 mx-auto container bg-transparent">
        <div className="mx-auto text-center my-12 md:my-24">
          {/* Título com SVG vermelho diferente */}
          <div className="relative inline-flex items-center justify-center">
            <svg className="absolute z-1 bottom-0 translate-y-6 drop-shadow-md" 
                 xmlns="http://www.w3.org/2000/svg" width="100%" height="42" 
                 viewBox="0 0 1358 62" fill="none">
              <path d="M15.9387 42.8923C12.719 32.9575 11.4924 23.7252 8.32915 14.0604C7.96501 13.2808 8.25289 12.4674 9.14433 11.7569C10.0358 11.0464 11.4764 10.4821 13.2244 10.1587C19.0716 9.31065 25.0569 8.65106 31.1278 8.18577C45.1257 7.33193 59.2867 6.67946 73.3981 6.41074C181.568 4.32819 289.682 2.11088 397.992 3.02562C487.784 3.73218 577.772 2.74594 667.564 3.40742C775.711 4.2335 883.709 6.09812 991.753 7.33101C1069.08 8.2231 1146.4 8.91981 1223.72 9.42114C1256.95 9.64808 1290.27 9.15261 1323.49 9.08648C1329.71 9.02762 1335.94 9.30691 1343.13 9.53198C1345.1 9.69751 1346.82 10.18 1347.93 10.8769C1349.04 11.5737 1349.45 12.43 1349.08 13.2635L1343.39 38.3884C1343.34 39.0515 1342.8 39.6954 1341.85 40.23C1340.89 40.7646 1339.56 41.1631 1338.06 41.3698C1335.24 41.6749 1332.37 41.8756 1329.48 41.9695C1212.88 43.6132 1096.28 45.9107 979.727 46.6747C852.385 47.5181 724.975 47.0997 597.623 46.9512C532.739 46.8884 467.899 45.9233 403.016 45.9281C328.957 45.9972 254.802 47.1944 180.689 47.2189C129.276 47.2541 76.1355 46.2686 22.0328 45.653C20.3976 45.5692 18.8938 45.2475 17.7811 44.7434C16.6683 44.2394 16.0167 43.5846 15.9387 42.8923Z" fill="#CE4831"/>
            </svg>
            
            <h1 className="text-3xl w-full m-0 mb-10 p-0 sm:text-5xl font-bold 
                           bg-transparent text-text-grey inline-flex items-center 
                           justify-center py-[1rem] gap-[1rem] flex-shrink-0 relative z-10">
              {city.name}
            </h1>
          </div>
          
          <h3 className="text-2xl md:text-3xl text-text-grey font-bold my-8">
            Estatísticas Gerais
          </h3>
          
          {/* Container com fundo SVG (mesmo da página principal) */}
          <div className="relative z-1 rounded-lg mx-4 md:mx-auto my-8 max-w-4xl">
            {/* SVG de fundo igual ao principal */}
            <div className="absolute inset-0 z-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" 
                   viewBox="0 0 1149 208" preserveAspectRatio="none" fill="none"
                   className="drop-shadow-lg">
                <path opacity="1" d="M1126.03 193.311C1126.03 196.253 1119.59 199.073 1108.12 201.153C1096.65 203.233 1081.09 204.401 1064.87 204.401L892.017 206.573C836.194 207.271 780.371 207.271 759.995 208L362.477 202.969C302.327 201.223 274.862 202.741 250.161 203.131L76.2709 204.401C60.6238 204.401 45.5722 203.313 34.216 201.361C22.8599 199.409 16.064 196.742 15.2281 193.909L1.63507 148.243C-1.7472 136.762 0.119956 125.25 7.21741 113.825L8.44552 91.0475C13.1347 83.4551 12.4648 56.3808 8.44552 48.7733L18.7728 17.9331C18.5231 17.545 18.3926 17.1547 18.3821 16.7639C18.6891 9.40439 26.3648 3.5431 94.4414 3.5431L779.505 0C781.236 0 782.966 0 784.725 0L1068.34 2.94077C1083.93 3.09986 1098.6 4.33552 1109.33 6.39408C1120.06 8.45264 1126.03 11.1779 1126.03 14.0104L1148.36 117.14C1146.52 122.76 1146.73 128.395 1149 134.01L1126.03 193.311Z" fill="#E5E8E9"/>
              </svg>
            </div>
            
            {/* Cards de estatísticas */}
            <div className="relative z-10 flex flex-col align-baseline md:flex-row 
                            rounded-lg mx-4 md:mx-auto my-8 max-w-4xl 
                            divide-y md:divide-y-0 md:divide-x divide-gray-300">
              
              <div className="flex flex-col justify-center w-full p-6 text-center 
                              uppercase tracking-widest">
                <h3>IDECICLO</h3>
                <h3 className="text-3xl sm:text-5xl font-bold mt-2">
                  {(city.ideciclo * 100).toFixed(1)}
                </h3>
              </div>
              
              <div className="flex flex-col justify-center w-full p-6 text-center 
                              uppercase tracking-widest">
                <h3>Extensão Avaliada</h3>
                <h3 className="text-3xl sm:text-5xl font-bold mt-2">
                  {city.extensao_avaliada} km
                </h3>
              </div>
              
              <div className="flex flex-col justify-center w-full p-6 text-center 
                              uppercase tracking-widest">
                <h3>Segmentos</h3>
                <h3 className="text-3xl sm:text-5xl font-bold mt-2">
                  {segments.length}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Conteúdo Principal (3 colunas) - Estilo Subpágina */}
      <div className="w-full relative z-[-1] translate-y-[-100px] md:translate-y-[-80px] bg-ideciclo-yellow">
        <section className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
                            auto-rows-auto gap-10 mt-[150px] md:mt-[100px] mb-[100px]">
          
          {/* Card 1: Informações da Cidade */}
          <div className="rounded bg-white shadow-2xl">
            <div className="flex flex-col bg-white mx-4 md:mx-auto max-w-4xl 
                            divide-y md:divide-x divide-gray-100">
              
              {/* Seção Estado */}
              <div className="flex flex-col justify-center w-full p-6 text-center tracking-widest">
                <h3 className="text-ideciclo-red font-bold">ESTADO</h3>
                <h3 className="text-2xl mt-2 font-bold">
                  {city.state}
                </h3>
              </div>
              
              {/* Seção Região */}
              <div className="flex flex-col justify-center w-full p-6 text-center tracking-widest">
                <h3 className="text-ideciclo-red font-bold">REGIÃO</h3>
                <h3 className="text-xl mt-2">
                  <strong>BRASIL</strong>
                </h3>
              </div>
              
              {/* Seção Última Avaliação */}
              <div className="flex flex-col justify-center w-full p-6 text-center 
                              uppercase tracking-widest">
                <h3 className="text-ideciclo-red font-bold">Última avaliação</h3>
                <h3 className="text-2xl font-bold mt-2">2024</h3>
              </div>
            </div>
          </div>
          
          {/* Card 2: Mapa Placeholder */}
          <div className="bg-ideciclo-green bg-opacity-20 rounded shadow-2xl flex items-center justify-center">
            <div className="p-6 text-center" style={{height: '400px'}}>
              <h3 className="text-2xl font-bold text-ideciclo-red mb-4">MAPA DA CIDADE</h3>
              <p className="text-text-grey">Visualização geográfica dos segmentos avaliados</p>
              <div className="mt-8 bg-white bg-opacity-50 rounded-lg p-8">
                <p className="text-gray-500">Mapa interativo será implementado aqui</p>
              </div>
            </div>
          </div>
          
          {/* Card 3: Estatísticas Adicionais */}
          <div className="rounded bg-white shadow-2xl">
            <div className="p-6">
              <h3 className="text-center font-bold text-xl mb-4 text-ideciclo-red">ESTATÍSTICAS DETALHADAS</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-background-grey rounded-lg">
                  <h4 className="font-bold text-text-grey">Vias Estruturais</h4>
                  <p className="text-2xl font-bold text-ideciclo-blue">
                    {city.vias_estruturais_km || 0} km
                  </p>
                </div>
                <div className="text-center p-4 bg-background-grey rounded-lg">
                  <h4 className="font-bold text-text-grey">Vias Alimentadoras</h4>
                  <p className="text-2xl font-bold text-ideciclo-blue">
                    {city.vias_alimentadoras_km || 0} km
                  </p>
                </div>
                <div className="text-center p-4 bg-background-grey rounded-lg">
                  <h4 className="font-bold text-text-grey">Vias Locais</h4>
                  <p className="text-2xl font-bold text-ideciclo-blue">
                    {city.vias_locais_km || 0} km
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Seção de Segmentos */}
      <div className="container mx-auto mt-[-50px]">
        <div className="mx-auto text-center my-12 md:my-6">
          <h3 className="text-4xl font-bold p-6 my-8 mb-[50px] rounded-[40px] 
                         bg-ideciclo-teal mx-auto text-white shadow-[0px_6px_8px_rgba(0,0,0,0.25)]">
            Segmentos Avaliados
          </h3>
        </div>
        
        <div className="bg-white rounded-[20px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] p-6 mb-8">
          {segments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-background-grey">
                    <th className="px-4 py-3 border-b text-left font-bold text-text-grey">Nome</th>
                    <th className="px-4 py-3 border-b text-left font-bold text-text-grey">Tipologia</th>
                    <th className="px-4 py-3 border-b text-left font-bold text-text-grey">Hierarquia</th>
                    <th className="px-4 py-3 border-b text-left font-bold text-text-grey">Extensão (km)</th>
                    <th className="px-4 py-3 border-b text-left font-bold text-text-grey">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((segment, index) => (
                    <tr key={segment.id} className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-ideciclo-yellow hover:bg-opacity-20 transition-colors`}>
                      <td className="px-4 py-3 border-b text-text-grey">{segment.name}</td>
                      <td className="px-4 py-3 border-b text-text-grey">{segment.type || "-"}</td>
                      <td className="px-4 py-3 border-b text-text-grey">{segment.classification || "-"}</td>
                      <td className="px-4 py-3 border-b text-text-grey">{segment.length}</td>
                      <td className="px-4 py-3 border-b text-text-grey font-bold">
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
            <p className="text-gray-500 text-center py-8">Nenhum segmento encontrado para esta cidade.</p>
          )}
        </div>
        
        <div className="text-center mt-8">
          <Link to="/ranking">
            <Button className="bg-ideciclo-teal hover:bg-ideciclo-blue text-white rounded-full px-8 py-3">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Ranking
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default CityDetails;