import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";
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
  const [feedback, setFeedback] = useState("");

  const redirectQuery = useMemo(
    () => encodeURIComponent(loginModal.redirectTo || "/admin"),
    [loginModal.redirectTo]
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeLoginModal();
      setFeedback("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await requestMagicLink(email, loginModal.redirectTo || "/admin");
      setFeedback(result.message);
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
            "Este acesso está protegido. Informe seu e-mail para receber um magic link."}
        </p>

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
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {feedback}
          </div>
        ) : null}

        <div className="text-center text-sm text-gray-500">
          Se preferir, use a página completa de{" "}
          <Link className="font-medium text-ideciclo-blue underline" to={`/login?redirect=${redirectQuery}`}>
            login
          </Link>
          .
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
