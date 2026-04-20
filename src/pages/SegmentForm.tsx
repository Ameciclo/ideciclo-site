import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Wifi, WifiOff } from "lucide-react";
import Page1 from "./Page1";
import Page2 from "./Page2";
import Page3 from "./Page3";
import Page4 from "./Page4";
import Page5 from "./Page5";
import Page6 from "./Page6";
import Page7 from "./Page7";
import Page8 from "./Page8";
import Page9 from "./Page9";
import { useToast } from "@/hooks/use-toast";
import {
  createFormInDB,
  fetchCityFromDB,
  fetchFormById,
  fetchSegmentById,
  getFormBySegmentId,
  updateFormInDB,
  updateSegmentEvaluationStatus,
} from "@/services/database";
import { getInitialRatingModes, getScoreBreakdown } from "@/utils/idecicloAssessment";
import { IdecicloFormData } from "@/types/idecicloForm";

const DRAFT_PREFIX = "ideciclo-draft";
const PENDING_SUBMISSIONS_KEY = "ideciclo-pending-submissions";

const buildDraftKey = (segmentId?: string | null) =>
  segmentId ? `${DRAFT_PREFIX}:${segmentId}` : DRAFT_PREFIX;

const createEmptyFormData = (segmentId?: string | null): IdecicloFormData => ({
  researcher: "",
  date: new Date().toISOString().split("T")[0],
  city: "",
  city_id: "",
  neighborhood: "",
  id: segmentId || "",
  segment_id: segmentId || "",
  segment_name: "",
  extension_m: 0,
  velocity_kmh: 0,
  start_point: "",
  end_point: "",
  road_hierarchy: "",
  blocks_count: 0,
  intersections_count: 0,
  relevant_intersections_count: 0,
  connected_intersections_count: 0,
  pedestrian_flow_per_hour_per_meter: 0,
  infra_typology: "",
  infra_flow: "unidirectional",
  position_on_road: "pista_calcada",
  width_meters: 0,
  includes_gutter: false,
  speed_measures: [],
  avg_distance_measures_m: 0,
  pavement_type: "A",
  conservation_state: "A",
  separation_devices_ciclofaixa: "D",
  separation_devices_ciclovia: "A",
  separation_devices_calcada: "D",
  devices_conservation: "A",
  lateral_spacing_type: "linha",
  lateral_spacing_width_m: 0,
  spacing_conservation: "A",
  space_identification: "A",
  identification_conservation: "A",
  pictograms_per_block: 0,
  pictograms_cover_all_blocks: false,
  pictograms_conservation: "A",
  regulation_signs_per_block: 0,
  signs_both_directions: false,
  vertical_signs_conservation: "A",
  traffic_lanes_count: 2,
  signalized_crossings_per_block: 0,
  bus_school_conflict: false,
  horizontal_obstacles: false,
  vertical_obstacles: false,
  side_change_mid_block: false,
  opposite_flow_direction: false,
  intersection_signaling: "A",
  intersection_conservation: "A",
  connection_accessibility: "A",
  traffic_lanes_per_direction: 1,
  mixed_lane_width_m: 2.7,
  has_intersection_traffic_calming: false,
  motorized_conflicts: [],
  has_lighting_posts: true,
  lighting_post_type: "A",
  lighting_distance_m: 0,
  lighting_directed: false,
  lighting_barriers: false,
  lighting_distance_to_infra: "A",
  shading_coverage: "A",
  vegetation_size: "A",
  blocks_with_cycling_furniture: 0,
  cycling_furniture: [],
  observations: "",
  rating_modes: getInitialRatingModes(),
  manual_ratings: {},
});

const mergeWithDefaults = (
  segmentId: string | null | undefined,
  incoming: Partial<IdecicloFormData> | null | undefined
): IdecicloFormData => {
  const defaults = createEmptyFormData(segmentId);
  const data = incoming ?? {};

  return {
    ...defaults,
    ...data,
    id: data.id || defaults.id,
    segment_id: data.segment_id || defaults.segment_id,
    city_id: data.city_id || defaults.city_id,
    rating_modes: {
      ...defaults.rating_modes,
      ...(data.rating_modes || {}),
    },
    manual_ratings: {
      ...(data.manual_ratings || {}),
    },
  };
};

interface PendingSubmission {
  segment_id: string;
  saved_at: string;
  payload: Record<string, unknown>;
}

interface AxisRibbonProps {
  tone: "a" | "b" | "c" | "d" | "e";
  title: string;
  badges?: React.ReactNode;
}

const AxisRibbon: React.FC<AxisRibbonProps> = ({ tone, title, badges }) => (
  <div className="space-y-3">
    <div className={`ideciclo-axis-ribbon ideciclo-axis-ribbon-${tone}`}>
      <h3 className="text-xl font-bold tracking-tight text-black md:text-2xl">{title}</h3>
    </div>
    {badges ? <div className="flex flex-wrap items-center gap-3">{badges}</div> : null}
  </div>
);

const getPendingSubmissions = (): PendingSubmission[] => {
  try {
    const raw = localStorage.getItem(PENDING_SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Erro ao ler fila local:", error);
    return [];
  }
};

const savePendingSubmission = (segmentId: string, payload: Record<string, unknown>) => {
  const pending = getPendingSubmissions().filter(
    (item) => item.segment_id !== segmentId
  );

  pending.push({
    segment_id: segmentId,
    saved_at: new Date().toISOString(),
    payload,
  });

  localStorage.setItem(PENDING_SUBMISSIONS_KEY, JSON.stringify(pending));
};

const removePendingSubmission = (segmentId: string) => {
  const pending = getPendingSubmissions().filter(
    (item) => item.segment_id !== segmentId
  );
  localStorage.setItem(PENDING_SUBMISSIONS_KEY, JSON.stringify(pending));
};

const SegmentForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { segmentId, formId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [existingFormId, setExistingFormId] = useState<string | null>(formId || null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [lastLocalSaveAt, setLastLocalSaveAt] = useState<string | null>(null);
  const [formData, setFormData] = useState<IdecicloFormData>(() => createEmptyFormData(segmentId));
  const draftKey = buildDraftKey(segmentId || formData.segment_id || formData.id);
  const liveSummary = useMemo(() => getScoreBreakdown(formData), [formData]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        let nextFormData = createEmptyFormData(segmentId);

        if (formId) {
          const dbForm = await fetchFormById(formId);
          if (!dbForm) throw new Error("Formulário não encontrado");

          setExistingFormId(formId);
          nextFormData = mergeWithDefaults(dbForm.segment_id || segmentId, {
            ...dbForm.responses,
            id: dbForm.segment_id || segmentId,
            segment_id: dbForm.segment_id || segmentId,
            city_id: dbForm.city_id || "",
          });
        } else if (segmentId) {
          const existingForm = await getFormBySegmentId(segmentId);

          if (existingForm) {
            setExistingFormId(existingForm.id);
            nextFormData = mergeWithDefaults(segmentId, {
              ...existingForm.responses,
              id: segmentId,
              segment_id: segmentId,
              city_id: existingForm.city_id || "",
            });
          } else {
            const segmentData = await fetchSegmentById(segmentId);
            if (!segmentData) throw new Error("Trecho não encontrado");

            let cityName = "";
            if (segmentData.id_cidade) {
              const cityData = await fetchCityFromDB(segmentData.id_cidade);
              cityName = cityData?.name || "";
            }

            nextFormData = mergeWithDefaults(segmentId, {
              id: segmentId,
              segment_id: segmentId,
              segment_name: segmentData.name || "",
              infra_typology: segmentData.type || "",
              city: cityName,
              city_id: segmentData.id_cidade || "",
              extension_m: segmentData.length || 0,
              road_hierarchy: segmentData.classification || "",
              classification: segmentData.classification || undefined,
            });
          }
        }

        try {
          const rawDraft = localStorage.getItem(draftKey);
          if (rawDraft) {
            const draft = JSON.parse(rawDraft);
            nextFormData = mergeWithDefaults(segmentId, draft.data);
            setLastLocalSaveAt(draft.savedAt || null);
          }
        } catch (draftError) {
          console.error("Erro ao recuperar rascunho local:", draftError);
        }

        setFormData(nextFormData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do formulário.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [draftKey, formId, segmentId, toast]);

  useEffect(() => {
    if (isLoading) return;

    const timer = window.setTimeout(() => {
      try {
        const payload = {
          savedAt: new Date().toISOString(),
          data: formData,
        };

        localStorage.setItem(draftKey, JSON.stringify(payload));
        setLastLocalSaveAt(payload.savedAt);
      } catch (error) {
        console.error("Erro ao salvar rascunho local:", error);
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [draftKey, formData, isLoading]);

  const handleDataChange = (newData: Partial<IdecicloFormData>) => {
    setFormData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  const handleSubmit = async () => {
    const currentSegmentId = segmentId || formData.segment_id || formData.id;
    const cityId = formData.city_id || sessionStorage.getItem("selectedCityId");

    if (!cityId) {
      toast({
        title: "Cidade ausente",
        description: "Não foi possível identificar a cidade deste trecho.",
        variant: "destructive",
      });
      return;
    }

    if (!currentSegmentId) {
      toast({
        title: "Trecho ausente",
        description: "Não foi possível identificar o trecho avaliado.",
        variant: "destructive",
      });
      return;
    }

    const enrichedResponses = {
      ...formData,
      city_id: cityId,
      segment_id: currentSegmentId,
      score_breakdown: liveSummary,
      criterion_ratings: liveSummary.resolvedRatings,
      auto_ratings: liveSummary.autoRatings,
      total_score: liveSummary.total,
      saved_offline: !isOnline,
      last_local_save_at: lastLocalSaveAt,
    };

    const formToSave = {
      segment_id: currentSegmentId,
      city_id: cityId,
      researcher: formData.researcher || "",
      date: formData.date || null,
      street_name: formData.segment_name || null,
      neighborhood: formData.neighborhood || null,
      extension: formData.extension_m || null,
      start_point: formData.start_point || null,
      end_point: formData.end_point || null,
      hierarchy: formData.road_hierarchy || null,
      velocity: formData.velocity_kmh || null,
      blocks_count: formData.blocks_count || null,
      intersections_count: formData.intersections_count || null,
      observations: formData.observations || null,
      responses: enrichedResponses,
    };

    if (!isOnline) {
      savePendingSubmission(currentSegmentId, formToSave);
      toast({
        title: "Rascunho salvo offline",
        description:
          "Você está sem conexão. O formulário ficou guardado no aparelho para envio posterior.",
      });
      return;
    }

    try {
      let result;
      const isUpdating = Boolean(existingFormId);

      if (isUpdating && existingFormId) {
        result = await updateFormInDB(existingFormId, formToSave);
      } else {
        const generatedFormId = `form-${currentSegmentId}-${Date.now()}`;
        result = await createFormInDB({ ...formToSave, id: generatedFormId });

        if (result) {
          await updateSegmentEvaluationStatus(currentSegmentId, generatedFormId);
          setExistingFormId(generatedFormId);
        }
      }

      if (!result) {
        throw new Error("Não foi possível persistir os dados no banco.");
      }

      localStorage.removeItem(draftKey);
      removePendingSubmission(currentSegmentId);

      toast({
        title: existingFormId ? "Avaliação atualizada" : "Avaliação salva",
        description: `Nota calculada: ${liveSummary.total.toFixed(1)}/100.`,
      });

      navigate("/avaliacao");
    } catch (error) {
      console.error("Error saving form:", error);
      savePendingSubmission(currentSegmentId, formToSave);
      toast({
        title: "Falha no envio online",
        description:
          "Guardei o conteúdo como rascunho local para você tentar de novo quando a conexão estabilizar.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {existingFormId ? "Editar Avaliação" : "Nova Avaliação"} de Estrutura
          </h2>
          <p className="text-muted-foreground">
            Formulário híbrido do IDECICLO em página única, com cálculo por parâmetro, override manual e rascunho offline.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/avaliacao")}>
          Voltar
        </Button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Estado</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="flex items-center gap-2 font-medium">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-emerald-600" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-amber-600" />
                  <span>Offline</span>
                </>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              O preenchimento segue funcionando e fica salvo localmente.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pontuação Atual</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-3xl font-bold">{liveSummary.total.toFixed(1)}/100</div>
            <p className="mt-2 text-sm text-muted-foreground">
              {liveSummary.eliminated
                ? "Estrutura eliminada pela regra A1."
                : "Atualizada conforme os parâmetros e overrides manuais."}
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rascunho Local</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <Badge variant="outline">
              {lastLocalSaveAt
                ? `Último autosave: ${new Date(lastLocalSaveAt).toLocaleString("pt-BR")}`
                : "Ainda sem autosave"}
            </Badge>
            <p className="mt-2 text-sm text-muted-foreground">
              O rascunho fica preso a este trecho e a este aparelho.
            </p>
          </div>
        </Card>
      </div>

      {isLoading ? (
        <Card className="mb-6 p-6 text-center">
          <p>Carregando dados do segmento...</p>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Formulário de Avaliação</CardTitle>
            <CardDescription>
              Os critérios do manual podem ser expandidos individualmente e a revisão final fica no fim da página.
            </CardDescription>
          </CardHeader>
          <div className="space-y-8 px-6 pb-2">
            <section className="space-y-6">
              <AxisRibbon
                tone="a"
                title="A. Planejamento Cicloviário"
                badges={
                  <Badge variant="outline">
                    A: {liveSummary.sections?.A?.score?.toFixed?.(1) ?? "0.0"}/
                    {liveSummary.sections?.A?.max ?? 0}
                  </Badge>
                }
              />
              <Page1
                data={formData}
                onDataChange={handleDataChange}
                segmentName={formData.segment_name}
                segmentType={formData.infra_typology}
              />
              <Page2
                data={formData}
                onDataChange={handleDataChange}
                segmentType={formData.infra_typology}
              />
            </section>

            <section className="space-y-6">
              <AxisRibbon
                tone="b"
                title="B. Projeto Cicloviário ao Longo da Quadra"
                badges={
                  <>
                    <Badge variant="outline">
                      B: {liveSummary.sections?.B?.score?.toFixed?.(1) ?? "0.0"}/
                      {liveSummary.sections?.B?.max ?? 0}
                    </Badge>
                    <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-800">
                      E parcial:{" "}
                      {(
                        ((liveSummary.sections?.E?.items?.E2?.points as number | null) ?? 0) +
                        ((liveSummary.sections?.E?.items?.E3?.points as number | null) ?? 0) +
                        ((liveSummary.sections?.E?.items?.E4?.points as number | null) ?? 0)
                      ).toFixed(1)}
                    </Badge>
                  </>
                }
              />
              <Page3 data={formData} onDataChange={handleDataChange} />
              <Page4 data={formData} onDataChange={handleDataChange} />
              <Page5 data={formData} onDataChange={handleDataChange} />
              <Page6 data={formData} onDataChange={handleDataChange} />
            </section>

            <section className="space-y-6">
              <AxisRibbon
                tone="c"
                title="C. Projeto Cicloviário nas Interseções"
                badges={
                  <>
                    <Badge variant="outline">
                      C: {liveSummary.sections?.C?.score?.toFixed?.(1) ?? "0.0"}/
                      {liveSummary.sections?.C?.max ?? 0}
                    </Badge>
                    <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-800">
                      E1: {liveSummary.sections?.E?.items?.E1?.points ?? 0}
                    </Badge>
                  </>
                }
              />
              <Page7 data={formData} onDataChange={handleDataChange} />
            </section>

            <section className="space-y-6">
              <AxisRibbon
                tone="d"
                title="D. Urbanidade"
                badges={
                  <Badge variant="outline">
                    D: {liveSummary.sections?.D?.score?.toFixed?.(1) ?? "0.0"}/
                    {liveSummary.sections?.D?.max ?? 0}
                  </Badge>
                }
              />
              <Page8 data={formData} onDataChange={handleDataChange} />
            </section>

            <section className="space-y-6">
              <AxisRibbon
                tone="e"
                title="E. Manutenção e Revisão Final"
                badges={<Badge>{liveSummary.total.toFixed(1)}/100</Badge>}
              />
              <Page9 data={formData} onDataChange={handleDataChange} isOnline={isOnline} />
            </section>
          </div>

          <div className="flex justify-end px-6 py-6">
            <Button onClick={handleSubmit} size="lg">
              <Save className="mr-2 h-4 w-4" />
              {isOnline ? "Salvar Avaliação" : "Guardar Rascunho Offline"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SegmentForm;
