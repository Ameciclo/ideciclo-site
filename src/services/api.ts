
import { City, IBGECity, IBGEState, OverpassResponse, Segment, SegmentType } from "@/types";
import * as turf from '@turf/turf';
import { 
  fetchCityFromDB, 
  saveCityToDB, 
  fetchSegmentsFromDB, 
  saveSegmentsToDB, 
  updateSegmentInDB,
  migrateLocalStorageToDatabase,
  saveSegmentToDB,
  removeSegmentsFromDB,
  unmergeSegmentsFromDB
} from "./supabase";
import { supabase } from "@/integrations/supabase/client";

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
    console.log("here")
    const query = `
    [out:json];
    area(${areaId})->.searchArea;
    
    (
      // Likely to contain any kind of cycle infrastructure
      way["cycleway"](area.searchArea);
      way["cycleway:left"](area.searchArea);
      way["cycleway:right"](area.searchArea);
      way["cycleway:both"](area.searchArea);
      
      // Dedicated cycleways
      way["highway"="cycleway"](area.searchArea);
    
      // Shared with pedestrians
      way["highway"="footway"]["bicycle"](area.searchArea);
      way["highway"="pedestrian"]["bicycle"](area.searchArea);
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
    
    console.log("here", response.json)
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

  return undefined;
};

export const convertToSegments = (data: OverpassResponse, cityId: string): Segment[] => {
  const seen = new Set<string>();
  
  return data.elements
    .filter(element => element.type === 'way' && element.geometry)
    .filter(element => {
      const id = element.id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map(element => {
      const coordinates = element.geometry?.map(point => [point.lon, point.lat]) || [];
      const line = turf.lineString(coordinates);
      const length = turf.length(line, { units: 'kilometers' });

      const type = determineSegmentType(element.tags);
      if (!type) return null;

      return {
        id: element.id.toString(),
        id_cidade: cityId,
        name: element.tags.name || element.tags.alt_name || `Segmento ${element.id}`,
        type: type,
        length: parseFloat(length.toFixed(4)),
        geometry: {
          type: "MultiLineString",
          coordinates: [coordinates]
        },
        selected: false,
        evaluated: false
      };
    })
    .filter((segment): segment is Segment => segment !== null); 
};

export const mergeGeometry = (segments: Segment[]): any => {
  const allCoordinates: number[][][] = segments.flatMap(segment => segment.geometry.coordinates);

  return {
    type: "MultiLineString",
    coordinates: allCoordinates
  };
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

// New function to create merged segment with child segments
export const createMergedSegment = async (
  selectedSegments: Segment[], 
  mergedName: string, 
  mergedType: SegmentType
): Promise<{ mergedSegment: Segment; childSegments: Segment[] }> => {
  const mergedId = `merged-${Date.now()}`;
  const mergedGeometry = mergeGeometry(selectedSegments);
  const newLength = calculateMergedLength(selectedSegments);
  
  // Create the merged segment info for storage
  const mergedSegmentInfo = selectedSegments.map(segment => ({
    id: segment.id,
    name: segment.name,
    type: segment.type,
    length: segment.length,
    originalGeometry: segment.geometry
  }));

  // Create the parent merged segment
  const mergedSegment: Segment = {
    id: mergedId,
    id_cidade: selectedSegments[0].id_cidade,
    name: mergedName,
    type: mergedType,
    length: newLength,
    neighborhood: selectedSegments[0].neighborhood,
    geometry: mergedGeometry,
    selected: false,
    evaluated: false,
    is_merged: true,
    merged_segments: mergedSegmentInfo
  };

  // Create child segments that reference the parent
  const childSegments: Segment[] = selectedSegments.map(segment => ({
    ...segment,
    parent_segment_id: mergedId,
    is_merged: false, // Child segments are not marked as merged themselves
    selected: false
  }));

  return { mergedSegment, childSegments };
};

// Enhanced function to handle merging with already merged segments
export const mergeSegmentsInDB = async (
  selectedSegments: Segment[],
  mergedName: string,
  mergedType: SegmentType
): Promise<boolean> => {
  try {
    console.log("Starting merge process for segments:", selectedSegments.map(s => s.id));
    
    // Check if any of the selected segments is already a merged segment
    const alreadyMergedSegment = selectedSegments.find(s => s.is_merged && s.merged_segments);
    const newSegmentsToMerge = selectedSegments.filter(s => !s.is_merged || !s.merged_segments);
    
    if (alreadyMergedSegment && newSegmentsToMerge.length > 0) {
      console.log("Merging new segments with existing merged segment:", alreadyMergedSegment.id);
      
      // Get all existing merged segments info
      const existingMergedSegments = alreadyMergedSegment.merged_segments || [];
      
      // Create info for new segments being added
      const newMergedSegmentInfo = newSegmentsToMerge.map(segment => ({
        id: segment.id,
        name: segment.name,
        type: segment.type,
        length: segment.length,
        originalGeometry: segment.geometry
      }));
      
      // Combine existing and new merged segments info
      const allMergedSegments = [...existingMergedSegments, ...newMergedSegmentInfo];
      
      // Calculate new geometry by combining all segments
      const allSegmentsForGeometry = [
        alreadyMergedSegment,
        ...newSegmentsToMerge
      ];
      const updatedGeometry = mergeGeometry(allSegmentsForGeometry);
      const updatedLength = alreadyMergedSegment.length + newSegmentsToMerge.reduce((sum, s) => sum + s.length, 0);
      
      // Update the existing merged segment
      const updatedMergedSegment: Segment = {
        ...alreadyMergedSegment,
        name: mergedName,
        type: mergedType,
        length: parseFloat(updatedLength.toFixed(4)),
        geometry: updatedGeometry,
        merged_segments: allMergedSegments,
        selected: false
      };
      
      console.log("Updating existing merged segment:", updatedMergedSegment.id);
      await updateSegmentInDB(updatedMergedSegment);
      
      // Update the new segments to be children of the merged segment
      for (const newSegment of newSegmentsToMerge) {
        const childSegment: Segment = {
          ...newSegment,
          parent_segment_id: alreadyMergedSegment.id,
          selected: false
        };
        console.log("Updating new child segment:", childSegment.id);
        await updateSegmentInDB(childSegment);
      }
      
      return true;
    } else {
      // Standard merge of non-merged segments
      const { mergedSegment, childSegments } = await createMergedSegment(
        selectedSegments, 
        mergedName, 
        mergedType
      );

      console.log("Created merged segment:", mergedSegment.id);
      console.log("Child segments to update:", childSegments.map(s => s.id));

      // Save the merged segment first
      await saveSegmentToDB(mergedSegment);
      console.log("Saved merged segment to DB");

      // Update the original segments to be children of the merged segment
      for (const childSegment of childSegments) {
        console.log("Updating child segment:", childSegment.id);
        await updateSegmentInDB(childSegment);
      }

      console.log("Merge process completed successfully");
      return true;
    }
  } catch (error) {
    console.error("Error merging segments in database:", error);
    return false;
  }
};

// New function to unmerge segments
export const unmergeSegments = async (
  parentSegmentId: string, 
  segmentIdsToUnmerge: string[]
): Promise<boolean> => {
  try {
    return await unmergeSegmentsFromDB(parentSegmentId, segmentIdsToUnmerge);
  } catch (error) {
    console.error("Error unmerging segments:", error);
    return false;
  }
};

/**
 * Store city data in database
 */
export const storeCityData = async (cityId: string, data: { city: Partial<City>, segments: Segment[] }): Promise<boolean> => {
  try {
    // Store in database
    await saveCityToDB(data.city);
    await saveSegmentsToDB(data.segments);
    
    return true;
  } catch (error) {
    console.error("Error storing city data:", error);
    return false;
  }
};

export const storeSegment = async (segment: Segment): Promise<boolean> => {
  try {
    await saveSegmentToDB(segment);
    return true;
  } catch (error) {
    console.error("Error storing segment:", error);
    return false;
  }
};

export const removeSegments = async (segmentIds: string[]): Promise<boolean> => {
  try {
    await removeSegmentsFromDB(segmentIds);
    return true;
  } catch (error) {
    console.error("Error removing segments:", error);
    return false;
  }
};

/**
 * Get city data from database
 */
export const getStoredCityData = async (cityId: string): Promise<{ city: Partial<City>, segments: Segment[] } | null> => {
  try {
    // Try to get from database
    const city = await fetchCityFromDB(cityId);
    const segments = await fetchSegmentsFromDB(cityId);
    
    if (city && segments.length > 0) {
      console.log(`Found city ${cityId} in database`);
      return { city, segments };
    }
    console.log(`No data found for city ${cityId}`);
    return null;
  } catch (error) {
    console.error("Error getting stored city data:", error);    
    return null;
  }
};

export const updateSegmentName = async (cityId: string, segmentId: string, newName: string): Promise<boolean> => {
  try {
    // Update in database
    await updateSegmentInDB({ id: segmentId, name: newName });    
    return true;
  } catch (error) {
    console.error("Error updating segment name:", error);    
    return false;
  }
};
