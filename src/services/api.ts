import { City, IBGECity, IBGEState, OverpassResponse, Segment, SegmentType } from "@/types";
import * as turf from '@turf/turf';

// Helper function to retry failed API calls
const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      // Wait before trying again
      await new Promise(resolve => setTimeout(resolve, delay));
      // Increase delay for each retry (exponential backoff)
      delay *= 2;
    }
  }
  
  throw lastError;
};

export const fetchStates = async (): Promise<IBGEState[]> => {
  try {
    const response = await fetchWithRetry('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
    return response.json();
  } catch (error) {
    console.error("Error fetching states:", error);
    throw new Error("Não foi possível carregar os estados. Por favor, tente novamente mais tarde.");
  }
};

export const fetchCities = async (stateId: string): Promise<IBGECity[]> => {
  try {
    const response = await fetchWithRetry(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`);
    return response.json();
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw new Error(`Não foi possível carregar as cidades do estado ${stateId}. Por favor, tente novamente mais tarde.`);
  }
};

export const getOverpassAreaId = async (cityId: string): Promise<number> => {
  try {
    const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
    const query = `
      [out:json][timeout:900];
      area["IBGE:GEOCODIGO"=${cityId}];
      out ids;
    `;

    const response = await fetchWithRetry(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: query,
    });

    const data = await response.json();
    
    const areaId = data.elements[0]?.id;
    
    if (!areaId) {
      throw new Error('Área não encontrada para o ID informado.');
    }
    
    return areaId;
  } catch (error) {
    console.error("Error getting Overpass area ID:", error);
    throw new Error(`Falha ao obter a área para a cidade ${cityId}. O serviço Overpass API pode estar indisponível temporariamente. Por favor, tente novamente mais tarde.`);
  }
};

export const fetchCityHighwayStats = async (cityId: string): Promise<OverpassResponse> => {
  try {
    const areaId = await getOverpassAreaId(cityId);
    const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

    const query = `
      [out:json][timeout:900];
      area(${areaId})->.searchArea;
      way ["highway"]
      ["highway"!~"^(construction|cycleway|footway|path|proposed|service|track|bus_stop|corridor|living_street|pedestrian|raceway|steps)$"]
      ["highway"](area.searchArea);
      for (t["highway"])
      {
        make stat highway=_.val,
        count=count(ways),
        length=sum(length());
        out
        body;
      }
    `;

    const response = await fetchWithRetry(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: query,
    }, 3, 2000); // More retries and longer delay for complex queries

    return response.json();
  } catch (error) {
    console.error("Error fetching city highway stats:", error);
    throw new Error(`Falha ao obter estatísticas viárias para a cidade ${cityId}. O serviço Overpass API pode estar indisponível ou com lentidão. Por favor, tente novamente mais tarde.`);
  }
};

export const fetchCityWays = async (cityId: string): Promise<OverpassResponse> => {
  try {
    const areaId = await getOverpassAreaId(cityId);
    const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

    const query = `
      [out:json][timeout:900];
      area(${areaId})->.searchArea;
      (
        way(area.searchArea)["highway"]["cycleway"];
        way(area.searchArea)["highway"]["cycleway:left"];
        way(area.searchArea)["highway"]["cycleway:right"];
        way(area.searchArea)["highway"]["cycleway:both"];
      );
      out geom;
    `;

    const response = await fetchWithRetry(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: query,
    }, 3, 2000); // More retries and longer delay for complex queries

    return response.json();
  } catch (error) {
    console.error("Error fetching city ways:", error);
    throw new Error(`Falha ao obter dados cicloviários para a cidade ${cityId}. O serviço Overpass API pode estar indisponível ou com lentidão. Por favor, tente novamente mais tarde.`);
  }
};

export const calculateCityStats = (data: OverpassResponse): Pick<City, 'vias_estruturais_km' | 'vias_alimentadoras_km' | 'vias_locais_km'> => {
  let estruturais = 0;
  let alimentadoras = 0;
  let locais = 0;

  data.elements.forEach(element => {
    if (element.type === 'stat' && element.tags.highway) {
      const highway = element.tags.highway;
      const length = parseFloat(element.tags.length || '0') / 1000; // Convert to km

      // Estruturais: motorway, motorway_link, trunk, trunk_link, primary, primary_link
      if (['motorway', 'motorway_link', 'trunk', 'trunk_link', 'primary', 'primary_link'].includes(highway)) {
        estruturais += length;
      } 
      // Alimentadoras: secondary, secondary_link, tertiary, tertiary_link
      else if (['secondary', 'secondary_link', 'tertiary', 'tertiary_link'].includes(highway)) {
        alimentadoras += length;
      } 
      // Locais: residential, unclassified
      else if (['residential', 'unclassified'].includes(highway)) {
        locais += length;
      }
    }
  });

  return {
    vias_estruturais_km: parseFloat(estruturais.toFixed(2)),
    vias_alimentadoras_km: parseFloat(alimentadoras.toFixed(2)),
    vias_locais_km: parseFloat(locais.toFixed(2))
  };
};

export const determineSegmentType = (tags: Record<string, string>): SegmentType => {
  // Ciclofaixa
  if (
    tags['cycleway'] === 'lane' || 
    tags['cycleway:left'] === 'lane' || 
    tags['cycleway:right'] === 'lane' || 
    tags['cycleway:both'] === 'lane' ||
    tags['cycleway'] === 'opposite_lane' ||
    tags['cycleway:right'] === 'opposite_lane' ||
    tags['cycleway:left'] === 'opposite_lane' ||
    tags['cycleway'] === 'buffered_lane' ||
    tags['cycleway:left'] === 'buffered_lane' ||
    tags['cycleway:right'] === 'buffered_lane'
  ) {
    return SegmentType.CICLOFAIXA;
  } 
  // Ciclovia
  else if (
    tags['highway'] === 'cycleway' ||
    tags['cycleway'] === 'track' ||
    tags['cycleway:left'] === 'track' ||
    tags['cycleway:right'] === 'track' ||
    tags['cycleway'] === 'opposite_track' ||
    tags['cycleway:left'] === 'opposite_track' ||
    tags['cycleway:right'] === 'opposite_track'
  ) {
    return SegmentType.CICLOVIA;
  } 
  // Ciclorrota
  else if (
    tags['cycleway'] === 'shared_lane' ||
    tags['cycleway:left'] === 'shared_lane' ||
    tags['cycleway:right'] === 'shared_lane' ||
    tags['cycleway'] === 'share_busway' ||
    tags['cycleway:left'] === 'share_busway' ||
    tags['cycleway:right'] === 'share_busway' ||
    tags['cycleway'] === 'opposite_share_busway'
  ) {
    return SegmentType.CICLORROTA;
  } 
  // Compartilhada
  else if (
    (tags['highway'] === 'footway' && (tags['bicycle'] === 'designated' || tags['bicycle'] === 'yes')) ||
    (tags['highway'] === 'pedestrian' && (tags['bicycle'] === 'designated' || tags['bicycle'] === 'yes'))
  ) {
    return SegmentType.COMPARTILHADA;
  }
  
  // Default - ciclorrota
  return SegmentType.CICLORROTA;
};

export const convertToSegments = (data: OverpassResponse, cityId: string): Segment[] => {
  return data.elements
    .filter(element => element.type === 'way' && element.geometry)
    .map(element => {
      // Convert geometry to GeoJSON format
      const coordinates = element.geometry?.map(point => [point.lon, point.lat]) || [];
      const line = turf.lineString(coordinates);
      const length = turf.length(line, { units: 'kilometers' });

      return {
        id: element.id.toString(),
        id_cidade: cityId,
        name: element.tags.name || `Segmento ${element.id}`,
        type: determineSegmentType(element.tags),
        length: parseFloat(length.toFixed(4)),
        geometry: element.geometry,
        selected: false,
        evaluated: false
      };
    });
};

export const calculateMergedLength = (segments: Segment[]): number => {
  const selectedSegments = segments.filter(segment => segment.selected);
  
  if (selectedSegments.length === 0) return 0;
  
  let totalLength = 0;
  selectedSegments.forEach(segment => {
    totalLength += segment.length;
  });
  
  return parseFloat(totalLength.toFixed(4));
};

/**
 * Store city data in localStorage
 */
export const storeCityData = (cityId: string, data: { city: Partial<City>, segments: Segment[] }) => {
  try {
    localStorage.setItem(`city_${cityId}`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error storing city data:", error);
    return false;
  }
};

/**
 * Get city data from localStorage
 */
export const getStoredCityData = (cityId: string): { city: Partial<City>, segments: Segment[] } | null => {
  try {
    const data = localStorage.getItem(`city_${cityId}`);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error("Error getting stored city data:", error);
    return null;
  }
};
