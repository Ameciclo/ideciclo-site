# IDECICLO - Plataforma Digital

> Plataforma digital para avaliação da qualidade da infraestrutura cicloviária urbana

## 📋 Sobre o Projeto

O **IDECICLO** (Índice de Desenvolvimento Cicloviário) é uma metodologia de avaliação qualitativa da infraestrutura cicloviária que considera não apenas a extensão das ciclovias e ciclofaixas, mas também a segurança, qualidade e o contexto viário em que estão inseridas.

Esta plataforma digital foi desenvolvida para facilitar o processo de coleta, análise e visualização dos dados do IDECICLO, permitindo que pesquisadores registrem avaliações de campo, gestores acessem relatórios e cidadãos consultem informações sobre a qualidade da infraestrutura cicloviária em suas cidades.

### 🎯 Funcionalidades Principais

- **Avaliação de Campo**: Formulário digital para coleta de dados in loco
- **Mapeamento Interativo**: Visualização geográfica dos segmentos avaliados
- **Cálculo Automático**: Processamento das notas baseado na metodologia IDECICLO
- **Ranking Nacional**: Comparação entre cidades avaliadas
- **Relatórios**: Geração de documentos e análises detalhadas
- **Gestão de Dados**: Sistema completo para armazenamento e consulta

### 🏛️ Desenvolvido por

**Ameciclo** - Associação Metropolitana de Ciclistas do Recife

Criado inicialmente em 2016 e atualizado em 2024 com colaboração de especialistas e organizações não governamentais.

## 🚀 Começando

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Git

### Instalação

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>

# Navegue até o diretório
cd ideciclo-site

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Build para desenvolvimento
npm run build:dev

# Linting
npm run lint

# Preview da build
npm run preview
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool e dev server
- **React Router** - Roteamento

### UI/UX
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes de interface
- **Radix UI** - Primitivos de componentes acessíveis
- **Lucide React** - Ícones

### Mapas e Geolocalização
- **Leaflet** - Biblioteca de mapas interativos
- **React Leaflet** - Componentes React para Leaflet
- **Turf.js** - Análise geoespacial

### Dados e Estado
- **Supabase** - Backend como serviço
- **TanStack Query** - Gerenciamento de estado do servidor
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de esquemas

### Utilitários
- **date-fns** - Manipulação de datas
- **html2pdf.js** - Geração de PDFs
- **Recharts** - Gráficos e visualizações

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de interface base
│   ├── CityMap.tsx     # Mapa interativo das cidades
│   ├── Navbar.tsx      # Barra de navegação
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── Index.tsx       # Página inicial
│   ├── About.tsx       # Sobre o IDECICLO
│   ├── Avaliacao.tsx   # Formulário de avaliação
│   ├── Ranking.tsx     # Ranking das cidades
│   └── ...
├── services/           # Serviços e APIs
│   ├── api.ts          # Configuração da API
│   └── database.ts     # Operações do banco
├── types/              # Definições de tipos TypeScript
├── utils/              # Funções utilitárias
│   └── idecicloCalculator.ts  # Cálculos do IDECICLO
└── hooks/              # Hooks customizados
```

## 🗺️ Metodologia IDECICLO

### Parâmetros de Avaliação

A metodologia avalia **23 parâmetros** organizados em **5 eixos**:

1. **Planejamento Cicloviário** (2 parâmetros)
2. **Projeto Cicloviário ao Longo da Quadra** (11 parâmetros)
3. **Projeto Cicloviário nas Interseções** (3 parâmetros)
4. **Urbanidade** (3 parâmetros)
5. **Manutenção da Infraestrutura** (4 parâmetros)

### Diferencial

O IDECICLO pondera a avaliação de acordo com a **velocidade máxima permitida** nas vias, dando maior peso às estruturas em vias de alta velocidade, onde a proteção ao ciclista é mais crítica.

## 🎯 Público-Alvo

- **Gestores Públicos**: Planejamento e justificativa de melhorias
- **Técnicos e Planejadores**: Incorporação de indicadores em projetos
- **Organizações Cicloativistas**: Incidência e reivindicações baseadas em dados
- **Pesquisadores**: Estudos sobre mobilidade urbana e segurança viária
- **Ciclistas e Conselhos**: Diálogo qualificado com o poder público

## 📊 Como Usar a Plataforma

1. **Preparação**: Leia o manual e organize a equipe
2. **Mapeamento**: Identifique os segmentos a serem avaliados
3. **Avaliação**: Colete dados em campo usando o formulário digital
4. **Análise**: Visualize resultados e relatórios gerados
5. **Ação**: Use os dados para advocacy e melhorias

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é uma ferramenta aberta e replicável, desenvolvida para fortalecer o planejamento participativo e promover cidades mais seguras para ciclistas.

## 📞 Contato

**Ameciclo** - Associação Metropolitana de Ciclistas do Recife

---

## 🔧 Desenvolvimento

### Configuração do Ambiente

O projeto utiliza Supabase como backend. Configure as variáveis de ambiente necessárias:

```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Deploy

O projeto pode ser deployado em qualquer plataforma que suporte aplicações React/Vite:

- **Vercel**: Deploy automático via Git
- **Netlify**: Build e deploy contínuo
- **AWS S3 + CloudFront**: Hospedagem estática
- **Lovable**: [Deploy direto pela plataforma](https://lovable.dev/projects/dd5572a5-488e-4df3-8a4f-562c8ff6d96c)

### Lovable Integration

Este projeto foi desenvolvido com [Lovable](https://lovable.dev/projects/dd5572a5-488e-4df3-8a4f-562c8ff6d96c) e suporta:

- Deploy automático via Lovable
- Sincronização bidirecional com o repositório
- Edição visual de componentes
- Configuração de domínio customizado
