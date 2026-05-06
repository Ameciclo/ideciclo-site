import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AccessDenied from "@/components/auth/AccessDenied";
import { useAuth } from "@/hooks/useAuth";
import type { AuthModule } from "@/types/auth";
import { getPersistedCityData } from "@/utils/persistedCityData";

const readAssessmentScope = () => {
  const raw = getPersistedCityData();
  if (!raw) return { state: null, city: null };

  try {
    const parsed = JSON.parse(raw) as {
      cityName?: string;
      stateName?: string;
    };

    return {
      state: parsed.stateName || null,
      city: parsed.cityName || null,
    };
  } catch (error) {
    console.error("Falha ao ler cidade ativa para a proteção da rota:", error);
    return { state: null, city: null };
  }
};

const LoadingScreen = () => (
  <div className="container py-16">
    <div className="flex items-center justify-center gap-3 text-gray-600">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Validando acesso...</span>
    </div>
  </div>
);

const ProtectedRoute = ({
  children,
  requiredModule,
  allowViewer = false,
  requireAdminGlobal = false,
  useAssessmentScope = false,
}: {
  children: ReactNode;
  requiredModule?: AuthModule | null;
  allowViewer?: boolean;
  requireAdminGlobal?: boolean;
  useAssessmentScope?: boolean;
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, canAccess, canManageAdminPanel } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}`;
    return <Navigate replace to={`/login?redirect=${encodeURIComponent(redirectTo)}`} />;
  }

  if (requireAdminGlobal && !canManageAdminPanel) {
    return <AccessDenied />;
  }

  if (requiredModule || allowViewer) {
    const scope = useAssessmentScope ? readAssessmentScope() : { state: null, city: null };

    const allowed = canAccess({
      module: requiredModule,
      state: scope.state,
      city: scope.city,
      allowViewer,
    });

    if (!allowed) {
      return <AccessDenied />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
