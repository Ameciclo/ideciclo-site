import { authClient, databaseClient as supabase } from "@/integrations/database/client";
import { City, Segment, Form, Review, SegmentType, RatingType } from "@/types";
import { Database } from "@/integrations/database/types";

// Type aliases for database row types
type CityRow = Database['public']['Tables']['cities']['Row'];
type SegmentRow = Database['public']['Tables']['segments']['Row'];
type FormRow = Database['public']['Tables']['forms']['Row'];
type ReviewRow = Database['public']['Tables']['reviews']['Row'];

const CITY_RANKING_VISIBILITY_STORAGE_KEY = "ideciclo-city-ranking-visibility";

const formatDatabaseError = (context: string, error: unknown): string => {
  if (!error || typeof error !== "object") {
    return context;
  }

  const parts = [
    "message" in error ? error.message : "",
    "details" in error ? error.details : "",
    "hint" in error ? error.hint : "",
    "code" in error ? `(code: ${error.code})` : "",
  ].filter(Boolean);

  return parts.length > 0 ? `${context}: ${parts.join(" | ")}` : context;
};

const getMissingColumnName = (error: unknown): string | null => {
  if (!error || typeof error !== "object") return null;

  const message = [
    "message" in error ? error.message : "",
    "details" in error ? error.details : "",
    "hint" in error ? error.hint : "",
  ]
    .filter(Boolean)
    .join(" ");

  const patterns = [
    /column ["']?([a-zA-Z0-9_.]+)["']?/i,
    /Could not find the ['"]?([a-zA-Z0-9_.]+)['"]? column/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      return match[1].split(".").pop() || match[1];
    }
  }

  return null;
};

const readCityRankingVisibilityMap = (): Record<string, boolean> => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(CITY_RANKING_VISIBILITY_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed as Record<string, boolean> : {};
  } catch (error) {
    console.warn("Failed to read ranking visibility map from localStorage:", error);
    return {};
  }
};

const writeCityRankingVisibilityMap = (value: Record<string, boolean>) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      CITY_RANKING_VISIBILITY_STORAGE_KEY,
      JSON.stringify(value)
    );
  } catch (error) {
    console.warn("Failed to write ranking visibility map to localStorage:", error);
  }
};

const setLocalCityRankingVisibility = (cityId: string, visible: boolean) => {
  const current = readCityRankingVisibilityMap();
  current[cityId] = visible;
  writeCityRankingVisibilityMap(current);
};

const fetchAuthDb = async <T>(
  input: RequestInfo,
  init?: Omit<RequestInit, "body"> & { body?: unknown }
): Promise<T> => {
  const response = await fetch(input, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
    body:
      init && "body" in init
        ? JSON.stringify(init.body ?? {})
        : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String(payload.error)
        : "Erro inesperado ao acessar a API autenticada.";
    throw new Error(message);
  }

  return payload as T;
};

export const getLocalCityRankingVisibility = (cityId: string): boolean | null => {
  const current = readCityRankingVisibilityMap();
  return typeof current[cityId] === "boolean" ? current[cityId] : null;
};

const resolveDatabaseSegmentId = async (
  segmentId: string,
  cityId?: string
): Promise<{ dbId: string; cityId?: string } | null> => {
  if (segmentId.includes("_")) {
    return { dbId: segmentId, cityId };
  }

  if (cityId) {
    return { dbId: `${cityId}_${segmentId}`, cityId };
  }

  const exactMatch = await supabase
    .from("segments")
    .select("id, id_cidade")
    .eq("id", segmentId)
    .single();

  if (exactMatch.data) {
    return {
      dbId: exactMatch.data.id,
      cityId: exactMatch.data.id_cidade,
    };
  }

  const likeMatch = await supabase
    .from("segments")
    .select("id, id_cidade")
    .like("id", `%_${segmentId}`)
    .limit(1)
    .maybeSingle();

  if (likeMatch.data) {
    return {
      dbId: likeMatch.data.id,
      cityId: likeMatch.data.id_cidade,
    };
  }

  return null;
};

export const getSegmentByIdForForm = async (
  segmentId: string,
  cityId?: string
): Promise<{ dbId: string; cityId?: string } | null> =>
  resolveDatabaseSegmentId(segmentId, cityId);

// Conversion helpers
const convertCityRowToCity = (row: CityRow): City => ({
  id: row.id,
  name: row.name,
  state: row.state,
  extensao_avaliada: row.extensao_avaliada || 0,
  ideciclo: row.ideciclo || 0,
  vias_estruturais_km: row.vias_estruturais_km || 0,
  vias_alimentadoras_km: row.vias_alimentadoras_km || 0,
  vias_locais_km: row.vias_locais_km || 0,
  show_in_ranking:
    typeof (row as any).show_in_ranking === "boolean"
      ? (row as any).show_in_ranking
      : getLocalCityRankingVisibility(row.id) ?? true,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const convertFormRowToForm = (row: FormRow): Form => ({
  id: row.id,
  segment_id: row.segment_id,
  city_id: row.city_id,
  researcher: row.researcher || '',
  date: row.date || new Date().toISOString(),
  street_name: row.street_name || '',
  neighborhood: row.neighborhood || '',
  extension: row.extension || 0,
  start_point: row.start_point || '',
  end_point: row.end_point || '',
  hierarchy: row.hierarchy || '',
  observations: row.observations || '',
  responses: row.responses as Record<string, any> || {},
  created_at: row.created_at,
  updated_at: row.updated_at,
  velocity: row.velocity || undefined,
  blocks_count: row.blocks_count || undefined,
  intersections_count: row.intersections_count || undefined,
});

const convertSegmentRowToSegment = (row: SegmentRow): Segment => {
  const advanced = (row as any).osm_advanced as Record<string, any> | undefined;

  return {
    id: row.id,
    id_form: row.id_form || undefined,
    id_cidade: row.id_cidade,
    name: row.name,
    type: row.type as SegmentType,
    length: row.length,
    neighborhood: row.neighborhood || undefined,
    geometry: row.geometry,
    selected: row.selected || false,
    evaluated: row.evaluated || false,
    is_merged: row.is_merged || false,
    parent_segment_id: row.parent_segment_id || undefined,
    merged_segments: (row.merged_segments as any[]) || [],
    classification: row.classification || undefined,
    blocks_count:
      (row as any).blocks_count ?? advanced?.blocks_count ?? advanced?.estimated_blocks_count ?? undefined,
    intersections_count:
      (row as any).intersections_count ??
      advanced?.intersections_count ??
      advanced?.estimated_intersections_count ??
      undefined,
    relevant_intersections_count:
      (row as any).relevant_intersections_count ?? advanced?.relevant_intersections_count ?? undefined,
    connected_intersections_count:
      (row as any).connected_intersections_count ?? advanced?.connected_intersections_count ?? undefined,
    osm_id: (row as any).osm_id ?? advanced?.osm_id ?? advanced?.osmId ?? undefined,
    osm_type: (row as any).osm_type ?? advanced?.osm_type ?? advanced?.osmType ?? undefined,
    osm_tags: (row as any).osm_tags ?? advanced?.osm_tags ?? advanced?.rawTags ?? undefined,
    osm_raw: (row as any).osm_raw ?? advanced?.osm_raw ?? undefined,
    osm_confidence:
      (row as any).osm_confidence ??
      advanced?.osm_confidence ??
      advanced?.confidenceByField ??
      undefined,
    ideciclo_prefill:
      (row as any).ideciclo_prefill ?? advanced?.ideciclo_prefill ?? advanced?.interpreted ?? undefined,
    osm_improvement_suggestions:
      (row as any).osm_improvement_suggestions ??
      advanced?.osm_improvement_suggestions ??
      advanced?.suggestions ??
      undefined,
    estimated_blocks_count:
      (row as any).estimated_blocks_count ?? advanced?.estimated_blocks_count ?? undefined,
    estimated_intersections_count:
      (row as any).estimated_intersections_count ?? advanced?.estimated_intersections_count ?? undefined,
    intersections_preview:
      (row as any).intersections_preview ?? advanced?.intersections_preview ?? undefined,
    selected_intersections:
      (row as any).selected_intersections ?? advanced?.selected_intersections ?? undefined,
    osm_advanced: advanced ?? undefined,
  };
};

/**
 * City CRUD operations
 */
export const fetchCityFromDB = async (cityId: string): Promise<City | null> => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('id', cityId)
    .single();

  if (error) {
    console.error("Error fetching city:", error);
    return null;
  }

  return convertCityRowToCity(data);
};

export const saveCityToDB = async (city: Partial<City>): Promise<City | null> => {
  if (!city.id || !city.name || !city.state) {
    throw new Error("Campos obrigatorios da cidade estao ausentes.");
  }
  try {
    const payload = await fetchAuthDb<{ city: CityRow }>("/api/auth/db/cities/upsert", {
      method: "POST",
      body: { city },
    });

    if (typeof city.show_in_ranking === "boolean") {
      setLocalCityRankingVisibility(city.id, city.show_in_ranking);
    }

    return payload.city ? convertCityRowToCity(payload.city) : null;
  } catch (error) {
    const message = formatDatabaseError("Erro ao salvar a cidade no banco de dados", error);
    console.error(message, error);
    throw new Error(message);
  }
};

export const updateCityRankingVisibility = async (
  cityId: string,
  visible: boolean,
  _citySnapshot?: Partial<City>
): Promise<boolean> => {
  try {
    await fetchAuthDb<{ ok: true }>(
      `/api/auth/db/cities/${encodeURIComponent(cityId)}/ranking-visibility`,
      {
        method: "PATCH",
        body: { visible },
      }
    );
    setLocalCityRankingVisibility(cityId, visible);
    return true;
  } catch (error) {
    console.error("Error updating city ranking visibility:", error);
    return false;
  }
};

/**
 * Segment CRUD operations
 */
export const fetchSegmentsFromDB = async (cityId: string): Promise<Segment[]> => {
  // First, clear any existing segments from the cache
  try {
    const cacheName = `segments-${cityId}`;
    if ('caches' in window) {
      const cache = await caches.open(cacheName);
      await cache.delete(`/segments?cityId=${cityId}`);
    }
  } catch (cacheError) {
    console.log("Cache API not supported or error clearing segment cache:", cacheError);
  }
  
  const normalizeSegments = (rows: SegmentRow[]) => {
    const uniqueIds = new Set<string>();

    return rows
      .map((row) => {
        const segment = convertSegmentRowToSegment(row);

        if (segment.id.startsWith(`${cityId}_`)) {
          segment.id = segment.id.substring(cityId.length + 1);
        }

        if (
          segment.parent_segment_id &&
          segment.parent_segment_id.startsWith(`${cityId}_`)
        ) {
          segment.parent_segment_id = segment.parent_segment_id.substring(
            cityId.length + 1
          );
        }

        return segment;
      })
      .filter((segment) => {
        if (uniqueIds.has(segment.id)) {
          console.warn(`Duplicate segment ID found: ${segment.id}`);
          return false;
        }
        uniqueIds.add(segment.id);
        return true;
      });
  };

  // Prefer top-level segments, but fall back to all segments if the stored data
  // predates the merge fields or was persisted in an inconsistent state.
  let { data, error } = await (supabase.from("segments") as any)
    .select("*")
    .eq("id_cidade", cityId)
    .is("parent_segment_id", null)
    .is("deleted_at", null);

  if (error) {
    const missingColumn = getMissingColumnName(error);
    if (missingColumn === "deleted_at") {
      const fallbackWithoutDeletedAt = await supabase
        .from("segments")
        .select("*")
        .eq("id_cidade", cityId)
        .is("parent_segment_id", null);
      data = fallbackWithoutDeletedAt.data;
      error = fallbackWithoutDeletedAt.error;
    } else {
      console.warn("Error fetching top-level segments, falling back to all city segments:", error);
    }
  }

  if (!data || data.length === 0) {
    let fallbackResult = await (supabase.from("segments") as any)
      .select("*")
      .eq("id_cidade", cityId)
      .is("deleted_at", null);

    if (fallbackResult.error && getMissingColumnName(fallbackResult.error) === "deleted_at") {
      fallbackResult = await supabase
        .from("segments")
        .select("*")
        .eq("id_cidade", cityId);
    }

    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (error) {
    console.error("Error fetching segments:", error);
    return [];
  }

  if (data && data.length > 0) {
    console.log(`Found ${data.length} segments in database for city ${cityId}, using database data`);
    const segments = normalizeSegments(data);
    console.log(`Fetched ${segments.length} unique segments for city ${cityId} from database`);
    return segments;
  }

  console.log(`No segments found in database for city ${cityId}, will need to fetch from OSM`);
  return [];
};

export const saveSegmentToDB = async (segment: Segment): Promise<boolean> => {
  try {
    const segmentId = segment.id.includes('_') ? segment.id : `${segment.id_cidade}_${segment.id}`;

    const parentSegmentId = segment.parent_segment_id ?
      (segment.parent_segment_id.includes('_') ? segment.parent_segment_id : `${segment.id_cidade}_${segment.parent_segment_id}`) :
      null;

    const segmentPayload = {
      id: segmentId,
      id_cidade: segment.id_cidade,
      id_form: segment.id_form,
      name: segment.name,
      type: segment.type,
      length: segment.length,
      neighborhood: segment.neighborhood,
      geometry: segment.geometry,
      selected: segment.selected,
      evaluated: segment.evaluated,
      is_merged: segment.is_merged || false,
      parent_segment_id: parentSegmentId,
      merged_segments: segment.merged_segments || [],
      classification: segment.classification,
      blocks_count: segment.blocks_count ?? null,
      intersections_count: segment.intersections_count ?? null,
      relevant_intersections_count: segment.relevant_intersections_count ?? null,
      connected_intersections_count: segment.connected_intersections_count ?? null,
      osm_id: segment.osm_id ?? null,
      osm_type: segment.osm_type ?? null,
      osm_tags: segment.osm_tags ?? null,
      osm_raw: segment.osm_raw ?? null,
      osm_confidence: segment.osm_confidence ?? null,
      ideciclo_prefill: segment.ideciclo_prefill ?? null,
      osm_improvement_suggestions: segment.osm_improvement_suggestions ?? null,
      estimated_blocks_count: segment.estimated_blocks_count ?? null,
      estimated_intersections_count: segment.estimated_intersections_count ?? null,
      intersections_preview: segment.intersections_preview ?? null,
      osm_advanced: segment.osm_advanced ?? null,
      deleted_at: (segment as any).deleted_at ?? null,
    };

    await fetchAuthDb<{ segment: SegmentRow }>("/api/auth/db/segments/upsert", {
      method: "POST",
      body: {
        segment: segmentPayload,
      },
    });
    return true;
  } catch (error) {
    console.error("Unexpected error inserting segment:", error);
    return false;
  }
};

export const removeSegmentsFromDB = async (segmentIds: string[]): Promise<boolean> => {
  if (segmentIds.length === 0) {
    console.warn("No segment IDs provided for soft deletion.");
    return false;
  }

  try {
    await fetchAuthDb<{ ok: true }>("/api/auth/db/segments/delete", {
      method: "POST",
      body: {
        segmentIds,
      },
    });
    return true;
  } catch (error) {
    console.error("Unexpected error soft deleting segments:", error);
    return false;
  }
};

export const hardDeleteSegmentsFromDB = async (segmentIds: string[]): Promise<boolean> => {
  if (segmentIds.length === 0) return false;
  try {
    await fetchAuthDb<{ ok: true }>("/api/auth/db/segments/delete", {
      method: "POST",
      body: {
        segmentIds,
        hard: true,
      },
    });
    return true;
  } catch (error) {
    console.error("Unexpected error hard deleting segments:", error);
    return false;
  }
};

export const fetchDeletedSegmentsFromDB = async (cityId: string): Promise<Segment[]> => {
  const { data, error } = await (supabase.from("segments") as any)
    .select("*")
    .eq("id_cidade", cityId)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Error fetching deleted segments:", error);
    return [];
  }

  const rows = (data || []) as SegmentRow[];
  return rows.map((row) => {
    const segment = convertSegmentRowToSegment(row);
    if (segment.id.startsWith(`${cityId}_`)) {
      segment.id = segment.id.substring(cityId.length + 1);
    }
    if (
      segment.parent_segment_id &&
      segment.parent_segment_id.startsWith(`${cityId}_`)
    ) {
      segment.parent_segment_id = segment.parent_segment_id.substring(
        cityId.length + 1
      );
    }
    return segment;
  });
};

export const restoreSegmentsFromDB = async (segmentIds: string[]): Promise<boolean> => {
  if (segmentIds.length === 0) return false;

  try {
    await fetchAuthDb<{ ok: true }>("/api/auth/db/segments/restore", {
      method: "POST",
      body: {
        segmentIds,
      },
    });
    return true;
  } catch (error) {
    console.error("Unexpected error restoring segments:", error);
    return false;
  }
};

export const deleteMultipleSegments = async (segmentIds: string[]): Promise<boolean> => {
  return await removeSegmentsFromDB(segmentIds);
};

export const saveSegmentsToDB = async (segments: Segment[]): Promise<boolean> => {
  if (segments.length === 0) return true; // No segments to insert
  
  const cityId = segments[0].id_cidade;
  
  try {
    const uniqueSegmentIds = new Set<string>();
    const uniqueSegments = segments.filter(segment => {
      if (uniqueSegmentIds.has(segment.id)) {
        console.warn(`Skipping duplicate segment ID: ${segment.id}`);
        return false;
      }
      uniqueSegmentIds.add(segment.id);
      return true;
    });
    
    // Log all segment IDs we're trying to upload
    console.log(`Segments being uploaded to database: ${uniqueSegments.length} unique segments out of ${segments.length} total`);

    const segmentsToInsert = uniqueSegments.map(segment => ({
      id: `${cityId}_${segment.id}`, // Make ID unique by prefixing with city ID
      id_cidade: segment.id_cidade,
      id_form: segment.id_form,
      name: segment.name,
      type: segment.type,
      length: segment.length,
      neighborhood: segment.neighborhood,
      geometry: segment.geometry,
      selected: segment.selected,
      evaluated: segment.evaluated,
      is_merged: segment.is_merged || false,
      parent_segment_id: segment.parent_segment_id ? `${cityId}_${segment.parent_segment_id}` : null, // Update parent reference too
      merged_segments: segment.merged_segments || [],
      classification: segment.classification || null, // Ensure null instead of undefined
      blocks_count: segment.blocks_count ?? null,
      intersections_count: segment.intersections_count ?? null,
      relevant_intersections_count: segment.relevant_intersections_count ?? null,
      connected_intersections_count: segment.connected_intersections_count ?? null,
      osm_id: segment.osm_id ?? null,
      osm_type: segment.osm_type ?? null,
      osm_tags: segment.osm_tags ?? null,
      osm_raw: segment.osm_raw ?? null,
      osm_confidence: segment.osm_confidence ?? null,
      ideciclo_prefill: segment.ideciclo_prefill ?? null,
      osm_improvement_suggestions: segment.osm_improvement_suggestions ?? null,
      estimated_blocks_count: segment.estimated_blocks_count ?? null,
      estimated_intersections_count: segment.estimated_intersections_count ?? null,
      intersections_preview: segment.intersections_preview ?? null,
      osm_advanced: segment.osm_advanced ?? null,
      deleted_at: (segment as any).deleted_at ?? null,
    }));

    await fetchAuthDb<{ ok: true }>("/api/auth/db/segments/bulk-upsert", {
      method: "POST",
      body: {
        cityId,
        segments: segmentsToInsert,
      },
    });

    console.log(`Successfully inserted all ${segmentsToInsert.length} segments for city ${cityId}`);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    const message = formatDatabaseError("Erro inesperado ao salvar segmentos", error);
    console.error(message, error);
    throw new Error(message);
  }
};

export const updateSegmentInDB = async (segment: Partial<Segment>): Promise<Segment | null> => {
  if (!segment.id) {
    console.error("Segment ID is required for updates");
    return null;
  }

  try {
    const payload = await fetchAuthDb<{ segment: SegmentRow }>(
      `/api/auth/db/segments/${encodeURIComponent(segment.id)}`,
      {
        method: "PATCH",
        body: {
          cityId: segment.id_cidade,
          segment,
        },
      }
    );

    if (!payload.segment) {
      return null;
    }

    const result = convertSegmentRowToSegment(payload.segment);
    const cityId = segment.id_cidade || result.id_cidade;

    if (result.id.includes('_') && cityId) {
      result.id = result.id.substring(result.id.indexOf('_') + 1);
    }

    if (result.parent_segment_id && result.parent_segment_id.includes('_')) {
      result.parent_segment_id = result.parent_segment_id.substring(result.parent_segment_id.indexOf('_') + 1);
    }

    return result;
  } catch (error) {
    console.error("Error updating segment:", error);
    return null;
  }
};

export const updateSegmentTechnicalInDB = async (
  segmentId: string,
  cityId: string,
  updates: Partial<Segment>
): Promise<Segment | null> => {
  try {
    const payload = await fetchAuthDb<{ segment: SegmentRow }>(
      `/api/auth/db/segments/${encodeURIComponent(segmentId)}/technical`,
      {
        method: "PATCH",
        body: {
          cityId,
          updates,
        },
      }
    );

    if (!payload.segment) {
      return null;
    }

    const result = convertSegmentRowToSegment(payload.segment);
  if (!result.osm_advanced) {
    console.error(
      "segments.osm_advanced is unavailable in database response; technical data was not persisted."
    );
    return null;
  }
  if (result.id.includes("_") && cityId) {
    result.id = result.id.substring(result.id.indexOf("_") + 1);
  }

  if (result.parent_segment_id && result.parent_segment_id.includes("_")) {
    result.parent_segment_id = result.parent_segment_id.substring(
      result.parent_segment_id.indexOf("_") + 1
    );
  }

    return result;
  } catch (error) {
    console.error("Error updating segment technical data:", error);
    return null;
  }
};

// New function to unmerge segments
export const unmergeSegmentsFromDB = async (parentSegmentId: string, segmentIdsToUnmerge: string[]): Promise<boolean> => {
  try {
    await fetchAuthDb<{ ok: true }>("/api/auth/db/segments/unmerge", {
      method: "POST",
      body: {
        parentSegmentId,
        segmentIdsToUnmerge,
      },
    });
    return true;
  } catch (error) {
    console.error("Unexpected error unmerging segments:", error);
    return false;
  }
};

/**
 * Form CRUD operations
 */
export const fetchFormsByCityId = async (cityId: string): Promise<Form[]> => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('city_id', cityId);

  if (error) {
    console.error("Error fetching forms by city ID:", error);
    return [];
  }

  return data.map(convertFormRowToForm);
};

export const saveFormToDB = async (form: Partial<Form>): Promise<Form | null> => {
  if (!form.id || !form.segment_id || !form.city_id) {
    console.error("Required form fields missing");
    return null;
  }

  const formToInsert = {
    id: form.id,
    segment_id: form.segment_id,
    city_id: form.city_id,
    researcher: form.researcher || null,
    date: form.date instanceof Date ? form.date.toISOString() : form.date || new Date().toISOString(),
    street_name: form.street_name || null,
    neighborhood: form.neighborhood || null,
    extension: form.extension || null,
    start_point: form.start_point || null,
    end_point: form.end_point || null,
    hierarchy: form.hierarchy || null,
    velocity: form.velocity || null,
    blocks_count: form.blocks_count || null,
    intersections_count: form.intersections_count || null,
    observations: form.observations || null,
    responses: form.responses || null
  };

  try {
    const payload = await fetchAuthDb<{ form: FormRow }>("/api/auth/db/forms", {
      method: "POST",
      body: {
        formData: formToInsert,
      },
    });
    return payload.form ? convertFormRowToForm(payload.form) : null;
  } catch (error) {
    console.error("Error saving form:", error);
    return null;
  }
};

export const fetchFormFromDB = async (formId: string): Promise<Form | null> => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single();

  if (error) {
    console.error("Error fetching form:", error);
    return null;
  }

  return convertFormRowToForm(data);
};

export const fetchFormBySegmentId = async (segmentId: string): Promise<Form | null> => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('segment_id', segmentId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" - not a real error in this case
      console.error("Error fetching form by segment ID:", error);
    }
    return null;
  }

  return convertFormRowToForm(data);
};

/**
 * Check which form IDs exist in the database
 */
export const checkFormsExistByIds = async (formIds: string[]): Promise<string[]> => {
  if (formIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('forms')
    .select('id')
    .in('id', formIds);

  if (error) {
    console.error("Error checking forms existence:", error);
    return [];
  }

  return data.map(form => form.id);
};

/**
 * Review CRUD operations
 */
export const saveReviewsToDB = async (reviews: Review[]): Promise<boolean> => {
  if (reviews.length === 0) return true;

  const reviewsToInsert = reviews.map(review => ({
    id: review.id,
    form_id: review.form_id,
    rating_name: review.rating_name,
    rating: review.rating,
    weight: review.weight
  }));

  try {
    await fetchAuthDb<{ ok: true }>("/api/auth/db/reviews/bulk", {
      method: "POST",
      body: {
        reviews: reviewsToInsert,
      },
    });
    return true;
  } catch (error) {
    console.error("Error saving reviews:", error);
    return false;
  }
};

export const fetchReviewsForForm = async (formId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('form_id', formId);

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }

  return data.map((review: ReviewRow): Review => ({
    id: review.id,
    form_id: review.form_id,
    rating_name: review.rating_name as RatingType,
    rating: review.rating,
    weight: review.weight
  }));
};

/**
 * Database operations for city management
 */
/**
 * Functions for Refine page
 */
export const deleteCityFromDB = async (cityId: string): Promise<boolean> => {
  try {
    await fetchAuthDb<{ ok: true }>(`/api/auth/db/cities/${encodeURIComponent(cityId)}`, {
      method: "DELETE",
    });
    return true;
  } catch (error) {
    console.error("Error deleting city:", error);
    return false;
  }
};

/**
 * Functions for SegmentForm page
 */
export const fetchFormById = async (formId: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", formId)
      .single();

    if (error) {
      console.error("Error fetching form by ID:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching form by ID:", error);
    return null;
  }
};

export const getFormBySegmentId = async (segmentId: string): Promise<any | null> => {
  try {
    const directMatch = await supabase
      .from("forms")
      .select("*")
      .eq("segment_id", segmentId)
      .maybeSingle();

    if (directMatch.error && directMatch.error.code !== "PGRST116") {
      console.error("Error fetching form by segment ID:", directMatch.error);
    }

    if (directMatch.data) {
      return directMatch.data;
    }

    const resolvedSegment = await resolveDatabaseSegmentId(segmentId);
    if (!resolvedSegment || resolvedSegment.dbId === segmentId) {
      return null;
    }

    const fallbackMatch = await supabase
      .from("forms")
      .select("*")
      .eq("segment_id", resolvedSegment.dbId)
      .maybeSingle();

    if (fallbackMatch.error && fallbackMatch.error.code !== "PGRST116") {
      console.error("Error fetching form by resolved segment ID:", fallbackMatch.error);
    }

    return fallbackMatch.data || null;
  } catch (error) {
    console.error("Error fetching form by segment ID:", error);
    return null;
  }
};

export const fetchSegmentById = async (segmentId: string): Promise<any | null> => {
  try {
    const candidateIds = Array.from(
      new Set(
        segmentId.includes("_")
          ? [segmentId, segmentId.split("_").slice(1).join("_")]
          : [segmentId]
      )
    ).filter(Boolean);

    let data = null;
    let error = null;

    for (const candidateId of candidateIds) {
      const result = await supabase
        .from("segments")
        .select("*")
        .eq("id", candidateId)
        .maybeSingle();

      if (result.data) {
        data = result.data;
        error = null;
        break;
      }

      error = result.error;
    }

    if (!data && !segmentId.includes("_")) {
      const wildcardResult = await supabase
        .from("segments")
        .select("*")
        .like("id", `%_${segmentId}`)
        .limit(1)
        .maybeSingle();

      if (wildcardResult.data) {
        data = wildcardResult.data;
        error = null;
      } else {
        error = wildcardResult.error;
      }
    }

    if (!data && error) {
      console.error("Error fetching segment by ID:", error);
      return null;
    }

    if (!data) return null;
    return convertSegmentRowToSegment(data as SegmentRow);
  } catch (error) {
    console.error("Error fetching segment by ID:", error);
    return null;
  }
};

export const updateFormInDB = async (formId: string, formData: any): Promise<any | null> => {
  try {
    const payload = await fetchAuthDb<{ form: FormRow }>(
      `/api/auth/db/forms/${encodeURIComponent(formId)}`,
      {
        method: "PATCH",
        body: {
          formData,
        },
      }
    );
    return payload.form ?? null;
  } catch (error) {
    console.error("Error updating form:", error);
    throw error;
  }
};

export const createFormInDB = async (formData: any): Promise<any | null> => {
  try {
    const payload = await fetchAuthDb<{ form: FormRow }>("/api/auth/db/forms", {
      method: "POST",
      body: {
        formData,
      },
    });
    return payload.form ?? null;
  } catch (error) {
    console.error("Error creating form:", error);
    throw error;
  }
};

export const updateSegmentEvaluationStatus = async (segmentId: string, formId: string): Promise<boolean> => {
  try {
    await fetchAuthDb<{ ok: true }>(
      `/api/auth/db/segments/${encodeURIComponent(segmentId)}/evaluation-status`,
      {
        method: "PATCH",
        body: {
          formId,
        },
      }
    );
    return true;
  } catch (error) {
    console.error("Error updating segment evaluation status:", error);
    return false;
  }
};

/**
 * Functions for ViewEvaluation page
 */
export const fetchFormWithDetails = async (formId: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", formId)
      .single();

    if (error) {
      console.error("Error fetching form details:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching form details:", error);
    return null;
  }
};

/**
 * Functions for Avaliacao page
 */
export const fetchUniqueStatesFromDB = async (): Promise<{ id: string; name: string }[]> => {
  try {
    const { data, error } = await supabase.from("cities").select("state");

    if (error) {
      console.error("Error fetching states:", error);
      return [];
    }

    // Extract unique states
    const uniqueStatesSet = new Set(data.map((item) => item.state));
    const uniqueStates = Array.from(uniqueStatesSet).map((state) => ({
      id: state,
      name: state,
    }));

    return uniqueStates;
  } catch (error) {
    console.error("Error fetching states:", error);
    return [];
  }
};

export const fetchCitiesByState = async (state: string): Promise<City[]> => {
  try {
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .eq("state", state);

    if (error) {
      console.error("Error fetching cities:", error);
      return [];
    }

    return data as City[];
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};

/**
 * Fetch all cities that are stored in the database
 */
export const fetchAllStoredCities = async (): Promise<City[]> => {
  try {
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .order("state", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching stored cities:", error);
      return [];
    }

    return data.map(convertCityRowToCity);
  } catch (error) {
    console.error("Error fetching stored cities:", error);
    return [];
  }
};

export const fetchSegmentsByCity = async (cityId: string): Promise<Segment[]> => {
  try {
    return await fetchSegmentsFromDB(cityId);
  } catch (error) {
    console.error("Error fetching segments:", error);
    return [];
  }
};

export const clearLocalStorage = (): void => {
  try {
    // Get all city IDs from localStorage
    const cityKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('city_'));
    
    // Clear all city data
    for (const key of cityKeys) {
      localStorage.removeItem(key);
    }
    
    // Clear segment data
    const segmentKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('segments_'));
    
    for (const key of segmentKeys) {
      localStorage.removeItem(key);
    }
    
    // Clear evaluated segments
    localStorage.removeItem('evaluatedSegments');
    
    // Clear form data
    const formKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('form_'));
    
    for (const key of formKeys) {
      localStorage.removeItem(key);
    }
    
    // Clear current city ID and name
    localStorage.removeItem('currentCityId');
    localStorage.removeItem('currentCityName');
    localStorage.removeItem('currentStateName');
    
    console.log('All localStorage data related to cities, segments, and forms has been cleared');
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};

// Function to clear all caches (localStorage and database API)
export const clearAllCaches = async (): Promise<void> => {
  try {
    // 1. Clear localStorage
    clearLocalStorage();
    
    // 2. Clear client-side session/cache placeholders
    await authClient.refreshSession();
    
    // 3. Clear browser cache for Supabase API requests
    try {
      const cachesToClear = await caches.keys();
      for (const cacheName of cachesToClear) {
        // Only clear caches related to our app or Supabase
        if (cacheName.includes('postgrest') || cacheName.includes('ideciclo')) {
          await caches.delete(cacheName);
        }
      }
    } catch (cacheError) {
      // Ignore cache errors, as they might not be supported in all browsers
      console.log("Cache API not supported or error clearing caches:", cacheError);
    }
    
    console.log('All caches cleared successfully');
  } catch (error) {
    console.error("Error clearing caches:", error);
  }
};
