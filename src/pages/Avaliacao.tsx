import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Edit, MapPin, FileText, TrendingUp } from "lucide-react";

const Avaliacao = () => {
  const navigate = useNavigate();

  const etapas = [
    {
      id: 1,
      title: "Baixar Dados",
      subtitle: "Selecione uma cidade",
      description: "Escolha a cidade e baixe os dados da infraestrutura cicloviária",
      icon: Download,
      color: "#EFC345",
      route: "/avaliacao/baixar-dados"
    },
    {
      id: 2,
      title: "Refinar Dados",
      subtitle: "Ajuste os dados",
      description: "Melhore e organize os dados baixados da cidade",
      icon: Edit,
      color: "#5AC2E1",
      route: "/avaliacao/refinar-dados"
    },
    {
      id: 3,
      title: "Escolher Estrutura",
      subtitle: "Selecione um trecho",
      description: "Escolha uma estrutura específica para avaliar",
      icon: MapPin,
      color: "#8B5CF6",
      route: "/avaliacao/escolher-estrutura"
    },
    {
      id: 4,
      title: "Avaliar Estrutura",
      subtitle: "Preencha o formulário",
      description: "Realize a avaliação detalhada da estrutura",
      icon: FileText,
      color: "#10B981",
      route: "/avaliacao/avaliar-estrutura"
    },
    {
      id: 5,
      title: "Ver Resultados",
      subtitle: "Confira o índice",
      description: "Visualize a nota calculada e o índice IDECICLO",
      icon: TrendingUp,
      color: "#F59E0B",
      route: "/avaliacao/resultados"
    }
  ];

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Processo de Avaliação IDECICLO
          </h1>
          <p className="text-gray-600">
            Siga as etapas para avaliar a infraestrutura cicloviária de uma cidade
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/")}>
          Voltar ao Início
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {etapas.map((etapa) => {
          const IconComponent = etapa.icon;
          return (
            <a
              key={etapa.id}
              href={etapa.route}
              role="button"
              aria-label={`Ir para ${etapa.title}`}
              className="relative flex flex-col justify-center rounded-[40px] font-semibold text-xl w-full p-6 text-center tracking-wide shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-[1px] min-h-[200px]"
              style={{
                background: etapa.color,
                boxShadow: "0px 6px 8px 0px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white rounded-full p-4 shadow-lg">
                <IconComponent className="h-12 w-12" style={{ color: etapa.color }} />
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-1">{etapa.title}</h3>
                <h4 className="text-xl font-bold mb-2">{etapa.subtitle}</h4>
                <p className="text-sm opacity-90 leading-tight">{etapa.description}</p>
              </div>
            </a>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Como funciona?</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            O processo de avaliação IDECICLO é dividido em 5 etapas sequenciais. 
            Cada etapa pode ser acessada individualmente, permitindo que você trabalhe 
            no seu próprio ritmo e retome o processo quando necessário.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Avaliacao;
