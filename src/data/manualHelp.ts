export interface ManualHelpEntry {
  title: string;
  description: string;
  pages: number[];
  imagePaths: string[];
}

const imagesForPages = (pages: number[]) =>
  pages.map((page) => `/manual-pages/ideciclo-manual-${page}.png`);

const entry = (title: string, description: string, pages: number[]): ManualHelpEntry => ({
  title,
  description,
  pages,
  imagePaths: imagesForPages(pages),
});

export const MANUAL_HELP_MAP: Record<string, ManualHelpEntry> = {
  A1: entry(
    "A.1 Adequação da tipologia de tratamento",
    "Páginas metodológicas do manual que descrevem a adequação da tipologia em relação à velocidade e à hierarquia viária.",
    [18]
  ),
  A2: entry(
    "A.2 Conectividade da rede cicloviária",
    "Páginas do manual com a explicação do cálculo de conectividade e do método de apuração em interseções conectadas.",
    [19]
  ),
  b11: entry(
    "B.1 Espaço útil da infraestrutura cicloviária",
    "Trecho do manual que explica o conceito de espaço útil, largura da estrutura e forma de medição em campo.",
    [21]
  ),
  B1: entry(
    "B.1 Espaço útil da infraestrutura cicloviária",
    "Trecho do manual que explica o conceito de espaço útil, largura da estrutura e forma de medição em campo.",
    [21]
  ),
  b12: entry(
    "B.6 Medidas de moderação de velocidade",
    "Páginas do manual que definem as medidas moderadoras e os critérios de avaliação para ciclorrotas.",
    [32, 33]
  ),
  B6: entry(
    "B.6 Medidas de moderação de velocidade",
    "Páginas do manual que definem as medidas moderadoras e os critérios de avaliação para ciclorrotas.",
    [32, 33]
  ),
  b2: entry(
    "B.2 Tipo de pavimento",
    "Página metodológica do manual que descreve os tipos de pavimento e seus critérios de avaliação.",
    [22]
  ),
  B2: entry(
    "B.2 Tipo de pavimento",
    "Página metodológica do manual que descreve os tipos de pavimento e seus critérios de avaliação.",
    [22]
  ),
  B3: entry(
    "B.3 Delimitação da infraestrutura cicloviária",
    "Conjunto de páginas do manual com a composição do indicador, tabela de critérios e imagens de referência.",
    [23, 24, 25, 26]
  ),
  b31: entry(
    "B.3.1 Elementos de separação ou segregação",
    "Páginas do manual que descrevem o nível de proteção, os critérios por tipologia e as imagens de referência.",
    [23, 24, 25]
  ),
  b32: entry(
    "B.3.2 Afastamento lateral do fluxo veicular",
    "Página do manual dedicada à faixa de amortecimento lateral e aos parâmetros por velocidade da via.",
    [26]
  ),
  B4: entry(
    "B.4 Identificação do espaço cicloviário",
    "Conjunto de páginas metodológicas do manual para sinalização vertical, identificação em vermelho e inscrições no pavimento.",
    [27, 28, 29, 30]
  ),
  b41: entry(
    "B.4.1 Sinalização vertical ao longo do trecho",
    "Páginas do manual que descrevem as placas de regulamentação, o método de apuração e os critérios por tipologia.",
    [28, 29]
  ),
  b42: entry(
    "B.4.2 Identificação do espaço de circulação de bicicletas",
    "Página do manual que descreve a identificação em vermelho e os critérios de avaliação desse item.",
    [29]
  ),
  b43: entry(
    "B.4.3 Aplicação de inscrições no pavimento",
    "Página do manual com a explicação dos pictogramas em ciclorrotas e dos critérios de avaliação.",
    [30]
  ),
  b44: entry(
    "B.4.4 Sinalização vertical de regulamentação",
    "Páginas do manual que descrevem as placas de regulamentação e o método de apuração em ciclorrotas.",
    [28, 29]
  ),
  B5: entry(
    "B.5 Acessibilidade relativa ao uso do solo lindeiro",
    "Páginas do manual que explicam a avaliação de travessias e acessibilidade entre a infraestrutura e os usos do entorno.",
    [31, 32]
  ),
  b5: entry(
    "B.5 Acessibilidade relativa ao uso do solo lindeiro",
    "Páginas do manual que explicam a avaliação de travessias e acessibilidade entre a infraestrutura e os usos do entorno.",
    [31, 32]
  ),
  B7: entry(
    "B.7 Existência de situações de risco",
    "Páginas do manual com a descrição do indicador de risco e dos tipos de ocorrência avaliados em campo.",
    [34, 35, 36]
  ),
  b7: entry(
    "B.7 Existência de situações de risco",
    "Páginas do manual com a descrição do indicador de risco e dos tipos de ocorrência avaliados em campo.",
    [34, 35, 36]
  ),
  C1: entry(
    "C.1 Sinalização horizontal cicloviária nas interseções",
    "Página metodológica do manual para a sinalização nas interseções e seu método de apuração.",
    [38]
  ),
  c1e1: entry(
    "C.1 / E.1 Interseções cicloviárias",
    "Páginas do manual para a avaliação da sinalização horizontal nas interseções e do seu estado de conservação.",
    [38, 47]
  ),
  C2: entry(
    "C.2 Acessibilidade entre conexões cicloviárias",
    "Página do manual que explica a conexão visual e física entre infraestruturas cicloviárias.",
    [39]
  ),
  C3: entry(
    "C.3 Tratamento dos conflitos com modos motorizados",
    "Páginas metodológicas do manual com os elementos de análise e a tabela de critérios nas interseções.",
    [40, 41]
  ),
  D1: entry(
    "D.1 Iluminação da infraestrutura cicloviária",
    "Página do manual com o método de apuração da iluminação pública e seus critérios de posicionamento.",
    [43]
  ),
  D2: entry(
    "D.2 Conforto térmico",
    "Página do manual que descreve os critérios de sombreamento e conforto térmico na infraestrutura.",
    [44]
  ),
  D3: entry(
    "D.3 Existência de mobiliário cicloviário",
    "Página do manual com a definição dos mobiliários considerados e os critérios de avaliação.",
    [45]
  ),
  E1: entry(
    "E.1 Estado de conservação da sinalização horizontal nas interseções",
    "Página do manual dedicada à conservação da sinalização horizontal nas interseções.",
    [47]
  ),
  E2: entry(
    "E.2 Estado de conservação do pavimento",
    "Página metodológica do manual que descreve a conservação predominante do pavimento ao longo do trecho.",
    [48]
  ),
  E3: entry(
    "E.3 Estado de conservação dos elementos de delimitação",
    "Páginas do manual com a composição do indicador de manutenção da delimitação e da faixa de afastamento lateral.",
    [49, 50]
  ),
  e31: entry(
    "E.3.1 Estado de conservação dos elementos de separação e segregação",
    "Página do manual com a manutenção dos dispositivos de separação e segregação.",
    [49]
  ),
  e32: entry(
    "E.3.2 Estado de conservação da faixa de afastamento lateral",
    "Página metodológica do manual dedicada à conservação da faixa de amortecimento lateral.",
    [50]
  ),
  E4: entry(
    "E.4 Estado de conservação da identificação do espaço cicloviário",
    "Páginas do manual com a composição do indicador de manutenção da identificação, pictogramas e sinalização vertical.",
    [51, 52]
  ),
  e41: entry(
    "E.4.1 Estado de conservação da identificação do espaço de circulação",
    "Página do manual dedicada à manutenção da identificação em vermelho do espaço cicloviário.",
    [51]
  ),
  e42: entry(
    "E.4.2 Estado de conservação da sinalização vertical",
    "Página do manual com os critérios de conservação das placas de regulamentação.",
    [52]
  ),
  e43: entry(
    "E.4.3 Estado de conservação das inscrições no pavimento",
    "Página do manual com os critérios de conservação dos pictogramas em ciclorrotas.",
    [52]
  ),
};
