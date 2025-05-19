
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
    .eq('id_cidade', cityId);

  if (error) {
    console.error("Error fetching segments:", error);
    return [];
  }

  return data.map((segment: SegmentRow): Segment => ({
    id: segment.id,
    id_form: segment.id_form || undefined,
    id_cidade: segment.id_cidade,
    name: segment.name,
    type: segment.type as SegmentType,
    length: segment.length,
    neighborhood: segment.neighborhood || undefined,
    geometry: segment.geometry,
    selected: segment.selected || false,
    evaluated: segment.evaluated || false,
  }));
};

export const saveSegmentsToDB = async (segments: Segment[]): Promise<boolean> => {
  // First, delete all existing segments for the city to avoid duplications
  // In a real-world scenario, this might need a more sophisticated merge strategy
  if (segments.length > 0) {
    const cityId = segments[0].id_cidade;
    
    // We'll only do this delete if we're saving a complete set of segments for a city
    const { error: deleteError } = await supabase
      .from('segments')
      .delete()
      .eq('id_cidade', cityId);

    if (deleteError) {
      console.error("Error deleting existing segments:", deleteError);
      return false;
    }
  }

  // Prepare segments for insertion by ensuring they match the database schema
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
    evaluated: segment.evaluated
  }));

  // Now insert all segments
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
      id_form: segment.id_form
    })
    .eq('id', segment.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating segment:", error);
    return null;
  }

  return {
    id: data.id,
    id_form: data.id_form || undefined,
    id_cidade: data.id_cidade,
    name: data.name,
    type: data.type as SegmentType,
    length: data.length,
    neighborhood: data.neighborhood || undefined,
    geometry: data.geometry,
    selected: data.selected || false,
    evaluated: data.evaluated || false,
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
