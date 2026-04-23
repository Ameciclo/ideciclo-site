export type IdecicloRating = "A" | "B" | "C" | "D";
export type RatingMode = "auto" | "manual";
export type CriterionWorkflowState = "default" | "analysis";
export type TrafficCalmingMeasure =
  | "lombada"
  | "valas"
  | "faixa_elevada"
  | "elevacao_intersecao"
  | "reducao_largura";
export type CriterionCode =
  | "A1"
  | "A2"
  | "B1"
  | "B2"
  | "B3"
  | "B4"
  | "B5"
  | "B6"
  | "B7"
  | "C1"
  | "C2"
  | "C3"
  | "D1"
  | "D2"
  | "D3"
  | "E1"
  | "E2"
  | "E3"
  | "E4";

export interface IdecicloFormData {
  researcher: string;
  date: string;
  city: string;
  city_id: string;
  neighborhood: string;
  id: string;
  segment_id: string;
  segment_name: string;
  extension_m: number;
  velocity_kmh: number;
  start_point: string;
  end_point: string;
  road_hierarchy: string;
  classification?: string;
  blocks_count: number;
  intersections_count: number;
  relevant_intersections_count: number;
  connected_intersections_count: number;
  pedestrian_flow_per_hour_per_meter: number;
  infra_typology: string;
  infra_flow: string;
  position_on_road: string;
  width_meters: number;
  width_measurements_m: number[];
  includes_gutter: boolean;
  buffer_width_m: number;
  buffer_measurements_m: number[];
  speed_measures: string[];
  traffic_calming_counts: Partial<Record<TrafficCalmingMeasure, number>>;
  avg_distance_measures_m: number;
  pavement_type: IdecicloRating | "";
  conservation_state: IdecicloRating | "";
  separation_devices_ciclofaixa: IdecicloRating | "";
  separation_devices_ciclovia: IdecicloRating | "";
  separation_devices_calcada: IdecicloRating | "";
  devices_conservation: IdecicloRating | "";
  lateral_spacing_type: string;
  lateral_spacing_width_m: number;
  spacing_conservation: IdecicloRating | "";
  space_identification: IdecicloRating | "";
  identification_conservation: IdecicloRating | "";
  pictograms_per_block: number;
  pictograms_cover_all_blocks: boolean;
  pictograms_conservation: IdecicloRating | "";
  regulation_signs_per_block: number;
  signs_both_directions: boolean | null;
  vertical_signs_conservation: IdecicloRating | "";
  traffic_lanes_count: number;
  signalized_crossings_count: number;
  no_risk_situations: boolean;
  bus_school_conflict: boolean;
  horizontal_obstacles: boolean;
  vertical_obstacles: boolean;
  side_change_mid_block: boolean;
  opposite_flow_direction: boolean;
  intersection_signaling: IdecicloRating | "";
  intersection_conservation: IdecicloRating | "";
  connection_accessibility: "A" | "D" | "NA" | "";
  traffic_lanes_per_direction: number;
  mixed_lane_width_m: number;
  has_intersection_traffic_calming: boolean;
  motorized_conflicts: string[];
  has_lighting_posts: boolean | null;
  lighting_post_type: "A" | "B" | "";
  lighting_distance_m: number;
  lighting_directed: boolean | null;
  lighting_barriers: boolean | null;
  lighting_distance_to_infra: "A" | "B" | "";
  shading_coverage: IdecicloRating | "";
  vegetation_size: "A" | "B" | "C" | "";
  blocks_with_cycling_furniture: number;
  cycling_furniture: string[];
  observations: string;
  rating_modes: Partial<Record<CriterionCode, RatingMode>>;
  manual_ratings: Partial<Record<CriterionCode, IdecicloRating>>;
  touched_fields?: Partial<Record<string, boolean>>;
  criterion_workflow_state?: Partial<Record<string, CriterionWorkflowState>>;
  score_breakdown?: unknown;
  criterion_ratings?: Partial<Record<CriterionCode, IdecicloRating | null>>;
  auto_ratings?: Partial<Record<CriterionCode, IdecicloRating | null>>;
  total_score?: number;
  saved_offline?: boolean;
  last_local_save_at?: string | null;
}
