import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const LoginDialog = () => {
  const {
    loginModal,
    closeLoginModal,
    requestMagicLink,
    isAuthenticated,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const redirectQuery = useMemo(
    () => encodeURIComponent(loginModal.redirectTo || "/admin"),
    [loginModal.redirectTo]
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeLoginModal();
      setRequestSent(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await requestMagicLink(email, loginModal.redirectTo || "/admin");
      setRequestSent(true);
    } catch {
      // O toast já é tratado no contexto.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={loginModal.open && !isAuthenticated} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{loginModal.title || "Entrar para continuar"}</DialogTitle>
        </DialogHeader>

        <p className="text-sm leading-6 text-gray-600">
          {loginModal.description ||
            "Se este e-mail estiver autorizado, enviaremos um link de acesso. Caso não tenha autorização de acesso, requisite por \"Solicitar acesso\"."}
        </p>

        {!requestSent ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="magic-link-email" className="text-sm font-medium text-text-grey">
                E-mail
              </label>
              <Input
                id="magic-link-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@organizacao.org"
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
              <Link to="/solicitar-acesso" onClick={() => handleOpenChange(false)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Solicitar acesso
              </Link>
            </Button>
          </form>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-700">
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

        <div className="text-center text-sm text-gray-500">
          Se preferir, use a página completa de{" "}
          <Link
            className="font-medium text-ideciclo-blue underline"
            to={`/login?redirect=${redirectQuery}`}
            onClick={() => handleOpenChange(false)}
          >
            login
          </Link>
          .
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
