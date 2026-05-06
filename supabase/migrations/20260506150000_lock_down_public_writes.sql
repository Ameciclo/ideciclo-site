REVOKE ALL ON SCHEMA public FROM web_anon;
GRANT USAGE ON SCHEMA public TO web_anon;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM web_anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO web_anon;

REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM web_anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO web_anon;

REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM web_anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE ALL ON TABLES FROM web_anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO web_anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE ALL ON SEQUENCES FROM web_anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO web_anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE ALL ON FUNCTIONS FROM web_anon;

DROP POLICY IF EXISTS "Enable insert access for all users" ON public.cities;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.cities;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.cities;

DROP POLICY IF EXISTS "Enable insert access for all users" ON public.segments;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.segments;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.segments;

DROP POLICY IF EXISTS "Enable insert access for all users" ON public.forms;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.forms;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.forms;

DROP POLICY IF EXISTS "Enable insert access for all users" ON public.reviews;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.reviews;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.reviews;

DROP POLICY IF EXISTS "Enable insert access for all users" ON public.avaliacoes_ideciclo;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.avaliacoes_ideciclo;

DROP POLICY IF EXISTS "Enable insert access for all users" ON public.pontuacoes_ideciclo;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.resultados_ideciclo;
