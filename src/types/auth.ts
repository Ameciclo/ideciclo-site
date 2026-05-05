export type AuthRole =
  | "admin_global"
  | "admin_estado"
  | "admin_cidade"
  | "avaliador_estrutura_cicloviaria"
  | "refinador_dados_cidade"
  | "visualizador";

export type AuthModule =
  | "admin"
  | "avaliacao_estrutura_cicloviaria"
  | "refinamento_dados_cidade";

export interface AuthPermission {
  id: string;
  userId: string;
  role: AuthRole;
  state: string | null;
  city: string | null;
  module: AuthModule | null;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  active: boolean;
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: string;
  permissions: AuthPermission[];
}

export interface AdminUser extends AuthUser {
  createdAt: string;
  permissions: AuthPermission[];
}
