import { useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Loader2, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [searchParams] = useSearchParams();
  const redirectTo = useMemo(
    () => searchParams.get("redirect") || "/admin",
    [searchParams]
  );
  const { isAuthenticated, requestMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  if (isAuthenticated) {
    return <Navigate replace to={redirectTo} />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await requestMagicLink(email, redirectTo);
      setRequestSent(true);
    } catch {
      // O toast já é tratado no contexto.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-xl rounded-[32px] bg-background-grey p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-text-grey">Entrar no IDECICLO</h1>
        <p className="mt-4 leading-7 text-gray-700">
          Informe seu e-mail. Se este e-mail estiver autorizado, enviaremos um link de acesso.
          Caso não tenha autorização de acesso, requisite por "Solicitar acesso".
        </p>

        {!requestSent ? (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-medium text-text-grey">
                E-mail
              </label>
              <Input
                id="login-email"
                type="email"
                placeholder="voce@organizacao.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <Button
              className="w-full bg-ideciclo-red hover:bg-ideciclo-red/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando autorização de acesso
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar autorização de acesso
                </>
              )}
            </Button>

            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link to="/solicitar-acesso">
                <UserPlus className="mr-2 h-4 w-4" />
                Solicitar acesso
              </Link>
            </Button>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-700">
            <p className="text-sm leading-6">
              Se o e-mail abaixo estiver autorizado, enviaremos um link de acesso.
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-text-grey">
              {email}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Caso não tenha autorização de acesso, requisite por &quot;Solicitar acesso&quot;.
            </p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <Link className="underline" to="/avaliacao">
            Voltar para avaliação
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
