import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { calcDownloadUrl, formDownloadUrl, manualDownloadUrl } from "@/constants/siteLinks";
import { fetchCities, fetchStates } from "@/services/api";
import { fetchAllStoredCities } from "@/services/database";
import { City, IBGECity, IBGEState } from "@/types";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  MapPin,
  TrendingUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  clearPersistedCityData,
  getPersistedCityData,
  setPersistedCityData,
} from "@/utils/persistedCityData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { AuthPermission } from "@/types/auth";

interface PersistedCityData {
  cityId: string;
  cityName: string;
  stateName: string;
}

interface SelectedCityActionState extends PersistedCityData {
  stateId: string;
  storedCity: City | null;
}

const EVALUATION_MODULES = new Set([
  "avaliacao_estrutura_cicloviaria",
  "refinamento_dados_cidade",
] as const);

const normalizeScopeValue = (value?: string | null) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim().toLowerCase() : "";

const isEvaluationPermission = (permission: AuthPermission) =>
  permission.role === "admin_global" ||
  permission.role === "admin_estado" ||
  permission.role === "admin_cidade" ||
  permission.role === "visualizador" ||
  (permission.module !== null && EVALUATION_MODULES.has(permission.module));

const matchesRegionalScope = (
  permission: AuthPermission,
  stateCode?: string,
  cityName?: string
) => {
  const permissionState = normalizeScopeValue(permission.state);
  const permissionCity = normalizeScopeValue(permission.city);
  const requestedState = normalizeScopeValue(stateCode);
  const requestedCity = normalizeScopeValue(cityName);

  if (permissionState && requestedState && permissionState !== requestedState) {
    return false;
  }

  if (permissionCity && requestedCity && permissionCity !== requestedCity) {
    return false;
  }

  return true;
};

const normalizeCityLabel = (value?: string | null) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const cityIsWithinPermissionScope = (
  permissionsList: AuthPermission[],
  city: City
) => {
  if (permissionsList.some((permission) => permission.role === "admin_global")) {
    return true;
  }

  return permissionsList.some((permission) =>
    matchesRegionalScope(permission, city.state, city.name)
  );
};

const Avaliacao = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, openLoginModal, canAccess, permissions } = useAuth();
  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [storedCitiesById, setStoredCitiesById] = useState<Record<string, City>>({});
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [selectedCityOption, setSelectedCityOption] = useState("");
  const [selectedCityAction, setSelectedCityAction] =
    useState<SelectedCityActionState | null>(null);
  const [activeCity, setActiveCity] = useState<PersistedCityData | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoadingOptions(true);
        const [statesData, storedCities] = await Promise.all([
          fetchStates(),
          fetchAllStoredCities(),
        ]);

        setStates(statesData);
        setStoredCitiesById(
          storedCities.reduce<Record<string, City>>((accumulator, storedCity) => {
            accumulator[storedCity.id] = storedCity;
            return accumulator;
          }, {})
        );

        const storedData = getPersistedCityData();
        if (storedData) {
          const parsedData = JSON.parse(storedData) as Partial<PersistedCityData>;
          if (parsedData.cityId && parsedData.cityName && parsedData.stateName) {
            setActiveCity({
              cityId: parsedData.cityId,
              cityName: parsedData.cityName,
              stateName: parsedData.stateName,
            });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar opções da avaliação:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os estados e cidades agora.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [toast]);

  const etapas = useMemo(
    () => [
      {
        id: 1,
        title: "Aprimorar Dados",
        subtitle: "Revise a cidade",
        description:
          "Ajuste nomes, tipologias, classificações e a composição dos trechos antes da avaliação.",
        icon: Download,
        color: "#EFC345",
        route: "/avaliacao/refinar-dados",
      },
      {
        id: 2,
        title: "Selecionar um Trecho",
        subtitle: "Escolha a estrutura",
        description:
          "Defina qual trecho será avaliado. O formulário só abre a partir dessa seleção.",
        icon: MapPin,
        color: "#5AC2E1",
        route: "/avaliacao/escolher-estrutura",
      },
      {
        id: 3,
        title: "Ver Resultados",
        subtitle: "Confira o índice",
        description:
          "Visualize a nota calculada, o IDECICLO da cidade e os trechos já avaliados.",
        icon: TrendingUp,
        color: "#F59E0B",
        route: "/avaliacao/resultados",
      },
    ],
    []
  );

  const relevantPermissions = useMemo(
    () => permissions.filter(isEvaluationPermission),
    [permissions]
  );

  const availableStates = useMemo(() => {
    if (!isAuthenticated) return states;
    if (relevantPermissions.some((permission) => permission.role === "admin_global")) {
      return states;
    }

    return states.filter((state) =>
      relevantPermissions.some((permission) => matchesRegionalScope(permission, state.sigla))
    );
  }, [isAuthenticated, relevantPermissions, states]);

  const scopedStoredCities = useMemo(() => {
    if (!isAuthenticated) return [];

    return Object.values(storedCitiesById)
      .filter((city) => cityIsWithinPermissionScope(relevantPermissions, city))
      .sort((left, right) => {
        const leftDate = left.updated_at || left.created_at || "";
        const rightDate = right.updated_at || right.created_at || "";
        return rightDate.localeCompare(leftDate);
      });
  }, [isAuthenticated, relevantPermissions, storedCitiesById]);

  const formatLastDownload = (storedCity?: City | null) => {
    const rawDate = storedCity?.updated_at || storedCity?.created_at;
    if (!rawDate) return "Ainda não baixada";

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(rawDate));
  };

  const handleSelectionStateChange = async (stateId: string) => {
    setSelectedStateId(stateId);
    setSelectedCityOption("");
    setSelectedCityAction(null);
    setCities([]);

    const selectedState = states.find((state) => state.id.toString() === stateId);
    setSelectedStateCode(selectedState?.sigla || "");

    if (!stateId) return;

    try {
      setIsLoadingCities(true);
      const citiesData = await fetchCities(stateId);
      const filteredCities =
        !isAuthenticated ||
        relevantPermissions.some((permission) => permission.role === "admin_global")
          ? citiesData
          : citiesData.filter((city) =>
              relevantPermissions.some((permission) =>
                matchesRegionalScope(permission, selectedState?.sigla, city.nome)
              )
            );

      setCities(filteredCities);
    } catch (error) {
      console.error("Erro ao carregar cidades:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as cidades deste estado.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCities(false);
    }
  };

  const handleSelectionCityChange = (cityIdValue: string) => {
    setSelectedCityOption(cityIdValue);

    const cityData = cities.find((city) => city.id.toString() === cityIdValue);
    if (!cityData || !selectedStateId || !selectedStateCode) {
      setSelectedCityAction(null);
      return;
    }

    setSelectedCityAction({
      cityId: cityIdValue,
      cityName: cityData.nome,
      stateId: selectedStateId,
      stateName: selectedStateCode,
      storedCity: storedCitiesById[cityIdValue] || null,
    });
  };

  const handleActivateCity = () => {
    if (!selectedCityAction) return;

    const nextCity = {
      cityId: selectedCityAction.cityId,
      cityName: selectedCityAction.cityName,
      stateName: selectedCityAction.stateName,
    };

    setPersistedCityData(JSON.stringify(nextCity));
    setActiveCity(nextCity);
    sessionStorage.removeItem("selectedSegmentId");
    sessionStorage.removeItem("selectedCityId");

    toast({
      title: selectedCityAction.storedCity ? "Cidade selecionada" : "Cidade pronta para baixar",
      description: selectedCityAction.storedCity
        ? `${selectedCityAction.cityName}/${selectedCityAction.stateName} está ativa para a avaliação.`
        : `Ao entrar em aprimorar dados, vamos baixar ${selectedCityAction.cityName}/${selectedCityAction.stateName}.`,
    });

    navigate("/avaliacao/refinar-dados");
  };

  const handleGoToStep = (route: string) => {
    if (!activeCity) {
      toast({
        title: "Selecione uma cidade primeiro",
        description: "Defina a cidade desta avaliação antes de seguir para as etapas.",
        variant: "destructive",
      });
      return;
    }

    const routeAccess =
      route === "/avaliacao/refinar-dados"
        ? { module: "refinamento_dados_cidade" as const, allowViewer: false }
        : route === "/avaliacao/escolher-estrutura" ||
            route === "/avaliacao/avaliar-estrutura"
          ? { module: "avaliacao_estrutura_cicloviaria" as const, allowViewer: false }
          : { module: undefined, allowViewer: true };

    if (!isAuthenticated) {
      openLoginModal({
        redirectTo: route,
        title: "Entrar para acessar esta etapa",
        description:
          "Esta área é mais útil para pessoas com acesso de edição. Depois do login, você volta direto para a etapa selecionada da avaliação.",
      });
      return;
    }

    const allowed = canAccess({
      module: routeAccess.module,
      allowViewer: routeAccess.allowViewer,
      state: activeCity.stateName,
      city: activeCity.cityName,
    });

    if (!allowed) {
      toast({
        title: "Acesso não autorizado",
        description:
          "Sua conta está ativa, mas sem a permissão necessária para esta etapa e cidade.",
        variant: "destructive",
      });
      return;
    }

    navigate(route);
  };

  const handleClearActiveCity = () => {
    clearPersistedCityData();
    sessionStorage.removeItem("selectedSegmentId");
    sessionStorage.removeItem("selectedCityId");
    setActiveCity(null);
    setSelectedCityAction(null);
    setSelectedStateId("");
    setSelectedStateCode("");
    setSelectedCityOption("");
    setCities([]);
  };

  const handleSelectStoredCity = (city: City) => {
    const matchedState = states.find(
      (state) =>
        normalizeCityLabel(state.sigla) === normalizeCityLabel(city.state) ||
        normalizeCityLabel(state.nome) === normalizeCityLabel(city.state)
    );

    if (matchedState) {
      setSelectedStateId(matchedState.id.toString());
      setSelectedStateCode(matchedState.sigla);
    }

    setSelectedCityOption(city.id);
    setSelectedCityAction({
      cityId: city.id,
      cityName: city.name,
      stateId: matchedState?.id.toString() || "",
      stateName: matchedState?.sigla || city.state,
      storedCity: city,
    });

    toast({
      title: "Cidade carregada",
      description: `${city.name}/${city.state} está pronta para continuar.`,
    });
  };

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Avaliação</h1>
          <p className="text-gray-600">
            Selecione a cidade aqui para seguir com as etapas de avaliação e edição.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/")}>
          Voltar ao Início
        </Button>
      </div>

      {isAuthenticated ? (
        <div className="mb-8 rounded-[24px] bg-background-grey p-6 shadow-md">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-2xl font-semibold text-text-grey">Cidade da avaliação</h2>
              <p className="leading-7 text-gray-700">
                A escolha da cidade agora acontece nesta página. Depois disso, você segue para
                aprimorar os dados, selecionar um trecho e ver os resultados da cidade.
              </p>
              {activeCity ? (
                <div className="inline-flex max-w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    Cidade ativa: {activeCity.cityName}, {activeCity.stateName}
                  </span>
                </div>
              ) : (
                <div className="inline-flex max-w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                  <FileText className="h-4 w-4" />
                  <span>Escolha a cidade para habilitar o fluxo de avaliação.</span>
                </div>
              )}
            </div>

            <div className="w-full max-w-xl rounded-[24px] bg-white p-6 shadow-sm">
              {isLoadingOptions ? (
                <div className="flex items-center justify-center gap-3 py-10 text-sm text-gray-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Carregando estados e cidades...</span>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="estado-avaliacao" className="text-sm font-medium">
                        Estado
                      </label>
                      <Select value={selectedStateId} onValueChange={handleSelectionStateChange}>
                        <SelectTrigger id="estado-avaliacao">
                          <SelectValue placeholder="Selecione um estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStates.map((state) => (
                            <SelectItem key={state.id} value={state.id.toString()}>
                              {state.nome} - {state.sigla}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="cidade-avaliacao" className="text-sm font-medium">
                        Cidade
                      </label>
                      <Select
                        value={selectedCityOption}
                        onValueChange={handleSelectionCityChange}
                        disabled={isLoadingCities || !selectedStateId || cities.length === 0}
                      >
                        <SelectTrigger id="cidade-avaliacao">
                          <SelectValue
                            placeholder={
                              isLoadingCities
                                ? "Carregando cidades..."
                                : cities.length === 0 && selectedStateId
                                  ? "Nenhuma cidade disponível"
                                  : "Selecione uma cidade"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.id.toString()}>
                              {city.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedCityAction ? (
                    <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold">
                          {selectedCityAction.cityName}, {selectedCityAction.stateName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Último download: {formatLastDownload(selectedCityAction.storedCity)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status:{" "}
                          {selectedCityAction.storedCity
                            ? "dados já disponíveis para aprimoramento"
                            : "cidade ainda não baixada"}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <Button
                          onClick={handleActivateCity}
                          className="bg-ideciclo-blue hover:bg-blue-600"
                        >
                          {selectedCityAction.storedCity
                            ? "Usar esta cidade e aprimorar dados"
                            : "Selecionar cidade e baixar dados"}
                        </Button>
                        {activeCity ? (
                          <Button variant="outline" onClick={handleClearActiveCity}>
                            Limpar cidade ativa
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
          {scopedStoredCities.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-text-grey">
                    Cidades já baixadas no seu escopo
                  </h3>
                  <p className="text-sm text-gray-600">
                    Use um atalho para retomar uma cidade já preparada.
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  {scopedStoredCities.length} cidade{scopedStoredCities.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {scopedStoredCities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectStoredCity(city)}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-ideciclo-blue hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{city.name}</div>
                        <div className="text-sm text-slate-600">{city.state}</div>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      Última atualização: {formatLastDownload(city)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mb-8 rounded-[24px] border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-md">
          <h2 className="mb-2 text-2xl font-semibold">Cidade da avaliação</h2>
          <p className="leading-7">
            Faça login para escolher a cidade e seguir com as etapas de edição e avaliação.
          </p>
        </div>
      )}

      <div className="mb-8 rounded-[24px] bg-background-grey p-6 shadow-md">
        <p className="leading-7 text-gray-700">
          O formulário IDECICLO deixa de ser uma etapa solta. Agora ele é acessado apenas depois
          que um trecho é escolhido na etapa de seleção.
        </p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <Button
            asChild
            className="w-full bg-ideciclo-red text-white hover:bg-ideciclo-red/90 md:w-auto"
          >
            <a href={manualDownloadUrl} target="_blank" rel="noreferrer">
              Baixar manual
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full md:w-auto">
            <a href={formDownloadUrl} target="_blank" rel="noreferrer">
              Baixar formulário
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full md:w-auto">
            <a href={calcDownloadUrl} target="_blank" rel="noreferrer">
              Ver cálculo do IDECICLO
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {etapas.map((etapa) => {
          const IconComponent = etapa.icon;
          const isDisabled = !activeCity;

          return (
            <button
              key={etapa.id}
              type="button"
              aria-label={`Ir para ${etapa.title}`}
              onClick={() => handleGoToStep(etapa.route)}
              className="relative flex min-h-[200px] w-full flex-col justify-center rounded-[40px] p-6 text-center text-xl font-semibold tracking-wide shadow-md transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-[1px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: etapa.color,
                boxShadow: "0px 6px 8px 0px rgba(0, 0, 0, 0.25)",
              }}
              disabled={isDisabled}
            >
              <div className="absolute left-1/2 top-[-3rem] -translate-x-1/2 rounded-full bg-white p-4 shadow-lg">
                <IconComponent className="h-12 w-12" style={{ color: etapa.color }} />
              </div>
              <div className="mt-8">
                <h3 className="mb-1 text-lg font-semibold">{etapa.title}</h3>
                <h4 className="mb-2 text-xl font-bold">{etapa.subtitle}</h4>
                <p className="text-sm leading-tight opacity-90">{etapa.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-2 text-lg font-semibold">Como funciona?</h3>
          <p className="mx-auto max-w-2xl text-gray-600">
            Primeiro, escolha a cidade nesta página. Depois, revise os dados, selecione um trecho
            e só então abra o formulário IDECICLO para avaliar a estrutura escolhida.
          </p>
          <p className="mt-4 text-sm font-medium text-gray-500">
            Para uma melhor visualização, acesse pelo computador.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Avaliacao;
