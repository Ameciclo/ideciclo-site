import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Shield, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AUTH_MODULES, AUTH_ROLES } from "@/lib/authPermissions";
import { fetchCities, fetchStates } from "@/services/api";
import AdminAccessRequests from "@/pages/admin/AdminAccessRequests";
import {
  createAdminUser,
  createUserPermission,
  deleteUserPermission,
  fetchAdminUsers,
  updateAdminUser,
} from "@/services/authApi";
import type { IBGECity, IBGEState } from "@/types";
import type { AdminUser, AuthModule, AuthPermission, AuthRole } from "@/types/auth";

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

type PermissionDraft = {
  role: string;
  module: string;
  state: string;
  city: string;
};

const defaultPermissionDraft: PermissionDraft = {
  role: AUTH_ROLES[0],
  module: "__none__",
  state: "",
  city: "",
};

const normalizeScopeValue = (value?: string | null) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim().toLowerCase() : "";

const matchesPermissionScope = (
  permission: Pick<AuthPermission, "state" | "city">,
  state?: string,
  city?: string
) => {
  const permissionState = normalizeScopeValue(permission.state);
  const permissionCity = normalizeScopeValue(permission.city);
  const requestedState = normalizeScopeValue(state);
  const requestedCity = normalizeScopeValue(city);

  if (permissionState && requestedState && permissionState !== requestedState) {
    return false;
  }

  if (permissionCity && requestedCity && permissionCity !== requestedCity) {
    return false;
  }

  return true;
};

const AdminUsers = () => {
  const { toast } = useToast();
  const { permissions } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [states, setStates] = useState<IBGEState[]>([]);
  const [citiesByUserId, setCitiesByUserId] = useState<Record<string, IBGECity[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [permissionDrafts, setPermissionDrafts] = useState<Record<string, PermissionDraft>>({});

  const adminPermissions = useMemo(
    () =>
      permissions.filter(
        (permission) =>
          permission.role === "admin_global" ||
          permission.role === "admin_estado" ||
          permission.role === "admin_cidade"
      ),
    [permissions]
  );

  const isGlobalAdmin = adminPermissions.some((permission) => permission.role === "admin_global");

  const allowedRoles = AUTH_ROLES;

  const availableStates = useMemo(() => {
    if (isGlobalAdmin) return states;

    return states.filter((state) =>
      adminPermissions.some((permission) => matchesPermissionScope(permission, state.sigla))
    );
  }, [adminPermissions, isGlobalAdmin, states]);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const statesResponse = await fetchStates();
        setStates(statesResponse);
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

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetchAdminUsers();
        setUsers(response.users);
        setPermissionDrafts(
          response.users.reduce<Record<string, PermissionDraft>>((accumulator, user) => {
            accumulator[user.id] = {
              ...defaultPermissionDraft,
              role: allowedRoles[0] || defaultPermissionDraft.role,
            };
            return accumulator;
          }, {})
        );
      } catch (error) {
        toast({
          title: "Erro ao carregar usuários",
          description:
            error instanceof Error ? error.message : "Não foi possível buscar os usuários.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void loadUsers();
  }, [toast]);

  const updateUsersState = (nextUsers: AdminUser[]) => {
    setUsers(nextUsers);
    setPermissionDrafts((currentDrafts) =>
      nextUsers.reduce<Record<string, PermissionDraft>>((accumulator, user) => {
        const currentDraft = currentDrafts[user.id] || {
          ...defaultPermissionDraft,
          role: defaultPermissionDraft.role,
        };

        accumulator[user.id] = currentDraft;
        return accumulator;
      }, {})
    );
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await createAdminUser(newUserEmail, newUserName || undefined);
      updateUsersState(response.users);
      setNewUserEmail("");
      setNewUserName("");
      toast({
        title: "Usuário adicionado",
        description: "O cadastro foi salvo com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar usuário",
        description: error instanceof Error ? error.message : "Falha inesperada.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    setIsSaving(true);

    try {
      const response = await updateAdminUser(user.id, { active: !user.active });
      updateUsersState(response.users);
    } catch (error) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error instanceof Error ? error.message : "Falha inesperada.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePermissionDraftChange = (
    userId: string,
    patch: Partial<PermissionDraft>
  ) => {
    setPermissionDrafts((currentDrafts) => ({
      ...currentDrafts,
      [userId]: {
        ...(currentDrafts[userId] || defaultPermissionDraft),
        ...patch,
      },
    }));
  };

  const handleStateChange = async (userId: string, stateId: string) => {
    const selectedState = states.find((state) => state.id.toString() === stateId);

    handlePermissionDraftChange(userId, {
      state: selectedState?.sigla || "",
      city: "",
    });

    if (!stateId) {
      setCitiesByUserId((current) => ({
        ...current,
        [userId]: [],
      }));
      return;
    }

    try {
      const cities = await fetchCities(stateId);
      const filteredCities = isGlobalAdmin
        ? cities
        : cities.filter((city) =>
            adminPermissions.some((permission) =>
              matchesPermissionScope(permission, selectedState?.sigla, city.nome)
            )
          );

      setCitiesByUserId((current) => ({
        ...current,
        [userId]: filteredCities,
      }));
    } catch (error) {
      setCitiesByUserId((current) => ({
        ...current,
        [userId]: [],
      }));
      toast({
        title: "Erro ao carregar cidades",
        description:
          error instanceof Error ? error.message : "Não foi possível carregar as cidades.",
        variant: "destructive",
      });
    }
  };

  const getSelectedStateId = (stateCode: string) =>
    states.find((state) => state.sigla === stateCode)?.id.toString() || "__none__";

  const canManageExistingPermission = (permission: AuthPermission) => {
    if (isGlobalAdmin) return true;
    if (permission.role === "admin_global") return false;

    return adminPermissions.some((adminPermission) =>
      matchesPermissionScope(adminPermission, permission.state || "", permission.city || "")
    );
  };

  const canManageUser = (user: AdminUser) => {
    if (isGlobalAdmin) return true;
    if (user.permissions.length === 0) return true;

    return user.permissions.every(canManageExistingPermission);
  };

  const handleCreatePermission = async (userId: string) => {
    const draft = permissionDrafts[userId] || defaultPermissionDraft;
    setIsSaving(true);

    try {
      const response = await createUserPermission({
        userId,
        role: draft.role as AuthRole,
        module: draft.module === "__none__" ? "" : (draft.module as AuthModule),
        state: draft.state,
        city: draft.city,
      });
      updateUsersState(response.users);
      toast({
        title: "Permissão atribuída",
        description: "A nova permissão foi adicionada ao usuário.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atribuir permissão",
        description: error instanceof Error ? error.message : "Falha inesperada.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    setIsSaving(true);

    try {
      const response = await deleteUserPermission(permissionId);
      updateUsersState(response.users);
    } catch (error) {
      toast({
        title: "Erro ao remover permissão",
        description: error instanceof Error ? error.message : "Falha inesperada.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando usuários...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-grey">Administração de usuários</h1>
          <p className="mt-2 max-w-3xl text-gray-600">
            Cadastre e-mails autorizados, ative ou desative acessos e atribua permissões dentro
            do escopo administrativo da sua conta.
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          {isGlobalAdmin ? (
            <TabsTrigger value="access-requests">Solicitações de acesso</TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="mb-8 rounded-[28px] bg-background-grey p-6 shadow-md">
            <form className="grid gap-4 md:grid-cols-[2fr_2fr_auto]" onSubmit={handleCreateUser}>
              <Input
                type="email"
                placeholder="email@organizacao.org"
                value={newUserEmail}
                onChange={(event) => setNewUserEmail(event.target.value)}
                required
              />
              <Input
                placeholder="Nome do usuário"
                value={newUserName}
                onChange={(event) => setNewUserName(event.target.value)}
              />
              <Button disabled={isSaving} className="bg-ideciclo-red hover:bg-ideciclo-red/90">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar usuário
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            {users.map((user) => {
              const draft = permissionDrafts[user.id] || defaultPermissionDraft;
              const userIsManageable = canManageUser(user);

              return (
                <div key={user.id} className="rounded-[28px] border bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold text-text-grey">
                          {user.name || user.email}
                        </h2>
                        <Badge variant={user.active ? "default" : "destructive"}>
                          {user.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{user.email}</p>
                    </div>

                    <Button
                      variant="outline"
                      disabled={isSaving || !userIsManageable}
                      onClick={() => handleToggleActive(user)}
                    >
                      {user.active ? "Desativar" : "Ativar"}
                    </Button>
                  </div>

                  <div className="mt-6 rounded-2xl bg-background-grey p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-ideciclo-blue" />
                      <h3 className="font-semibold text-text-grey">Permissões</h3>
                    </div>

                    <div className="space-y-3">
                      {user.permissions.length === 0 ? (
                        <p className="text-sm text-gray-500">Nenhuma permissão atribuída.</p>
                      ) : (
                        user.permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex flex-col gap-3 rounded-2xl border bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between"
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
                              variant="ghost"
                              size="sm"
                              disabled={isSaving || !canManageExistingPermission(permission)}
                              onClick={() => handleDeletePermission(permission.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover
                            </Button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <Select
                        value={draft.role}
                        disabled={isSaving || !userIsManageable}
                        onValueChange={(value) =>
                          handlePermissionDraftChange(user.id, { role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {roleLabels[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={draft.module}
                        disabled={isSaving || !userIsManageable}
                        onValueChange={(value) =>
                          handlePermissionDraftChange(user.id, { module: value })
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
                        value={getSelectedStateId(draft.state)}
                        disabled={isSaving || !userIsManageable}
                        onValueChange={(value) =>
                          void handleStateChange(user.id, value === "__none__" ? "" : value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Sem estado</SelectItem>
                          {availableStates.map((state) => (
                            <SelectItem key={state.id} value={state.id.toString()}>
                              {state.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={draft.city || "__none__"}
                        disabled={
                          isSaving ||
                          !userIsManageable ||
                          !draft.state ||
                          (citiesByUserId[user.id] || []).length === 0
                        }
                        onValueChange={(value) =>
                          handlePermissionDraftChange(user.id, {
                            city: value === "__none__" ? "" : value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Cidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Sem cidade</SelectItem>
                          {(citiesByUserId[user.id] || []).map((city) => (
                            <SelectItem key={city.id} value={city.nome}>
                              {city.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        disabled={isSaving || !userIsManageable}
                        onClick={() => void handleCreatePermission(user.id)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Atribuir
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {isGlobalAdmin ? (
          <TabsContent value="access-requests">
            <AdminAccessRequests />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
};

export default AdminUsers;
