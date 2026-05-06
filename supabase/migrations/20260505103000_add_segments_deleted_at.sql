ALTER TABLE public.segments
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_segments_deleted_at
ON public.segments (deleted_at);
