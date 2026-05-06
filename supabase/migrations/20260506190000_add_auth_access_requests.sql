CREATE TABLE IF NOT EXISTS auth.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  organization text NOT NULL,
  state text,
  city text,
  interest_type text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'email_verification_pending',
  email_verified_at timestamp with time zone,
  requester_ip text,
  reviewer_notes text,
  rejection_reason text,
  reviewed_at timestamp with time zone,
  reviewed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT auth_access_requests_status_check
    CHECK (
      status IN (
        'email_verification_pending',
        'pending_review',
        'approved',
        'rejected'
      )
    )
);

CREATE INDEX IF NOT EXISTS auth_access_requests_email_idx
  ON auth.access_requests (lower(email));

CREATE INDEX IF NOT EXISTS auth_access_requests_status_idx
  ON auth.access_requests (status);

CREATE INDEX IF NOT EXISTS auth_access_requests_requester_ip_idx
  ON auth.access_requests (requester_ip);

CREATE INDEX IF NOT EXISTS auth_access_requests_created_at_idx
  ON auth.access_requests (created_at);

CREATE UNIQUE INDEX IF NOT EXISTS auth_access_requests_pending_email_idx
  ON auth.access_requests (lower(email))
  WHERE status IN ('email_verification_pending', 'pending_review');

CREATE TABLE IF NOT EXISTS auth.access_request_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_request_id uuid NOT NULL REFERENCES auth.access_requests(id) ON DELETE CASCADE,
  email text NOT NULL,
  token_hash text NOT NULL,
  ip_address text,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS auth_access_request_verifications_token_hash_idx
  ON auth.access_request_verifications (token_hash);

CREATE INDEX IF NOT EXISTS auth_access_request_verifications_request_idx
  ON auth.access_request_verifications (access_request_id);

CREATE INDEX IF NOT EXISTS auth_access_request_verifications_email_idx
  ON auth.access_request_verifications (lower(email));

CREATE INDEX IF NOT EXISTS auth_access_request_verifications_expires_at_idx
  ON auth.access_request_verifications (expires_at);

DROP TRIGGER IF EXISTS update_access_requests_updated_at ON auth.access_requests;
CREATE TRIGGER update_access_requests_updated_at
BEFORE UPDATE ON auth.access_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();
