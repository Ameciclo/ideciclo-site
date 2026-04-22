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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import SegmentPreviewMap from "@/components/SegmentPreviewMap";
import { Segment } from "@/types";

const DRAFT_PREFIX = "ideciclo-draft";
const PENDING_SUBMISSIONS_KEY = "ideciclo-pending-submissions";

const buildDraftKey = (segmentId?: string | null) =>
  segmentId ? `${DRAFT_PREFIX}:${segmentId}` : DRAFT_PREFIX;

const clampMinimumOne = (value: unknown) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 1;
  return Math.max(1, Math.round(numeric));
};

const clampNonNegative = (value: unknown) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.round(numeric));
};

const getSessionSelectedSegmentId = () => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("selectedSegmentId");
};

const getSessionSelectedCityId = () => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("selectedCityId");
};

const HIERARCHY_OPTIONS = [
  { value: "local", label: "Local" },
  { value: "alimentadora", label: "Alimentadora" },
  { value: "estrutural", label: "Estrutural" },
] as const;

const normalizeHierarchyValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const toSegmentPreview = (
  segmentData: {
    id?: string;
    id_cidade?: string;
    name?: string;
    type?: Segment["type"];
    length?: number;
    neighborhood?: string | null;
    geometry?: unknown;
    selected?: boolean | null;
    evaluated?: boolean | null;
    id_form?: string | null;
    is_merged?: boolean | null;
    parent_segment_id?: string | null;
    merged_segments?: unknown;
    classification?: string | null;
  } | null
): Segment | null => {
  if (!segmentData) return null;

  return {
    id: segmentData.id,
    id_cidade: segmentData.id_cidade,
    name: segmentData.name || "",
    type: segmentData.type,
    length: segmentData.length || 0,
    neighborhood: segmentData.neighborhood || undefined,
    geometry: segmentData.geometry,
    selected: Boolean(segmentData.selected),
    evaluated: Boolean(segmentData.evaluated),
    id_form: segmentData.id_form || undefined,
    is_merged: Boolean(segmentData.is_merged),
    parent_segment_id: segmentData.parent_segment_id || undefined,
    merged_segments: Array.isArray(segmentData.merged_segments)
      ? segmentData.merged_segments
      : undefined,
    classification: segmentData.classification || undefined,
  };
};

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
  blocks_count: 1,
  intersections_count: 0,
  relevant_intersections_count: 0,
  connected_intersections_count: 0,
  pedestrian_flow_per_hour_per_meter: 0,
  infra_typology: "",
  infra_flow: "unidirectional",
  position_on_road: "pista_calcada",
  width_meters: 0,
  width_measurements_m: [],
  includes_gutter: false,
  speed_measures: [],
  avg_distance_measures_m: 0,
  pavement_type: "",
  conservation_state: "",
  separation_devices_ciclofaixa: "",
  separation_devices_ciclovia: "",
  separation_devices_calcada: "",
  devices_conservation: "",
  lateral_spacing_type: "linha",
  lateral_spacing_width_m: 0,
  spacing_conservation: "",
  space_identification: "",
  identification_conservation: "",
  pictograms_per_block: 0,
  pictograms_cover_all_blocks: false,
  pictograms_conservation: "",
  regulation_signs_per_block: 0,
  signs_both_directions: null,
  vertical_signs_conservation: "",
  traffic_lanes_count: 2,
  signalized_crossings_per_block: 0,
  bus_school_conflict: false,
  horizontal_obstacles: false,
  vertical_obstacles: false,
  side_change_mid_block: false,
  opposite_flow_direction: false,
  intersection_signaling: "",
  intersection_conservation: "",
  connection_accessibility: "",
  traffic_lanes_per_direction: 1,
  mixed_lane_width_m: 2.7,
  has_intersection_traffic_calming: false,
  motorized_conflicts: [],
  has_lighting_posts: null,
  lighting_post_type: "",
  lighting_distance_m: 0,
  lighting_directed: null,
  lighting_barriers: null,
  lighting_distance_to_infra: "",
  shading_coverage: "",
  vegetation_size: "",
  blocks_with_cycling_furniture: 0,
  cycling_furniture: [],
  observations: "",
  rating_modes: getInitialRatingModes(),
  manual_ratings: {},
  touched_fields: {},
  criterion_workflow_state: {},
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

const hydrateHeaderFields = async (
  segmentId: string | null | undefined,
  data: IdecicloFormData
): Promise<IdecicloFormData> => {
  const currentSegmentId = segmentId || data.segment_id || data.id;
  if (!currentSegmentId) return data;

  const segmentData = await fetchSegmentById(currentSegmentId);
  if (!segmentData) return data;

  let cityName = data.city || "";
  const cityId = data.city_id || segmentData.id_cidade || "";

  if (!cityName && cityId) {
    const cityData = await fetchCityFromDB(cityId);
    cityName = cityData?.name || "";
  }

  return {
    ...data,
    id: data.id || currentSegmentId,
    segment_id: data.segment_id || currentSegmentId,
    city: data.city || cityName,
    city_id: data.city_id || cityId,
    neighborhood: data.neighborhood || segmentData.neighborhood || "",
    segment_name: data.segment_name || segmentData.name || "",
    infra_typology: data.infra_typology || segmentData.type || "",
    extension_m: data.extension_m || segmentData.length || 0,
    road_hierarchy: data.road_hierarchy || segmentData.classification || "",
    classification: data.classification || segmentData.classification || undefined,
    blocks_count:
      data.touched_fields?.blocks_count || data.blocks_count !== 1
        ? data.blocks_count
        : clampMinimumOne(segmentData.blocks_count),
    intersections_count:
      data.touched_fields?.intersections_count || data.intersections_count !== 0
        ? data.intersections_count
        : clampNonNegative(segmentData.intersections_count),
  };
};

const normalizeEvaluationCounts = (data: IdecicloFormData): IdecicloFormData => {
  const intersectionsCount = clampNonNegative(data.intersections_count);
  const relevantIntersectionsCount = Math.min(
    clampNonNegative(data.relevant_intersections_count),
    intersectionsCount
  );
  const connectedIntersectionsCount = Math.min(
    clampNonNegative(data.connected_intersections_count),
    relevantIntersectionsCount
  );

  return {
    ...data,
    blocks_count: clampMinimumOne(data.blocks_count),
    intersections_count: intersectionsCount,
    relevant_intersections_count: relevantIntersectionsCount,
    connected_intersections_count: connectedIntersectionsCount,
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

const HeaderField = ({
  label,
  value,
  readOnly = false,
  type = "text",
  name,
  onChange,
}: {
  label: string;
  value: string | number;
  readOnly?: boolean;
  type?: string;
  name: keyof IdecicloFormData;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
    <input
      className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ${
        readOnly ? "bg-gray-100 text-muted-foreground" : "bg-background"
      }`}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      disabled={readOnly}
    />
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
  const sessionSegmentId = getSessionSelectedSegmentId();
  const effectiveSegmentId = segmentId || sessionSegmentId;
  const sessionCityId = getSessionSelectedCityId();
  const [isLoading, setIsLoading] = useState(false);
  const [existingFormId, setExistingFormId] = useState<string | null>(formId || null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [lastLocalSaveAt, setLastLocalSaveAt] = useState<string | null>(null);
  const [originalSegmentType, setOriginalSegmentType] = useState("");
  const [originalRoadHierarchy, setOriginalRoadHierarchy] = useState("");
  const [originalSegmentCounts, setOriginalSegmentCounts] = useState<{
    blocks_count: number | null;
    intersections_count: number | null;
    relevant_intersections_count: number | null;
    connected_intersections_count: number | null;
  }>({
    blocks_count: null,
    intersections_count: null,
    relevant_intersections_count: null,
    connected_intersections_count: null,
  });
  const [segmentPreview, setSegmentPreview] = useState<Segment | null>(null);
  const [allowHierarchyEdit, setAllowHierarchyEdit] = useState(false);
  const [formData, setFormData] = useState<IdecicloFormData>(() =>
    createEmptyFormData(effectiveSegmentId)
  );
  const draftKey = buildDraftKey(effectiveSegmentId || formData.segment_id || formData.id);
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
    const loadOriginalSegmentContext = async () => {
      const currentSegmentId = effectiveSegmentId || formData.segment_id || formData.id;
      if (!currentSegmentId) return;

      const segmentData = await fetchSegmentById(currentSegmentId);
      setSegmentPreview(toSegmentPreview(segmentData));
      setOriginalSegmentType(segmentData?.type || "");
      setOriginalRoadHierarchy(segmentData?.classification || "");
      setOriginalSegmentCounts({
        blocks_count:
          typeof segmentData?.blocks_count === "number" ? segmentData.blocks_count : null,
        intersections_count:
          typeof segmentData?.intersections_count === "number"
            ? segmentData.intersections_count
            : null,
        relevant_intersections_count:
          typeof segmentData?.relevant_intersections_count === "number"
            ? segmentData.relevant_intersections_count
            : null,
        connected_intersections_count:
          typeof segmentData?.connected_intersections_count === "number"
            ? segmentData.connected_intersections_count
            : null,
      });
    };

    loadOriginalSegmentContext();
  }, [effectiveSegmentId, formData.id, formData.segment_id]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        let nextFormData = createEmptyFormData(effectiveSegmentId);

        if (formId) {
          const dbForm = await fetchFormById(formId);
          if (!dbForm) throw new Error("Formulário não encontrado");

          setExistingFormId(formId);
          nextFormData = mergeWithDefaults(dbForm.segment_id || effectiveSegmentId, {
            ...dbForm.responses,
            id: dbForm.segment_id || effectiveSegmentId,
            segment_id: dbForm.segment_id || effectiveSegmentId,
            city_id: dbForm.city_id || sessionCityId || "",
          });
          nextFormData = await hydrateHeaderFields(
            dbForm.segment_id || effectiveSegmentId,
            nextFormData
          );
        } else if (effectiveSegmentId) {
          const existingForm = await getFormBySegmentId(effectiveSegmentId);

          if (existingForm) {
            setExistingFormId(existingForm.id);
            nextFormData = mergeWithDefaults(effectiveSegmentId, {
              ...existingForm.responses,
              id: effectiveSegmentId,
              segment_id: effectiveSegmentId,
              city_id: existingForm.city_id || sessionCityId || "",
            });
            nextFormData = await hydrateHeaderFields(effectiveSegmentId, nextFormData);
          } else {
            const segmentData = await fetchSegmentById(effectiveSegmentId);
            if (!segmentData) throw new Error("Trecho não encontrado");

            let cityName = "";
            const resolvedCityId = segmentData.id_cidade || sessionCityId || "";
            if (resolvedCityId) {
              const cityData = await fetchCityFromDB(resolvedCityId);
              cityName = cityData?.name || "";
            }

            nextFormData = mergeWithDefaults(effectiveSegmentId, {
              id: effectiveSegmentId,
              segment_id: effectiveSegmentId,
              segment_name: segmentData.name || "",
              infra_typology: segmentData.type || "",
              city: cityName,
              city_id: resolvedCityId,
              extension_m: segmentData.length || 0,
              neighborhood: segmentData.neighborhood || "",
              road_hierarchy: segmentData.classification || "",
              classification: segmentData.classification || undefined,
              blocks_count:
                typeof segmentData.blocks_count === "number" ? segmentData.blocks_count : 1,
              intersections_count:
                typeof segmentData.intersections_count === "number"
                  ? segmentData.intersections_count
                  : 0,
              relevant_intersections_count:
                typeof segmentData.relevant_intersections_count === "number"
                  ? segmentData.relevant_intersections_count
                  : 0,
              connected_intersections_count:
                typeof segmentData.connected_intersections_count === "number"
                  ? segmentData.connected_intersections_count
                  : 0,
            });
          }
        }

        try {
          const rawDraft = localStorage.getItem(draftKey);
          if (rawDraft) {
            const draft = JSON.parse(rawDraft);
            nextFormData = mergeWithDefaults(effectiveSegmentId, draft.data);
            setLastLocalSaveAt(draft.savedAt || null);
          }
        } catch (draftError) {
          console.error("Erro ao recuperar rascunho local:", draftError);
        }

        setFormData(normalizeEvaluationCounts(nextFormData));
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
  }, [draftKey, effectiveSegmentId, formId, sessionCityId, toast]);

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
    setFormData((prevData) => {
      const incomingTouched = newData.touched_fields || {};
      const { touched_fields, ...rest } = newData;
      const autoTouched = Object.keys(rest).reduce<Record<string, boolean>>((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});

      return normalizeEvaluationCounts({
        ...prevData,
        ...rest,
        touched_fields: {
          ...(prevData.touched_fields || {}),
          ...autoTouched,
          ...incomingTouched,
        },
      });
    });
  };

  const handleHeaderInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    handleDataChange({ [name]: processedValue } as Partial<IdecicloFormData>);
  };

  const handleHierarchyEditToggle = (checked: boolean) => {
    setAllowHierarchyEdit(checked);

    if (!checked) {
      handleDataChange({
        road_hierarchy: originalRoadHierarchy,
        classification: originalRoadHierarchy || undefined,
      });
    }
  };

  const handleHierarchySelection = (value: string) => {
    handleDataChange({
      road_hierarchy: value,
      classification: value,
    });
  };

  const handleSubmit = async () => {
    const currentSegmentId = effectiveSegmentId || formData.segment_id || formData.id;
    const cityId = formData.city_id || sessionCityId;

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
            Formulario hibrido do IDECICLO em duas telas: coleta em campo e revisao final com
            override manual e rascunho offline.
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

      <Card className="mb-6 overflow-hidden">
        <CardHeader>
          <CardTitle>Mapa do Trecho Avaliado</CardTitle>
          <CardDescription>
            Visualizacao do segmento selecionado para apoio ao preenchimento em campo.
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">Trecho:</strong> {formData.segment_name || "Nao informado"}
            </span>
            <span>
              <strong className="text-foreground">Cidade:</strong> {formData.city || "Nao informada"}
            </span>
          </div>
          {segmentPreview ? (
            <SegmentPreviewMap
              segment={segmentPreview}
              className="h-[340px] overflow-hidden rounded-[24px] border"
            />
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-[24px] border border-dashed text-center text-muted-foreground">
              Mapa indisponivel para este trecho.
            </div>
          )}
        </div>
      </Card>

      <Card className="mb-6">
        <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Navegação do formulário</div>
            <div className="mt-1 text-lg font-semibold">
              {currentStep === 1 ? "Página 1 de 2 · Coleta em Campo" : "Página 2 de 2 · Revisão Final"}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={currentStep === 1 ? "default" : "outline"}
              onClick={() => setCurrentStep(1)}
            >
              Coleta
            </Button>
            <Button
              type="button"
              variant={currentStep === 2 ? "default" : "outline"}
              onClick={() => setCurrentStep(2)}
            >
              Revisão Final
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="mb-6 p-6 text-center">
          <p>Carregando dados do segmento...</p>
        </Card>
      ) : (
        <>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cabeçalho da Avaliação</CardTitle>
            <CardDescription>
              Identificacao do trecho e dados gerais antes dos blocos do formulario em papel.
            </CardDescription>
          </CardHeader>
          <div className="grid grid-cols-1 gap-4 px-6 pb-6 md:grid-cols-2 lg:grid-cols-3">
            <HeaderField
              label="Pesquisador(a):"
              name="researcher"
              value={formData.researcher || ""}
              onChange={handleHeaderInputChange}
            />
            <HeaderField
              label="Data:"
              name="date"
              type="date"
              value={formData.date || ""}
              onChange={handleHeaderInputChange}
            />
            <HeaderField
              label="Cidade:"
              name="city"
              value={formData.city || ""}
              readOnly
            />
            <HeaderField
              label="Bairro:"
              name="neighborhood"
              value={formData.neighborhood || ""}
              onChange={handleHeaderInputChange}
            />
            <HeaderField
              label="ID:"
              name="id"
              value={formData.id || ""}
              readOnly
            />
            <HeaderField
              label="Nome Trecho:"
              name="segment_name"
              value={formData.segment_name || ""}
              readOnly
            />
            <HeaderField
              label="Extensão (m):"
              name="extension_m"
              type="number"
              value={formData.extension_m || ""}
              readOnly
            />
            <HeaderField
              label="Início do trecho:"
              name="start_point"
              value={formData.start_point || ""}
              onChange={handleHeaderInputChange}
            />
            <HeaderField
              label="Fim do trecho:"
              name="end_point"
              value={formData.end_point || ""}
              onChange={handleHeaderInputChange}
            />
            <div className="rounded-xl border p-4 md:col-span-2 lg:col-span-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Hierarquia viária:
                  </label>
                  <p className="text-sm text-muted-foreground">
                    A hierarquia original vem do cadastro do trecho e pode ser corrigida em campo
                    se houver erro.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline">
                    Original: {originalRoadHierarchy || "Nao informada"}
                  </Badge>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="allow_hierarchy_edit" className="text-sm">
                      Corrigir hierarquia em campo
                    </Label>
                    <Switch
                      id="allow_hierarchy_edit"
                      checked={allowHierarchyEdit}
                      onCheckedChange={handleHierarchyEditToggle}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {HIERARCHY_OPTIONS.map((option) => {
                  const isSelected =
                    normalizeHierarchyValue(formData.road_hierarchy || "") === option.value;

                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant="ghost"
                      aria-disabled={!allowHierarchyEdit}
                      onClick={() => {
                        if (!allowHierarchyEdit) return;
                        handleHierarchySelection(option.value);
                      }}
                      className={`h-auto rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                        isSelected
                          ? "border-amber-300 bg-amber-50 text-amber-900 opacity-100"
                          : "border-slate-200 bg-white text-slate-500 opacity-45"
                      } ${allowHierarchyEdit ? "cursor-pointer hover:opacity-85" : "cursor-default"}`}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                {allowHierarchyEdit
                  ? "Selecione acima a hierarquia corrigida."
                  : "Ao desligar, a hierarquia volta para o valor original do trecho."}
              </p>

              {allowHierarchyEdit &&
              normalizeHierarchyValue(formData.road_hierarchy || "") !==
                normalizeHierarchyValue(originalRoadHierarchy || "") ? (
                <p className="mt-2 text-sm font-medium text-amber-700">
                  A hierarquia foi corrigida em campo e esta diferente da classificacao original.
                </p>
              ) : null}
            </div>
          </div>
        </Card>

        {currentStep === 1 ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Formulário de Coleta</CardTitle>
              <CardDescription>
                A primeira pagina segue a logica de preenchimento do formulario em papel.
              </CardDescription>
            </CardHeader>
            <div className="space-y-8 px-6 pb-2">
              <section className="space-y-6">
                <AxisRibbon
                  tone="a"
                  title="Caracterizacao do Trecho e Enquadramento Inicial"
                  badges={
                    <>
                      <Badge variant="outline">A1</Badge>
                      <Badge variant="outline">A2</Badge>
                    </>
                  }
                />
                <Page1
                  data={formData}
                  onDataChange={handleDataChange}
                  originalCounts={originalSegmentCounts}
                />
                <Page2
                  data={formData}
                  onDataChange={handleDataChange}
                  segmentType={originalSegmentType}
                />
              </section>

              <section className="space-y-6">
                <AxisRibbon
                  tone="b"
                  title="Espaco Util da Estrutura (B1) e Moderacao de Velocidade (B6)"
                  badges={
                    <>
                      <Badge variant="outline">B1</Badge>
                      <Badge variant="outline">B6</Badge>
                    </>
                  }
                />
                <Page3 data={formData} onDataChange={handleDataChange} />
              </section>

              <section className="space-y-6">
                <AxisRibbon
                  tone="e"
                  title="Pavimento e Conservacao do Piso (B2 / E2)"
                  badges={
                    <>
                      <Badge variant="outline">B2</Badge>
                      <Badge variant="outline">E2</Badge>
                    </>
                  }
                />
                <Page4 data={formData} onDataChange={handleDataChange} />
              </section>

              <section className="space-y-6">
                <AxisRibbon
                  tone="b"
                  title="Delimitacao da Estrutura e Conservacao da Separacao (B3 / E3)"
                  badges={
                    <>
                      <Badge variant="outline">B3</Badge>
                      <Badge variant="outline">E3</Badge>
                    </>
                  }
                />
                <Page5 data={formData} onDataChange={handleDataChange} />
              </section>

              <section className="space-y-6">
                <AxisRibbon
                  tone="b"
                  title="Identificacao do Espaco Cicloviario e Sinalizacao (B4 / E4)"
                  badges={
                    <>
                      <Badge variant="outline">B4</Badge>
                      <Badge variant="outline">E4</Badge>
                    </>
                  }
                />
                <Page6 data={formData} onDataChange={handleDataChange} />
              </section>

              <section className="space-y-6">
                <AxisRibbon
                  tone="c"
                  title="Acessibilidade aos Lados, Riscos e Avaliacao das Intersecoes"
                  badges={
                    <>
                      <Badge variant="outline">B5</Badge>
                      <Badge variant="outline">B7</Badge>
                      <Badge variant="outline">C1</Badge>
                      <Badge variant="outline">C2</Badge>
                      <Badge variant="outline">C3</Badge>
                      <Badge variant="outline">E1</Badge>
                    </>
                  }
                />
                <Page7 data={formData} onDataChange={handleDataChange} />
              </section>

              <section className="space-y-6">
                <AxisRibbon
                  tone="d"
                  title="Iluminacao, Sombreamento e Mobiliario no Entorno"
                  badges={
                    <>
                      <Badge variant="outline">D1</Badge>
                      <Badge variant="outline">D2</Badge>
                      <Badge variant="outline">D3</Badge>
                    </>
                  }
                />
                <Page8 data={formData} onDataChange={handleDataChange} />
              </section>
            </div>

            <div className="flex justify-end px-6 py-6">
              <Button type="button" onClick={() => setCurrentStep(2)} size="lg">
                Ir para a Revisão Final
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Revisão Final</CardTitle>
              <CardDescription>
                Revise as notas, veja o que foi considerado em cada criterio e faca overrides
                manuais quando necessario.
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-2">
              <Page9 data={formData} onDataChange={handleDataChange} isOnline={isOnline} />
            </div>
            <div className="flex flex-col gap-3 px-6 py-6 md:flex-row md:justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                Voltar para a Coleta
              </Button>
              <Button onClick={handleSubmit} size="lg">
                <Save className="mr-2 h-4 w-4" />
                {isOnline ? "Salvar Avaliação" : "Guardar Rascunho Offline"}
              </Button>
            </div>
          </Card>
        )}
        </>
      )}
    </div>
  );
};

export default SegmentForm;
