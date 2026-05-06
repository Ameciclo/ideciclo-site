CREATE TABLE IF NOT EXISTS auth.magic_link_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  requested_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_magic_link_requests_email_idx
  ON auth.magic_link_requests (lower(email));

CREATE INDEX IF NOT EXISTS auth_magic_link_requests_ip_idx
  ON auth.magic_link_requests (ip_address);

CREATE INDEX IF NOT EXISTS auth_magic_link_requests_requested_at_idx
  ON auth.magic_link_requests (requested_at);
