import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyMagicLink } from "@/services/authApi";
import { useAuth } from "@/hooks/useAuth";

const AuthVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const redirectTo = useMemo(
    () => searchParams.get("redirect") || "/admin",
    [searchParams]
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError("O link de acesso está incompleto ou inválido.");
        return;
      }

      try {
        const result = await verifyMagicLink(token, redirectTo);
        await refreshSession();
        navigate(result.redirectTo || redirectTo, { replace: true });
      } catch (verifyError) {
        setError(
          verifyError instanceof Error
            ? verifyError.message
            : "Não foi possível validar o link."
        );
      }
    };

    void verify();
  }, [navigate, redirectTo, refreshSession, token]);

  if (!error) {
    return (
      <div className="container py-16">
        <div className="mx-auto flex max-w-lg items-center gap-3 rounded-[28px] bg-background-grey p-8 text-gray-700 shadow-md">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Validando seu link de acesso...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-xl rounded-[28px] border border-red-200 bg-red-50 p-8 shadow-md">
        <h1 className="text-2xl font-bold text-text-grey">Link inválido</h1>
        <p className="mt-4 leading-7 text-gray-700">{error}</p>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`}>Solicitar novo link</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/avaliacao">Voltar</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthVerify;
