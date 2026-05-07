import type {
  AccessRequest,
  AuthModule,
  AuthPermission,
  AuthRole,
  AuthSession,
  AdminUser,
} from "@/types/auth";

type JsonResponse<T> = T & {
  error?: string;
};

type FetchJsonOptions = RequestInit & {
  fresh?: boolean;
};

const buildFreshUrl = (input: RequestInfo): RequestInfo => {
  if (typeof input !== "string") return input;
  if (typeof window === "undefined") return input;

  const url = new URL(input, window.location.origin);
  url.searchParams.set("_ts", String(Date.now()));
  return `${url.pathname}${url.search}`;
};

const fetchJson = async <T>(input: RequestInfo, init?: FetchJsonOptions): Promise<T> => {
  const method = (init?.method || "GET").toUpperCase();
  const fresh = Boolean(init?.fresh) && method === "GET";
  const requestInput = fresh ? buildFreshUrl(input) : input;

  const response = await fetch(requestInput, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(fresh
        ? {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          }
        : {}),
      ...(init?.headers || {}),
    },
    cache: fresh ? "no-store" : init?.cache,
  });

  const rawBody = await response.text();
  const payload = (() => {
    if (!rawBody) return {} as JsonResponse<T>;

    try {
      return JSON.parse(rawBody) as JsonResponse<T>;
    } catch {
      return {} as JsonResponse<T>;
    }
  })();

  if (!response.ok) {
    const fallbackMessage =
      rawBody.trim() ||
      `${response.status} ${response.statusText}`.trim() ||
      "Erro inesperado na autenticação.";

    throw new Error(
      payload.error || `Falha na autenticação (${response.status}): ${fallbackMessage}`
    );
  }

  return payload;
};

export const requestMagicLink = async (email: string, redirectTo: string) =>
  fetchJson<{ message: string }>("/api/auth/request-magic-link", {
    method: "POST",
    body: JSON.stringify({ email, redirectTo }),
  });

export const verifyMagicLink = async (token: string, redirectTo: string) =>
  fetchJson<{ ok: true; redirectTo: string }>("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ token, redirectTo }),
  });

export const fetchCurrentSession = async () =>
  fetchJson<{ session: AuthSession | null }>("/api/auth/session", {
    method: "GET",
    fresh: true,
  });

export const logoutRequest = async () =>
  fetchJson<{ ok: true }>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });

export const fetchAdminUsers = async () =>
  fetchJson<{ users: AdminUser[] }>("/api/auth/admin/users", {
    method: "GET",
    fresh: true,
  });

export const createAdminUser = async (email: string, name?: string) =>
  fetchJson<{ users: AdminUser[] }>("/api/auth/admin/users", {
    method: "POST",
    body: JSON.stringify({ email, name }),
  });

export const updateAdminUser = async (
  userId: string,
  payload: {
    name?: string | null;
    active?: boolean;
  }
) =>
  fetchJson<{ users: AdminUser[] }>(`/api/auth/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const createUserPermission = async (payload: {
  userId: string;
  role: AuthRole;
  state?: string;
  city?: string;
  module?: AuthModule | "";
}) =>
  fetchJson<{ users: AdminUser[] }>("/api/auth/admin/permissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const deleteUserPermission = async (permissionId: string) =>
  fetchJson<{ users: AdminUser[] }>(`/api/auth/admin/permissions/${permissionId}`, {
    method: "DELETE",
  });

export const createAccessRequest = async (payload: {
  name: string;
  email: string;
  organization: string;
  state: string;
  city?: string;
  interestType: string;
  message: string;
}) =>
  fetchJson<{ message: string }>("/api/auth/access-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const fetchAdminAccessRequests = async (status?: string) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return fetchJson<{ requests: AccessRequest[] }>(`/api/auth/admin/access-requests${query}`, {
    method: "GET",
    fresh: true,
  });
};

export const fetchAdminAccessRequest = async (requestId: string) =>
  fetchJson<{
    request: AccessRequest;
    existingUser: AdminUser | null;
    existingPermissions: AuthPermission[];
  }>(`/api/auth/admin/access-requests/${requestId}`, {
    method: "GET",
    fresh: true,
  });

export const approveAdminAccessRequest = async (
  requestId: string,
  payload: {
    name?: string;
    reviewerNotes?: string;
    permissions: Array<{
      role: AuthRole;
      state?: string;
      city?: string;
      module?: AuthModule | "";
    }>;
  }
) =>
  fetchJson<{ ok: true; request: AccessRequest }>(
    `/api/auth/admin/access-requests/${requestId}/approve`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

export const rejectAdminAccessRequest = async (
  requestId: string,
  payload: {
    reviewerNotes?: string;
    rejectionReason?: string;
  }
) =>
  fetchJson<{ ok: true; request: AccessRequest }>(
    `/api/auth/admin/access-requests/${requestId}/reject`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
