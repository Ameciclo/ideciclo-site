import * as turf from "@turf/turf";
import {
  IdecicloPrefill,
  OsmAdvancedInfo,
  OsmConfidence,
  OsmImprovementSuggestion,
  OverpassElement,
  SegmentIntersectionPreview,
  SegmentType,
} from "@/types";

export type ParsedOsmAdvancedSegment = {
  osm_id: string;
  osm_type: string;
  osm_tags: Record<string, string>;
  osm_raw: OverpassElement;
  osm_confidence: Record<string, OsmConfidence>;
  ideciclo_prefill: IdecicloPrefill;
  osm_improvement_suggestions: OsmImprovementSuggestion[];
  estimated_blocks_count: number;
  estimated_intersections_count: number;
  relevant_intersections_count: number;
  connected_intersections_count: number;
  intersections_preview: SegmentIntersectionPreview[];
  osm_advanced: OsmAdvancedInfo;
};

const classifyHighway = (highway?: string): string | undefined => {
  if (!highway) return undefined;

  if (["motorway", "trunk", "primary", "motorway_link", "trunk_link", "primary_link"].includes(highway)) {
    return "estrutural";
  }

  if (["secondary", "tertiary", "secondary_link", "tertiary_link"].includes(highway)) {
    return "alimentadora";
  }

  if (["residential", "unclassified", "living_street", "service"].includes(highway)) {
    return "local";
  }

  return undefined;
};

const normalizeNumericTag = (value?: string): number | undefined => {
  if (!value) return undefined;
  const normalized = value.replace(",", ".").match(/-?\d+(\.\d+)?/);
  if (!normalized) return undefined;
  const parsed = Number(normalized[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeMaxSpeed = (value?: string): string | undefined => {
  if (!value) return undefined;
  const numeric = normalizeNumericTag(value);
  if (numeric !== undefined) return String(Math.round(numeric));
  if (value.toLowerCase() === "br:urban") return "60";
  return value;
};

const inferPositionOnRoad = (tags: Record<string, string>): string | undefined => {
  if (tags["cycleway:both"]) return "ambos os lados da via";
  if (tags["cycleway:left"] && tags["cycleway:right"]) return "lados esquerdo e direito";
  if (tags["cycleway:left"]) return "lado esquerdo da via";
  if (tags["cycleway:right"]) return "lado direito da via";

  if (tags.highway === "cycleway") {
    if (tags.segregated === "yes") return "infraestrutura segregada";
    return "infraestrutura dedicada";
  }

  if (
    tags.sidewalk === "both" ||
    tags.sidewalk === "left" ||
    tags.sidewalk === "right" ||
    tags.highway === "footway" ||
    tags.highway === "pedestrian"
  ) {
    if (tags.bicycle === "designated" || tags.bicycle === "yes") {
      return tags.segregated === "yes" ? "calçada partilhada segregada" : "calçada partilhada";
    }
  }

  return undefined;
};

const inferDirection = (tags: Record<string, string>): string | undefined => {
  if (tags["oneway:bicycle"] === "no" || tags["cycleway:oneway"] === "no") {
    return "contrafluxo provável";
  }

  if (tags.oneway === "yes" && tags["oneway:bicycle"] !== "no") {
    return "unidirecional";
  }

  if (tags.oneway === "no" || tags["cycleway:both"] || tags["cycleway"] === "track") {
    return "bidirecional";
  }

  if (tags["cycleway:left"] || tags["cycleway:right"]) {
    return "unidirecional";
  }

  return undefined;
};

const inferLanesCount = (tags: Record<string, string>): number | undefined => {
  const lanes = normalizeNumericTag(tags.lanes);
  if (lanes !== undefined) return Math.max(1, Math.round(lanes));

  const forward = normalizeNumericTag(tags["lanes:forward"]);
  const backward = normalizeNumericTag(tags["lanes:backward"]);
  if (forward !== undefined && backward !== undefined) {
    return Math.max(1, Math.round(forward + backward));
  }
  if (forward !== undefined && tags.oneway === "yes") {
    return Math.max(1, Math.round(forward));
  }

  return undefined;
};

const inferPavement = (tags: Record<string, string>): string | undefined => {
  const surface = tags.surface?.toLowerCase();
  if (!surface) return undefined;

  if (["asphalt", "concrete", "concrete:lanes", "concrete:plates", "paved"].includes(surface)) {
    return "asfalto/concreto (melhor)";
  }

  if (["paving_stones", "sett", "unhewn_cobblestone", "brick"].includes(surface)) {
    return "blocos (razoável)";
  }

  if (["cobblestone", "stone", "pebblestone"].includes(surface)) {
    return "paralelepípedo/pedra (regular)";
  }

  if (["dirt", "earth", "sand", "mud", "metal", "grass", "gravel", "ground"].includes(surface)) {
    return "inadequado/revisar";
  }

  return surface;
};

const inferBufferSeparation = (tags: Record<string, string>): string | undefined => {
  const values = [
    tags.separation,
    tags["cycleway:separation"],
    tags.buffer,
    tags["cycleway:buffer"],
    tags.kerb,
    tags.barrier,
  ].filter(Boolean);

  if (values.length === 0) return undefined;
  return values.join(" | ");
};

const buildIntersectionPreview = (
  segment: OverpassElement,
  roads: OverpassElement[]
): {
  intersections_preview: SegmentIntersectionPreview[];
  estimated_intersections_count: number;
  estimated_blocks_count: number;
  relevant_intersections_count: number;
} => {
  if (!segment.geometry || segment.geometry.length < 2) {
    return {
      intersections_preview: [],
      estimated_intersections_count: 0,
      estimated_blocks_count: 1,
      relevant_intersections_count: 0,
    };
  }

  const segmentLine = turf.lineString(segment.geometry.map((point) => [point.lon, point.lat]));
  const previews: SegmentIntersectionPreview[] = [];
  const uniqueIntersections = new Set<string>();
  const relevantIntersections = new Set<string>();

  roads.forEach((road) => {
    if (road.id === segment.id || !road.geometry || road.geometry.length < 2) return;

    try {
      const roadLine = turf.lineString(road.geometry.map((point) => [point.lon, point.lat]));
      const intersections = turf.lineIntersect(segmentLine, roadLine);
      if (intersections.features.length === 0) return;

      const hierarchy = classifyHighway(road.tags.highway) || "não classificada";
      intersections.features.forEach((feature) => {
        if (!feature.geometry || feature.geometry.type !== "Point") return;
        const [lon, lat] = feature.geometry.coordinates;
        const pointKey = `${lat.toFixed(6)},${lon.toFixed(6)}`;
        uniqueIntersections.add(pointKey);
        if (hierarchy === "estrutural" || hierarchy === "alimentadora") {
          relevantIntersections.add(pointKey);
        }

        previews.push({
          pointKey,
          roadId: String(road.id),
          roadName: road.tags.name || road.tags.ref || `Via ${road.id}`,
          highway: road.tags.highway,
          hierarchy,
        });
      });
    } catch (error) {
      console.warn(`Falha ao calcular interseção para via ${road.id}:`, error);
    }
  });

  const uniqueByRoadAndPoint = new Map<string, SegmentIntersectionPreview>();
  previews.forEach((item) => {
    uniqueByRoadAndPoint.set(`${item.pointKey}-${item.roadId}`, item);
  });

  const estimatedIntersectionsCount = uniqueIntersections.size;
  return {
    intersections_preview: Array.from(uniqueByRoadAndPoint.values()),
    estimated_intersections_count: estimatedIntersectionsCount,
    estimated_blocks_count: Math.max(1, estimatedIntersectionsCount + 1),
    relevant_intersections_count: relevantIntersections.size,
  };
};

export const parseOsmAdvancedSegment = (
  element: OverpassElement,
  roads: OverpassElement[],
  inferredType?: SegmentType,
  inferredHierarchy?: string
): ParsedOsmAdvancedSegment => {
  const rawTags = element.tags || {};
  const pendenciasCampo: string[] = [];
  const confidenceByField: Record<string, OsmConfidence> = {};
  const suggestions: OsmImprovementSuggestion[] = [];

  const posicaoNaVia = inferPositionOnRoad(rawTags);
  if (!posicaoNaVia) {
    pendenciasCampo.push("Posição na via");
    confidenceByField.posicaoNaVia = "low";
    suggestions.push({
      field: "posicaoNaVia",
      reason: "Sem tags suficientes para posição na via.",
      suggestedTags: ["cycleway:left", "cycleway:right", "cycleway:both", "sidewalk", "segregated"],
      priority: "medium",
    });
  } else {
    confidenceByField.posicaoNaVia = "medium";
  }

  const velocidadeNormalizada = normalizeMaxSpeed(rawTags.maxspeed);
  if (!velocidadeNormalizada) {
    pendenciasCampo.push("Velocidade regulamentada");
    confidenceByField.velocidade = "unknown";
    suggestions.push({
      field: "velocidade",
      reason: "Tag de velocidade ausente.",
      suggestedTags: ["maxspeed=*"],
      priority: "high",
    });
  } else {
    confidenceByField.velocidade = rawTags.maxspeed ? "high" : "low";
  }

  const numeroFaixas = inferLanesCount(rawTags);
  if (numeroFaixas === undefined) {
    pendenciasCampo.push("Número de faixas");
    confidenceByField.numeroFaixas = "unknown";
    suggestions.push({
      field: "numeroFaixas",
      reason: "Não foi possível inferir faixas de tráfego.",
      suggestedTags: ["lanes", "lanes:forward", "lanes:backward", "oneway"],
      priority: "medium",
    });
  } else {
    confidenceByField.numeroFaixas = "high";
  }

  const sentido = inferDirection(rawTags);
  if (!sentido) {
    pendenciasCampo.push("Sentido de circulação");
    confidenceByField.sentido = "low";
    suggestions.push({
      field: "sentido",
      reason: "Tags de sentido insuficientes.",
      suggestedTags: ["oneway", "oneway:bicycle", "cycleway:oneway"],
      priority: "medium",
    });
  } else {
    confidenceByField.sentido = "medium";
  }

  const pavimento = inferPavement(rawTags);
  if (!pavimento) {
    pendenciasCampo.push("Pavimento");
    confidenceByField.pavimento = "unknown";
    suggestions.push({
      field: "pavimento",
      reason: "Superfície não mapeada.",
      suggestedTags: ["surface", "smoothness"],
      priority: "medium",
    });
  } else {
    confidenceByField.pavimento = "medium";
  }

  const largura =
    normalizeNumericTag(rawTags["cycleway:width"]) ??
    normalizeNumericTag(rawTags.width) ??
    normalizeNumericTag(rawTags.est_width);
  if (largura === undefined) {
    pendenciasCampo.push("Largura");
    confidenceByField.largura = "unknown";
    suggestions.push({
      field: "largura",
      reason: "Largura não disponível no OSM.",
      suggestedTags: ["cycleway:width", "width", "est_width"],
      priority: "high",
    });
  } else {
    confidenceByField.largura = "medium";
  }

  const bufferSeparacao = inferBufferSeparation(rawTags);
  if (!bufferSeparacao) {
    pendenciasCampo.push("Buffer/separação");
    confidenceByField.bufferSeparacao = "unknown";
    suggestions.push({
      field: "bufferSeparacao",
      reason: "Separação física não descrita de forma clara.",
      suggestedTags: ["separation", "cycleway:separation", "buffer", "cycleway:buffer", "kerb", "barrier"],
      priority: "low",
    });
  } else {
    confidenceByField.bufferSeparacao = "low";
  }

  const intersections = buildIntersectionPreview(element, roads);

  const interpreted: IdecicloPrefill = {
    nome: rawTags.name || rawTags.official_name || rawTags.alt_name || rawTags.ref,
    tipologia: inferredType,
    posicaoNaVia,
    hierarquia: inferredHierarchy,
    velocidade: velocidadeNormalizada,
    sentido,
    numeroFaixas,
    pavimento,
    largura,
    bufferSeparacao,
    pendenciasCampo,
  };

  const osmAdvanced: OsmAdvancedInfo = {
    osmId: String(element.id),
    osmType: element.type,
    rawTags,
    interpreted,
    confidenceByField,
    suggestions,
  };

  return {
    osm_id: String(element.id),
    osm_type: element.type,
    osm_tags: rawTags,
    osm_raw: element,
    osm_confidence: confidenceByField,
    ideciclo_prefill: interpreted,
    osm_improvement_suggestions: suggestions,
    estimated_blocks_count: intersections.estimated_blocks_count,
    estimated_intersections_count: intersections.estimated_intersections_count,
    relevant_intersections_count: intersections.relevant_intersections_count,
    connected_intersections_count: 0,
    intersections_preview: intersections.intersections_preview,
    osm_advanced: osmAdvanced,
  };
};
