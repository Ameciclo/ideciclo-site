# Plano do Formulário de Avaliação de Estrutura Cicloviária

## Objetivo
Construir um formulário do IDECICLO que:

- siga a lógica do manual 2025 colocado na raiz do repositório;
- funcione bem em celular;
- seja utilizável em campo, inclusive com conectividade instável;
- permita preencher por parâmetro mensurável ou informar diretamente o conceito final;
- respeite o fluxo de trabalho real do projeto:
  - uma pessoa com mais poder refina e libera estruturas;
  - apenas estruturas liberadas ficam aptas para avaliação;
  - a avaliação pode ser feita em campo ou digitada depois.

## Diagnóstico do repositório

### O que existe hoje
- `src/pages/IdecicloForm.tsx`: formulário simplificado, praticamente só em A-D, sem aderência suficiente ao manual.
- `src/pages/SegmentForm.tsx` + `src/pages/Page1.tsx` ... `Page8.tsx`: formulário mais promissor, já com vários parâmetros do manual.
- `form.json`: pesos e pontuações por tipologia. Ele já está muito próximo da tabela do manual.
- `src/utils/idecicloCalculator.ts`: cálculo de ranking ainda simplificado e parcialmente desconectado da lógica completa do manual.

### Problemas encontrados
- Há dois formulários concorrentes no projeto.
- O formulário simplificado ignora a maior parte da lógica condicional do manual.
- O formulário detalhado já coleta vários parâmetros, mas ainda não fecha o ciclo:
  - não resolve todos os conceitos automaticamente;
  - não oferece override manual por critério;
  - não tem uma página de revisão dos conceitos;
  - não tem estratégia boa para uso offline;
  - havia inconsistências de rotulagem entre B/E e C/E em algumas páginas.
- O site não tinha uma estratégia clara de cache offline do shell da aplicação.

## Leitura do manual e consequências de produto

### Regras centrais confirmadas no manual
- `A1` elimina a avaliação quando recebe `D`.
- `A2` depende de percentual de conectividade em interseções com vias arteriais/coletoras.
- `B1` depende de tipologia exclusiva e do fluxo unidirecional/bidirecional.
- `B3` é composto:
  - `B3.1` proteção/separação;
  - `B3.2` afastamento lateral;
  - resultado final por matriz.
- `B4` também é composto:
  - sinalização vertical;
  - identificação em vermelho ou pictogramas, conforme tipologia;
  - resultado final por matriz.
- `B5` depende da combinação entre número de faixas e travessias.
- `B6` só se aplica a ciclorrotas.
- `B7` é redutor da seção `B`.
- `C1`, `C2` e `C3` devem considerar interseções/conexões; em `C1` e `C3`, o manual trabalha com mediana dos conceitos observados.
- `D1` e `D3` dependem de cobertura do trecho, não só da existência do elemento.
- `E3` é composto por matriz.

### Regras que pedem formulário híbrido
O manual mistura:

- critérios objetivos e calculáveis:
  - largura;
  - número de placas;
  - número de travessias;
  - distância entre medidas moderadoras;
  - cobertura de mobiliário;
  - velocidade e hierarquia.
- critérios de inspeção qualitativa:
  - conservação;
  - leitura visual da identificação;
  - presença de obstáculos;
  - tratamento de conflitos.

Conclusão:

- o melhor desenho é por critério, com dois modos:
  - `Automático`: o avaliador informa parâmetros;
  - `Manual`: o avaliador informa diretamente `A`, `B`, `C` ou `D`.

## Arquitetura funcional recomendada

### 1. Pré-campo e governança
- Responsável técnico baixa/refina os dados da cidade.
- Cada trecho recebe:
  - tipologia;
  - hierarquia;
  - extensão;
  - status de liberação para avaliação.
- Só trechos liberados aparecem para quem avalia.

### 2. Avaliação de campo
- O avaliador abre o trecho no celular.
- O formulário já vem pré-preenchido com:
  - nome do trecho;
  - cidade;
  - hierarquia;
  - extensão;
  - tipologia.
- O avaliador preenche os parâmetros observáveis.
- Na revisão final, pode:
  - aceitar o conceito calculado;
  - trocar o item para modo manual;
  - informar o conceito diretamente.

### 3. Pós-campo
- Se estiver online, envia para Supabase.
- Se estiver offline:
  - salva rascunho local;
  - guarda submissão pendente no aparelho;
  - permite reabrir e enviar depois.

## Implementação feita nesta rodada

### Código
- `src/pages/IdecicloForm.tsx`
  - passou a apontar para o formulário detalhado, eliminando a duplicação conceitual.
- `src/pages/SegmentForm.tsx`
  - agora é o formulário principal;
  - ganhou autosave local;
  - ganhou leitura de rascunho local;
  - ganhou estado online/offline;
  - ganhou submissão tolerante a offline;
  - passou a enriquecer o payload com conceito por critério e nota total.
- `src/pages/Page1.tsx`
  - adicionados campos de conectividade relevantes para `A2`.
- `src/pages/Page2.tsx`
  - adicionado fluxo de pedestres para calçada partilhada.
- `src/pages/Page5.tsx`
  - refinado o bloco de afastamento lateral.
- `src/pages/Page6.tsx`
  - sinalização vertical ajustada;
  - suporte a cobertura dos pictogramas.
- `src/pages/Page7.tsx`
  - correções de nomenclatura;
  - `C2` ajustado para a lógica do manual;
  - complemento de `C3` para ciclorrotas.
- `src/pages/Page8.tsx`
  - iluminação com ausência de postes;
  - cobertura de mobiliário por quadras.
- `src/pages/Page9.tsx`
  - revisão final dos conceitos;
  - alternância entre modo automático e manual por critério;
  - exibição da nota calculada.
- `src/utils/idecicloAssessment.ts`
  - nova central de regras do manual;
  - cálculo de conceitos automáticos;
  - resolução de override manual;
  - cálculo da pontuação final por tipologia usando `form.json`.

### Offline
- `public/sw.js`
  - cache da shell da aplicação;
  - fallback para navegação offline.
- `public/manifest.webmanifest`
  - base para experiência instalável em celular.
- `src/main.tsx`
  - registro do service worker.

## Ambiguidades do manual que precisam de decisão de produto

### 1. `E4` tem ambiguidade real
A diagramação/texto extraído do manual não deixa totalmente claro qual composição final deve ser usada entre:

- conservação da identificação em vermelho;
- conservação das inscrições no pavimento;
- conservação da sinalização vertical.

Decisão aplicada nesta rodada:

- para ciclovias, ciclofaixas e calçadas partilhadas, assumi composição entre:
  - conservação da identificação do espaço;
  - conservação da sinalização vertical.
- para ciclorrotas, usei o pior conceito entre:
  - conservação dos pictogramas;
  - conservação das placas.

Isso precisa ser validado com quem define a metodologia.

### 2. `B7` em ciclorrota tem inconsistência textual
Na tabela aparece progressão `0 / -12 / -24 / -36`, mas a observação de rodapé cita desconto unitário de `10`.

Decisão aplicada:

- prevaleceu a tabela, porque ela está consistente com a estrutura de pontuação.

### 3. `D3` pode ser lido como cobertura do trecho ou da malha
O texto menciona total apurado em todos os trechos analisados da malha.

Decisão aplicada nesta rodada:

- no formulário do trecho, o cálculo considera a cobertura dentro do próprio trecho;
- para um índice agregado de cidade, vale discutir se `D3` deve migrar para uma camada de consolidação urbana.

### 4. `C1` e `C3` ainda podem evoluir
O manual recomenda mediana dos conceitos de todas as interseções.

Nesta rodada:

- o formulário aceita um conceito consolidado por trecho;
- o próximo passo ideal é coletar uma lista de interseções avaliadas para calcular a mediana automaticamente.

## Próximos passos recomendados

### Fase 1
- Validar com a equipe IDECICLO as ambiguidades de `E4`, `B7` e `D3`.
- Definir se `C1` e `C3` vão operar:
  - por conceito consolidado do trecho;
  - por lista de interseções.

### Fase 2
- Introduzir status explícito de trecho:
  - `rascunho`;
  - `refinado`;
  - `liberado para avaliar`;
  - `avaliado`;
  - `pendente de sincronização`.
- Criar tela administrativa para liberar trechos.

### Fase 3
- Sincronização automática das submissões pendentes quando a conexão voltar.
- Exportação local em JSON/PDF para campo.
- Melhorar `ViewEvaluation` para ler o novo modelo híbrido.

## Conclusão
O melhor caminho não é manter um formulário “só nota” e outro “só parâmetro”. O produto certo para o IDECICLO é um formulário híbrido, orientado pelo manual, com cálculo automático quando houver regra objetiva e override manual quando o julgamento técnico for mais importante que a parametrização.
