import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ACCESS_REQUEST_INTEREST_OPTIONS } from "@/lib/accessRequests";
import { useToast } from "@/hooks/use-toast";
import { fetchCities, fetchStates } from "@/services/api";
import { createAccessRequest } from "@/services/authApi";
import type { IBGECity, IBGEState } from "@/types";

const AccessRequest = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [selectedStateId, setSelectedStateId] = useState("");
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    state: "",
    city: "",
    interestType: ACCESS_REQUEST_INTEREST_OPTIONS[0].value,
    message: "",
  });

  useEffect(() => {
    const loadStates = async () => {
      try {
        setIsLoadingOptions(true);
        setStates(await fetchStates());
      } catch (error) {
        toast({
          title: "Erro ao carregar estados",
          description:
            error instanceof Error ? error.message : "Não foi possível carregar os estados.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingOptions(false);
      }
    };

    void loadStates();
  }, [toast]);

  const verificationFeedback = useMemo(() => {
    const status = searchParams.get("status");

    if (status === "verified") {
      return {
        tone: "emerald",
        message:
          "Seu e-mail foi confirmado. A solicitação agora está pendente de revisão da administração.",
      };
    }

    if (status === "already-verified") {
      return {
        tone: "amber",
        message: "Este e-mail já foi confirmado anteriormente para a mesma solicitação.",
      };
    }

    if (status === "expired") {
      return {
        tone: "destructive",
        message:
          "O link de verificação expirou. Envie uma nova solicitação para gerar outro link.",
      };
    }

    if (status === "invalid") {
      return {
        tone: "destructive",
        message: "O link de verificação é inválido ou já não está disponível.",
      };
    }

    return null;
  }, [searchParams]);

  const handleStateChange = async (stateId: string) => {
    setSelectedStateId(stateId);
    setCities([]);
    setFormData((current) => ({
      ...current,
      state: states.find((item) => item.id.toString() === stateId)?.sigla || "",
      city: "",
    }));

    if (!stateId) return;

    try {
      setIsLoadingCities(true);
      setCities(await fetchCities(stateId));
    } catch (error) {
      toast({
        title: "Erro ao carregar cidades",
        description:
          error instanceof Error ? error.message : "Não foi possível carregar as cidades.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCities(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createAccessRequest(formData);
      setFeedback(result.message);
      setConfirmationOpen(true);
      setFormData({
        name: "",
        email: "",
        organization: "",
        state: "",
        city: "",
        interestType: ACCESS_REQUEST_INTEREST_OPTIONS[0].value,
        message: "",
      });
      setSelectedStateId("");
      setCities([]);
    } catch (error) {
      toast({
        title: "Erro ao enviar solicitação",
        description: error instanceof Error ? error.message : "Falha inesperada.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-3xl rounded-[32px] bg-background-grey p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-text-grey">Solicitar acesso ao IDECICLO</h1>
        <p className="mt-4 leading-7 text-gray-700">
          Preencha o formulário com seus dados. Primeiro vamos confirmar a posse do e-mail.
          Depois disso, a solicitação segue para revisão administrativa.
        </p>

        {verificationFeedback ? (
          <div
            className={`mt-6 rounded-2xl px-4 py-3 text-sm ${
              verificationFeedback.tone === "emerald"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : verificationFeedback.tone === "amber"
                  ? "border border-amber-200 bg-amber-50 text-amber-800"
                  : "border border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {verificationFeedback.message}
          </div>
        ) : null}

        <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="access-request-name" className="text-sm font-medium text-text-grey">
              Nome
            </label>
            <Input
              id="access-request-name"
              value={formData.name}
              onChange={(event) =>
                setFormData((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="access-request-email" className="text-sm font-medium text-text-grey">
              E-mail
            </label>
            <Input
              id="access-request-email"
              type="email"
              value={formData.email}
              onChange={(event) =>
                setFormData((current) => ({ ...current, email: event.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="access-request-organization"
              className="text-sm font-medium text-text-grey"
            >
              Organização
            </label>
            <Input
              id="access-request-organization"
              value={formData.organization}
              onChange={(event) =>
                setFormData((current) => ({ ...current, organization: event.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-grey">Estado</label>
            <Select
              value={selectedStateId}
              onValueChange={(value) => void handleStateChange(value)}
              disabled={isLoadingOptions}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingOptions ? "Carregando estados..." : "Selecione um estado"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.id} value={state.id.toString()}>
                    {state.nome} - {state.sigla}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-grey">Cidade</label>
            <Select
              value={formData.city || "__none__"}
              onValueChange={(value) =>
                setFormData((current) => ({
                  ...current,
                  city: value === "__none__" ? "" : value,
                }))
              }
              disabled={isLoadingCities || !selectedStateId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={isLoadingCities ? "Carregando cidades..." : "Selecione uma cidade"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sem cidade específica</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.nome}>
                    {city.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-text-grey">Tipo de interesse</label>
            <Select
              value={formData.interestType}
              onValueChange={(value) =>
                setFormData((current) => ({ ...current, interestType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o interesse" />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_REQUEST_INTEREST_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="access-request-message"
              className="text-sm font-medium text-text-grey"
            >
              Mensagem
            </label>
            <Textarea
              id="access-request-message"
              value={formData.message}
              onChange={(event) =>
                setFormData((current) => ({ ...current, message: event.target.value }))
              }
              rows={5}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Button
              className="w-full bg-ideciclo-red hover:bg-ideciclo-red/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando solicitação
                </>
              ) : (
                <>
                  <MailCheck className="mr-2 h-4 w-4" />
                  Enviar solicitação
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-sm text-gray-500">
          <Link className="underline" to="/login">
            Já tem acesso? Ir para o login
          </Link>
        </div>
      </div>

      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Solicitação enviada
            </DialogTitle>
            <DialogDescription className="leading-6">
              {feedback ||
                "A solicitação foi registrada. Agora você precisa confirmar a posse do e-mail para que ela siga para análise administrativa."}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
            Verifique sua caixa de entrada e clique no link de confirmação enviado para o
            e-mail informado. Sem essa etapa, a solicitação não entra na fila de revisão.
          </div>

          <DialogFooter>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setConfirmationOpen(false)}
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccessRequest;
