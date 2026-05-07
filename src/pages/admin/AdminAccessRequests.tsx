import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Shield, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ACCESS_REQUEST_INTEREST_OPTIONS,
  ACCESS_REQUEST_STATUS_LABELS,
  buildDefaultPermissionDraftFromRequest,
  type PermissionDraft,
} from "@/lib/accessRequests";
import { AUTH_MODULES, AUTH_ROLES } from "@/lib/authPermissions";
import { fetchCities, fetchStates } from "@/services/api";
import {
  approveAdminAccessRequest,
  fetchAdminAccessRequest,
  fetchAdminAccessRequests,
  rejectAdminAccessRequest,
} from "@/services/authApi";
import type { IBGECity, IBGEState } from "@/types";
import type { AccessRequest, AdminUser, AuthPermission, AuthRole } from "@/types/auth";

const roleLabels: Record<string, string> = {
  admin_global: "Admin global",
  admin_estado: "Admin do estado",
  admin_cidade: "Admin da cidade",
  avaliador_estrutura_cicloviaria: "Avaliador de estrutura",
  refinador_dados_cidade: "Refinador de dados",
  visualizador: "Visualizador",
};

const moduleLabels: Record<string, string> = {
  admin: "Admin",
  avaliacao_estrutura_cicloviaria: "Avaliação de estrutura",
  refinamento_dados_cidade: "Refinamento de dados",
};

const AdminAccessRequests = () => {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [existingUser, setExistingUser] = useState<AdminUser | null>(null);
  const [existingPermissions, setExistingPermissions] = useState<AuthPermission[]>([]);
  const [states, setStates] = useState<IBGEState[]>([]);
  const [draftCities, setDraftCities] = useState<IBGECity[]>([]);
  const [permissionDraft, setPermissionDraft] = useState<PermissionDraft>({
    role: "visualizador",
    module: "",
    state: "",
    city: "",
  });
  const [approvalPermissions, setApprovalPermissions] = useState<PermissionDraft[]>([]);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const interestLabels = useMemo(
    () =>
      Object.fromEntries(
        ACCESS_REQUEST_INTEREST_OPTIONS.map((option) => [option.value, option.label])
      ),
    []
  );

  useEffect(() => {
    const loadStates = async () => {
      try {
        setStates(await fetchStates());
      } catch (error) {
        toast({
          title: "Erro ao carregar estados",
          description:
            error instanceof Error ? error.message : "Não foi possível carregar os estados.",
          variant: "destructive",
        });
      }
    };

    void loadStates();
  }, [toast]);

  const loadRequests = async (nextStatusFilter = statusFilter) => {
    try {
      setIsLoadingList(true);
      const response = await fetchAdminAccessRequests(nextStatusFilter);
      setRequests(response.requests);

      if (
        response.requests.length > 0 &&
        !response.requests.some((request) => request.id === selectedRequestId)
      ) {
        setSelectedRequestId(response.requests[0].id);
      }

      if (response.requests.length === 0) {
        setSelectedRequestId("");
        setSelectedRequest(null);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar solicitações",
        description:
          error instanceof Error ? error.message : "Não foi possível carregar as solicitações.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    void loadRequests(statusFilter);
  }, [statusFilter]);

  const getSelectedStateId = (stateCode: string) =>
    states.find((state) => state.sigla === stateCode)?.id.toString() || "__none__";

  const loadCitiesForState = async (stateCode: string) => {
    const selectedState = states.find((state) => state.sigla === stateCode);

    if (!selectedState) {
      setDraftCities([]);
      return;
    }

    try {
      setDraftCities(await fetchCities(selectedState.id.toString()));
    } catch (error) {
      setDraftCities([]);
      toast({
        title: "Erro ao carregar cidades",
        description:
          error instanceof Error ? error.message : "Não foi possível carregar as cidades.",
        variant: "destructive",
      });
    }
  };

  const loadRequestDetail = async (requestId: string) => {
    if (!requestId) return;

    try {
      setIsLoadingDetail(true);
      const response = await fetchAdminAccessRequest(requestId);
      setSelectedRequest(response.request);
      setExistingUser(response.existingUser);
      setExistingPermissions(response.existingPermissions);
      setReviewerNotes(response.request.reviewerNotes || "");
      setRejectionReason(response.request.rejectionReason || "");

      const defaultDraft = buildDefaultPermissionDraftFromRequest(response.request);
      setPermissionDraft(defaultDraft);
      setApprovalPermissions(response.request.status === "pending_review" ? [defaultDraft] : []);

      if (defaultDraft.state) {
        await loadCitiesForState(defaultDraft.state);
      } else {
        setDraftCities([]);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar solicitação",
        description:
          error instanceof Error ? error.message : "Não foi possível carregar os detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (!selectedRequestId) return;
    void loadRequestDetail(selectedRequestId);
  }, [selectedRequestId]);

  useEffect(() => {
    if (states.length === 0 || !permissionDraft.state || draftCities.length > 0) return;
    void loadCitiesForState(permissionDraft.state);
  }, [draftCities.length, permissionDraft.state, states]);

  const handleDraftStateChange = async (stateId: string) => {
    const selectedState = states.find((state) => state.id.toString() === stateId);
    const nextState = selectedState?.sigla || "";

    setPermissionDraft((current) => ({
      ...current,
      state: nextState,
      city: "",
    }));

    if (!nextState) {
      setDraftCities([]);
      return;
    }

    await loadCitiesForState(nextState);
  };

  const handleAddPermission = () => {
    setApprovalPermissions((current) => [...current, permissionDraft]);
  };

  const handleRemovePermission = (indexToRemove: number) => {
    setApprovalPermissions((current) =>
      current.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setIsSaving(true);
      await approveAdminAccessRequest(selectedRequest.id, {
        name: selectedRequest.name,
        reviewerNotes,
        permissions: approvalPermissions,
      });
      toast({
        title: "Solicitação aprovada",
        description: "O usuário foi aprovado e as permissões foram aplicadas.",
      });
      await loadRequests(statusFilter);
      await loadRequestDetail(selectedRequest.id);
    } catch (error) {
      toast({
        title: "Erro ao aprovar solicitação",
        description: error instanceof Error ? error.message : "Falha inesperada.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      setIsSaving(true);
      await rejectAdminAccessRequest(selectedRequest.id, {
        reviewerNotes,
        rejectionReason,
      });
      toast({
        title: "Solicitação rejeitada",
        description: "A solicitação foi marcada como rejeitada.",
      });
      await loadRequests(statusFilter);
      await loadRequestDetail(selectedRequest.id);
    } catch (error) {
      toast({
        title: "Erro ao rejeitar solicitação",
        description: error instanceof Error ? error.message : "Falha inesperada.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-[28px] bg-background-grey p-6 shadow-md">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-grey">Solicitações de acesso</h2>
          <p className="mt-2 text-sm text-gray-600">
            Revise solicitações confirmadas e pendentes de verificação de e-mail antes do primeiro
            login.
          </p>
        </div>

        <div className="w-full max-w-xs">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as solicitações</SelectItem>
              <SelectItem value="pending_review">Pendentes de revisão</SelectItem>
              <SelectItem value="email_verification_pending">Aguardando verificação</SelectItem>
              <SelectItem value="approved">Aprovadas</SelectItem>
              <SelectItem value="rejected">Rejeitadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-3">
          {isLoadingList ? (
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-5 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando solicitações...
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl bg-white px-4 py-5 text-sm text-gray-500">
              Nenhuma solicitação encontrada para o filtro atual.
            </div>
          ) : (
            requests.map((request) => (
              <button
                key={request.id}
                type="button"
                onClick={() => setSelectedRequestId(request.id)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                  selectedRequestId === request.id
                    ? "border-ideciclo-blue bg-white shadow-sm"
                    : "border-transparent bg-white/80 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-text-grey">{request.name}</h3>
                  <Badge variant={request.status === "approved" ? "default" : "secondary"}>
                    {ACCESS_REQUEST_STATUS_LABELS[request.status] || request.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-gray-600">{request.email}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {request.organization}
                  {request.state ? ` • ${request.state}` : ""}
                  {request.city ? ` • ${request.city}` : ""}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          {isLoadingDetail ? (
            <div className="flex items-center gap-3 py-8 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando detalhes...
            </div>
          ) : !selectedRequest ? (
            <div className="py-8 text-sm text-gray-500">
              Selecione uma solicitação para revisar os detalhes.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-text-grey">{selectedRequest.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{selectedRequest.email}</p>
                  <p className="mt-1 text-sm text-gray-600">{selectedRequest.organization}</p>
                </div>
                <Badge>{ACCESS_REQUEST_STATUS_LABELS[selectedRequest.status] || selectedRequest.status}</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-background-grey p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Interesse
                  </p>
                  <p className="mt-2 text-sm text-text-grey">
                    {interestLabels[selectedRequest.interestType] || selectedRequest.interestType}
                  </p>
                </div>
                <div className="rounded-2xl bg-background-grey p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Escopo solicitado
                  </p>
                  <p className="mt-2 text-sm text-text-grey">
                    {selectedRequest.state || "Sem estado"}
                    {selectedRequest.city ? ` • ${selectedRequest.city}` : ""}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-background-grey p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Mensagem
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-text-grey">
                  {selectedRequest.message || "Sem mensagem."}
                </p>
              </div>

              {existingUser ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-900">
                    Já existe usuário cadastrado para este e-mail.
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    {existingUser.name || existingUser.email} • {existingUser.active ? "Ativo" : "Inativo"}
                  </p>
                  {existingPermissions.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {existingPermissions.map((permission) => (
                        <Badge key={permission.id} variant="secondary">
                          {roleLabels[permission.role] || permission.role}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {selectedRequest.status === "pending_review" ? (
                <>
                  <div className="rounded-2xl border p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-ideciclo-blue" />
                      <h4 className="font-semibold text-text-grey">Permissões da aprovação</h4>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <Select
                        value={permissionDraft.role}
                        onValueChange={(value) =>
                          setPermissionDraft((current) => ({
                            ...current,
                            role: value as AuthRole,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {AUTH_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {roleLabels[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={permissionDraft.module || "__none__"}
                        onValueChange={(value) =>
                          setPermissionDraft((current) => ({
                            ...current,
                            module: value === "__none__" ? "" : value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Módulo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Sem módulo</SelectItem>
                          {AUTH_MODULES.map((module) => (
                            <SelectItem key={module} value={module}>
                              {moduleLabels[module]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={getSelectedStateId(permissionDraft.state)}
                        onValueChange={(value) => void handleDraftStateChange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Sem estado</SelectItem>
                          {states.map((state) => (
                            <SelectItem key={state.id} value={state.id.toString()}>
                              {state.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={permissionDraft.city || "__none__"}
                        disabled={!permissionDraft.state}
                        onValueChange={(value) =>
                          setPermissionDraft((current) => ({
                            ...current,
                            city: value === "__none__" ? "" : value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Cidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Sem cidade</SelectItem>
                          {draftCities.map((city) => (
                            <SelectItem key={city.id} value={city.nome}>
                              {city.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button type="button" variant="outline" onClick={handleAddPermission}>
                        Adicionar permissão
                      </Button>
                    </div>

                    <div className="mt-4 space-y-2">
                      {approvalPermissions.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Adicione ao menos uma permissão para concluir a aprovação.
                        </p>
                      ) : (
                        approvalPermissions.map((permission, index) => (
                          <div
                            key={`${permission.role}-${permission.module}-${permission.state}-${permission.city}-${index}`}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-background-grey px-4 py-3"
                          >
                            <div className="flex flex-wrap gap-2">
                              <Badge>{roleLabels[permission.role] || permission.role}</Badge>
                              {permission.module ? (
                                <Badge variant="secondary">
                                  {moduleLabels[permission.module] || permission.module}
                                </Badge>
                              ) : null}
                              {permission.state ? <Badge variant="outline">{permission.state}</Badge> : null}
                              {permission.city ? <Badge variant="outline">{permission.city}</Badge> : null}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePermission(index)}
                            >
                              Remover
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-grey">
                        Observações internas
                      </label>
                      <Textarea
                        value={reviewerNotes}
                        onChange={(event) => setReviewerNotes(event.target.value)}
                        rows={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-grey">
                        Motivo da rejeição
                      </label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(event) => setRejectionReason(event.target.value)}
                        rows={5}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={isSaving || approvalPermissions.length === 0}
                      onClick={() => void handleApprove()}
                    >
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                      Aprovar solicitação
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={isSaving}
                      onClick={() => void handleReject()}
                    >
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                      Rejeitar solicitação
                    </Button>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl bg-background-grey p-4 text-sm text-gray-600">
                  {selectedRequest.status === "approved"
                    ? "Esta solicitação já foi aprovada."
                    : selectedRequest.status === "rejected"
                      ? `Solicitação rejeitada${selectedRequest.rejectionReason ? `: ${selectedRequest.rejectionReason}` : "."}`
                      : "Aguardando confirmação de e-mail pelo solicitante."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAccessRequests;
