import type { AuthModule, AuthPermission, AuthRole } from "@/types/auth";

export const AUTH_ROLES: AuthRole[] = [
  "admin_global",
  "admin_estado",
  "admin_cidade",
  "avaliador_estrutura_cicloviaria",
  "refinador_dados_cidade",
  "visualizador",
];

export const AUTH_MODULES: AuthModule[] = [
  "admin",
  "avaliacao_estrutura_cicloviaria",
  "refinamento_dados_cidade",
];

const normalizeValue = (value?: string | null) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim().toLowerCase() : null;

export const matchesPermissionScope = (
  permission: Pick<AuthPermission, "state" | "city">,
  state?: string | null,
  city?: string | null
) => {
  const permissionState = normalizeValue(permission.state);
  const permissionCity = normalizeValue(permission.city);
  const requestedState = normalizeValue(state);
  const requestedCity = normalizeValue(city);

  if (permissionState && requestedState && permissionState !== requestedState) {
    return false;
  }

  if (permissionCity && requestedCity && permissionCity !== requestedCity) {
    return false;
  }

  return true;
};

export const canManageAdmin = (permissions: AuthPermission[]) =>
  permissions.some(
    (permission) =>
      permission.role === "admin_global" ||
      permission.role === "admin_estado" ||
      permission.role === "admin_cidade"
  );

export const canAccessModule = ({
  permissions,
  module,
  state,
  city,
  allowViewer = false,
}: {
  permissions: AuthPermission[];
  module?: AuthModule | null;
  state?: string | null;
  city?: string | null;
  allowViewer?: boolean;
}) =>
  permissions.some((permission) => {
    if (permission.role === "admin_global") return true;

    if (
      (permission.role === "admin_estado" || permission.role === "admin_cidade") &&
      matchesPermissionScope(permission, state, city)
    ) {
      return true;
    }

    if (allowViewer && permission.role === "visualizador") {
      return matchesPermissionScope(permission, state, city);
    }

    if (!module) {
      return matchesPermissionScope(permission, state, city);
    }

    return (
      permission.module === module && matchesPermissionScope(permission, state, city)
    );
  });
