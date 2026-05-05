import { useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";
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
  const [feedback, setFeedback] = useState("");

  if (isAuthenticated) {
    return <Navigate replace to={redirectTo} />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await requestMagicLink(email, redirectTo);
      setFeedback(result.message);
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
          Informe seu e-mail. Se ele estiver autorizado, enviaremos um link de acesso com
          validade de 30 minutos.
        </p>

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

          <Button className="w-full bg-ideciclo-red hover:bg-ideciclo-red/90" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando link
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Enviar magic link
              </>
            )}
          </Button>
        </form>

        {feedback ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {feedback}
          </div>
        ) : null}

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
