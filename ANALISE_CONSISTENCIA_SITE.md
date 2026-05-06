# Análise de Consistência do Site IDECICLO

Data da análise: 2026-04-26  
Escopo: rotas públicas, fluxo de avaliação, formulário IDECICLO, ranking, páginas institucionais e consistência do sistema como produto.

## Resumo executivo

O site já tem uma base funcional forte para o fluxo principal de trabalho, mas hoje convive com camadas paralelas de implementação, regras de cálculo duplicadas e alguns blocos órfãos. A principal conclusão é que a plataforma ainda não se comporta de forma plenamente consistente como um sistema único de ponta a ponta.

Os pontos mais críticos são:

1. O formulário usa uma lógica de pontuação mais nova e detalhada, em escala `0-100`, mas o ranking recalcula o índice por uma lógica antiga e simplificada, em escala `0-1`.
2. O salvamento da avaliação marca o segmento como avaliado, mas não encontrei atualização do `ideciclo` nem da `extensao_avaliada` da cidade após o envio do formulário.
3. O projeto mantém fluxos paralelos para a mesma jornada: `/processo-avaliacao`, `/avaliacao/refinar-dados`, `/avaliacao/baixar-dados` e `/refinar`.
4. O passo 5 solicitado no enunciado, “criar um ranking de infraestruturas comparadas em diferentes tipologias”, não está implementado como funcionalidade própria. O ranking atual é de cidades, não de infraestruturas/tipologias.
5. Há sinais claros de bloco faltante ou removido pela metade no formulário: `Page1.tsx` existe, mas `SegmentForm.tsx` usa apenas `Page2` a `Page9`.

## Inventário de rotas e estado atual

| Rota | Arquivo | Papel | Situação |
| --- | --- | --- | --- |
| `/` | `src/pages/Index.tsx` | Página inicial | Consistente |
| `/avaliacao` | `src/pages/Avaliacao.tsx` | Hub de etapas | Consistente, mas simplifica demais o fluxo |
| `/avaliacao/baixar-dados` | `src/pages/avaliacao/BaixarDados.tsx` | Fluxo antigo/separado de download | Redundante |
| `/avaliacao/refinar-dados` | `src/pages/avaliacao/RefinarDados.tsx` | Fluxo principal atual de seleção + download + refinamento | Principal |
| `/avaliacao/escolher-estrutura` | `src/pages/avaliacao/EscolherEstrutura.tsx` | Seleção do trecho | Consistente |
| `/avaliacao/avaliar-estrutura` | `src/pages/avaliacao/AvaliarEstrutura.tsx` | Wrapper do formulário | Consistente |
| `/avaliacao/formulario-ideciclo/:segmentId` | `src/pages/IdecicloForm.tsx` | Alias do formulário | Duplicada com outra rota |
| `/avaliacao/resultados` | `src/pages/avaliacao/Resultados.tsx` | Resultado da cidade | Parcial/inconsistente com persistência |
| `/ranking` | `src/pages/Ranking.tsx` | Ranking nacional | Inconsistente com o cálculo do formulário |
| `/city-details/:cityId` | `src/pages/CityDetails.tsx` | Detalhe da cidade no ranking | Parcial/inconsistente |
| `/processo-avaliacao` | `src/pages/ProcessoAvaliacao.tsx` | Fluxo guiado alternativo | Paralelo ao fluxo principal |
| `/refinar` | `src/pages/Refine.tsx` | Fluxo antigo de refinamento | Paralelo ao fluxo principal |
| `/refinar/formulario/:segmentId` | `src/pages/SegmentForm.tsx` | Formulário principal | Principal |
| `/view-evaluation/:formId` | `src/pages/ViewEvaluation.tsx` | Visualização da avaliação | Incompleta |
| `/edit-evaluation/:segmentId/:formId` | `src/pages/SegmentForm.tsx` | Edição do formulário | Consistente |
| `/sobre` | `src/pages/About.tsx` | Página institucional | Existe, mas está escondida do menu |
| `/apoiadores` | `src/pages/Apoiadores.tsx` | Página institucional | Existe, mas está escondida do menu |
| `*` | `src/pages/NotFound.tsx` | 404 | Inconsistente com o idioma do site |

## Análise do sistema nas 6 etapas solicitadas

| Etapa esperada | Implementação atual | Diagnóstico |
| --- | --- | --- |
| `1) seleciona uma cidade` | Implementado em `RefinarDados.tsx`, `BaixarDados.tsx`, `EtapaBaixarDados.tsx`, `Refine.tsx` e `CitySelection.tsx` | Implementado, mas duplicado em excesso |
| `2) refina os dados` | Implementado principalmente em `src/pages/avaliacao/RefinarDados.tsx` | Implementado |
| `3) escolhe uma estrutura` | Implementado em `src/pages/avaliacao/EscolherEstrutura.tsx` + `EtapaEscolherEstrutura.tsx` | Implementado |
| `4) avalia a estrutura` | Implementado em `src/pages/SegmentForm.tsx` | Implementado e robusto |
| `5) cria um ranking de infraestruturas comparadas em diferentes tipologias` | Não há uma tela dedicada a isso | Ausente |
| `6) calcula o ideciclo da cidade` | Há telas de resultado e ranking, mas a persistência/cálculo da cidade não fecha o ciclo de forma confiável | Parcial |

Conclusão do fluxo sistêmico: as etapas `1`, `2`, `3` e `4` existem. A etapa `5` não existe no formato solicitado. A etapa `6` existe na interface, mas não está devidamente conectada ao salvamento real da avaliação.

## Achados críticos

### 1. O ranking usa uma régua diferente da usada no formulário

Evidências:

- `src/pages/SegmentForm.tsx:1513-1520` salva `score_breakdown`, `criterion_ratings`, `auto_ratings` e `total_score`.
- `src/pages/SegmentForm.tsx:1641` exibe a nota atual como `.../100`.
- `src/utils/idecicloAssessment.ts:868-958` calcula a nota total por seções e itens da metodologia nova.
- `src/pages/Ranking.tsx:70-77` recalcula o IDECICLO por `calculateIdeciclo(...)`.
- `src/utils/idecicloCalculator.ts:18-33` usa uma lista fixa de 13 critérios antigos.
- `src/utils/idecicloCalculator.ts:178-223` calcula um índice entre `0.0` e `1.0`.

Impacto:

- A nota mostrada durante a avaliação não é a mesma lógica do ranking.
- O usuário pode salvar um formulário com uma nota e depois ver a cidade classificada por outro modelo.
- O sistema perde coerência metodológica.

### 2. O envio da avaliação não fecha o cálculo da cidade

Evidências:

- `src/pages/SegmentForm.tsx:1491-1581` salva o formulário e, quando cria um novo, chama apenas `updateSegmentEvaluationStatus(...)`.
- `src/services/database.ts:1184-1201` marca somente `evaluated: true` e `id_form`.
- `src/components/processo/EtapaResultados.tsx:25-31` lê a cidade e os segmentos do banco para montar os resultados.
- `src/components/processo/EtapaResultados.tsx:66-69` assume que `cityStats.ideciclo` e `cityStats.extensao_avaliada` já existem corretamente na cidade.

Impacto:

- A avaliação do trecho é persistida, mas não há evidência de recálculo/persistência do índice da cidade no mesmo fluxo.
- A tela de resultados pode exibir `0`, dado antigo ou valor incompleto.

### 3. Há inconsistência de ID de segmento entre fluxos

Evidências:

- `src/services/api.ts:806-813` cria segmentos com `id` sem prefixo da cidade.
- `src/services/database.ts:577-592` grava os segmentos no banco prefixando `id` com `cityId`.
- `src/services/database.ts:315-323` remove o prefixo ao buscar por `fetchSegmentsFromDB(...)`.
- `src/services/database.ts:1297-1309` `fetchSegmentsByCity(...)` devolve os dados crus, sem normalização.
- `src/pages/Ranking.tsx:71-75` cruza `forms` com `segments` vindos de `fetchSegmentsFromDB(...)`.

Impacto:

- Dependendo do caminho da leitura, o mesmo segmento pode aparecer com dois formatos de ID.
- Isso pode quebrar o casamento entre formulário e segmento no ranking.
- Também aumenta o risco de bugs em edição, visualização e status de avaliação.

### 4. O passo 5 pedido não existe: o ranking atual é de cidades, não de infraestruturas por tipologia

Evidências:

- `src/pages/Ranking.tsx` monta `CityRanking`.
- `src/pages/CityDetails.tsx` detalha cidade e lista segmentos, mas não gera ranking por tipologia.

Impacto:

- O sistema não entrega a parte “compara infraestruturas em diferentes tipologias”.
- O que existe hoje é um ranking de cidades avaliadas.

### 5. Há um bloco órfão no formulário (`Page1`)

Evidências:

- `src/pages/Page1.tsx:12-28` define um bloco específico para contagens e originais.
- `src/pages/SegmentForm.tsx:14-21` importa apenas `Page2` a `Page9`.
- `src/pages/SegmentForm.tsx:747-756` ainda mantém `originalSegmentCounts`.
- `src/pages/SegmentForm.tsx:1172-1248` já manipula contagem de quadras/interseções diretamente dentro do próprio formulário.

Diagnóstico:

- O conteúdo funcional de `Page1` foi absorvido parcialmente para dentro de `SegmentForm`.
- A limpeza da arquitetura não foi concluída.

Impacto:

- Sinal forte de refatoração incompleta.
- Aumenta o custo de manutenção e a chance de comportamento divergente.

## Fluxos paralelos e inconsistência arquitetural

### Fluxo principal atual

- `/avaliacao`
- `/avaliacao/refinar-dados`
- `/avaliacao/escolher-estrutura`
- `/avaliacao/avaliar-estrutura`
- `/avaliacao/resultados`

### Fluxos paralelos ainda ativos

- `/processo-avaliacao`
- `/avaliacao/baixar-dados`
- `/refinar`
- `/avaliacao/formulario-ideciclo/:segmentId`

Evidências:

- `src/App.tsx:41-58` mantém todas essas rotas.
- `src/pages/Avaliacao.tsx:9-42` apresenta um fluxo de 4 etapas.
- `src/pages/ProcessoAvaliacao.tsx:34-59` apresenta outro fluxo, de 5 etapas.
- `src/components/processo/EtapaRefinarDados.tsx:24-32` ainda empurra o usuário para `/refinar`.

Diagnóstico:

- O produto não tem uma única “fonte da verdade” para a jornada.
- O usuário pode entrar em diferentes fluxos que fazem quase a mesma coisa com estados diferentes.

## Persistência e estado

Hoje o projeto usa quatro camadas de persistência/estado para a mesma jornada:

- Banco de dados/Supabase
- `sessionStorage` para `selectedSegmentId` e `selectedCityId`
- `localStorage` para rascunhos do formulário e para o `processo-avaliacao-state`
- utilitário híbrido `persistedCityData` que grava em `sessionStorage` e `localStorage`

Evidências:

- `src/utils/persistedCityData.ts:3-37`
- `src/hooks/use-processo-avaliacao.ts:20-38`
- `src/components/processo/EtapaEscolherEstrutura.tsx:209-222`
- `src/pages/SegmentForm.tsx:72-79`

Diagnóstico:

- Há redundância e risco de estado desencontrado.
- O sistema parece ter sido migrado gradualmente de local para banco, sem consolidação final.

## Análise por página

### `Index.tsx`

- Boa como porta de entrada.
- Explica o sistema de forma coerente.
- Direciona para `/avaliacao/refinar-dados` e `/avaliacao`.
- Não expõe a existência do fluxo guiado `/processo-avaliacao`, o que reforça que esse fluxo virou secundário.

### `Avaliacao.tsx`

- Organiza bem a jornada, mas resume o sistema a 4 etapas.
- `src/pages/Avaliacao.tsx:91-99` usa `<a href>` para navegação interna, enquanto o resto do app frequentemente usa `Link`/`navigate`.
- Não contempla o passo 5 solicitado como ranking por infraestrutura/tipologia.

### `avaliacao/BaixarDados.tsx`

- Funcional, mas hoje é redundante com a entrada unificada de `avaliacao/RefinarDados.tsx`.
- A primeira etapa de `Avaliacao.tsx` já aponta para `/avaliacao/refinar-dados`, não para `/avaliacao/baixar-dados`.
- Indício de página mantida por compatibilidade, não por necessidade do fluxo principal.

### `avaliacao/RefinarDados.tsx`

- É hoje a página mais consistente para a etapa 1 + 2.
- Une seleção de cidade, verificação de cidade existente, download/atualização e refinamento.
- É a melhor candidata para virar a única etapa oficial de preparação da cidade.

### `Refine.tsx`

- Mantém lógica muito parecida com `avaliacao/RefinarDados.tsx`.
- Tem muitos logs e comentários de transição do tipo “No need to update localStorage anymore”.
- É um fluxo legado ainda ativo por rota.

### `avaliacao/EscolherEstrutura.tsx` + `EtapaEscolherEstrutura.tsx`

- Boa etapa de seleção.
- Filtros, resumo e preview no mapa ajudam bastante.
- Depende de `fetchSegmentsByCity(...)`, que devolve dados sem normalização de IDs.

### `SegmentForm.tsx`

- É a parte mais madura do sistema.
- Tem lógica rica de coleta, revisão, filtros por critério, rascunho offline e revisão final.
- O problema não está na robustez da tela, e sim no acoplamento com o restante do sistema.

### `Page1.tsx`

- Está fora do fluxo.
- É o principal candidato a “bloco faltante ou refatoração incompleta”.

### `Page2.tsx` a `Page9.tsx`

- Estão efetivamente em uso.
- Formam o núcleo da avaliação.
- A organização é coerente, mas a coexistência com `Page1` fora do fluxo indica dívida de arquitetura.

### `avaliacao/Resultados.tsx` + `EtapaResultados.tsx`

- A tela é clara visualmente.
- O dado que ela exibe depende de a cidade já estar com `ideciclo` e `extensao_avaliada` corretos no banco.
- Como isso não está garantido pelo envio do formulário, a consistência do resultado fica comprometida.

### `Ranking.tsx`

- É útil como ranking de cidades.
- Não implementa ranking de infraestruturas por tipologia.
- Usa cálculo antigo e, portanto, hoje não é confiável como espelho do formulário.

### `CityDetails.tsx`

- Tem problemas concretos:
- `src/pages/CityDetails.tsx:185` multiplica `city.ideciclo` por `100`, enquanto `Ranking.tsx` mostra o valor diretamente.
- `src/pages/CityDetails.tsx:238-239` fixa “Última avaliação” como `2024`.
- `src/pages/CityDetails.tsx:322-323` tenta mostrar `segment.rating`, mas `Segment` não tem esse campo em `src/types/index.ts`.

### `ViewEvaluation.tsx`

- Está incompleta para a profundidade do formulário atual.
- `src/pages/ViewEvaluation.tsx:100-176` mostra apenas dados gerais e caracterização básica.
- Não mostra breakdown de critérios, nota final, overrides manuais, revisões por seção nem resumo metodológico.

### `About.tsx` e `Apoiadores.tsx`

- As duas páginas existem e têm conteúdo consistente com a identidade do projeto.
- Porém estão escondidas da navegação principal.

### `NotFound.tsx`

- Está em inglês (“Oops! Page not found”), destoando do restante do site em português.

## Outros achados concretos de consistência

### Navegação global esconde páginas existentes

Evidências:

- `src/components/Navbar.tsx:16-20` deixa `processo-avaliacao`, `sobre` e `apoiadores` comentados.

Impacto:

- Há páginas válidas e publicáveis que não fazem parte da navegação oficial.

### O footer provavelmente tem logo quebrado

Evidências:

- `src/components/Footer.tsx:17` usa `"/ideciclo/ideciclo-logo.png"`.
- Na pasta `public`, o logo está como `ideciclo-logo.png` e `ideciclo_logo.png`, sem subpasta `ideciclo/`.

Impacto:

- Imagem pode não carregar.

### `CitySelection.tsx` faz side effect em `useState`

Evidências:

- `src/components/CitySelection.tsx:89-90` chama `useState(() => { loadStates(); })`.

Diagnóstico:

- O correto seria `useEffect`.
- Hoje funciona como anti-pattern e reduz a previsibilidade do componente.

### O fluxo guiado usa uma flag de avaliação que nunca é escrita

Evidências:

- `src/components/processo/EtapaAvaliarEstrutura.tsx:20-25` procura `sessionStorage.getItem(\`evaluation_${segmentId}\`)`.
- Busca textual no projeto não encontrou nenhuma escrita de `evaluation_`.

Impacto:

- Esse fluxo nunca tem um critério confiável para dizer que a avaliação foi concluída.

## Ferramentas e validação técnica

### Build

- `npm run build`: passou.
- Houve warning de chunks grandes.

Saída relevante:

- `dist/assets/index-ihCu1RMx.js` com mais de `1.3 MB`
- `dist/assets/mapbox-gl-CySJ4Vkg.js` com mais de `1.6 MB`
- Vite alertou para code splitting/manual chunks

Leitura:

- O projeto compila, mas já mostra pressão de bundle e performance.

### Lint

- `npm run lint`: falhou com `65 problemas`, sendo `53 errors` e `12 warnings`.

Padrões predominantes:

- uso extensivo de `any`
- `react-hooks/exhaustive-deps`
- alguns problemas de `prefer-const`
- componentes utilitários com avisos de fast refresh
- `tailwind.config.ts` com `require()`

Arquivos mais afetados:

- `src/services/database.ts`
- `src/services/api.ts`
- `src/pages/avaliacao/BaixarDados.tsx`
- `src/components/processo/*`
- `src/utils/idecicloCalculator.ts`
- `src/types/index.ts`

Leitura:

- A consistência de arquitetura está melhor do que a consistência tipada do código.
- A base ainda carrega bastante dívida técnica.

## Priorização recomendada

### Prioridade alta

1. Unificar o cálculo oficial do sistema.
2. Recalcular e persistir `ideciclo` e `extensao_avaliada` da cidade ao salvar/editar avaliação.
3. Escolher um único fluxo oficial e aposentar os paralelos (`/refinar`, `/avaliacao/baixar-dados`, possivelmente `/processo-avaliacao`).
4. Corrigir a normalização de IDs de segmento entre leitura e gravação.
5. Decidir o destino de `Page1.tsx`: reintegrar ou remover.

### Prioridade média

1. Completar `ViewEvaluation.tsx` com breakdown real da avaliação.
2. Corrigir `CityDetails.tsx` para usar a mesma escala do ranking e dados reais de avaliação.
3. Padronizar navegação interna com `Link`/`navigate`.
4. Padronizar persistência para reduzir mistura entre banco, `sessionStorage` e `localStorage`.

### Prioridade baixa

1. Reexpor `Sobre` e `Apoiadores` no menu, se fizer sentido de produto.
2. Corrigir o 404 para português.
3. Corrigir o caminho do logo do footer.
4. Reduzir bundle com code splitting.

## Conclusão

O projeto já oferece um fluxo real de trabalho para baixar dados, refinar, escolher trechos e preencher avaliações. O ponto mais forte hoje é o `SegmentForm`, que está bem mais evoluído do que o restante do sistema.

O problema central não é “falta de páginas”, e sim falta de convergência entre as páginas existentes. O sistema hoje tem:

- mais de um fluxo para a mesma jornada
- mais de uma regra de cálculo para o índice
- mais de uma estratégia de persistência
- pelo menos um bloco órfão (`Page1`)
- uma etapa pedida no enunciado que ainda não existe de fato (ranking de infraestruturas por tipologia)

Se eu resumisse em uma frase: o site já tem quase todas as peças, mas ainda não está operando como um único sistema coerente de ponta a ponta.
