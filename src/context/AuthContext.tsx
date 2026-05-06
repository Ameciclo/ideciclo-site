import { createContext, useEffect, useState, type ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { canAccessModule, canManageAdmin } from "@/lib/authPermissions";
import LoginDialog from "@/components/auth/LoginDialog";
import {
  fetchCurrentSession,
  logoutRequest,
  requestMagicLink as requestMagicLinkApi,
} from "@/services/authApi";
import type { AuthModule, AuthPermission, AuthSession, AuthUser } from "@/types/auth";

interface LoginModalState {
  open: boolean;
  redirectTo: string;
  title?: string;
  description?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  permissions: AuthPermission[];
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginModal: LoginModalState;
  openLoginModal: (options?: Partial<LoginModalState>) => void;
  closeLoginModal: () => void;
  refreshSession: () => Promise<AuthSession | null>;
  requestMagicLink: (email: string, redirectTo: string) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  canAccess: (options: {
    module?: AuthModule | null;
    state?: string | null;
    city?: string | null;
    allowViewer?: boolean;
  }) => boolean;
  canManageAdminPanel: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginModal, setLoginModal] = useState<LoginModalState>({
    open: false,
    redirectTo: "/admin",
  });

  const refreshSession = async () => {
    try {
      const response = await fetchCurrentSession();
      setSession(response.session);
      return response.session;
    } catch (error) {
      console.error("Falha ao carregar sessão:", error);
      setSession(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetchCurrentSession();
        setSession(response.session);
      } catch (error) {
        console.error("Falha ao carregar sessão:", error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSession();
  }, []);

  const openLoginModal = (options?: Partial<LoginModalState>) => {
    setLoginModal({
      open: true,
      redirectTo: options?.redirectTo || "/admin",
      title: options?.title,
      description: options?.description,
    });
  };

  const closeLoginModal = () => {
    setLoginModal((currentState) => ({
      ...currentState,
      open: false,
    }));
  };

  const requestMagicLink = async (email: string, redirectTo: string) => {
    try {
      return await requestMagicLinkApi(email, redirectTo);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível solicitar o acesso.";
      toast({
        title: "Erro ao enviar o link",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
      setSession(null);
      closeLoginModal();
    } catch (error) {
      toast({
        title: "Erro ao encerrar a sessão",
        description:
          error instanceof Error ? error.message : "Não foi possível sair agora.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value: AuthContextValue = {
    user: session?.user || null,
    permissions: session?.permissions || [],
    session,
    isLoading,
    isAuthenticated: Boolean(session?.user),
    loginModal,
    openLoginModal,
    closeLoginModal,
    refreshSession,
    requestMagicLink,
    logout,
    canAccess: (options) =>
      canAccessModule({
        permissions: session?.permissions || [],
        ...options,
      }),
    canManageAdminPanel: canManageAdmin(session?.permissions || []),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginDialog />
    </AuthContext.Provider>
  );
};
