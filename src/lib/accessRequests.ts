import type {
  AccessRequest,
  AuthModule,
  AuthRole,
} from "@/types/auth";

export const ACCESS_REQUEST_INTEREST_OPTIONS = [
  {
    value: "avaliacao_estrutura_cicloviaria",
    label: "Avaliação",
  },
  {
    value: "refinamento_dados_cidade",
    label: "Refino de Dados",
  },
  {
    value: "visualizacao_resultados",
    label: "Visualização de Resultados",
  },
  {
    value: "administracao_local",
    label: "Administração Local",
  },
] as const;

export const ACCESS_REQUEST_STATUS_LABELS: Record<string, string> = {
  email_verification_pending: "Aguardando verificação de e-mail",
  pending_review: "Pendente de revisão",
  approved: "Aprovada",
  rejected: "Rejeitada",
};

export type PermissionDraft = {
  role: AuthRole;
  module: AuthModule | "";
  state: string;
  city: string;
};

export const buildDefaultPermissionDraftFromRequest = (
  request: Pick<AccessRequest, "interestType" | "state" | "city">
): PermissionDraft => {
  switch (request.interestType) {
    case "avaliacao_estrutura_cicloviaria":
      return {
        role: "avaliador_estrutura_cicloviaria",
        module: "avaliacao_estrutura_cicloviaria",
        state: request.state || "",
        city: request.city || "",
      };
    case "refinamento_dados_cidade":
      return {
        role: "refinador_dados_cidade",
        module: "refinamento_dados_cidade",
        state: request.state || "",
        city: request.city || "",
      };
    case "administracao_local":
      return {
        role: request.city ? "admin_cidade" : "admin_estado",
        module: "admin",
        state: request.state || "",
        city: request.city || "",
      };
    case "visualizacao_resultados":
    default:
      return {
        role: "visualizador",
        module: "",
        state: request.state || "",
        city: request.city || "",
      };
  }
};
