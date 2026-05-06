ALTER TABLE public.cities
ADD COLUMN IF NOT EXISTS show_in_ranking boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.cities.show_in_ranking IS
'Controla se a cidade pode aparecer no ranking público do IDECICLO.';
