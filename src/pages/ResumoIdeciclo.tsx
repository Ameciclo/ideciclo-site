import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bike,
  FileDown,
  GitBranch,
  LayoutGrid,
  Map,
  Shield,
  Trees,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { manualDownloadUrl } from "@/constants/siteLinks";

const keyQuestions = [
  "A infraestrutura está onde ela é mais necessária?",
  "O tipo da solução combina com a velocidade e o risco da via?",
  "Os trechos são conectados ou ficam soltos na cidade?",
  "As interseções são seguras para quem pedala?",
  "A rede está bem mantida e confortável no uso cotidiano?",
];

const typologies = [
  {
    title: "Ciclovia",
    description:
      "Espaço exclusivo para bicicletas, fisicamente separado do tráfego motorizado e dos pedestres.",
    accent: "#EFC345",
  },
  {
    title: "Ciclofaixa",
    description:
      "Faixa destinada às bicicletas na pista, normalmente marcada por pintura e elementos de separação.",
    accent: "#5AC2E1",
  },
  {
    title: "Calçada partilhada",
    description:
      "Espaço com separação clara entre a circulação de pedestres e a de bicicletas.",
    accent: "#6DBFAC",
  },
  {
    title: "Ciclorrota",
    description:
      "Via compartilhada de baixa velocidade, com sinalização e medidas para reduzir conflitos.",
    accent: "#F28B4B",
  },
];

const axes = [
  {
    letter: "A",
    title: "Planejamento cicloviário",
    description: "Verifica adequação da infraestrutura à via e conectividade da rede.",
    icon: Map,
    color: "bg-ideciclo-yellow text-text-grey",
  },
  {
    letter: "B",
    title: "Projeto ao longo da quadra",
    description: "Observa largura, pavimento, proteção, sinalização e riscos ao longo do trecho.",
    icon: LayoutGrid,
    color: "bg-ideciclo-blue text-white",
  },
  {
    letter: "C",
    title: "Projeto nas interseções",
    description: "Avalia travessias, visibilidade, conexão e conflitos nos cruzamentos.",
    icon: GitBranch,
    color: "bg-ideciclo-red text-white",
  },
  {
    letter: "D",
    title: "Urbanidade",
    description: "Considera iluminação, sombra e apoios que tornam o trajeto mais convidativo.",
    icon: Trees,
    color: "bg-emerald-600 text-white",
  },
  {
    letter: "E",
    title: "Manutenção",
    description: "Analisa pintura, conservação do pavimento, sinalização e elementos físicos.",
    icon: Wrench,
    color: "bg-slate-700 text-white",
  },
];

const roadWeights = [
  {
    title: "Estrutural",
    explanation: "Vias de maior fluxo e/ou velocidade. São as mais críticas para a segurança.",
    weight: "0,590",
    approx: "60%",
  },
  {
    title: "Alimentadora",
    explanation: "Vias de fluxo intermediário que distribuem deslocamentos na cidade.",
    weight: "0,262",
    approx: "25%",
  },
  {
    title: "Local",
    explanation: "Vias de menor fluxo e menor velocidade, como ruas residenciais.",
    weight: "0,148",
    approx: "15%",
  },
];

const ResumoIdeciclo = () => {
  return (
    <>
      <div
        className="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black"
        style={{ backgroundImage: "url('/pages_covers/ideciclo-navcover.png')" }}
      />

      <nav className="bg-gray-400 px-4 py-2 text-white">
        <Link to="/" className="hover:underline">
          Home
        </Link>{" "}
        &gt; <span>Resumo do IDECICLO</span>
      </nav>

      <main className="bg-[#f8f5ef]">
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="rounded-[36px] bg-white p-8 shadow-[0px_16px_40px_rgba(0,0,0,0.08)] md:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <span className="inline-flex rounded-full bg-ideciclo-yellow px-4 py-1 text-sm font-semibold text-text-grey">
                  Resumo didático
                </span>
                <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-text-grey md:text-6xl">
                  IDECICLO mede se a infraestrutura cicloviária está no lugar certo e com a proteção certa.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
                  Em vez de contar só quilômetros de ciclovia, o IDECICLO avalia
                  qualidade, segurança, conectividade, conforto e adequação ao risco
                  da via.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild className="bg-ideciclo-red text-white hover:bg-ideciclo-red/90">
                    <Link to="/avaliacao">Começar uma avaliação</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <a href={manualDownloadUrl} target="_blank" rel="noreferrer">
                      <FileDown className="mr-2 h-4 w-4" />
                      Baixar Manual IDECICLO
                    </a>
                  </Button>
                </div>
              </div>

              <div className="rounded-[32px] bg-[#14323d] p-6 text-white shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-ideciclo-yellow p-3 text-text-grey">
                    <Bike className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-white/70">
                      Em uma frase
                    </p>
                    <p className="mt-1 text-xl font-bold leading-8">
                      A cidade é boa para pedalar quando a rede cicloviária protege mais onde o risco é maior.
                    </p>
                  </div>
                </div>
                <div className="mt-6 rounded-[24px] bg-white/10 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
                    Pergunta central
                  </p>
                  <p className="mt-3 text-lg leading-8">
                    Não basta ter infraestrutura. Ela precisa estar onde faz mais diferença, funcionar bem e permanecer segura no uso cotidiano.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[32px] bg-[#f2e2bd] p-8 shadow-[0px_12px_32px_rgba(0,0,0,0.06)]">
              <h2 className="text-3xl font-black text-text-grey">O que o IDECICLO pergunta</h2>
              <p className="mt-4 text-base leading-7 text-slate-700">
                O índice funciona como um boletim da rede cicloviária. Ele ajuda a responder, de forma objetiva, se a infraestrutura existente realmente atende à cidade.
              </p>
              <ul className="mt-6 space-y-3">
                {keyQuestions.map((question) => (
                  <li
                    key={question}
                    className="rounded-2xl bg-white px-4 py-4 text-sm font-medium leading-6 text-slate-700 shadow-sm"
                  >
                    {question}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-[0px_12px_32px_rgba(0,0,0,0.06)]">
              <h2 className="text-3xl font-black text-text-grey">
                Por que ele é diferente de uma simples contagem de quilômetros
              </h2>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Indicador simples
                  </p>
                  <p className="mt-4 text-3xl font-black text-slate-700">100 km</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Informa extensão, mas não mostra se a infraestrutura está conectada, segura ou adequada ao tipo de via.
                  </p>
                </div>
                <div className="rounded-[28px] bg-[#14323d] p-6 text-white">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/70">
                    IDECICLO
                  </p>
                  <p className="mt-4 text-2xl font-black leading-9">
                    Qualidade + localização + conectividade + manutenção + risco da via
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/80">
                    A lógica é simples: quanto mais perigosa a via, maior deve ser a proteção oferecida a quem pedala.
                  </p>
                </div>
              </div>
              <div className="mt-6 rounded-[28px] bg-ideciclo-red px-6 py-5 text-white shadow-lg">
                Uma ciclorrota pode fazer sentido em uma rua calma. Em uma avenida rápida, a metodologia tende a exigir proteção muito maior.
              </div>
            </div>
          </div>
        </section>
                <section className="container mx-auto px-4 pb-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            ...
          </div>

          <div className="mt-6 rounded-[32px] bg-white p-8 shadow-[0px_12px_32px_rgba(0,0,0,0.06)]">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                Outras metodologias comuns
              </p>
              <h2 className="mt-2 text-2xl font-black text-text-grey">
                Cada indicador conta uma parte da história
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Medir quilômetros, cobertura populacional ou distribuição territorial é importante. 
                O IDECICLO complementa essas leituras ao avaliar se a infraestrutura está adequada, 
                segura, conectada e bem mantida.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-lg font-black text-text-grey">Quilometragem total</p>
                <p className="mt-1 text-sm font-semibold text-ideciclo-red">
                  “Quanto existe?”
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Mede a extensão da rede cicloviária. Mostra quantidade, mas não revela se os trechos são seguros, conectados ou adequados ao tipo de via.
                </p>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-lg font-black text-text-grey">Cobertura por população</p>
                <p className="mt-1 text-sm font-semibold text-ideciclo-red">
                  “Quantas pessoas são atendidas?”
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Observa a proximidade da infraestrutura em relação aos moradores. Ajuda a entender alcance territorial e acesso cotidiano à rede.
                </p>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-lg font-black text-text-grey">Distribuição territorial</p>
                <p className="mt-1 text-sm font-semibold text-ideciclo-red">
                  “Quem está sendo priorizado?”
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Analisa se a infraestrutura chega de forma equilibrada aos bairros, considerando desigualdades de renda, raça, gênero ou periferização.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="container mx-auto px-4 py-8">
          <div className="rounded-[36px] bg-white p-8 shadow-[0px_12px_32px_rgba(0,0,0,0.06)] md:p-10">
            <h2 className="text-3xl font-black text-text-grey">Quais infraestruturas entram na avaliação</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {typologies.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[28px] p-6 text-text-grey shadow-md"
                  style={{ backgroundColor: item.accent }}
                >
                  <h3 className="text-xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6">{item.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 rounded-2xl bg-slate-100 px-5 py-4 text-sm leading-6 text-slate-700">
              O IDECICLO não trata calçada compartilhada sem separação clara como solução adequada. O foco está em estruturas que protejam e organizem os fluxos com clareza.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="rounded-[36px] bg-[#0f3d4c] p-8 text-white shadow-[0px_12px_32px_rgba(0,0,0,0.1)] md:p-10">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-black md:text-4xl">Os 5 eixos do IDECICLO</h2>
              <p className="mt-4 text-base leading-7 text-white/80">
                Cada trecho é auditado em cinco grupos de critérios. Juntos, eles mostram se a estrutura funciona na cidade real, e não apenas no desenho.
              </p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {axes.map((axis) => {
                const Icon = axis.icon;
                return (
                  <div key={axis.letter} className="rounded-[28px] bg-white p-5 text-text-grey shadow-lg">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-black ${axis.color}`}
                    >
                      {axis.letter}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Icon className="h-5 w-5 text-ideciclo-red" />
                      <h3 className="text-base font-black leading-6">{axis.title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{axis.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="rounded-[36px] bg-white p-8 shadow-[0px_12px_32px_rgba(0,0,0,0.06)] md:p-10">
            <h2 className="text-3xl font-black text-text-grey">Como a nota da cidade é calculada</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
              O cálculo acontece em camadas. A ideia é transformar a qualidade dos trechos em uma medida de atendimento real da malha cicloviária.
            </p>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
              <div className="rounded-[28px] bg-[#f3ead2] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Etapa 1
                </p>
                <h3 className="mt-3 text-2xl font-black text-text-grey">Nota de cada trecho</h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Cada segmento recebe nota de 0 a 100 com base nos 5 eixos.
                </p>
              </div>
              <div className="hidden items-center justify-center lg:flex">
                <ArrowRight className="h-8 w-8 text-ideciclo-red" />
              </div>
              <div className="rounded-[28px] bg-[#dff0f6] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Etapa 2
                </p>
                <h3 className="mt-3 text-2xl font-black text-text-grey">Contribuição do trecho</h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  A extensão do trecho é multiplicada pela sua qualidade.
                </p>
                <pre className="mt-4 overflow-x-auto rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700">
{`contribuição = extensão x (nota / 100)`}
                </pre>
              </div>
              <div className="hidden items-center justify-center lg:flex">
                <ArrowRight className="h-8 w-8 text-ideciclo-red" />
              </div>
              <div className="rounded-[28px] bg-[#dcebdd] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Etapa 3
                </p>
                <h3 className="mt-3 text-2xl font-black text-text-grey">Nota final da cidade</h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  O sistema calcula o grau de atendimento das malhas estrutural, alimentadora e local, depois aplica pesos diferentes.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[32px] bg-[#14323d] p-7 text-white">
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                <div>
                  <h3 className="text-2xl font-black">Pesos das malhas viárias</h3>
                  <p className="mt-3 text-sm leading-6 text-white/80">
                    Vias de maior risco têm peso maior. Por isso, uma boa infraestrutura em avenidas estruturais impacta mais o índice final.
                  </p>
                </div>
                <div className="overflow-x-auto rounded-[24px] bg-white/10">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/15 text-white/70">
                        <th className="px-4 py-3 font-semibold">Malha</th>
                        <th className="px-4 py-3 font-semibold">Peso</th>
                        <th className="px-4 py-3 font-semibold">Aproximação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roadWeights.map((item) => (
                        <tr key={item.title} className="border-b border-white/10 last:border-b-0">
                          <td className="px-4 py-4">
                            <div className="font-bold">{item.title}</div>
                            <div className="mt-1 text-xs leading-5 text-white/70">
                              {item.explanation}
                            </div>
                          </td>
                          <td className="px-4 py-4 font-bold">{item.weight}</td>
                          <td className="px-4 py-4">{item.approx}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 rounded-[24px] bg-white/10 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/70">
                  Fórmula simplificada
                </p>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm font-semibold leading-7 text-white">
{`IDECICLO =
(GAM estrutural x 0,590) +
(GAM alimentadora x 0,262) +
(GAM local x 0,148)`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 pb-16">
          <div className="rounded-[36px] bg-gradient-to-r from-ideciclo-red to-[#d85f33] p-8 text-white shadow-[0px_12px_32px_rgba(0,0,0,0.1)] md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-black md:text-4xl">
                  Em resumo: o IDECICLO mostra o quanto a cidade está preparada para acolher a bicicleta.
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-white/85">
                  Ele aponta onde a infraestrutura precisa melhorar, onde a proteção é insuficiente e como priorizar expansão, qualificação e manutenção da rede.
                </p>
              </div>
              <div className="rounded-[28px] bg-white p-6 text-text-grey shadow-lg">
                <div className="flex items-start gap-3">
                  <Shield className="mt-1 h-5 w-5 text-ideciclo-red" />
                  <p className="text-sm leading-6">
                    Use o IDECICLO para diagnosticar, comparar cidades, justificar projetos e orientar prioridades de ação com base em risco, cobertura e qualidade.
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="bg-[#14323d] text-white hover:bg-[#14323d]/90">
                    <Link to="/avaliacao">Ir para avaliação</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <a href={manualDownloadUrl} target="_blank" rel="noreferrer">
                      Baixar Manual IDECICLO
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ResumoIdeciclo;
