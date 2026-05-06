alter table public.segments
  add column if not exists osm_advanced jsonb;
