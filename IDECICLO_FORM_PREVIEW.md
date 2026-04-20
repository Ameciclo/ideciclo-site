# Prévia do Novo Formulário de Avaliação

## Ideia central
O formulário passa a funcionar como um assistente de avaliação:

- ele herda os dados do trecho liberado;
- calcula automaticamente o conceito dos itens objetivos;
- permite mudar qualquer item para preenchimento manual;
- mostra a nota total antes do envio.

## Fluxo pensado para celular

### Página 1
Dados gerais e conectividade

- pesquisador;
- data;
- bairro;
- início e fim do trecho;
- número de quadras;
- número de interseções;
- interseções relevantes para `A2`;
- interseções conectadas.

### Página 2
Caracterização da infraestrutura

- tipologia;
- fluxo;
- posição na via;
- fluxo de pedestres por metro, quando for calçada partilhada.

### Página 3
Espaço útil e moderação

- largura útil;
- sarjeta;
- medidas moderadoras;
- distância média entre medidas.

### Página 4
Pavimento e conservação

- tipo de pavimento;
- conservação do pavimento.

### Página 5
Delimitação

- tipo de separação/segregação;
- conservação dos dispositivos;
- tipo de afastamento lateral;
- largura do amortecimento.

### Página 6
Identificação e sinalização

- identificação em vermelho;
- conservação da identificação;
- placas por quadra;
- placas nos dois sentidos;
- pictogramas nas ciclorrotas.

### Página 7
Risco e interseções

- travessias e faixas;
- situações de risco;
- sinalização nas interseções;
- acessibilidade entre conexões;
- conflitos com motorizados;
- complemento de ciclorrota.

### Página 8
Urbanidade

- iluminação;
- sombreamento;
- mobiliário cicloviário;
- número de quadras cobertas por mobiliário.

### Página 9
Revisão final

- conceito automático de cada critério;
- troca para modo manual por item;
- nota por seção;
- nota total do trecho;
- aviso de online/offline;
- botão final de salvar ou guardar offline.

## Comportamento por critério

### Modo automático
O avaliador informa parâmetros. O sistema devolve o conceito.

Exemplo:

- tipologia: `ciclofaixa`
- fluxo: `bidirecional`
- largura útil: `3,0 m`

Resultado:

- `B1 = A`

### Modo manual
O avaliador ignora o cálculo daquele item e informa diretamente:

- `A`
- `B`
- `C`
- `D`

Isso é importante para:

- casos excepcionais;
- leituras de campo difíceis;
- critérios onde a equipe prefira consolidar o julgamento técnico.

## O que já ficou implementado nesta primeira versão

- formulário detalhado como formulário principal;
- autosave local por trecho;
- leitura de rascunho local;
- página de revisão com override manual;
- cálculo automático de critérios centrais;
- nota total por tipologia com base no `form.json`;
- registro de service worker para melhorar uso offline.

## O que ainda vale evoluir

- cálculo por mediana real em `C1` e `C3`, interseção por interseção;
- sincronização automática de submissões pendentes;
- visualização posterior adaptada ao novo modelo;
- validação metodológica final das ambiguidades do manual em `E4`.

## Resultado esperado para o uso real

### Para quem coordena
- consegue liberar trechos já pré-configurados;
- garante mais padronização entre avaliadores.

### Para quem vai a campo
- abre o trecho no celular;
- preenche por parâmetro quando isso for rápido;
- troca para manual quando o caso pedir;
- não perde trabalho se a conexão cair.
