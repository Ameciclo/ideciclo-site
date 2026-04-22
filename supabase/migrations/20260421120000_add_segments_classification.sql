ALTER TABLE public.segments
ADD COLUMN IF NOT EXISTS classification text;

CREATE INDEX IF NOT EXISTS idx_segments_classification
ON public.segments(classification);
