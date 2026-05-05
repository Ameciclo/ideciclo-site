import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-xl rounded-[28px] border border-red-200 bg-red-50 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-ideciclo-red shadow-sm">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-text-grey">Acesso negado</h1>
        <p className="mt-3 leading-7 text-gray-700">
          Sua sessão está ativa, mas suas permissões não cobrem esta área da plataforma.
        </p>
        <Button className="mt-6" onClick={() => navigate("/avaliacao")}>
          Voltar para avaliação
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied;
