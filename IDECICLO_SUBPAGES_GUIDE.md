# Guia Visual das Subpáginas do IDECICLO - Páginas de Detalhes

Este documento complementa o guia principal e contém os elementos visuais específicos das páginas de detalhes individuais do IDECICLO (páginas por slug/ID).

## 🏗️ Estrutura da Página de Detalhes

### 1. Header e Breadcrumb (Igual à página principal)
```html
<!-- NavCover com imagem -->
<div class="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black"
     style="background-image: url('/pages_covers/ideciclo-navcover.png')">
</div>

<!-- Breadcrumb -->
<nav class="bg-gray-400 text-white px-4 py-2">
  <a href="/">Home</a> > <a href="/ideciclo">IDECICLO</a> > <span>Nome da Rua</span>
</nav>
```

### 2. Estatísticas Principais (Variação do componente principal)
```html
<section class="relative z-1 mx-auto container bg-transparent">
  <div class="mx-auto text-center my-12 md:my-24">
    <!-- Título com SVG vermelho diferente -->
    <div class="relative inline-flex items-center justify-center">
      <svg class="absolute z-1 bottom-0 translate-y-6 drop-shadow-md" 
           xmlns="http://www.w3.org/2000/svg" width="1358" height="42" 
           viewBox="0 0 1358 62" fill="none">
        <path d="M15.9387 42.8923C12.719 32.9575..." fill="#CE4831"/>
      </svg>
      
      <h1 class="text-3xl w-full m-0 mb-10 p-0 sm:text-5xl font-bold 
                 bg-transparent text-gray-700 inline-flex items-center 
                 justify-center py-[1rem] gap-[1rem] flex-shrink-0 relative z-10">
        Nome da Rua
      </h1>
    </div>
    
    <h3 class="text-2xl md:text-3xl text-gray-700 font-bold my-8">
      Estatísticas Gerais
    </h3>
    
    <!-- Container com fundo SVG (mesmo da página principal) -->
    <div class="relative z-1 rounded-lg mx-4 md:mx-auto my-8 max-w-4xl">
      <!-- SVG de fundo igual ao principal -->
      <div class="absolute inset-0 z-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" 
             viewBox="0 0 1149 208" preserveAspectRatio="none" fill="none"
             class="drop-shadow-lg">
          <path opacity="1" d="M1126.03 193.311C1126.03 196.253..." fill="#E5E8E9"/>
        </svg>
      </div>
      
      <!-- Cards de estatísticas -->
      <div class="relative z-10 flex flex-col align-baseline md:flex-row 
                  rounded-lg mx-4 md:mx-auto my-8 max-w-4xl 
                  divide-y md:divide-y-0 md:divide-x divide-gray-300">
        <!-- Cards individuais -->
      </div>
    </div>
  </div>
</section>
```

### 3. Grid de Conteúdo Principal (3 colunas)
```html
<div class="w-full relative z-[-1] translate-y-[-500px] md:translate-y-[-320px] bg-amber-300">
  <section class="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
                  auto-rows-auto gap-10 mt-[500px] md:mt-[300px] mb-[100px]">
    
    <!-- Card 1: Descrição -->
    <div class="rounded bg-white shadow-2xl">
      <div class="flex flex-col bg-white mx-4 md:mx-auto max-w-4xl 
                  divide-y md:divide-x divide-gray-100">
        
        <!-- Seção Descrição -->
        <div class="flex flex-col justify-center w-full p-6 text-center tracking-widest">
          <h3>DESCRIÇÃO</h3>
          <h3 class="text-2xl mt-2">
            <strong>CICLOVIA</strong>, <strong>BIDIRECIONAL</strong>, 
            com piso de <strong>CONCRETO</strong>, 
            localizada <strong>NO CANTEIRO CENTRAL</strong>
          </h3>
        </div>
        
        <!-- Seção Largura -->
        <div class="flex flex-col justify-center w-full p-6 text-center tracking-widest">
          <h3>LARGURA</h3>
          <h3 class="text-3xl mt-2">
            <strong>3,2m</strong>, onde <strong>3,0m</strong> são transitáveis
          </h3>
        </div>
        
        <!-- Seção Última Avaliação -->
        <div class="flex flex-col justify-center w-full p-6 text-center 
                    uppercase tracking-widest">
          <h3>Última avaliação</h3>
          <h3 class="text-3xl font-bold mt-2">15/03/2023</h3>
        </div>
      </div>
    </div>
    
    <!-- Card 2: Mapa -->
    <div class="bg-green-200 rounded shadow-2xl">
      <!-- Componente de mapa aqui -->
      <div style="height: 550px;">
        <!-- Mapa interativo -->
      </div>
    </div>
    
    <!-- Card 3: Gráfico Radar -->
    <div class="rounded bg-white shadow-2xl">
      <!-- Componente de gráfico radar -->
      <div class="p-6">
        <h3 class="text-center font-bold text-xl mb-4">EVOLUÇÃO DA NOTA</h3>
        <p class="text-center text-gray-600 mb-4">Notas que compõem a média</p>
        <!-- Gráfico radar aqui -->
      </div>
    </div>
  </section>
</div>
```

### 4. Seção de Detalhamento das Notas (Componente Vertical)
```html
<section class="container mx-auto mt-[-450px] md:mt-[-250px]">
  <div class="mx-auto text-center my-12 md:my-6">
    <!-- Título principal -->
    <h3 class="text-4xl font-bold p-6 my-8 mb-[100px] rounded-[40px] 
               bg-[#6DBFAC] mx-auto w-[300px] md:w-[600px] lg:w-[700px]">
      Detalhamento e composição das notas
    </h3>
    
    <!-- Grid de categorias principais -->
    <section class="container mx-auto grid grid-cols-1 sm:grid-cols-2 
                    lg:grid-cols-4 md:grid-cols-2 auto-rows-auto gap-10 my-10">
      
      <!-- Categoria 1: Qualidade do Projeto -->
      <div class="container rounded flex flex-col gap-[80px]">
        <!-- Caixa principal colorida -->
        <div class="flex flex-col rounded-[40px] justify-center font-semibold 
                    text-xl mx-auto uppercase w-[234px] mt-10 p-6 text-center 
                    tracking-widest shadow-md relative md:min-h-[150px]"
             style="background: #5AC2E1; box-shadow: 0px 6px 8px 0px rgba(0, 0, 0, 0.25)">
          
          <!-- Ícone posicionado acima -->
          <img src="/ideciclo/icones/qualidade-do-projeto.svg" 
               alt="Qualidade do projeto image" 
               class="absolute top-[-80px] left-1/2 transform -translate-x-1/2"
               style="height: 108px; width: 104px">
          
          <h3>Qualidade do projeto</h3>
          <h3 class="text-4xl font-bold mt-1">8.5</h3>
        </div>
        
        <!-- Subcategorias -->
        <div class="flex flex-col gap-[80px] mx-4 md:mx-auto max-w-4xl">
          
          <!-- Subcategoria 1 -->
          <div class="relative border-4 rounded-[40px] flex flex-col justify-center 
                      uppercase w-[234px] p-6 text-center tracking-widest mx-auto"
               style="border-color: #5AC2E1; box-shadow: 0px 6px 8px 0px rgba(0, 0, 0, 0.25)">
            
            <img src="/ideciclo/icones/protecao-contra-invasao.svg" 
                 alt="Proteção contra a invasão image" 
                 class="absolute top-[-80px] left-1/2 transform -translate-x-1/2"
                 style="height: 108px; width: 104px">
            
            <h3>Proteção contra a invasão</h3>
            <p class="text-4xl font-bold mt-1 text-gray-900">9.0</p>
          </div>
          
          <!-- Mais subcategorias... -->
        </div>
      </div>
      
      <!-- Repetir para outras categorias: Segurança Viária, Manutenção, Urbanidade -->
    </section>
  </div>
</section>
```

## 🎨 Cores Específicas das Categorias

### Cores das Categorias Principais
```css
/* Qualidade do Projeto */
--projeto-color: #5AC2E1;        /* Azul claro */

/* Segurança Viária */
--seguranca-color: #EFC345;      /* Amarelo */

/* Manutenção */
--manutencao-color: #F5BDBF;     /* Rosa claro */

/* Urbanidade */
--urbanidade-color: #69BFAF;     /* Verde-azulado */
```

## 🖼️ Ícones Necessários

### Estrutura de Ícones
```
/ideciclo/icones/
├── qualidade-do-projeto.svg
├── protecao-contra-invasao.svg
├── sinalizacao-vertical.svg
├── sinalizacao-horizontal.svg
├── conforto-da-estrutura.svg
├── seguranca-viaria.svg
├── controle-de-velocidade.svg
├── conflitos-ao-longo.svg
├── conflitos-nos-cruzamentos.svg
├── manutencao.svg
├── tipo-de-pavimento.svg
├── condicao-da-sinalizacao-horizontal.svg
├── situacao-da-protecao.svg
├── urbanidade.svg
├── obstaculos.svg
├── sombreamento.svg
├── acesso-da-estrutura.svg
├── iluminacao.svg
└── default-image.svg
```

### Especificações dos Ícones
- **Tamanho**: 104px × 108px
- **Formato**: SVG
- **Posicionamento**: Absoluto, 80px acima da caixa
- **Centralização**: `left-1/2 transform -translate-x-1/2`

## 📐 Layout Responsivo Específico

### Breakpoints das Subpáginas
```css
/* Grid principal (3 colunas) */
.grid-cols-1.md:grid-cols-2.lg:grid-cols-3

/* Grid de categorias (4 colunas) */
.grid-cols-1.sm:grid-cols-2.lg:grid-cols-4.md:grid-cols-2

/* Ajustes de posicionamento */
.translate-y-[-500px].md:translate-y-[-320px]  /* Sobreposição do grid */
.mt-[-450px].md:mt-[-250px]                    /* Ajuste da seção final */
```

### Dimensões Específicas
```css
/* Caixas de categoria */
.w-[234px]                    /* Largura fixa das caixas */
.min-h-[150px]               /* Altura mínima das caixas principais */
.gap-[80px]                  /* Espaçamento entre elementos */

/* Título da seção final */
.w-[300px].md:w-[600px].lg:w-[700px]  /* Largura responsiva do título */
```

## 🎯 Elementos Únicos das Subpáginas

### 1. SVG Vermelho do Título (Diferente da página principal)
```svg
<path d="M15.9387 42.8923C12.719 32.9575 11.4924 23.7252 8.32915 14.0604C7.96501 13.2808 8.25289 12.4674 9.14433 11.7569C10.0358 11.0464 11.4764 10.4821 13.2244 10.1587C19.0716 9.31065 25.0569 8.65106 31.1278 8.18577C45.1257 7.33193 59.2867 6.67946 73.3981 6.41074C181.568 4.32819 289.682 2.11088 397.992 3.02562C487.784 3.73218 577.772 2.74594 667.564 3.40742C775.711 4.2335 883.709 6.09812 991.753 7.33101C1069.08 8.2231 1146.4 8.91981 1223.72 9.42114C1256.95 9.64808 1290.27 9.15261 1323.49 9.08648C1329.71 9.02762 1335.94 9.30691 1343.13 9.53198C1345.1 9.69751 1346.82 10.18 1347.93 10.8769C1349.04 11.5737 1349.45 12.43 1349.08 13.2635L1343.39 38.3884C1343.34 39.0515 1342.8 39.6954 1341.85 40.23C1340.89 40.7646 1339.56 41.1631 1338.06 41.3698C1335.24 41.6749 1332.37 41.8756 1329.48 41.9695C1212.88 43.6132 1096.28 45.9107 979.727 46.6747C852.385 47.5181 724.975 47.0997 597.623 46.9512C532.739 46.8884 467.899 45.9233 403.016 45.9281C328.957 45.9972 254.802 47.1944 180.689 47.2189C129.276 47.2541 76.1355 46.2686 22.0328 45.653C20.3976 45.5692 18.8938 45.2475 17.7811 44.7434C16.6683 44.2394 16.0167 43.5846 15.9387 42.8923Z" fill="#CE4831"/>
```

### 2. Posicionamento Complexo com Sobreposições
```css
/* Fundo amarelo com sobreposição */
.bg-amber-300.translate-y-[-500px].md:translate-y-[-320px]

/* Ajuste do grid principal */
.mt-[500px].md:mt-[300px].mb-[100px]

/* Seção final sobreposta */
.mt-[-450px].md:mt-[-250px]
```

### 3. Mapeamento de Ícones por Categoria
```javascript
// Função para mapear títulos para ícones
const getImageUrl = (titulo) => {
  const iconMap = {
    'Qualidade do projeto': '/ideciclo/icones/qualidade-do-projeto.svg',
    'Proteção contra a invasão': '/ideciclo/icones/protecao-contra-invasao.svg',
    'Sinalização vertical': '/ideciclo/icones/sinalizacao-vertical.svg',
    'Sinalização horizontal': '/ideciclo/icones/sinalizacao-horizontal.svg',
    'Conforto da esturutra': '/ideciclo/icones/conforto-da-estrutura.svg',
    'Segurança viária': '/ideciclo/icones/seguranca-viaria.svg',
    'Controle de velocidade': '/ideciclo/icones/controle-de-velocidade.svg',
    'Conflitos ao longo': '/ideciclo/icones/conflitos-ao-longo.svg',
    'Conflitos nos cruzamentos': '/ideciclo/icones/conflitos-nos-cruzamentos.svg',
    'Manutenção': '/ideciclo/icones/manutencao.svg',
    'Tipo de pavimento': '/ideciclo/icones/tipo-de-pavimento.svg',
    'Condição da sinalização horizontal': '/ideciclo/icones/condicao-da-sinalizacao-horizontal.svg',
    'Situação da proteção': '/ideciclo/icones/situacao-da-protecao.svg',
    'Urbanidade': '/ideciclo/icones/urbanidade.svg',
    'Obstáculos': '/ideciclo/icones/obstaculos.svg',
    'Sombreamento': '/ideciclo/icones/sombreamento.svg',
    'Acesso da estrutura': '/ideciclo/icones/acesso-da-estrutura.svg',
    'Iluminação': '/ideciclo/icones/iluminacao.svg'
  };
  
  return iconMap[titulo] || '/ideciclo/icones/default-image.svg';
};
```

## 📋 Checklist Adicional para Subpáginas

### ✅ Elementos Específicos das Subpáginas
- [ ] SVG vermelho diferente no título
- [ ] Grid de 3 colunas (descrição, mapa, gráfico)
- [ ] Card de descrição com 3 seções divididas
- [ ] Área para mapa interativo (550px altura)
- [ ] Área para gráfico radar
- [ ] Seção vertical de categorias com ícones
- [ ] 4 categorias principais com cores específicas
- [ ] Subcategorias com bordas coloridas
- [ ] Posicionamento absoluto dos ícones
- [ ] Sobreposições complexas de seções

### 🎨 Assets Adicionais Necessários
- [ ] 18+ ícones SVG específicos (104×108px)
- [ ] Mapeamento de cores por categoria
- [ ] Integração com componente de mapa
- [ ] Integração com gráfico radar

### 🔧 Funcionalidades Específicas
- [ ] Navegação por breadcrumb dinâmico
- [ ] Carregamento de dados por ID/slug
- [ ] Formatação de números e datas
- [ ] Indicadores visuais de melhor/pior nota
- [ ] Responsividade em layouts complexos

Este guia complementa o documento principal e fornece todos os elementos necessários para implementar as páginas de detalhes individuais do IDECICLO.