
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
  unmergeSegmentsFromDB,
  fetchAllStoredCities
} from "./database";

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

// Helper function to get DF region name by ID
const getRegionNameById = (regionId: string): string | null => {
  const dfRegions: Record<string, string> = {
    '5300108001': 'Plano Piloto',
    '5300108002': 'Gama',
    '5300108003': 'Taguatinga',
    '5300108004': 'Brazlândia',
    '5300108005': 'Sobradinho',
    '5300108006': 'Planaltina',
    '5300108007': 'Paranoá',
    '5300108008': 'Núcleo Bandeirante',
    '5300108009': 'Ceilândia',
    '5300108010': 'Guará',
    '5300108011': 'Cruzeiro',
    '5300108012': 'Samambaia',
    '5300108013': 'Santa Maria',
    '5300108014': 'São Sebastião',
    '5300108015': 'Recanto das Emas',
    '5300108016': 'Lago Sul',
    '5300108017': 'Riacho Fundo',
    '5300108018': 'Lago Norte',
    '5300108019': 'Candangolândia',
    '5300108020': 'Águas Claras',
    '5300108021': 'Riacho Fundo II',
    '5300108022': 'Sudoeste/Octogonal',
    '5300108023': 'Varjão',
    '5300108024': 'Park Way',
    '5300108025': 'SCIA',
    '5300108026': 'Sobradinho II',
    '5300108027': 'Jardim Botânico',
    '5300108028': 'Itapoã',
    '5300108029': 'SIA',
    '5300108030': 'Vicente Pires',
    '5300108031': 'Fercal'
  };
  
  return dfRegions[regionId] || null;
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
    // Special case for Distrito Federal (DF) - stateId 53
    if (stateId === '53') {
      // Manually return Brasília and other Regiões Administrativas of DF
      return [
        { id: 5300108, nome: "Brasília" },
        { id: 5300108001, nome: "Plano Piloto" },
        { id: 5300108002, nome: "Gama" },
        { id: 5300108003, nome: "Taguatinga" },
        { id: 5300108004, nome: "Brazlândia" },
        { id: 5300108005, nome: "Sobradinho" },
        { id: 5300108006, nome: "Planaltina" },
        { id: 5300108007, nome: "Paranoá" },
        { id: 5300108008, nome: "Núcleo Bandeirante" },
        { id: 5300108009, nome: "Ceilândia" },
        { id: 5300108010, nome: "Guará" },
        { id: 5300108011, nome: "Cruzeiro" },
        { id: 5300108012, nome: "Samambaia" },
        { id: 5300108013, nome: "Santa Maria" },
        { id: 5300108014, nome: "São Sebastião" },
        { id: 5300108015, nome: "Recanto das Emas" },
        { id: 5300108016, nome: "Lago Sul" },
        { id: 5300108017, nome: "Riacho Fundo" },
        { id: 5300108018, nome: "Lago Norte" },
        { id: 5300108019, nome: "Candangolândia" },
        { id: 5300108020, nome: "Águas Claras" },
        { id: 5300108021, nome: "Riacho Fundo II" },
        { id: 5300108022, nome: "Sudoeste/Octogonal" },
        { id: 5300108023, nome: "Varjão" },
        { id: 5300108024, nome: "Park Way" },
        { id: 5300108025, nome: "SCIA" },
        { id: 5300108026, nome: "Sobradinho II" },
        { id: 5300108027, nome: "Jardim Botânico" },
        { id: 5300108028, nome: "Itapoã" },
        { id: 5300108029, nome: "SIA" },
        { id: 5300108030, nome: "Vicente Pires" },
        { id: 5300108031, nome: "Fercal" }
      ];
    }
    
    // Normal case for other states
    const response = await fetchWithRetry(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`);
    return response.json();
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw new Error(`Não foi possível carregar as cidades do estado ${stateId}. Por favor, tente novamente mais tarde.`);
  }
};

export const getOverpassAreaId = async (cityId: string): Promise<number> => {
  try {
    // Special case for Distrito Federal regions
    if (cityId.startsWith('5300108') && cityId !== '5300108') {
      // For RAs of DF, use the main Brasília area ID
      // We'll use the name-based query instead of IBGE code
      const raName = getRegionNameById(cityId);
      if (raName) {
        const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
        const query = `
          [out:json][timeout:900];
          area["name"="${raName}"]["admin_level"="9"]["is_in:state"="Distrito Federal"];
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
        
        if (areaId) {
          return areaId;
        }
        
        // Fallback to Brasília if specific RA not found
        console.log(`RA ${raName} not found in OSM, falling back to Brasília`);
        return await getOverpassAreaId('5300108');
      }
    }
    
    // Special case for Brasília (main city of DF)
    if (cityId === '5300108') {
      // Try multiple approaches to find Brasília/DF
      const queries = [
        // Try by name and admin level
        `
        [out:json][timeout:900];
        area["name"="Distrito Federal"]["admin_level"="4"]["ISO3166-2"="BR-DF"];
        out ids;
        `,
        // Try by relation ID directly (Distrito Federal relation in OSM)
        `
        [out:json][timeout:900];
        area(3406826);
        out ids;
        `,
        // Try by name only
        `
        [out:json][timeout:900];
        area["name"="Distrito Federal"]["admin_level"="4"];
        out ids;
        `
      ];
      
      const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
      
      // Try each query until we find a valid area ID
      for (const query of queries) {
        try {
          const response = await fetchWithRetry(OVERPASS_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: query,
          });
          
          const data = await response.json();
          const areaId = data.elements[0]?.id;
          
          if (areaId) {
            console.log(`Found area ID ${areaId} for Distrito Federal`);
            return areaId;
          }
        } catch (err) {
          console.log(`Query failed, trying next approach: ${err}`);
          continue;
        }
      }
      
      // If all queries fail, use a hardcoded area ID for Distrito Federal
      // This is the area ID for Distrito Federal in OSM (3600003406826 + 3600000000)
      console.log("Using hardcoded area ID for Distrito Federal");
      return 3603406826;
    }
    
    // Standard approach for other cities using IBGE code
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

    // Increase timeout for Distrito Federal regions
    const timeout = cityId.startsWith('53001') ? 1200 : 900;

    const query = `
      [out:json][timeout:${timeout}];
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
    
    // Increase timeout for Distrito Federal regions
    const timeout = cityId.startsWith('53001') ? 120 : 60;
    
    // First query: Get all bicycle infrastructure
    const cycleQuery = `
    [out:json][timeout:${timeout}];
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

    const cycleResponse = await fetchWithRetry(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: cycleQuery,
    }, 3, 2000);
    
    const cycleData = await cycleResponse.json();
    
    // Extract dedicated cycleways that need classification
    const cyclewaysToClassify = cycleData.elements.filter(
      element => element.type === 'way' && 
                element.tags.highway === 'cycleway' && 
                element.geometry
    );
    
    // If there are no cycleways to classify, return the original data
    if (cyclewaysToClassify.length === 0) {
      return cycleData;
    }
    
    // Create a bounding box for all cycleways to limit the road query area
    const allCoords = cyclewaysToClassify.flatMap(way => way.geometry || []);
    if (allCoords.length === 0) {
      return cycleData;
    }
    
    const lats = allCoords.map(coord => coord.lat);
    const lons = allCoords.map(coord => coord.lon);
    
    const minLat = Math.min(...lats) - 0.001; // Add small buffer
    const maxLat = Math.max(...lats) + 0.001;
    const minLon = Math.min(...lons) - 0.001;
    const maxLon = Math.max(...lons) + 0.001;
    
    // Second query: Get only roads that might be near cycleways
    // Use a larger buffer to ensure we get all relevant roads
    const bufferDegrees = 0.005; // Approximately 500m at the equator
    // Increase timeout for Distrito Federal regions
    const roadsTimeout = cityId.startsWith('53001') ? 120 : 60;
    
    const roadsQuery = `
    [out:json][timeout:${roadsTimeout}];
    (
      // Primary roads
      way["highway"~"^(motorway|motorway_link|trunk|trunk_link|primary|primary_link)$"](${minLat-bufferDegrees},${minLon-bufferDegrees},${maxLat+bufferDegrees},${maxLon+bufferDegrees});
      
      // Secondary roads
      way["highway"~"^(secondary|secondary_link|tertiary|tertiary_link)$"](${minLat-bufferDegrees},${minLon-bufferDegrees},${maxLat+bufferDegrees},${maxLon+bufferDegrees});
      
      // Local roads
      way["highway"~"^(residential|unclassified)$"](${minLat-bufferDegrees},${minLon-bufferDegrees},${maxLat+bufferDegrees},${maxLon+bufferDegrees});
    );
    out geom;
    `;
    
    const roadsResponse = await fetchWithRetry(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: roadsQuery,
    }, 3, 2000);
    
    const roadsData = await roadsResponse.json();
    
    // Combine both responses
    return {
      ...cycleData,
      elements: [...cycleData.elements, ...roadsData.elements]
    };
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

/**
 * Determines the classification of a segment based on its highway tag.
 * 
 * Classification mapping:
 * - "estrutural": motorway, motorway_link, trunk, trunk_link, primary, primary_link
 * - "alimentadora": secondary, secondary_link, tertiary, tertiary_link
 * - "local": residential, unclassified
 * 
 * For cycleways (highway=cycleway), the classification is determined by looking at nearby roads
 * using the findNearbyRoad function, which checks for roads within a certain distance of the cycleway.
 * 
 * @param tags - The OSM tags of the segment
 * @returns The classification as "estrutural", "alimentadora", "local", or undefined if not classifiable
 */
export const determineSegmentClassification = (tags: Record<string, string>): string | undefined => {
  const highway = tags['highway'];
  
  // If no highway tag exists, return undefined
  if (!highway) {
    return undefined;
  }
  
  // Estruturais: motorway, motorway_link, trunk, trunk_link, primary, primary_link
  if (['motorway', 'motorway_link', 'trunk', 'trunk_link', 'primary', 'primary_link'].includes(highway)) {
    return "estrutural";
  } 
  // Alimentadoras: secondary, secondary_link, tertiary, tertiary_link
  else if (['secondary', 'secondary_link', 'tertiary', 'tertiary_link'].includes(highway)) {
    return "alimentadora";
  } 
  // Locais: residential, unclassified
  else if (['residential', 'unclassified'].includes(highway)) {
    return "local";
  }
  
  // For cycleway and other highway types, return undefined (não classificada)
  return undefined;
};

// Function to find nearby roads for cycleways
export const findNearbyRoad = (
  cycleway: OverpassElement, 
  roads: OverpassElement[], 
  maxDistance: number = 0.05 // 50 meters in kilometers
): OverpassElement | null => {
  try {
    if (!cycleway.geometry || cycleway.geometry.length < 2) {
      return null;
    }
    
    // Highway types in order of priority (highest to lowest)
    const highwayPriority = [
      'motorway', 'motorway_link', 'trunk', 'trunk_link', 'primary', 'primary_link',
      'secondary', 'secondary_link', 'tertiary', 'tertiary_link',
      'residential', 'unclassified'
    ];
    
    // First, try to match by name if available
    if (cycleway.tags.name) {
      // Look for roads with the same name or matching ref
      const nameMatches = roads.filter(road => {
        // Exact name match
        if (road.tags.name && road.tags.name === cycleway.tags.name) {
          return true;
        }
        
        // Partial name match (for cases like "Ciclovia Avenida X" and "Avenida X")
        if (road.tags.name && 
            (cycleway.tags.name.includes(road.tags.name) || 
             road.tags.name.includes(cycleway.tags.name))) {
          return true;
        }
        
        // Reference number match
        if (road.tags.ref && cycleway.tags.name.includes(road.tags.ref)) {
          return true;
        }
        
        return false;
      });
      
      if (nameMatches.length > 0) {
        // Sort roads by highway priority
        const sortedRoads = [...nameMatches].sort((a, b) => {
          const aIndex = highwayPriority.indexOf(a.tags.highway);
          const bIndex = highwayPriority.indexOf(b.tags.highway);
          
          // If both roads have a priority, sort by priority (lower index = higher priority)
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          
          // If only one road has a priority, it comes first
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          
          // If neither has a priority, keep original order
          return 0;
        });
        
        // Return the highest priority road
        return sortedRoads[0];
      }
    }
    
    // If no name match, use spatial proximity
    const cyclewayCoords = cycleway.geometry.map(point => [point.lon, point.lat]);
    const cyclewayLine = turf.lineString(cyclewayCoords);
    
    // Create a buffer around the cycleway
    const buffer = turf.buffer(cyclewayLine, maxDistance, { units: 'kilometers' });
    
    // Find roads that intersect with the buffer
    const nearbyRoads = roads.filter(road => {
      if (!road.geometry || road.geometry.length < 2) return false;
      
      try {
        const roadCoords = road.geometry.map(point => [point.lon, point.lat]);
        const roadLine = turf.lineString(roadCoords);
        
        // Check if the road intersects with the buffer
        return turf.booleanIntersects(roadLine, buffer);
      } catch (err) {
        return false;
      }
    });
    
    if (nearbyRoads.length === 0) {
      return null;
    }
    
    // Filter roads with classification
    const classifiableRoads = nearbyRoads.filter(road => 
      highwayPriority.includes(road.tags.highway)
    );
    
    if (classifiableRoads.length === 0) {
      return nearbyRoads[0];
    }
    
    // Group roads by highway type
    const roadsByType: Record<string, OverpassElement[]> = {};
    
    for (const road of classifiableRoads) {
      const highway = road.tags.highway;
      if (!roadsByType[highway]) {
        roadsByType[highway] = [];
      }
      roadsByType[highway].push(road);
    }
    
    // Process road types in priority order
    for (const highwayType of highwayPriority) {
      const roadsOfType = roadsByType[highwayType];
      if (!roadsOfType || roadsOfType.length === 0) continue;
      
      // Find the closest road of this type
      let closestRoad = roadsOfType[0];
      let minDistance = Infinity;
      
      for (const road of roadsOfType) {
        try {
          const roadCoords = road.geometry.map(point => [point.lon, point.lat]);
          const roadLine = turf.lineString(roadCoords);
          
          // Calculate minimum distance between the cycleway and road
          const distance = turf.pointToLineDistance(
            turf.point(cyclewayCoords[0]), 
            roadLine, 
            { units: 'kilometers' }
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            closestRoad = road;
          }
        } catch (err) {
          continue;
        }
      }
      
      // If we found a road of this type within the distance threshold, return it
      if (minDistance <= maxDistance) {
        console.log(`Found ${highwayType} road "${closestRoad.tags.name || 'unnamed'}" at distance ${minDistance.toFixed(5)}km`);
        return closestRoad;
      }
    }
    
    // If we didn't find any high-priority roads within the threshold,
    // fall back to the closest road of any type
    let closestRoad = classifiableRoads[0];
    let minDistance = Infinity;
    
    for (const road of classifiableRoads) {
      try {
        const roadCoords = road.geometry.map(point => [point.lon, point.lat]);
        const roadLine = turf.lineString(roadCoords);
        
        const distance = turf.pointToLineDistance(
          turf.point(cyclewayCoords[0]), 
          roadLine, 
          { units: 'kilometers' }
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestRoad = road;
        }
      } catch (err) {
        continue;
      }
    }
    
    console.log(`Falling back to closest road "${closestRoad.tags.name || 'unnamed'}" (${closestRoad.tags.highway}) at distance ${minDistance.toFixed(5)}km`);
    return closestRoad;
    
    return closestRoad;
  } catch (error) {
    console.error("Error finding nearby road:", error);
    return null;
  }
};

export const convertToSegments = (data: OverpassResponse, cityId: string): Segment[] => {
  const seen = new Set<string>();
  
  try {
    // Separate cycleways from roads
    const cycleways = data.elements.filter(element => 
      element.type === 'way' && 
      element.geometry && 
      (
        element.tags.highway === 'cycleway' || 
        element.tags.cycleway || 
        element.tags['cycleway:left'] || 
        element.tags['cycleway:right'] || 
        element.tags['cycleway:both'] ||
        (element.tags.highway === 'footway' && element.tags.bicycle) ||
        (element.tags.highway === 'pedestrian' && element.tags.bicycle)
      )
    );
    
    // Regular roads for classification
    const roads = data.elements.filter(element => 
      element.type === 'way' && 
      element.geometry && 
      element.tags.highway && 
      !element.tags.cycleway &&
      !element.tags['cycleway:left'] &&
      !element.tags['cycleway:right'] &&
      !element.tags['cycleway:both'] &&
      element.tags.highway !== 'cycleway' &&
      !(element.tags.highway === 'footway' && element.tags.bicycle) &&
      !(element.tags.highway === 'pedestrian' && element.tags.bicycle)
    );
    
    return cycleways
      .filter(element => {
        const id = element.id.toString();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map(element => {
        try {
          // Ensure geometry exists and has valid coordinates
          if (!element.geometry || element.geometry.length < 2) {
            console.warn(`Skipping segment ${element.id} due to invalid geometry`);
            return null;
          }
          
          const coordinates = element.geometry.map(point => [point.lon, point.lat]) || [];
          
          // Validate coordinates
          if (coordinates.length < 2) {
            console.warn(`Skipping segment ${element.id} due to insufficient coordinates`);
            return null;
          }
          
          // Create a valid line string for length calculation
          const line = turf.lineString(coordinates);
          const length = turf.length(line, { units: 'kilometers' });

          const type = determineSegmentType(element.tags);
          if (!type) {
            console.warn(`Skipping segment ${element.id} due to undetermined type`);
            return null;
          }
          
          // Get classification from the segment's own tags
          let classification = determineSegmentClassification(element.tags);
          
          // For cycleways, always try to find a nearby road for classification
          // This ensures cycleways like Avenida Beira Mar get properly classified
          if (element.tags.highway === 'cycleway') {
            console.log(`Looking for classification for cycleway ${element.id} (${element.tags.name || 'unnamed'})`);
            const nearbyRoad = findNearbyRoad(element, roads);
            if (nearbyRoad) {
              const roadClassification = determineSegmentClassification(nearbyRoad.tags);
              if (roadClassification) {
                classification = roadClassification;
                console.log(`Classified cycleway ${element.id} (${element.tags.name || 'unnamed'}) as ${classification} based on nearby road ${nearbyRoad.id} (${nearbyRoad.tags.name || 'unnamed'}) with highway=${nearbyRoad.tags.highway}`);
              } else {
                console.log(`Found nearby road ${nearbyRoad.id} (${nearbyRoad.tags.name || 'unnamed'}) with highway=${nearbyRoad.tags.highway} but couldn't determine classification`);
              }
            } else {
              console.log(`No nearby road found for cycleway ${element.id} (${element.tags.name || 'unnamed'})`);
            }
          }

          return {
            id: element.id.toString(),
            id_cidade: cityId,
            name: element.tags.name || element.tags.alt_name || `Segmento ${element.id}`,
            type: type,
            classification: classification,
            length: parseFloat(length.toFixed(4)),
            geometry: {
              type: "MultiLineString",
              coordinates: [coordinates]
            },
            selected: false,
            evaluated: false
          };
        } catch (error) {
          console.error(`Error processing segment ${element.id}:`, error);
          return null;
        }
      })
      .filter((segment): segment is Segment => segment !== null);
  } catch (error) {
    console.error("Error in convertToSegments:", error);
    return [];
  }
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
  mergedType: SegmentType,
  mergedClassification?: string
): Promise<{ mergedSegment: Segment; childSegments: Segment[] }> => {
  const mergedId = `merged-${Date.now()}`;
  const mergedGeometry = mergeGeometry(selectedSegments);
  const newLength = calculateMergedLength(selectedSegments);
  
  // Use the provided classification if available
  // Otherwise, determine classification for merged segment
  // If all segments have the same classification, use that
  if (mergedClassification === undefined) {
    const classifications = selectedSegments
      .map(segment => segment.classification)
      .filter((c): c is string => c !== undefined);
    
    if (classifications.length > 0) {
      const classificationCounts = classifications.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Check if all segments have the same classification
      if (Object.keys(classificationCounts).length === 1) {
        mergedClassification = Object.keys(classificationCounts)[0];
      }
      // Otherwise, we'll let the user choose in the UI
    }
  }
  
  // Create the merged segment info for storage
  const mergedSegmentInfo = selectedSegments.map(segment => ({
    id: segment.id,
    name: segment.name,
    type: segment.type,
    classification: segment.classification,
    length: segment.length,
    originalGeometry: segment.geometry
  }));

  // Create the parent merged segment
  const mergedSegment: Segment = {
    id: mergedId,
    id_cidade: selectedSegments[0].id_cidade,
    name: mergedName,
    type: mergedType,
    classification: mergedClassification,
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
  mergedType: SegmentType,
  mergedClassification?: string
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
        classification: mergedClassification,
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
        mergedType,
        mergedClassification
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

export const deleteMultipleSegments = async (segmentIds: string[]): Promise<boolean> => {
  try {
    await removeSegmentsFromDB(segmentIds);
    return true;
  } catch (error) {
    console.error("Error deleting multiple segments:", error);
    return false;
  }
};

/**
 * Fetch all cities that have been stored in the database
 */
export const fetchStoredCities = async (): Promise<City[]> => {
  try {
    const cities = await fetchAllStoredCities();
    return cities;
  } catch (error) {
    console.error("Error fetching stored cities:", error);
    return [];
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

// Debug function to analyze cycleway classification results
export const analyzeCyclewayClassification = (segments: Segment[]): { 
  total: number, 
  classified: number, 
  unclassified: number,
  byClassification: Record<string, number>,
  unclassifiedNames: string[]
} => {
  const cycleways = segments.filter(segment => segment.type === SegmentType.CICLOVIA);
  
  const classified = cycleways.filter(segment => segment.classification).length;
  const unclassified = cycleways.length - classified;
  
  const byClassification: Record<string, number> = {};
  const unclassifiedNames: string[] = [];
  
  cycleways.forEach(segment => {
    if (segment.classification) {
      byClassification[segment.classification] = (byClassification[segment.classification] || 0) + 1;
    } else {
      unclassifiedNames.push(segment.name);
    }
  });
  
  return {
    total: cycleways.length,
    classified,
    unclassified,
    byClassification,
    unclassifiedNames
  };
};
