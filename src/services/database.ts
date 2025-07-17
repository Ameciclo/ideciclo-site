import { supabase } from "@/integrations/supabase/client";
import { City, Segment, Form, Review, SegmentType, RatingType } from "@/types";
import { Database } from "@/integrations/supabase/types";

// Type aliases for database row types
type CityRow = Database['public']['Tables']['cities']['Row'];
type SegmentRow = Database['public']['Tables']['segments']['Row'];
type FormRow = Database['public']['Tables']['forms']['Row'];
type ReviewRow = Database['public']['Tables']['reviews']['Row'];

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

const convertSegmentRowToSegment = (row: SegmentRow): Segment => ({
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
  merged_segments: row.merged_segments as any[] || [],
  classification: row.classification || undefined,
});

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
  // Ensure required fields are present
  if (!city.id || !city.name || !city.state) {
    console.error("Required city fields missing");
    return null;
  }

  // Check if city already exists
  const { data: existingCity } = await supabase
    .from('cities')
    .select('*')
    .eq('id', city.id)
    .single();

  let operation;
  if (existingCity) {
    // Update
    operation = supabase
      .from('cities')
      .update({
        name: city.name,
        state: city.state,
        extensao_avaliada: city.extensao_avaliada || 0,
        ideciclo: city.ideciclo || 0,
        vias_estruturais_km: city.vias_estruturais_km || 0,
        vias_alimentadoras_km: city.vias_alimentadoras_km || 0,
        vias_locais_km: city.vias_locais_km || 0,
      })
      .eq('id', city.id);
  } else {
    // Insert
    operation = supabase
      .from('cities')
      .insert({
        id: city.id,
        name: city.name,
        state: city.state,
        extensao_avaliada: city.extensao_avaliada || 0,
        ideciclo: city.ideciclo || 0,
        vias_estruturais_km: city.vias_estruturais_km || 0,
        vias_alimentadoras_km: city.vias_alimentadoras_km || 0,
        vias_locais_km: city.vias_locais_km || 0,
      });
  }

  const { data, error } = await operation.select().single();

  if (error) {
    console.error("Error saving city:", error);
    return null;
  }

  return convertCityRowToCity(data);
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
  
  // Now fetch from the database
  const { data, error } = await supabase
    .from('segments')
    .select('*')
    .eq('id_cidade', cityId)
    .is('parent_segment_id', null); // Only fetch top-level segments

  if (error) {
    console.error("Error fetching segments:", error);
    return [];
  }

  // Check if we have segments in the database
  if (data && data.length > 0) {
    console.log(`Found ${data.length} segments in database for city ${cityId}, using database data`);
    
    // Create a Set to track unique IDs
    const uniqueIds = new Set<string>();
    
    // Convert the data and restore original segment IDs (remove city prefix if needed)
    const segments = data
      .map(row => {
        const segment = convertSegmentRowToSegment(row);
        
        // If the ID has the city prefix, remove it for consistency with the rest of the app
        if (segment.id.startsWith(`${cityId}_`)) {
          segment.id = segment.id.substring(cityId.length + 1);
        }
        
        // Also fix parent_segment_id if it exists
        if (segment.parent_segment_id && segment.parent_segment_id.startsWith(`${cityId}_`)) {
          segment.parent_segment_id = segment.parent_segment_id.substring(cityId.length + 1);
        }
        
        return segment;
      })
      // Filter out duplicates
      .filter(segment => {
        if (uniqueIds.has(segment.id)) {
          console.warn(`Duplicate segment ID found: ${segment.id}`);
          return false;
        }
        uniqueIds.add(segment.id);
        return true;
      });
    
    console.log(`Fetched ${segments.length} unique segments for city ${cityId} from database`);
    return segments;
  } else {
    console.log(`No segments found in database for city ${cityId}, will need to fetch from OSM`);
    return [];
  }
};

export const saveSegmentToDB = async (segment: Segment): Promise<boolean> => {
  try {
    // Make segment ID unique by prefixing with city ID if not already prefixed
    const segmentId = segment.id.includes('_') ? segment.id : `${segment.id_cidade}_${segment.id}`;
    
    // Also update parent_segment_id if it exists
    const parentSegmentId = segment.parent_segment_id ? 
      (segment.parent_segment_id.includes('_') ? segment.parent_segment_id : `${segment.id_cidade}_${segment.parent_segment_id}`) : 
      null;
    
    const { error } = await supabase
      .from('segments')
      .insert({
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
        classification: segment.classification
      });

    if (error) {
      console.error("Error inserting segment:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error inserting segment:", error);
    return false;
  }
};

export const removeSegmentsFromDB = async (segmentIds: string[]): Promise<boolean> => {
  if (segmentIds.length === 0) {
    console.warn("No segment IDs provided for deletion.");
    return false;
  }
  try {
    // Get all segments to find their city IDs
    const { data: segments } = await supabase
      .from('segments')
      .select('id, id_cidade')
      .in('id', segmentIds);
    
    if (!segments || segments.length === 0) {
      // Try to find segments with prefixed IDs
      const prefixedIds = await Promise.all(segmentIds.map(async (id) => {
        // Check if this ID already exists in the database
        const { data } = await supabase
          .from('segments')
          .select('id')
          .eq('id', id)
          .single();
          
        if (data) {
          return id; // ID already exists as is
        }
        
        // If not found, it might need a city prefix
        // Try to find it by looking for IDs ending with this ID
        const { data: matches } = await supabase
          .from('segments')
          .select('id')
          .like('id', `%_${id}`);
          
        if (matches && matches.length > 0) {
          return matches[0].id; // Return the first match
        }
        
        return id; // Default to original ID if no match found
      }));
      
      // First, handle any child segments by moving them back to top-level
      const { data: childSegments } = await supabase
        .from('segments')
        .select('*')
        .in('parent_segment_id', prefixedIds);

      if (childSegments && childSegments.length > 0) {
        await supabase
          .from('segments')
          .update({ 
            parent_segment_id: null,
            is_merged: false 
          })
          .in('parent_segment_id', prefixedIds);
      }

      // Delete the segments
      const { error } = await supabase
        .from('segments')
        .delete()
        .in('id', prefixedIds);
      
      if (error) {
        console.error("Error deleting segments:", error);
        return false;
      }
      
      return true;
    }
    
    // Map segment IDs to their prefixed versions
    const idMap = new Map();
    segments.forEach(segment => {
      const cityId = segment.id_cidade;
      const originalId = segment.id.includes('_') ? 
        segment.id.substring(segment.id.indexOf('_') + 1) : 
        segment.id;
      
      idMap.set(originalId, segment.id);
    });
    
    // Get the prefixed IDs for deletion
    const prefixedIds = segmentIds.map(id => idMap.get(id) || id);
    
    // First, handle any child segments by moving them back to top-level
    const { data: childSegments } = await supabase
      .from('segments')
      .select('*')
      .in('parent_segment_id', prefixedIds);

    if (childSegments && childSegments.length > 0) {
      await supabase
        .from('segments')
        .update({ 
          parent_segment_id: null,
          is_merged: false 
        })
        .in('parent_segment_id', prefixedIds);
    }

    // Delete the segments
    const { error } = await supabase
      .from('segments')
      .delete()
      .in('id', prefixedIds);
    
    if (error) {
      console.error("Error deleting segments:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error deleting segments:", error);
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
    // Filter out segments with duplicate IDs
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
    
    // First, delete existing segments for this city
    console.log(`Deleting existing segments for city ${cityId}`);
    const { error: deleteError } = await supabase
      .from('segments')
      .delete()
      .eq('id_cidade', cityId);

    if (deleteError) {
      console.error("Error deleting existing segments:", deleteError);
      return false;
    }
    
    // Map segments to the format expected by the database
    // Make segment IDs unique by prefixing with city ID
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
      classification: segment.classification || null // Ensure null instead of undefined
    }));

    // Split segments into batches of 50 to avoid timeouts or payload size limits
    const BATCH_SIZE = 50;
    console.log(`Inserting ${segmentsToInsert.length} segments in batches of ${BATCH_SIZE}`);
    
    let allBatchesSuccessful = true;
    
    for (let i = 0; i < segmentsToInsert.length; i += BATCH_SIZE) {
      const batch = segmentsToInsert.slice(i, i + BATCH_SIZE);
      console.log(`Inserting batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(segmentsToInsert.length/BATCH_SIZE)}`);
      
      // Try up to 3 times for each batch
      let batchSuccess = false;
      
      for (let attempt = 1; attempt <= 3 && !batchSuccess; attempt++) {
        try {
          const { error: insertError } = await supabase
            .from('segments')
            .insert(batch);

          if (!insertError) {
            batchSuccess = true;
          } else if (attempt < 3) {
            console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1} failed (attempt ${attempt}), retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          } else {
            console.error(`Error inserting batch ${Math.floor(i/BATCH_SIZE) + 1} after ${attempt} attempts:`, insertError);
          }
        } catch (err) {
          if (attempt < 3) {
            console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1} failed with exception (attempt ${attempt}), retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.error(`Exception inserting batch ${Math.floor(i/BATCH_SIZE) + 1} after ${attempt} attempts:`, err);
          }
        }
      }
      
      if (!batchSuccess) {
        allBatchesSuccessful = false;
        break;
      }
    }
    
    if (allBatchesSuccessful) {
      console.log(`Successfully inserted all ${segmentsToInsert.length} segments for city ${cityId}`);
      return true;
    } else {
      console.error(`Failed to insert all segments for city ${cityId}`);
      return false;
    }
  } catch (error) {
    console.error("Unexpected error in saveSegmentsToDB:", error);
    return false;
  }
};

export const updateSegmentInDB = async (segment: Partial<Segment>): Promise<Segment | null> => {
  if (!segment.id) {
    console.error("Segment ID is required for updates");
    return null;
  }
  
  // Get the city ID to construct the full segment ID
  let cityId = segment.id_cidade;
  
  if (!cityId) {
    // If city ID is not provided, try to get it from the database
    const { data: segmentData } = await supabase
      .from('segments')
      .select('id_cidade')
      .eq('id', segment.id)
      .single();
      
    if (segmentData) {
      cityId = segmentData.id_cidade;
    }
  }
  
  // Determine the ID to use for the update
  // If the ID already contains an underscore, assume it's already prefixed
  // Otherwise, try to prefix it with the city ID if available
  const updateId = segment.id.includes('_') ? 
    segment.id : 
    (cityId ? `${cityId}_${segment.id}` : segment.id);
  
  // Also handle parent_segment_id if it exists
  let parentSegmentId = segment.parent_segment_id;
  if (parentSegmentId && cityId && !parentSegmentId.includes('_')) {
    parentSegmentId = `${cityId}_${parentSegmentId}`;
  }
  
  const { data, error } = await supabase
    .from('segments')
    .update({
      name: segment.name,
      type: segment.type,
      length: segment.length,
      neighborhood: segment.neighborhood,
      geometry: segment.geometry,
      selected: segment.selected,
      evaluated: segment.evaluated,
      id_form: segment.id_form,
      is_merged: segment.is_merged,
      parent_segment_id: parentSegmentId,
      merged_segments: segment.merged_segments,
      classification: segment.classification
    })
    .eq('id', updateId)
    .select()
    .single();

  if (error) {
    console.error("Error updating segment:", error);
    return null;
  }

  // Convert and restore original ID format
  const result = convertSegmentRowToSegment(data);
  if (result.id.includes('_') && cityId) {
    result.id = result.id.substring(result.id.indexOf('_') + 1);
  }
  
  if (result.parent_segment_id && result.parent_segment_id.includes('_')) {
    result.parent_segment_id = result.parent_segment_id.substring(result.parent_segment_id.indexOf('_') + 1);
  }
  
  return result;
};

// New function to unmerge segments
export const unmergeSegmentsFromDB = async (parentSegmentId: string, segmentIdsToUnmerge: string[]): Promise<boolean> => {
  try {
    console.log("Unmerging segments from parent:", parentSegmentId);
    console.log("Segments to unmerge:", segmentIdsToUnmerge);
    
    // Try to find the parent segment directly
    let { data: parentSegment, error: fetchError } = await supabase
      .from('segments')
      .select('*')
      .eq('id', parentSegmentId);
    
    // If not found, try with a wildcard search (for prefixed IDs)
    if (fetchError || !parentSegment || parentSegment.length === 0) {
      console.log("Parent segment not found with exact ID, trying wildcard search");
      const { data: segments, error: wildcardError } = await supabase
        .from('segments')
        .select('*')
        .like('id', `%${parentSegmentId}`);
      
      if (wildcardError || !segments || segments.length === 0) {
        console.error("Parent segment not found with wildcard search:", wildcardError || "No results");
        return false;
      }
      
      parentSegment = segments;
    }
    
    // Ensure we have exactly one parent segment
    if (parentSegment.length !== 1) {
      console.error(`Expected 1 parent segment, found ${parentSegment.length}`);
      return false;
    }
    
    const parent = parentSegment[0];
    console.log("Found parent segment:", parent.id);
    
    if (!parent.merged_segments || !Array.isArray(parent.merged_segments) || parent.merged_segments.length === 0) {
      console.error("Parent segment has no merged segments");
      return false;
    }
    
    // 2. Filter out the segments to unmerge from the merged_segments array
    const remainingMergedSegments = parent.merged_segments.filter(
      (segment: any) => !segmentIdsToUnmerge.includes(segment.id)
    );
    
    console.log(`Filtered merged segments: ${parent.merged_segments.length} -> ${remainingMergedSegments.length}`);
    
    // 3. Update the parent segment with the remaining merged segments
    const { error: updateError } = await supabase
      .from('segments')
      .update({
        merged_segments: remainingMergedSegments,
        is_merged: remainingMergedSegments.length > 0
      })
      .eq('id', parent.id);

    if (updateError) {
      console.error("Error updating parent segment:", updateError);
      return false;
    }
    
    // Set parent_segment_id to null for unmerged segments
    for (const segmentId of segmentIdsToUnmerge) {
      // Try to find the segment with exact ID or with city prefix
      const { error: resetError } = await supabase
        .from('segments')
        .update({ 
          parent_segment_id: null,
          is_merged: false
        })
        .or(`id.eq.${segmentId},id.like.%_${segmentId}`);
      
      if (resetError) {
        console.error(`Error resetting parent_segment_id for segment ${segmentId}:`, resetError);
      }
    }

    // 4. If no segments remain, delete the parent segment
    if (remainingMergedSegments.length === 0) {
      const { error: deleteError } = await supabase
        .from('segments')
        .delete()
        .eq('id', parent.id);

      if (deleteError) {
        console.error("Error deleting parent segment:", deleteError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Unexpected error unmerging segments:", error);
    return false;
  }
};

// Helper function to merge geometries
const mergeGeometries = (geometries: any[]): any => {
  const allCoordinates: number[][][] = geometries.flatMap(geometry => 
    geometry?.coordinates || []
  );

  return {
    type: "MultiLineString",
    coordinates: allCoordinates
  };
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
  // Ensure required fields are present
  if (!form.id || !form.segment_id || !form.city_id) {
    console.error("Required form fields missing");
    return null;
  }

  // Convert date fields to ISO strings for database storage
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

  const { data, error } = await supabase
    .from('forms')
    .insert(formToInsert)
    .select()
    .single();

  if (error) {
    console.error("Error saving form:", error);
    return null;
  }

  // Update the segment to mark it as evaluated
  if (form.segment_id) {
    const { error: updateError } = await supabase
      .from('segments')
      .update({ 
        evaluated: true,
        id_form: form.id 
      })
      .eq('id', form.segment_id);

    if (updateError) {
      console.error("Error updating segment evaluation status:", updateError);
    }
  }

  return convertFormRowToForm(data);
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

  // Prepare reviews for insertion by ensuring they match the database schema
  const reviewsToInsert = reviews.map(review => ({
    id: review.id,
    form_id: review.form_id,
    rating_name: review.rating_name,
    rating: review.rating,
    weight: review.weight
  }));

  const { error } = await supabase
    .from('reviews')
    .insert(reviewsToInsert);

  if (error) {
    console.error("Error saving reviews:", error);
    return false;
  }

  return true;
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
    const { error } = await supabase.from("cities").delete().eq("id", cityId);
    
    if (error) {
      console.error("Error deleting city:", error);
      return false;
    }
    
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
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("segment_id", segmentId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error fetching form by segment ID:", error);
    }

    return data || null;
  } catch (error) {
    console.error("Error fetching form by segment ID:", error);
    return null;
  }
};

export const fetchSegmentById = async (segmentId: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from("segments")
      .select("*")
      .eq("id", segmentId)
      .single();

    if (error) {
      console.error("Error fetching segment by ID:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching segment by ID:", error);
    return null;
  }
};

export const updateFormInDB = async (formId: string, formData: any): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from("forms")
      .update(formData)
      .eq("id", formId)
      .select()
      .single();

    if (error) {
      console.error("Error updating form:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error updating form:", error);
    return null;
  }
};

export const createFormInDB = async (formData: any): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from("forms")
      .insert(formData)
      .select()
      .single();

    if (error) {
      console.error("Error creating form:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error creating form:", error);
    return null;
  }
};

export const updateSegmentEvaluationStatus = async (segmentId: string, formId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("segments")
      .update({
        evaluated: true,
        id_form: formId,
      })
      .eq("id", segmentId);

    if (error) {
      console.error("Error updating segment evaluation status:", error);
      return false;
    }

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
    const { data, error } = await supabase
      .from("segments")
      .select("*")
      .eq("id_cidade", cityId);

    if (error) {
      console.error("Error fetching segments:", error);
      return [];
    }

    return data as Segment[];
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

// Function to clear all caches (localStorage and Supabase)
export const clearAllCaches = async (): Promise<void> => {
  try {
    // 1. Clear localStorage
    clearLocalStorage();
    
    // 2. Clear Supabase cache by refreshing the client
    // This will clear any cached queries in the Supabase client
    await supabase.auth.refreshSession();
    
    // 3. Clear browser cache for Supabase API requests
    try {
      const cachesToClear = await caches.keys();
      for (const cacheName of cachesToClear) {
        // Only clear caches related to our app or Supabase
        if (cacheName.includes('supabase') || cacheName.includes('ideciclo')) {
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
