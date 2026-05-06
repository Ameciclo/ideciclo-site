export const databaseClient: unknown = null;

export const authClient = {
  refreshSession: async () => ({
    data: { session: null },
    error: null,
  }),
};

export type { Database } from "./types";
