import { PostgrestClient } from '@supabase/postgrest-js';
import type { Database } from './types';

const DATABASE_API_URL = import.meta.env.VITE_DATABASE_API_URL;

const resolveApiUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (typeof window !== 'undefined') {
    return new URL(url, window.location.origin).toString();
  }

  return url;
};

const resolvedDatabaseApiUrl = resolveApiUrl(DATABASE_API_URL);

if (!resolvedDatabaseApiUrl) {
  throw new Error(
    'Env vars ausentes. Defina VITE_DATABASE_API_URL para conectar a API do banco de dados.'
  );
}

export const databaseClient = new PostgrestClient<Database>(resolvedDatabaseApiUrl, {
  schema: 'public',
});

export const authClient = {
  refreshSession: async () => ({
    data: { session: null },
    error: null,
  }),
};
