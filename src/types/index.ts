
export enum SegmentType {
  CICLOFAIXA = "ciclofaixa",
  CICLOVIA = "ciclovia",
  CICLORROTA = "ciclorrota",
  COMPARTILHADA = "compartilhada"
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
  geometry: any;
  selected: boolean;
}

export interface Form {
  id: string;
  id_review?: string;
  start: string;
  end: string;
  reviewed_at: Date;
  reviewed_by: string;
  started_at: Date;
  ended_at: Date;
  other_info: any;
  reviewed: boolean;
}

export interface Review {
  id: string;
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
