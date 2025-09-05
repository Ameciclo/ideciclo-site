# Guia Visual do IDECICLO - Componentes e Estilos

Este documento contém todos os elementos visuais necessários para replicar o design da página do IDECICLO em outras linguagens/frameworks.

## 🎨 Paleta de Cores

### Cores Principais
```css
/* Cores customizadas do Tailwind */
--ameciclo: #008080;           /* Verde-azulado principal */
--ideciclo: #5050aa;           /* Azul específico do IDECICLO */
--custom-grey: #F1F1F1;        /* Cinza claro */

/* Cores específicas dos componentes IDECICLO */
--ideciclo-red: #CE4831;       /* Vermelho dos títulos */
--ideciclo-teal: #6DBFAC;      /* Verde-azulado dos cards */
--ideciclo-blue: #5AC2E1;      /* Azul claro */
--ideciclo-yellow: #EFC345;    /* Amarelo */
--ideciclo-pink: #F5BDBF;      /* Rosa claro */
--ideciclo-green: #69BFAF;     /* Verde dos elementos de fundo */
--background-grey: #E5E8E9;    /* Cinza de fundo */
--text-grey: #334454;          /* Cinza do texto */
```

## 📐 Estrutura da Página

### 1. Header com Imagem de Capa
```html
<!-- Componente NavCoverIdeciclo -->
<div class="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black"
     style="background-image: url('/pages_covers/ideciclo-navcover.png')">
</div>
```

### 2. Breadcrumb
```html
<nav class="bg-gray-400 text-white px-4 py-2">
  <a href="/">Home</a> > <span>IDECICLO</span>
</nav>
```

### 3. Seção de Estatísticas Gerais
Componente principal com fundo SVG e cards de números.

#### Título com SVG de Fundo
```html
<div class="relative inline-flex items-center justify-center">
  <!-- SVG de fundo cinza -->
  <svg xmlns="http://www.w3.org/2000/svg" width="110%" height="57" viewBox="0 0 488 57" 
       class="absolute bottom-[-30px] left:0 transform scale-x-105 drop-shadow-lg">
    <path d="M10.9295 34.8977C9.75216 26.5786..." fill="#A5AEB8"/>
  </svg>
  
  <!-- Título principal -->
  <h1 class="text-3xl sm:text-5xl font-bold bg-[#CE4831] text-white rounded-[2.5rem] 
             shadow-[0px_6px_8px_rgba(0,0,0,0.25)] inline-flex items-center justify-center 
             h-[6rem] px-[2.1875rem] py-[1rem] gap-[1rem] flex-shrink-0 relative z-10">
    Estatísticas Gerais
  </h1>
</div>
```

#### Container de Cards com Fundo SVG
```html
<div class="relative z-1 rounded-lg mx-4 md:mx-auto my-8 max-w-4xl">
  <!-- SVG de fundo -->
  <div class="absolute inset-0 z-1">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" 
         viewBox="0 0 1149 208" preserveAspectRatio="none" fill="none"
         class="drop-shadow-lg">
      <path opacity="1" d="M1126.03 193.311C1126.03 196.253..." fill="#E5E8E9"/>
    </svg>
  </div>
  
  <!-- Cards de conteúdo -->
  <div class="relative z-10 flex flex-col align-baseline md:flex-row rounded-lg 
              mx-4 md:mx-auto my-8 max-w-4xl divide-y md:divide-y-0 md:divide-x divide-gray-300">
    <!-- Cards individuais aqui -->
  </div>
</div>
```

### 4. Seção de Explicações (O que é? / Para que serve? / Metodologia)

#### Container Principal com SVGs de Fundo
```html
<section class="relative w-100">
  <!-- Seção principal -->
  <section class="relative z-[1] container mx-auto lg:w-4/6 my-5 md:my-6 rounded p-12 overflow-auto">
    
    <!-- Título com navegação -->
    <div class="flex p-6 justify-between items-center mb-4">
      <!-- Título com SVG -->
      <div class="relative inline-flex items-center justify-center">
        <h1 class="relative inline-flex items-center justify-center px-4 md:px-8 py-2 md:py-4 
                   gap-4 rounded-full bg-[#5AC2E1] shadow-lg text-[#334454] text-center 
                   font-lato text-xl md:text-3xl font-black leading-normal z-[0]">
          O que é?
        </h1>
        
        <!-- SVG de fundo amarelo -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 341 80"
             class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 
                    w-[120%] flex-shrink-0 z-[-1]"
             style="fill: #EFC345; filter: drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.25))">
          <path d="M9.80432 49.4967C9.04999 36.8026..."/>
        </svg>
      </div>

      <!-- Botões de navegação -->
      <div class="flex items-center">
        <!-- Círculos indicadores -->
        <div class="w-5 h-5 rounded-full mx-1 cursor-pointer bg-sky-500"></div>
        <div class="w-5 h-5 rounded-full mx-1 cursor-pointer bg-amber-400"></div>
        <div class="w-5 h-5 rounded-full mx-1 cursor-pointer bg-amber-400"></div>
        
        <!-- Botão próximo -->
        <button class="p-4 rounded-full ml-2 text-lg font-bold leading-none shadow-sm 
                       transform scale-y-150">
          >
        </button>
      </div>
    </div>
    
    <!-- Caixa de conteúdo -->
    <div class="relative z-[-2] top-[-50px] text-gray-800 p-12 py-24 mx-auto 
                bg-gray-100 shadow-2xl">
      <p class="text-justify">Conteúdo da explicação...</p>
    </div>
  </section>
  
  <!-- SVGs verticais de fundo -->
  <div class="absolute bottom-0 md:top-0 left-0 w-full z-0">
    <div class="flex mx-2 md:mx-12 md:translate-y-full">
      <!-- Repetir este SVG para preencher a largura -->
      <svg xmlns="http://www.w3.org/2000/svg" width="68" height="268" 
           viewBox="0 0 68 268" fill="none" class="px-2">
        <path d="M67.6863 246.015C67.833 250.383..." fill="#69BFAF"/>
      </svg>
    </div>
  </div>
</section>
```

### 5. Ranking das Cidades

#### Título e Filtros
```html
<section class="flex gap-2 relative justify-center mb-10 mx-auto w-full 2xl:w-3/4">
  <!-- SVG esquerdo -->
  <svg class="relative z-[1]" xmlns="http://www.w3.org/2000/svg" 
       width="225" height="264" viewBox="0 0 225 264" fill="none">
    <path d="M217.255 111.903C209.361 106.913..." fill="#EFC345"/>
  </svg>
  
  <!-- Conteúdo central -->
  <div class="mx-auto flex flex-col justify-center align-middle gap-2 md:gap-5 relative z-[2]">
    <h1 class="text-4xl md:text-5xl font-bold text-gray-700 pb-8 bg-[#F5BDBF] 
               mx-auto px-7 py-6 rounded-[40px]">
      Ranking das Cidades
    </h1>
    
    <!-- Filtros -->
    <div class="flex flex-wrap align-baseline gap-0 md-gap-10 justify-center flex-grow mx-auto">
      <!-- Filtro por estado -->
      <div class="relative rounded-lg mx-4 m-4 xl:m-8 max-w-md">
        <!-- SVG de fundo do filtro -->
        <div class="absolute inset-0 z-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" 
               viewBox="0 0 288 101" preserveAspectRatio="none" fill="none"
               class="drop-shadow-lg">
            <path d="M285.958 85.6596C285.958 97.0472..." fill="#6DBFAC"/>
          </svg>
        </div>
        
        <!-- Conteúdo do filtro -->
        <div class="relative z-10 text-white font-bold rounded px-4 pb-6 pt-2 mx-4">
          <label>por estado:</label>
          <select class="block appearance-none text-black font-bold w-full bg-white 
                         border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 
                         rounded shadow leading-tight focus:outline-none focus:shadow-outline">
            <option value="">Todas</option>
            <option value="PE">PE</option>
            <!-- Mais opções -->
          </select>
        </div>
      </div>
    </div>
  </div>
  
  <!-- SVG direito -->
  <svg class="relative z-[1]" xmlns="http://www.w3.org/2000/svg" 
       width="236" height="229" viewBox="0 0 236 229" fill="none">
    <path d="M236 229L236 14.1282C226.709 10.9305..." fill="#5AC2E1"/>
  </svg>
  
  <!-- SVG de fundo -->
  <div class="absolute lg:translate-y-[-65px] translate-y-[0] z-[0]">
    <svg class="scale-y-[2] sm:scale-y-[1] w-full" xmlns="http://www.w3.org/2000/svg" 
         width="847" height="373" viewBox="0 0 847 373" fill="none">
      <path d="M103.281 309.45C103.281 309.45..." fill="#E4E8EA"/>
    </svg>
  </div>
</section>
```

### 6. Cards de Cidades
```html
<section class="container mx-auto gap-8 my-5 grid sm:grid-cols-2 md:grid-cols-3 
                lg:grid-cols-4 xl:grid-cols-5">
  <!-- Card individual -->
  <div class="flex flex-col rounded-[40px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] 
              h-full mx-3 ld:mx-0 p-3 justify-center align-center bg-white text-gray-700 
              h-42 hover:bg-[#EFC345] hover:text-gray-700">
    <button>
      <div class="flex center justify-center">
        <h3 class="text-center text-5xl font-bold">7.2</h3>
      </div>
      <div class="p-3">
        <h3 class="uppercase tracking-widest">Recife</h3>
      </div>
    </button>
  </div>
</section>
```

### 7. Estatísticas da Cidade Selecionada
```html
<section class="mx-auto container">
  <div class="mx-auto text-center my-12 md:my-24">
    <!-- Título da cidade -->
    <div class="relative inline-flex items-center justify-center">
      <h1 class="text-4xl sm:text-5xl font-bold bg-[#6DBFAC] text-gray-800 
                 rounded-[2.5rem] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] 
                 inline-flex items-center justify-center px-[2rem] py-[.75rem] 
                 pb-4 lg:p-6 lg:pb-8 lg:px-8 gap-[1rem] flex-shrink-0 
                 relative z-10 max-w-[95%] lg:max-w-full">
        Recife
      </h1>
    </div>
    
    <h3 class="text-2xl md:text-3xl font-medium my-8 text-gray-800">
      Estatísticas Gerais
    </h3>
    
    <!-- Cards com SVG individual -->
    <div class="flex flex-col gap-4 justify-between md:flex-row rounded-lg text-gray-800">
      <div class="relative flex-1">
        <!-- SVG de fundo para cada card -->
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" 
             viewBox="0 0 1149 208" preserveAspectRatio="none" fill="none"
             class="absolute inset-0 h-full drop-shadow-lg lg:px-6">
          <path opacity="1" d="M1126.03 193.311C1126.03 196.253..." fill="#E5E8E9"/>
        </svg>
        
        <!-- Conteúdo do card -->
        <div class="relative z-10">
          <div class="flex flex-col justify-center w-full p-6 text-center 
                      uppercase tracking-widest">
            <h3>Nota Média</h3>
            <h3 class="text-3xl sm:text-5xl font-bold mt-2">7.2</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

## 🎯 Elementos SVG Principais

### 1. SVG de Fundo Cinza (Estatísticas Gerais)
```svg
<path opacity="1" d="M1126.03 193.311C1126.03 196.253 1119.59 199.073 1108.12 201.153C1096.65 203.233 1081.09 204.401 1064.87 204.401L892.017 206.573C836.194 207.271 780.371 207.271 759.995 208L362.477 202.969C302.327 201.223 274.862 202.741 250.161 203.131L76.2709 204.401C60.6238 204.401 45.5722 203.313 34.216 201.361C22.8599 199.409 16.064 196.742 15.2281 193.909L1.63507 148.243C-1.7472 136.762 0.119956 125.25 7.21741 113.825L8.44552 91.0475C13.1347 83.4551 12.4648 56.3808 8.44552 48.7733L18.7728 17.9331C18.5231 17.545 18.3926 17.1547 18.3821 16.7639C18.6891 9.40439 26.3648 3.5431 94.4414 3.5431L779.505 0C781.236 0 782.966 0 784.725 0L1068.34 2.94077C1083.93 3.09986 1098.6 4.33552 1109.33 6.39408C1120.06 8.45264 1126.03 11.1779 1126.03 14.0104L1148.36 117.14C1146.52 122.76 1146.73 128.395 1149 134.01L1126.03 193.311Z" fill="#E5E8E9"/>
```

### 2. SVG Vertical Verde (Fundo das Explicações)
```svg
<path d="M67.6863 246.015C67.833 250.383 66.2783 254.644 63.3332 257.946C60.388 261.248 56.2693 263.348 51.8002 263.826C39.4054 265.011 28.312 266.055 17.2806 267.2C6.6004 268.324 2.07628 260.152 1.37391 247.24C0.56825 232.642 0.113775 217.983 0.0931153 203.345C-0.0308293 144.898 -0.0308266 86.4448 0.0931231 27.9848C0.0931233 24.6515 0.361678 21.3182 0.692207 18.0652C0.988921 15.0779 2.07236 12.2152 3.83812 9.75323C5.60387 7.29125 7.99237 5.31295 10.7733 4.00907C20.0281 -0.288083 25.6678 -0.569205 44.7558 1.49905C48.8752 1.98753 52.6892 3.86075 55.5375 6.79441C58.3859 9.72807 60.0892 13.5375 60.3527 17.5632C66.3642 91.418 65.8271 166.578 67.6863 246.015Z" fill="#69BFAF"/>
```

## 📱 Responsividade

### Breakpoints Principais
- **Mobile**: até 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+

### Classes Responsivas Importantes
```css
/* Títulos */
.text-3xl.sm:text-5xl     /* Títulos que crescem em telas maiores */

/* Grid de cards */
.grid.sm:grid-cols-2.md:grid-cols-3.lg:grid-cols-4.xl:grid-cols-5

/* Containers */
.container.mx-auto        /* Container centralizado */
.w-full.2xl:w-3/4        /* Largura responsiva */

/* Padding e margin */
.my-12.md:my-24          /* Margens verticais responsivas */
.px-4.md:px-8            /* Padding horizontal responsivo */
```

## 🔧 Configurações CSS/Tailwind Necessárias

### Extensões do Tailwind
```javascript
module.exports = {
  theme: {
    extend: {
      height: {
        cover: "52vh",
        "no-cover": "25vh",
      },
      colors: {
        customGrey: "#F1F1F1",
        ameciclo: "#008080",
        ideciclo: "#5050aa",
      },
      fontFamily: {
        custom: ["Open Sans"],
      },
    },
  },
}
```

### Fontes
```css
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');

body {
  font-family: 'Open Sans', BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}
```

## 📋 Checklist de Implementação

### ✅ Elementos Essenciais
- [ ] Header com imagem de fundo
- [ ] Breadcrumb com cor customizada
- [ ] Seção de estatísticas com SVG de fundo
- [ ] Cards de números com formatação específica
- [ ] Seção de explicações com navegação
- [ ] SVGs verticais de fundo
- [ ] Filtros com SVGs customizados
- [ ] Grid responsivo de cards de cidades
- [ ] Estatísticas da cidade selecionada
- [ ] Tabela de dados (se necessário)

### 🎨 Estilos Críticos
- [ ] Paleta de cores implementada
- [ ] Fonte Open Sans carregada
- [ ] Sombras e drop-shadows aplicadas
- [ ] Border-radius arredondados (40px para cards)
- [ ] Gradientes e transparências
- [ ] Responsividade em todos os breakpoints

### 🖼️ Assets Necessários
- [ ] Imagem de capa: `/pages_covers/ideciclo-navcover.png`
- [ ] Logo (opcional): `/ideciclo/ideciclo-logo.png`
- [ ] Todos os SVGs inline implementados

## 💡 Dicas de Implementação

1. **SVGs**: Use sempre `preserveAspectRatio="none"` para SVGs de fundo que precisam se adaptar ao container
2. **Z-index**: Mantenha a hierarquia: fundo (z-0), meio (z-1), conteúdo (z-10)
3. **Sombras**: Use `drop-shadow` para SVGs e `shadow-*` para elementos HTML
4. **Cores**: Prefira as cores customizadas definidas no tema
5. **Responsividade**: Teste sempre em mobile primeiro
6. **Performance**: Considere otimizar SVGs complexos para produção

Este guia fornece todos os elementos visuais necessários para replicar fielmente o design do IDECICLO em qualquer framework ou linguagem.