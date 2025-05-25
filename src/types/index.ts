
export enum SegmentType {
  CICLOFAIXA = "Ciclofaixa",
  CICLOVIA = "Ciclovia",
  CICLORROTA = "Ciclorrota",
  COMPARTILHADA = "Compartilhada"
}

export enum RatingType {
  A = "A",
  B = "B",
  C = "C",
  D = "D"
}

export interface City {
  id: string;
  name: string;
  state: string;
  extensao_avaliada: number;
  ideciclo: number;
  vias_estruturais_km: number;
  vias_alimentadoras_km: number;
  vias_locais_km: number;
}

export interface Segment {
  id: string;
  id_form?: string;
  id_cidade: string;
  name: string;
  type: SegmentType;
  length: number;
  neighborhood?: string;
  geometry: any;
  selected: boolean;
  evaluated: boolean;
}

export interface Form {
  id: string;
  segment_id: string;
  city_id: string;
  researcher: string;
  date: string | Date;
  street_name: string;
  neighborhood: string;
  extension: number;
  start_point: string;
  end_point: string;
  hierarchy: string;
  observations: string;
  responses: Record<string, any>; // All survey responses stored as JSONB
  created_at: string | Date;
  updated_at: string | Date;
  velocity?: number;
  blocks_count?: number;
  intersections_count?: number;
}

export interface Review {
  id: string;
  form_id: string;
  rating_name: RatingType;
  rating: number;
  weight: number;
}

export interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

export interface IBGECity {
  id: number;
  nome: string;
}

export interface OverpassResponse {
  version: number;
  generator: string;
  osm3s: {
    timestamp_osm_base: string;
    timestamp_areas_base: string;
    copyright: string;
  };
  elements: OverpassElement[];
}

export interface OverpassElement {
  type: string;
  id: number;
  bounds?: {
    minlat: number;
    minlon: number;
    maxlat: number;
    maxlon: number;
  };
  nodes?: number[];
  geometry?: { lat: number, lon: number }[];
  tags: Record<string, string>;
}

// Survey response types for the comprehensive evaluation form
export interface SurveyResponses {
  // General Data
  researcher: string;
  date: string;
  city: string;
  neighborhood: string;
  id: string;
  segment_name: string;
  extension_m: number;
  velocity_kmh: number;
  start_point: string;
  end_point: string;
  road_hierarchy: string;
  blocks_count: number;
  intersections_count: number;

  // A.1 General characterization of cycling infrastructure
  infra_typology: string;
  infra_flow: 'unidirectional' | 'bidirectional';
  position_on_road: 'canteiro' | 'pista_canteiro' | 'pista_calcada' | 'calcada' | 'centro_pista' | 'isolada';

  // B.1.1 Width of cycling infrastructure
  width_meters: number;
  includes_gutter: boolean;

  // B.1.2 Speed moderation measures (for cyclorrotas)
  speed_measures: string[];
  avg_distance_measures_m: number;

  // B.2 Pavement type
  pavement_type: 'betuminoso_cimenticio' | 'modular' | 'pedras_irregulares' | 'barro_grelhas';

  // E.1 Pavement conservation state
  conservation_state: 'nivelado' | 'leve_desnivel' | 'desnivel_buraco' | 'degraus_buracos';

  // B.3/E.2 Infrastructure delimitation
  separation_devices_ciclofaixa: 'ate_1m' | '1_5_3m' | 'mais_3_5m' | 'nao_ha';
  separation_devices_ciclovia: 'total' | 'total_aberturas' | 'ate_2m' | 'mais_2_5m';
  separation_devices_calcada: 'demarcacao_clara' | 'demarcacao_separada' | 'linha_pictograma' | 'nao_ha';

  // E.2.1 Conservation state of separation devices
  devices_conservation: 'todo_trecho' | 'mais_metade' | 'menos_metade' | 'nao_ha';

  // B.3.2 Lateral spacing from vehicular flow
  lateral_spacing_type: 'linha' | 'dispositivos';
  lateral_spacing_width_m: number;

  // E.2.1 Conservation state of lateral spacing
  spacing_conservation: 'otimo' | 'bom_mais_metade' | 'menos_metade' | 'inexiste';

  // B.4/E.3 Horizontal and vertical signaling
  space_identification: 'pavimento_vermelho' | 'faixa_dois_bordos' | 'faixa_um_bordo' | 'nao_ha';
  identification_conservation: 'total_vermelho' | 'mais_metade' | 'menos_metade' | 'apagada';

  // B.4.2 Pavement inscriptions - pictograms (for cyclorrotas)
  pictograms_per_block: number;
  pictograms_conservation: 'visiveis' | 'desgastados' | 'menos_metade' | 'apagados';

  // B.4.3 Vertical regulation signaling
  regulation_signs_per_block: number;
  signs_both_directions: boolean;
  vertical_signs_conservation: 'bom_estado' | 'menos_metade_danos' | 'bastante_danificadas' | 'nao_ha';

  // B.5 Accessibility relative to adjacent land use
  traffic_lanes_count: number;
  signalized_crossings_per_block: number;

  // B.6 Risk situations along infrastructure
  bus_school_conflict: boolean;
  horizontal_obstacles: boolean;
  vertical_obstacles: boolean;
  side_change_mid_block: boolean;
  opposite_flow_direction: boolean;

  // C.1/E.4 Horizontal cycling signaling at intersections
  intersection_signaling: 'vermelho_tracejadas' | 'vermelho_estreito' | 'tracejadas_pictogramas' | 'nenhuma';
  intersection_conservation: 'bom_estado' | 'danificada' | 'nao_ha';

  // C.2 Accessibility between cycling connections
  connection_accessibility: 'universal_visivel' | 'degraus' | 'nao_visivel';

  // C.3 Conflicts with motorized circulation
  motorized_conflicts: string[];

  // D.1 Public lighting
  lighting_post_type: 'pedestonais' | 'convencionais';
  lighting_distance_m: number;
  lighting_directed: boolean;
  lighting_barriers: boolean;
  lighting_distance_to_infra: 'junto' | 'mais_5m';

  // D.2 Thermal comfort (shading)
  shading_coverage: 'toda_extensao' | 'mais_metade' | 'menos_metade' | 'nao_ha';
  vegetation_size: 'alto' | 'medio' | 'baixo';

  // D.3 Cycling furniture
  cycling_furniture: string[];
}
