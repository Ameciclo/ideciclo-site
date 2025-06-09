
-- Add columns to track merged segments and their relationships
ALTER TABLE public.segments 
ADD COLUMN is_merged boolean DEFAULT false,
ADD COLUMN parent_segment_id text REFERENCES public.segments(id) ON DELETE CASCADE,
ADD COLUMN merged_segments jsonb DEFAULT '[]'::jsonb;

-- Create index for better performance on merged segment queries
CREATE INDEX idx_segments_parent_segment_id ON public.segments(parent_segment_id);
CREATE INDEX idx_segments_is_merged ON public.segments(is_merged);

-- Add a trigger to automatically update the updated_at timestamp
DROP TRIGGER IF EXISTS update_segments_updated_at ON public.segments;
CREATE TRIGGER update_segments_updated_at
    BEFORE UPDATE ON public.segments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();
