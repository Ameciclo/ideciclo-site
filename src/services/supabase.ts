
import { supabase } from "@/integrations/supabase/client";
import { City, Segment, Form, Review, SegmentType } from "@/types";

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

  return data as City;
};

export const saveCityToDB = async (city: Partial<City>): Promise<City | null> => {
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
      .update(city)
      .eq('id', city.id);
  } else {
    // Insert
    operation = supabase
      .from('cities')
      .insert(city);
  }

  const { data, error } = await operation.select().single();

  if (error) {
    console.error("Error saving city:", error);
    return null;
  }

  return data as City;
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

  return data as Segment[];
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

  // Now insert all segments
  const { error: insertError } = await supabase
    .from('segments')
    .insert(segments);

  if (insertError) {
    console.error("Error inserting segments:", insertError);
    return false;
  }

  return true;
};

export const updateSegmentInDB = async (segment: Partial<Segment>): Promise<Segment | null> => {
  const { data, error } = await supabase
    .from('segments')
    .update(segment)
    .eq('id', segment.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating segment:", error);
    return null;
  }

  return data as Segment;
};

/**
 * Form CRUD operations
 */
export const saveFormToDB = async (form: Partial<Form>): Promise<Form | null> => {
  // Generate a unique ID if not provided
  if (!form.id) {
    form.id = `form-${Date.now()}`;
  }

  const { data, error } = await supabase
    .from('forms')
    .insert(form)
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

  return data as Form;
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

  return data as Form;
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

  return data as Form;
};

/**
 * Review CRUD operations
 */
export const saveReviewsToDB = async (reviews: Review[]): Promise<boolean> => {
  if (reviews.length === 0) return true;

  const { error } = await supabase
    .from('reviews')
    .insert(reviews);

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

  return data as Review[];
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
          await saveCityToDB(data.city);
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
        const form = JSON.parse(formData);
        await saveFormToDB({
          ...form,
          id: `form-${segmentId}`,
          segment_id: segmentId
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error migrating data from localStorage to database:", error);
    return false;
  }
};
