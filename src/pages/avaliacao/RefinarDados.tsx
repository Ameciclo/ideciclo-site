import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { City, Segment, SegmentType } from "@/types";
import { Button } from "@/components/ui/button";
import CitySelection from "@/components/CitySelection";
import StoredCitiesSelection from "@/components/StoredCitiesSelection";
import {
  fetchCityHighwayStats,
  fetchCityWays,
  calculateCityStats,
  convertToSegments,
  getStoredCityData,
  storeCityData,
  updateSegmentName,
  removeSegments,
  mergeSegmentsInDB,
  unmergeSegments,
  deleteMultipleSegments,
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import {
  deleteCityFromDB,
  updateSegmentInDB,
} from "@/services/database";
import MergeSegmentsDialog from "@/components/MergeSegmentsDialog";
import { CityInfrastructureCard } from "@/components/CityInfrastructureCard";
import { RefinementTableSortableWrapper } from "@/components/RefinementTableSortableWrapper";

const RefinarDados = () => {
  const [cityId, setCityId] = useState<string>("");
  const [cityName, setCityName] = useState<string>("");
  const [stateName, setStateName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [city, setCity] = useState<Partial<City> | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mergeDialogOpen, setMergeDialogOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const storedData = sessionStorage.getItem("cityData");
    if (storedData) {
      const data = JSON.parse(storedData);
      setCityId(data.cityId);
      setCityName(data.cityName);
      setStateName(data.stateName);
      loadStoredCityData(data.cityId);
    }
  }, []);

  const handleCitySelected = async (
    stateId: string,
    selectedCityId: string,
    selectedCityName: string,
    selectedStateName: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      setCityId(selectedCityId);
      setCityName(selectedCityName);
      setStateName(selectedStateName);

      const storedData = await getStoredCityData(selectedCityId);
      if (storedData) {
        setCity(storedData.city);
        setSegments([...storedData.segments]);
        toast({
          title: "Dados carregados",
          description: `Dados de ${selectedCityName}/${selectedStateName} carregados!`,
        });
      } else {
        const highwayStats = await fetchCityHighwayStats(selectedCityId);
        const cityStats = calculateCityStats(highwayStats);

        const newCity: Partial<City> = {
          id: selectedCityId,
          name: selectedCityName,
          state: selectedStateName,
          extensao_avaliada: 0,
          ideciclo: 0,
          ...cityStats,
        };

        setCity(newCity);

        const waysData = await fetchCityWays(selectedCityId);
        const segments = convertToSegments(waysData, selectedCityId);

        const enhancedSegments = segments.map((segment) => ({
          ...segment,
          evaluated: false,
          id_form: undefined,
        }));

        setSegments(enhancedSegments);

        await storeCityData(selectedCityId, {
          city: newCity,
          segments: enhancedSegments,
        });

        toast({
          title: "Dados baixados",
          description: `Dados de ${selectedCityName}/${selectedStateName} baixados com sucesso!`,
        });
      }
    } catch (error) {
      console.error("Erro ao processar cidade:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Falha ao processar os dados da cidade";
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStoredCityData = async (selectedCityId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const storedData = await getStoredCityData(selectedCityId);
      if (storedData) {
        setCity(storedData.city);
        setSegments([...storedData.segments]);
      } else {
        setError("Nenhum dado encontrado para esta cidade");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Falha ao carregar dados armazenados");
    } finally {
      setIsLoading(false);
    }
  };

  const resetCityData = async () => {
    if (!cityId) return;

    try {
      setIsLoading(true);
      setError(null);

      await deleteCityFromDB(cityId);

      const highwayStats = await fetchCityHighwayStats(cityId);
      const cityStats = calculateCityStats(highwayStats);

      const updatedCity: Partial<City> = {
        id: cityId,
        name: cityName,
        state: stateName,
        extensao_avaliada: 0,
        ideciclo: 0,
        ...cityStats,
      };

      setCity(updatedCity);

      const waysData = await fetchCityWays(cityId);
      const citySegments = convertToSegments(waysData, cityId);

      const enhancedSegments = citySegments.map((segment) => ({
        ...segment,
        evaluated: false,
        id_form: undefined,
      }));

      setSegments(enhancedSegments);

      await storeCityData(cityId, {
        city: updatedCity,
        segments: enhancedSegments,
      });

      toast({
        title: "Dados recarregados",
        description: `Dados de ${cityName}/${stateName} foram recarregados com sucesso!`,
      });
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Falha ao recarregar os dados da cidade";
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSegmentName = async (
    segmentId: string,
    newName: string
  ) => {
    try {
      await updateSegmentName(cityId, segmentId, newName);
      setSegments((prevSegments) =>
        prevSegments.map((seg) =>
          seg.id === segmentId ? { ...seg, name: newName } : seg
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar nome do segmento:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar o nome do segmento.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSegmentClassification = async (
    segmentId: string,
    classification: string
  ) => {
    try {
      await updateSegmentInDB({ id: segmentId, classification });
      setSegments((prevSegments) =>
        prevSegments.map((seg) =>
          seg.id === segmentId ? { ...seg, classification } : seg
        )
      );
      toast({
        title: "Classificação atualizada",
        description: "A classificação do segmento foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar classificação do segmento:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar a classificação do segmento.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSegmentType = async (
    segmentId: string,
    type: SegmentType
  ) => {
    try {
      await updateSegmentInDB({ id: segmentId, type });
      setSegments((prevSegments) =>
        prevSegments.map((seg) =>
          seg.id === segmentId ? { ...seg, type } : seg
        )
      );
      toast({
        title: "Tipo atualizado",
        description: "O tipo do segmento foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar tipo do segmento:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar o tipo do segmento.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSegment = async (segmentId: string) => {
    try {
      await removeSegments([segmentId]);
      const updatedSegments = segments.filter(
        (segment) => segment.id !== segmentId
      );
      setSegments(updatedSegments);
      toast({
        title: "Segmento removido",
        description: "O segmento foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao remover segmento:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover o segmento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSelectSegment = (id: string, selected: boolean) => {
    const updatedSegments = segments.map((segment) =>
      segment.id === id ? { ...segment, selected } : segment
    );
    setSegments(updatedSegments);
  };

  const handleSelectAllSegments = (segmentIds: string[], selected: boolean) => {
    const updatedSegments = segments.map((segment) =>
      segmentIds.includes(segment.id) ? { ...segment, selected } : segment
    );
    setSegments(updatedSegments);
  };

  const handleMergeButtonClick = () =>
    Promise.resolve().then(() => {
      if (selectedSegmentsCount >= 2) {
        setMergeDialogOpen(true);
      }
    });

  const handleDeleteMultipleSegments = async () => {
    if (selectedSegmentsCount === 0) return;

    const selectedSegmentIds = segments
      .filter((s) => s.selected)
      .map((s) => s.id);

    try {
      await deleteMultipleSegments(selectedSegmentIds);
      const updatedSegments = segments.filter((segment) => !segment.selected);
      setSegments(updatedSegments);
      toast({
        title: "Segmentos removidos",
        description: `${selectedSegmentIds.length} segmentos foram removidos com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao remover múltiplos segmentos:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover os segmentos selecionados.",
        variant: "destructive",
      });
    }
  };

  const handleMergeSegments = async (
    mergedName: string,
    mergedType: SegmentType,
    mergedClassification?: string
  ) => {
    const selectedSegments = segments.filter((s) => s.selected);
    if (selectedSegments.length < 2) return;

    try {
      await mergeSegmentsInDB(
        selectedSegments,
        mergedName,
        mergedType,
        mergedClassification
      );

      const storedData = await getStoredCityData(cityId);
      if (storedData) {
        const updatedSegments = storedData.segments.map((segment) => ({
          ...segment,
          selected: false,
        }));
        setSegments(updatedSegments);
      }

      toast({
        title: "Segmentos mesclados",
        description: `${selectedSegments.length} segmentos mesclados com sucesso`,
      });
    } catch (error) {
      console.error("Erro ao mesclar segmentos:", error);
      toast({
        title: "Erro",
        description: "Falha ao mesclar os segmentos. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUnmergeSegments = async (
    parentSegmentId: string,
    segmentIds: string[]
  ) => {
    try {
      await unmergeSegments(parentSegmentId, segmentIds);
      const storedData = await getStoredCityData(cityId);
      if (storedData) {
        const updatedSegments = storedData.segments.map((segment) => ({
          ...segment,
          selected: false,
        }));
        setSegments(updatedSegments);
      }
      toast({
        title: "Segmentos desmesclados",
        description: "Os segmentos foram desmesclados com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao desmesclar segmentos:", error);
      toast({
        title: "Erro",
        description: "Falha ao desmesclar os segmentos.",
        variant: "destructive",
      });
    }
  };

  const selectedSegmentsCount = segments.filter((s) => s.selected).length;
  const selectedSegments = segments.filter((s) => s.selected);

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
        &gt; <span>Refinar Dados</span>
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
                Refinar Dados
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
            Ajuste e melhore os dados baixados da cidade
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              sessionStorage.removeItem("cityData");
              setCityId("");
              setCityName("");
              setStateName("");
              setCity(null);
              setSegments([]);
            }}>
              Nova Cidade
            </Button>
            <Button variant="outline" onClick={() => navigate("/avaliacao")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar às Etapas
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Tentar novamente
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p>Carregando dados... Por favor aguarde.</p>
            </div>
          </div>
        )}

        {!isLoading && !error && cityName && (
          <div className="space-y-8">
            <CityInfrastructureCard
              cityName={cityName}
              stateName={stateName}
              city={city}
            />

            <div className="flex flex-col gap-8">
              <div>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {selectedSegmentsCount > 0 && (
                    <>
                      <Button
                        onClick={handleMergeButtonClick}
                        disabled={selectedSegmentsCount < 2}
                      >
                        Mesclar {selectedSegmentsCount} segmentos
                      </Button>
                      <Button
                        onClick={handleDeleteMultipleSegments}
                        variant="destructive"
                      >
                        Excluir {selectedSegmentsCount} segmentos
                      </Button>
                    </>
                  )}
                </div>
                <MergeSegmentsDialog
                  open={mergeDialogOpen}
                  onOpenChange={setMergeDialogOpen}
                  selectedSegments={selectedSegments}
                  onConfirm={handleMergeSegments}
                />
                {segments && segments.length > 0 ? (
                  <RefinementTableSortableWrapper
                    segments={segments}
                    onSelectSegment={handleSelectSegment}
                    onSelectAllSegments={handleSelectAllSegments}
                    selectedSegments={selectedSegments}
                    onMergeSelected={handleMergeButtonClick}
                    onUpdateSegmentName={handleUpdateSegmentName}
                    onDeleteSegment={handleDeleteSegment}
                    onUnmergeSegments={handleUnmergeSegments}
                    onUpdateSegmentClassification={
                      handleUpdateSegmentClassification
                    }
                    onUpdateSegmentType={handleUpdateSegmentType}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p>Nenhum segmento encontrado para esta cidade.</p>
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={resetCityData}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Resetar dados
                  </Button>
                  
                  <Button
                    onClick={() => navigate("/avaliacao/escolher-estrutura")}
                    className="bg-ideciclo-blue hover:bg-blue-600"
                  >
                    Continuar para Próxima Etapa
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!isLoading && !error && !cityName && (
          <section>
            <div className="flex gap-2 relative justify-center mb-8 mx-auto w-full max-w-md">
              <div className="mx-auto flex flex-col justify-center align-middle gap-2 relative z-[2]">
                <h2
                  className="text-2xl md:text-3xl font-bold text-text-grey bg-ideciclo-blue 
                           mx-auto px-6 py-4 rounded-[40px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] text-white"
                >
                  Selecionar Cidade
                </h2>
              </div>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="rounded bg-white shadow-2xl p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Cidades Já Baixadas</h3>
                  <p className="text-gray-600 text-sm">
                    Selecione uma cidade que já foi baixada para refinar seus dados
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <StoredCitiesSelection onCitySelected={handleCitySelected} />
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <p className="text-gray-600 text-sm mb-4">
                    Não encontrou sua cidade? Baixe os dados de uma nova cidade
                  </p>
                  <Button 
                    onClick={() => navigate("/avaliacao/baixar-dados")}
                    className="bg-ideciclo-yellow hover:bg-yellow-500 text-black px-8 py-3 text-lg font-semibold rounded-[20px] shadow-lg"
                  >
                    Baixar Nova Cidade
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default RefinarDados;