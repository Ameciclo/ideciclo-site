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
  const { data, error } = await supabase
    .from('segments')
    .select('*')
    .eq('id_cidade', cityId)
    .is('parent_segment_id', null); // Only fetch top-level segments

  if (error) {
    console.error("Error fetching segments:", error);
    return [];
  }

  return data.map(convertSegmentRowToSegment);
};

export const saveSegmentToDB = async (segment: Segment): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('segments')
      .insert({
        id: segment.id,
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
        parent_segment_id: segment.parent_segment_id,
        merged_segments: segment.merged_segments || []
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
    // First, handle any child segments by moving them back to top-level
    const { data: childSegments } = await supabase
      .from('segments')
      .select('*')
      .in('parent_segment_id', segmentIds);

    if (childSegments && childSegments.length > 0) {
      await supabase
        .from('segments')
        .update({ 
          parent_segment_id: null,
          is_merged: false 
        })
        .in('parent_segment_id', segmentIds);
    }

    const { error } = await supabase
      .from('segments')
      .delete()
      .in('id', segmentIds);
    
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
  if (segments.length > 0) {
    const cityId = segments[0].id_cidade;
    
    const { error: deleteError } = await supabase
      .from('segments')
      .delete()
      .eq('id_cidade', cityId);

    if (deleteError) {
      console.error("Error deleting existing segments:", deleteError);
      return false;
    }
  }

  const segmentsToInsert = segments.map(segment => ({
    id: segment.id,
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
    parent_segment_id: segment.parent_segment_id,
    merged_segments: segment.merged_segments || []
  }));

  const { error: insertError } = await supabase
    .from('segments')
    .insert(segmentsToInsert);

  if (insertError) {
    console.error("Error inserting segments:", insertError);
    return false;
  }

  return true;
};

export const updateSegmentInDB = async (segment: Partial<Segment>): Promise<Segment | null> => {
  if (!segment.id) {
    console.error("Segment ID is required for updates");
    return null;
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
      parent_segment_id: segment.parent_segment_id,
      merged_segments: segment.merged_segments
    })
    .eq('id', segment.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating segment:", error);
    return null;
  }

  return convertSegmentRowToSegment(data);
};

// New function to unmerge segments
export const unmergeSegmentsFromDB = async (parentSegmentId: string, segmentIdsToUnmerge: string[]): Promise<boolean> => {
  try {
    // Move specified segments back to top-level
    const { error: updateError } = await supabase
      .from('segments')
      .update({ 
        parent_segment_id: null,
        is_merged: false 
      })
      .in('id', segmentIdsToUnmerge);

    if (updateError) {
      console.error("Error unmerging segments:", updateError);
      return false;
    }

    // Check remaining child segments
    const { data: remainingChildren } = await supabase
      .from('segments')
      .select('*')
      .eq('parent_segment_id', parentSegmentId);

    // If no children remain or only one child remains, delete the parent
    if (!remainingChildren || remainingChildren.length <= 1) {
      if (remainingChildren && remainingChildren.length === 1) {
        // Move the last child back to top-level
        await supabase
          .from('segments')
          .update({ 
            parent_segment_id: null,
            is_merged: false 
          })
          .eq('id', remainingChildren[0].id);
      }
      
      // Delete the parent segment
      await supabase
        .from('segments')
        .delete()
        .eq('id', parentSegmentId);
    } else {
      // Update the parent's merged_segments list and recalculate geometry
      const updatedMergedSegments = remainingChildren.map(child => ({
        id: child.id,
        name: child.name,
        type: child.type,
        length: child.length,
        originalGeometry: child.geometry
      }));

      const newLength = remainingChildren.reduce((total, child) => total + child.length, 0);
      const newGeometry = mergeGeometries(remainingChildren.map(child => child.geometry));

      await supabase
        .from('segments')
        .update({
          merged_segments: updatedMergedSegments,
          length: newLength,
          geometry: newGeometry
        })
        .eq('id', parentSegmentId);
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
 * Backup the localStorage data to the database
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

export const migrateLocalStorageToDatabase = async (): Promise<boolean> => {
  try {
    // Get all city IDs from localStorage
    const cityKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('city_'))
      .map(key => key.replace('city_', ''));
    
    for (const cityId of cityKeys) {
      const storedData = localStorage.getItem(`city_${cityId}`);
      if (storedData) {
        const data = JSON.parse(storedData);
        
        // Save city data
        if (data.city) {
          await saveCityToDB({
            ...data.city,
            // Ensure required fields are present
            id: data.city.id || cityId,
            name: data.city.name || "Unknown City",
            state: data.city.state || "Unknown State"
          });
        }
        
        // Save segments data
        if (data.segments && Array.isArray(data.segments)) {
          await saveSegmentsToDB(data.segments);
        }
      }
    }
    
    // Get evaluated segments
    const evaluatedSegments = JSON.parse(localStorage.getItem('evaluatedSegments') || '[]');
    
    // For each evaluated segment, check if there's a form in localStorage and save it
    for (const segmentId of evaluatedSegments) {
      const formData = localStorage.getItem(`form_${segmentId}`);
      if (formData) {
        const formJson = JSON.parse(formData);
        const cityId = localStorage.getItem('currentCityId') || '';
        
        await saveFormToDB({
          id: `form-${segmentId}`,
          segment_id: segmentId,
          city_id: cityId,
          researcher: formJson.researcher || '',
          date: new Date().toISOString(),
          street_name: formJson.streetName || '',
          neighborhood: formJson.neighborhood || '',
          extension: formJson.extension || 0,
          start_point: formJson.startPoint || '',
          end_point: formJson.endPoint || '',
          hierarchy: formJson.hierarchy || '',
          observations: formJson.observations || '',
          responses: formJson
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error migrating data from localStorage to database:", error);
    return false;
  }
};
