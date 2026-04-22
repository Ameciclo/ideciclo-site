-- Bootstrap completo do schema IDECICLO para um projeto Supabase novo.
-- Pode ser executado no SQL Editor do Supabase.

-- 20250101000000_create_core_public_tables.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'segment_type'
  ) THEN
    CREATE TYPE public.segment_type AS ENUM (
      'Ciclofaixa',
      'Ciclovia',
      'Ciclorrota',
      'Compartilhada'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'rating_type'
  ) THEN
    CREATE TYPE public.rating_type AS ENUM ('A', 'B', 'C', 'D');
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.cities (
  id text PRIMARY KEY,
  name text NOT NULL,
  state text NOT NULL,
  extensao_avaliada numeric DEFAULT 0,
  ideciclo numeric DEFAULT 0,
  vias_estruturais_km numeric DEFAULT 0,
  vias_alimentadoras_km numeric DEFAULT 0,
  vias_locais_km numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.segments (
  id text PRIMARY KEY,
  id_cidade text NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  id_form text,
  name text NOT NULL,
  type public.segment_type NOT NULL,
  length numeric NOT NULL,
  neighborhood text,
  geometry jsonb,
  selected boolean DEFAULT false,
  evaluated boolean DEFAULT false,
  is_merged boolean DEFAULT false,
  parent_segment_id text REFERENCES public.segments(id) ON DELETE CASCADE,
  merged_segments jsonb DEFAULT '[]'::jsonb,
  classification text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.forms (
  id text PRIMARY KEY,
  segment_id text NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
  city_id text NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  researcher text,
  date timestamp with time zone,
  street_name text,
  neighborhood text,
  extension numeric,
  start_point text,
  end_point text,
  hierarchy text,
  observations text,
  responses jsonb,
  velocity integer,
  blocks_count integer,
  intersections_count integer,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id text PRIMARY KEY,
  form_id text NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  rating_name public.rating_type NOT NULL,
  rating integer NOT NULL,
  weight numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cities_state ON public.cities(state);
CREATE INDEX IF NOT EXISTS idx_segments_id_cidade ON public.segments(id_cidade);
CREATE INDEX IF NOT EXISTS idx_segments_parent_segment_id ON public.segments(parent_segment_id);
CREATE INDEX IF NOT EXISTS idx_segments_is_merged ON public.segments(is_merged);
CREATE INDEX IF NOT EXISTS idx_forms_city_id ON public.forms(city_id);
CREATE INDEX IF NOT EXISTS idx_forms_segment_id ON public.forms(segment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_form_id ON public.reviews(form_id);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.cities;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.cities;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.cities;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.cities;

CREATE POLICY "Enable read access for all users" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.cities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.cities FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.cities FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.segments;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.segments;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.segments;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.segments;

CREATE POLICY "Enable read access for all users" ON public.segments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.segments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.segments FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.segments FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.forms;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.forms;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.forms;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.forms;

CREATE POLICY "Enable read access for all users" ON public.forms FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.forms FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.forms FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.forms FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.reviews;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.reviews;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.reviews;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.reviews;

CREATE POLICY "Enable read access for all users" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.reviews FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.reviews FOR DELETE USING (true);

DROP TRIGGER IF EXISTS update_cities_updated_at ON public.cities;
CREATE TRIGGER update_cities_updated_at
BEFORE UPDATE ON public.cities
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();

DROP TRIGGER IF EXISTS update_segments_updated_at ON public.segments;
CREATE TRIGGER update_segments_updated_at
BEFORE UPDATE ON public.segments
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();

DROP TRIGGER IF EXISTS update_forms_updated_at ON public.forms;
CREATE TRIGGER update_forms_updated_at
BEFORE UPDATE ON public.forms
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();

-- 20250115000000_create_ideciclo_tables.sql
CREATE TABLE IF NOT EXISTS public.avaliacoes_ideciclo (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    segment_id text,
    pesquisador text,
    data date,
    cidade text,
    bairro text,
    nome_trecho text,
    extensao numeric,
    velocidade_maxima integer,
    inicio_trecho text,
    fim_trecho text,
    hierarquia_viaria text,
    tipologia text,
    A1 text, A2 text,
    B1 text, B2 text, B3 text, B4 text, B5 text, B6 text, B7 text,
    C1 text, C2 text, C3 text,
    D1 text, D2 text, D3 text,
    E1 text, E2 text, E3 text, E4 text,
    observacoes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pontuacoes_ideciclo (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    avaliacao_id uuid REFERENCES public.avaliacoes_ideciclo(id) ON DELETE CASCADE,
    parametro text NOT NULL,
    resposta text NOT NULL,
    pontos numeric NOT NULL,
    nome_parametro text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.resultados_ideciclo (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    avaliacao_id uuid REFERENCES public.avaliacoes_ideciclo(id) ON DELETE CASCADE,
    segment_id text,
    nota_total numeric NOT NULL,
    tipologia text NOT NULL,
    detalhes_calculo jsonb,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_segment_id ON public.avaliacoes_ideciclo(segment_id);
CREATE INDEX IF NOT EXISTS idx_pontuacoes_avaliacao_id ON public.pontuacoes_ideciclo(avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_resultados_avaliacao_id ON public.resultados_ideciclo(avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_resultados_segment_id ON public.resultados_ideciclo(segment_id);

ALTER TABLE public.avaliacoes_ideciclo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pontuacoes_ideciclo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados_ideciclo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.avaliacoes_ideciclo;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.avaliacoes_ideciclo;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.avaliacoes_ideciclo;
CREATE POLICY "Enable read access for all users" ON public.avaliacoes_ideciclo FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.avaliacoes_ideciclo FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.avaliacoes_ideciclo FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.pontuacoes_ideciclo;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.pontuacoes_ideciclo;
CREATE POLICY "Enable read access for all users" ON public.pontuacoes_ideciclo FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.pontuacoes_ideciclo FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.resultados_ideciclo;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.resultados_ideciclo;
CREATE POLICY "Enable read access for all users" ON public.resultados_ideciclo FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.resultados_ideciclo FOR INSERT WITH CHECK (true);

-- 20250609190324-d803efc1-ca57-444d-a1ba-933d63d12bae.sql
ALTER TABLE public.segments 
ADD COLUMN IF NOT EXISTS is_merged boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_segment_id text REFERENCES public.segments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS merged_segments jsonb DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_segments_parent_segment_id ON public.segments(parent_segment_id);
CREATE INDEX IF NOT EXISTS idx_segments_is_merged ON public.segments(is_merged);

DROP TRIGGER IF EXISTS update_segments_updated_at ON public.segments;
CREATE TRIGGER update_segments_updated_at
    BEFORE UPDATE ON public.segments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

-- 20260421120000_add_segments_classification.sql
ALTER TABLE public.segments
ADD COLUMN IF NOT EXISTS classification text;

CREATE INDEX IF NOT EXISTS idx_segments_classification
ON public.segments(classification);
