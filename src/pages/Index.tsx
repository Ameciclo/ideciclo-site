import { HeroSection } from "@/components/sections/HeroSection";
import { AccordionSection } from "@/components/sections/AccordionSection";
import { SupportersSection } from "@/components/sections/SupportersSection";
import { formDownloadUrl, manualDownloadUrl } from "@/constants/siteLinks";
import accordionData from "@/data/accordion.json";
import partnersData from "@/data/partners.json";
import consultantsData from "@/data/consultants.json";
import sponsorsData from "@/data/sponsors.json";
import { Calculator, ClipboardList, FileDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const resourceCards = [
    {
      title: "Manual",
      description: "Conheça a metodologia completa do IDECICLO.",
      href: manualDownloadUrl,
      icon: FileDown,
      color: "#EFC345",
    },
    {
      title: "Formulário",
      description: "Baixe o formulário de campo para a avaliação.",
      href: formDownloadUrl,
      icon: ClipboardList,
      color: "#5AC2E1",
    },
    {
      title: "Cálculo do IDECICLO",
      description: "Consulte o resumo do cálculo e dos pesos da metodologia.",
      href: "/resumo_ideciclo.pdf",
      icon: Calculator,
      color: "#6DBFAC",
    },
  ];

  return (
    <>
      <HeroSection coverUrl={"/pages_covers/ideciclo-navcover.png"} />
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-[32px] bg-background-grey p-8 shadow-2xl md:p-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-text-grey md:text-4xl">
              Como navegar na plataforma
            </h2>
            <div className="mt-6 space-y-4 text-base leading-7 text-text-grey md:text-lg">
              <p>
                Esta plataforma foi desenvolvida para facilitar a coleta, análise e visualização dos dados do IDECICLO nas cidades brasileiras. O sistema gerencia todo o ciclo de avaliação, do mapeamento inicial dos segmentos à geração dos relatórios finais, garantindo mais transparência e eficiência ao processo.
              </p>
              <p>
                Antes de começar, recomendamos conhecer o IDECICLO acessando a página sobre e baixando o manual. A plataforma possui três funcionalidades principais, que podem ser acessadas de forma independente, mas estão conectadas.
              </p>
              <p>
                Na seção de aprimoramento dos dados é possível visualizar, ajustar e complementar os dados da malha cicloviária da cidade, a partir da base extraída do OpenStreetMap. Depois dessa etapa, inicia-se o processo de avaliação da infraestrutura cicloviária, preenchendo todas as seções necessárias para cálculo automático da nota e da classificação.
              </p>
              <p>
                Os segmentos avaliados compõem o ranking nacional do IDECICLO, com a posição de cada cidade, sua nota e a classificação final.
              </p>
            </div>

            <div className="mt-8 rounded-[30px] bg-white p-6 shadow-md md:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ideciclo-red">
                    Resumo didático
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-text-grey md:text-3xl">
                    Entenda em linguagem simples como o IDECICLO avalia uma cidade
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-text-grey md:text-base">
                    Criamos uma página visual explicando o que o índice mede, por que ele é diferente de uma contagem de quilômetros e como a nota final é formada.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <Button asChild className="bg-ideciclo-red text-white hover:bg-ideciclo-red/90">
                    <Link to="/resumo-ideciclo">
                      Ver resumo do IDECICLO
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {resourceCards.map((card) => {
                const Icon = card.icon;
                return (
                  <a
                    key={card.title}
                    href={card.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-[32px] p-6 text-text-grey shadow-[0px_6px_8px_rgba(0,0,0,0.25)] transition-transform duration-200 hover:-translate-y-1"
                    style={{ backgroundColor: card.color }}
                  >
                    <Icon className="h-10 w-10" />
                    <h3 className="mt-5 text-2xl font-bold">{card.title}</h3>
                    <p className="mt-3 text-sm leading-6">{card.description}</p>
                  </a>
                );
              })}
            </div>

            <p className="mt-6 rounded-2xl bg-white/90 px-5 py-4 text-sm font-medium text-text-grey shadow-sm">
              Para uma melhor visualização, acesse pelo computador.
            </p>
          </div>
        </div>
      </section>

      <AccordionSection accordion={accordionData} />
      <div className="mx-auto relative z-0">
        <img className="min-h-[100px]" src="/ideciclo-ciclovia.png" alt="" />
      </div>
      <SupportersSection
        partners={partnersData}
        consultants={consultantsData}
        sponsors={sponsorsData}
      />
    </>
  );
};

export default Index;
