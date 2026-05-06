CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS auth_users_email_lower_idx
  ON auth.users (lower(email));

CREATE TABLE IF NOT EXISTS auth.magic_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS auth_magic_links_token_hash_idx
  ON auth.magic_links (token_hash);

CREATE INDEX IF NOT EXISTS auth_magic_links_email_idx
  ON auth.magic_links (lower(email));

CREATE INDEX IF NOT EXISTS auth_magic_links_expires_at_idx
  ON auth.magic_links (expires_at);

CREATE TABLE IF NOT EXISTS auth.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  revoked_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS auth_sessions_session_hash_idx
  ON auth.sessions (session_hash);

CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx
  ON auth.sessions (user_id);

CREATE INDEX IF NOT EXISTS auth_sessions_expires_at_idx
  ON auth.sessions (expires_at);

CREATE TABLE IF NOT EXISTS auth.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  state text,
  city text,
  module text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT auth_permissions_role_check
    CHECK (
      role IN (
        'admin_global',
        'admin_estado',
        'admin_cidade',
        'avaliador_estrutura_cicloviaria',
        'refinador_dados_cidade',
        'visualizador'
      )
    ),
  CONSTRAINT auth_permissions_module_check
    CHECK (
      module IS NULL OR module IN (
        'admin',
        'avaliacao_estrutura_cicloviaria',
        'refinamento_dados_cidade'
      )
    )
);

CREATE INDEX IF NOT EXISTS auth_permissions_user_id_idx
  ON auth.permissions (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS auth_permissions_unique_scope_idx
  ON auth.permissions (
    user_id,
    role,
    COALESCE(state, ''),
    COALESCE(city, ''),
    COALESCE(module, '')
  );
