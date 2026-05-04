import { IdecicloFormData } from "@/types/idecicloForm";
import { CriterionCode, IdecicloRating } from "@/utils/idecicloAssessment";

export interface CriterionScaleDescription {
  rating: IdecicloRating;
  description: string;
  unavailable?: boolean;
}

const buildScale = (
  entries: Record<
    IdecicloRating,
    string | { description: string; unavailable?: boolean }
  >
): CriterionScaleDescription[] =>
  (["A", "B", "C", "D"] as IdecicloRating[]).map((rating) => {
    const entry = entries[rating];

    if (typeof entry === "string") {
      return {
        rating,
        description: entry,
      };
    }

    return {
      rating,
      description: entry.description,
      unavailable: entry.unavailable,
    };
  });

const normalizeTypology = (value: unknown) => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("ciclovia")) return "ciclovia";
  if (normalized.includes("ciclofaixa")) return "ciclofaixa";
  if (normalized.includes("ciclorrota")) return "ciclorrota";
  if (normalized.includes("partilhada") || normalized.includes("compartilhada")) {
    return "calcada_partilhada";
  }

  return null;
};

const getFlowType = (value: unknown) =>
  String(value ?? "").toLowerCase().includes("bi") ? "bidirectional" : "unidirectional";

export const getCriterionRatingScale = (
  criterion: CriterionCode,
  data: Partial<IdecicloFormData>
): CriterionScaleDescription[] => {
  const typology = normalizeTypology(data.infra_typology);
  const flow = getFlowType(data.infra_flow);

  switch (criterion) {
    case "A1":
      return buildScale({
        A: "A tipologia está adequada à velocidade e à hierarquia da via segundo o manual.",
        B: {
          description: "Não utilizada neste critério. O enquadramento de A.1 resulta em adequado ou inadequado.",
          unavailable: true,
        },
        C: {
          description: "Não utilizada neste critério. O enquadramento de A.1 resulta em adequado ou inadequado.",
          unavailable: true,
        },
        D: "A tipologia está inadequada à velocidade e à hierarquia da via, ou a calçada partilhada excede o limite de pedestres do manual.",
      });
    case "A2":
      return buildScale({
        A: "Todas as interseções relevantes do trecho se conectam a outra infraestrutura cicloviária.",
        B: "A conexão ocorre em pelo menos 65% das interseções relevantes, mas não em todas.",
        C: "A conexão ocorre em pelo menos 30% e em menos de 65% das interseções relevantes.",
        D: "A conexão ocorre em menos de 30% das interseções relevantes.",
      });
    case "B1":
      return flow === "bidirectional"
        ? buildScale({
            A: "A largura útil é de 3,0 m ou mais para fluxo bidirecional.",
            B: "A largura útil fica entre 2,5 m e menos de 3,0 m para fluxo bidirecional.",
            C: "A largura útil fica entre 2,0 m e menos de 2,5 m para fluxo bidirecional.",
            D: "A largura útil é inferior a 2,0 m para fluxo bidirecional.",
          })
        : buildScale({
            A: "A largura útil é de 2,0 m ou mais para fluxo unidirecional.",
            B: "A largura útil fica entre 1,5 m e menos de 2,0 m para fluxo unidirecional.",
            C: "A largura útil fica entre 1,0 m e menos de 1,5 m para fluxo unidirecional.",
            D: "A largura útil é inferior a 1,0 m para fluxo unidirecional.",
          });
    case "B2":
      return buildScale({
        A: "Pisos betuminosos (asfalto) ou cimentícios (concreto).",
        B: "Pisos modulares bem assentados, como blocos de concreto e similares.",
        C: "Pisos de pedras irregulares ou pisos com espaçamento, como tampas de bueiro e similares.",
        D: "Pisos de barro ou similares, grelhas, chapas metálicas, pisos soltos ou derrapantes.",
      });
    case "B3":
      if (typology === "calcada_partilhada") {
        return buildScale({
          A: "Há diferenciação clara entre ciclistas e pedestres, com separação por pavimentos distintos.",
          B: "Há separação entre os espaços em um mesmo pavimento, com sinalização horizontal vermelha, marcas e pictogramas.",
          C: "Há apenas linha horizontal ao longo do trecho ou apenas pictogramas orientando a circulação.",
          D: "Não há delimitação nem diferenciação entre o espaço de ciclistas e o de pedestres.",
        });
      }

      return buildScale({
        A: "A combinação entre proteção física e afastamento lateral resulta em separação clara e confortável.",
        B: "A combinação entre proteção e afastamento lateral é boa, mas há alguma limitação em um dos componentes.",
        C: "Há delimitação presente, mas a combinação de proteção e afastamento lateral é apenas parcial.",
        D: "A proteção é insuficiente, inexistente ou o afastamento lateral é inadequado.",
      });
    case "B4":
      if (typology === "ciclorrota") {
        return buildScale({
          A: "Há 2 ou mais pictogramas por quadra e eles aparecem em todas as quadras do trecho.",
          B: "Há pelo menos 1 pictograma por quadra e eles aparecem em todas as quadras do trecho.",
          C: "Há pelo menos 1 pictograma por quadra, mas eles não cobrem todas as quadras do trecho.",
          D: "Não há pictogramas suficientes ou eles não identificam adequadamente o trecho.",
        });
      }

      return buildScale({
        A: "Placas de regulamentação e identificação visual do espaço cicloviário formam uma combinação alta e legível.",
        B: "A combinação entre regulamentação e identificação visual é boa, com pequenas limitações.",
        C: "Há identificação parcial ou regulamentação insuficiente, mas ainda existe alguma legibilidade do espaço cicloviário.",
        D: "A regulamentação e/ou a identificação visual são insuficientes para reconhecer o espaço cicloviário.",
      });
    case "B5":
      return buildScale({
        A: "Há, em média, 2 ou mais travessias sinalizadas por quadra.",
        B: "Há, em média, pelo menos 1 travessia sinalizada por quadra.",
        C: "Há travessias sinalizadas, mas em média menos de 1 por quadra.",
        D: "Não há travessias sinalizadas ao longo do trecho.",
      });
    case "B6":
      return buildScale({
        A: "As medidas de moderação existem e estão distribuídas no espaçamento recomendado pelo manual.",
        B: "As medidas existem e permanecem dentro do espaçamento máximo admitido pelo manual.",
        C: "As medidas existem, mas estão mais espaçadas do que o limite máximo recomendado.",
        D: "Não há medidas de moderação de velocidade ao longo do trecho.",
      });
    case "B7":
      return buildScale({
        A: "Não há situações de risco registradas ao longo do trecho.",
        B: "Há 1 situação de risco registrada ao longo do trecho.",
        C: "Há 2 situações de risco registradas ao longo do trecho.",
        D: "Há 3 ou mais situações de risco registradas ao longo do trecho.",
      });
    case "C1":
      return buildScale({
        A: "A interseção apresenta pavimento vermelho na largura da infraestrutura e linhas tracejadas brancas.",
        B: "Há pavimento vermelho estreito ou pavimento vermelho sem linhas tracejadas.",
        C: "Há apenas linhas tracejadas ou apenas pictogramas.",
        D: "Não há sinalização horizontal cicloviária na interseção.",
      });
    case "C2":
      return buildScale({
        A: "A conexão é visível e tem acessibilidade física, com rampa pedalável quando há desnível.",
        B: {
          description: "Não utilizada neste critério. Situações intermediárias são tratadas como inadequadas no cálculo final.",
          unavailable: true,
        },
        C: {
          description: "Não utilizada neste critério. Situações intermediárias são tratadas como inadequadas no cálculo final.",
          unavailable: true,
        },
        D: "A conexão não é visível, não existe ou depende de escadas ou transposição ruim.",
      });
    case "C3":
      if (typology === "ciclorrota") {
        return buildScale({
          A: "Há até 1 faixa por sentido e a faixa mista tem largura de até 2,7 m.",
          B: "Há até 1 faixa por sentido, mas a faixa mista tem largura acima de 2,7 m.",
          C: "Há mais de 1 faixa por sentido, mas existe medida de moderação de tráfego na interseção.",
          D: "Há mais de 1 faixa por sentido sem moderação, ou a condição de conflito permanece desfavorável.",
        });
      }

      return buildScale({
        A: "Não há conversão veicular sobre a infraestrutura cicloviária, ou há estágio semafórico exclusivo para ciclistas.",
        B: flow === "unidirectional"
          ? "Há conversão veicular, com medidas físicas de proteção dos ciclistas na esquina."
          : "Não utilizada para esta configuração. No fluxo bidirecional, o manual não prevê nota B neste critério.",
        C: "Há estágio semafórico de pedestres que permite circulação conjunta, ou há medidas de acalmamento não orientadas especificamente à travessia cicloviária.",
        D: "Há conversão veicular ou cruzamento sem medidas adequadas de proteção ou semáforo exclusivo para ciclistas.",
      });
    case "D1":
      return buildScale({
        A: "Há postes peatonais ou exclusivos da infraestrutura, próximos e direcionados ao trecho, com espaçamento máximo de 30 m.",
        B: "Há postes ao lado da infraestrutura, direcionados à via, com espaçamento entre 30 m e 50 m.",
        C: "Há postes distantes da infraestrutura, espaçados demais ou com barreiras que prejudicam a iluminação direta.",
        D: "Não há postes de iluminação no trecho analisado.",
      });
    case "D2":
      return buildScale({
        A: "Há sombreamento em praticamente toda a extensão.",
        B: "Há sombra em mais da metade da extensão, ou arborização de baixo porte em quase todo o trecho.",
        C: "Há sombra em menos da metade da extensão.",
        D: "Não há ou praticamente não há sombra.",
      });
    case "D3":
      return buildScale({
        A: "Mobiliário cicloviário está presente em mais de 40% das quadras.",
        B: "Mobiliário cicloviário está presente entre 25% e 40% das quadras.",
        C: "Mobiliário cicloviário está presente entre 10% e menos de 25% das quadras.",
        D: "Mobiliário cicloviário está presente em menos de 10% das quadras.",
      });
    case "E1":
      return buildScale({
        A: "A sinalização horizontal está em bom estado em todas as interseções avaliadas.",
        B: "A sinalização horizontal está em bom estado em mais da metade das interseções avaliadas.",
        C: "Há sinalização com danos em pelo menos parte das interseções avaliadas.",
        D: "Não há sinalização horizontal nas interseções avaliadas.",
      });
    case "E2":
      return buildScale({
        A: "Piso nivelado, sem ondulações.",
        B: "Piso com leve desnivelamento, sem exigir frenagem do ciclista.",
        C: "Piso com desnível transversal ou buraco raso, ou desgaste até a metade da largura útil.",
        D: "Piso com degraus, buracos profundos ou desgaste superior à metade da largura útil.",
      });
    case "E3":
      return buildScale({
        A: "Os dispositivos de separação e a faixa de afastamento lateral estão bem conservados.",
        B: "Os dois elementos estão conservados, com desgastes pontuais.",
        C: "Há conservação parcial ou danos relevantes em um dos elementos de delimitação.",
        D: "Os elementos de delimitação estão ausentes ou muito degradados.",
      });
    case "E4":
      if (typology === "ciclorrota") {
        return buildScale({
          A: "Os pictogramas estão visíveis em toda a extensão.",
          B: {
            description: "Não utilizada neste critério. Em E.4.3, a avaliação das inscrições no pavimento não utiliza nota B.",
            unavailable: true,
          },
          C: "Os pictogramas estão desgastados em toda a extensão.",
          D: "Os pictogramas estão praticamente apagados ou não existem.",
        });
      }

      return buildScale({
        A: "A identificação visual do espaço cicloviário e a sinalização vertical estão bem conservadas.",
        B: "Os elementos de identificação estão conservados, com perdas pontuais.",
        C: "A conservação é parcial ou há danos relevantes em um dos elementos.",
        D: "A identificação visual e/ou a sinalização vertical estão praticamente apagadas ou ausentes.",
      });
    default:
      return buildScale({
        A: "Descrição não disponível para esta nota.",
        B: "Descrição não disponível para esta nota.",
        C: "Descrição não disponível para esta nota.",
        D: "Descrição não disponível para esta nota.",
      });
  }
};
