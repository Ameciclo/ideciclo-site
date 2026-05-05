import type { AdminUser, AuthModule, AuthSession, AuthRole } from "@/types/auth";

type JsonResponse<T> = T & {
  error?: string;
};

const fetchJson = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const payload = (await response.json().catch(() => ({}))) as JsonResponse<T>;

  if (!response.ok) {
    throw new Error(payload.error || "Erro inesperado na autenticação.");
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
  });

export const logoutRequest = async () =>
  fetchJson<{ ok: true }>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });

export const fetchAdminUsers = async () =>
  fetchJson<{ users: AdminUser[] }>("/api/auth/admin/users", {
    method: "GET",
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
