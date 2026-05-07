# IDECICLO

Plataforma web para baixar, refinar, avaliar e publicar resultados do IDECICLO por cidade, com autenticação por magic link, controle de permissões por escopo territorial e painel administrativo.

## Visão geral

O projeto combina:

- portal público com apresentação da metodologia, ranking e páginas de detalhe;
- fluxo protegido de avaliação por cidade;
- persistência em PostgreSQL;
- rotas server-side locais em `/api/auth/*` e `/api/db/*`;
- autenticação por link mágico enviado por e-mail;
- gestão administrativa de usuários, permissões e solicitações de acesso.

## Sobre o IDECICLO

O IDECICLO é uma metodologia de avaliação qualitativa da infraestrutura cicloviária urbana. Em vez de medir apenas extensão de ciclovias e ciclofaixas, a plataforma trabalha com qualidade da infraestrutura, segurança e contexto viário.

A metodologia considera 23 parâmetros organizados em 5 eixos:

- Planejamento cicloviário
- Projeto cicloviário ao longo da quadra
- Projeto cicloviário nas interseções
- Urbanidade
- Manutenção da infraestrutura

O projeto é mantido no contexto da Ameciclo e foi estruturado para apoiar avaliação técnica, incidência pública e comparação entre cidades.

Hoje a página inicial oferece três materiais principais:

- `Manual` em `public/manual_ideciclo.pdf`;
- `Formulário` em link externo;
- `Cálculo do IDECICLO` em `public/resumo_ideciclo.pdf`.

## O que a aplicação faz

### Área pública

- `/` página inicial com apresentação, materiais e navegação para a metodologia.
- `/sobre` explicação do IDECICLO.
- `/apoiadores` parceiros e apoiadores.
- `/ranking` ranking nacional das cidades publicadas.
- `/detalhes-cidades/:cityId` página pública de resultados por cidade.
- `/detalhes-cidades/:cityId/estruturas/:segmentId` detalhe público de um trecho avaliado.

### Fluxo de avaliação

- `/avaliacao` escolha da cidade ativa e entrada para o fluxo protegido.
- `/avaliacao/refinar-dados` refinamento da malha cicloviária da cidade.
- `/avaliacao/escolher-estrutura` seleção do trecho a ser avaliado.
- `/avaliacao/avaliar-estrutura` apoio à avaliação do trecho.
- `/avaliacao/formulario-ideciclo/:segmentId` formulário IDECICLO.
- `/avaliacao/resultados` consolidação da nota, visualização e liberação para ranking.

### Autenticação e acesso

- `/login` envio de magic link.
- `/solicitar-acesso` solicitação de acesso com verificação de e-mail.
- `/auth/verify` consumo do magic link de login.
- `/auth/logout` encerramento de sessão.
- `/admin` painel administrativo de usuários e solicitações.

## Fluxos principais

### 1. Avaliar uma cidade

1. Entrar em `/avaliacao`.
2. Selecionar estado e cidade.
3. Ativar a cidade na sessão atual.
4. Refinar os segmentos em `/avaliacao/refinar-dados`.
5. Escolher um trecho e preencher o formulário IDECICLO.
6. Consultar os resultados em `/avaliacao/resultados`.
7. Se fizer sentido, liberar a cidade para aparecer no ranking.

### 2. Solicitar acesso

1. A pessoa preenche `/solicitar-acesso`.
2. O sistema envia um e-mail de verificação.
3. Após a confirmação do e-mail, a solicitação fica `pending_review`.
4. Um admin revisa no painel `/admin`.
5. Se aprovada, as permissões são criadas conforme o tipo de interesse e o escopo informado.

### 3. Entrar no sistema

1. A pessoa informa o e-mail em `/login`.
2. Se o e-mail já tiver acesso, o sistema envia um magic link.
3. O link leva para `/auth/verify` e cria a sessão autenticada.

## Modelo de permissões

### Papéis

- `admin_global`
- `admin_estado`
- `admin_cidade`
- `avaliador_estrutura_cicloviaria`
- `refinador_dados_cidade`
- `visualizador`

### Módulos protegidos

- `admin`
- `avaliacao_estrutura_cicloviaria`
- `refinamento_dados_cidade`

### Escopo territorial

As permissões podem ser:

- globais;
- por estado;
- por cidade.

O acesso é calculado com base em `role`, `module`, `state` e `city`.

### Regras administrativas atuais

- `admin_global` tem acesso total.
- `admin_estado` e `admin_cidade` acessam o painel admin dentro do próprio escopo.
- Admin regional pode revisar solicitações de acesso da própria jurisdição.
- Admin regional só pode conceder `visualizador`, `avaliador_estrutura_cicloviaria` e `refinador_dados_cidade`.
- Admin regional não pode conceder novos papéis de admin.
- Usuário não pode alterar o próprio status nem as próprias permissões.

## Ranking

Uma cidade só aparece em `/ranking` quando as duas condições abaixo são verdadeiras:

1. `show_in_ranking !== false`
2. existe pelo menos um formulário salvo em `public.forms` para a cidade

Na tela `/avaliacao/resultados`, a ação de liberação para ranking abre um modal com:

- pendências obrigatórias;
- pendências não obrigatórias;
- aviso explícito de que sem formulário salvo a cidade não entra no ranking.

## Arquitetura local

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui

### Dados e mapas

- PostgreSQL
- rotas Node locais em `/api/auth/*` e `/api/db/*`
- OpenStreetMap / Overpass para malha cicloviária
- IBGE para estados e municípios
- Mapbox para mapas interativos no frontend

### Observação sobre o backend local

No desenvolvimento normal, `npm run dev` já sobe o Vite e injeta middleware para atender:

- `/api/auth/*`
- `/api/db/*`

Ou seja, para desenvolvimento local comum não é necessário subir um servidor HTTP separado para a API.

O comando `npm run auth:dev` existe para rodar o servidor de autenticação isoladamente, mas ele não é obrigatório para o fluxo padrão do projeto.

## Pré-requisitos

- Node.js 18 ou superior
- npm
- Docker e Docker Compose
- acesso à internet para IBGE e Overpass
- token do Mapbox para visualizar mapas interativos

## Instalação local

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o arquivo de ambiente

Use `.env.example` como base:

```bash
cp .env.example .env.local
```

Exemplo mínimo:

```env
DATABASE_URL=postgresql://ideciclo:change_me_local_password@127.0.0.1:54322/ideciclo
APP_URL=http://127.0.0.1:8080
EMAIL_FROM=no-reply@ideciclo.local
MAGIC_LINK_SECRET=change_me_magic_link_secret
AUTH_COOKIE_SECURE=false
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
AUTH_MAGIC_LINK_RATE_LIMIT_WINDOW_MINUTES=15
AUTH_MAGIC_LINK_RATE_LIMIT_EMAIL_MAX=5
AUTH_MAGIC_LINK_RATE_LIMIT_IP_MAX=20
AUTH_MAGIC_LINK_RATE_LIMIT_EMAIL_COOLDOWN_SECONDS=60
POSTGRES_DATABASE=ideciclo
POSTGRES_USER=ideciclo
POSTGRES_PASSWORD=change_me_local_password
POSTGRES_PORT=54322
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

### 3. Subir o PostgreSQL

```bash
npm run db:up
```

O container `ideciclo-postgres` expõe o banco em `127.0.0.1:54322` por padrão.

Na primeira subida com volume novo, o `docker-compose.yml` já monta `supabase/bootstrap_full_schema.sql` como script de inicialização do Postgres.

### 4. Bootstrap do banco

Para bancos externos, bancos já existentes ou reaplicação manual da estrutura:

```bash
npm run db:bootstrap
```

### 5. Criar o primeiro admin global

```bash
npm run db:seedsudo
```

Ou passando o e-mail diretamente:

```bash
npm run db:seedsudo -- admin@exemplo.org
```

### 6. Iniciar a aplicação

```bash
npm run dev
```

Aplicação local:

- frontend + rotas locais: `http://127.0.0.1:8080`
- auth server isolado, se usado: `http://127.0.0.1:3001`

## Comandos úteis

```bash
# desenvolvimento
npm run dev

# auth server isolado
npm run auth:dev

# subir banco local
npm run db:up

# derrubar banco local
npm run db:down

# logs do banco
npm run db:logs

# aplicar bootstrap manualmente
npm run db:bootstrap

# criar primeiro admin global
npm run db:seedsudo

# build de produção
npm run build

# build em modo development
npm run build:dev

# preview da build
npm run preview

# lint
npm run lint
```

## Variáveis de ambiente

### Banco e app

- `DATABASE_URL` conexão principal com o PostgreSQL.
- `APP_URL` URL pública da aplicação.
- `POSTGRES_DATABASE`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT` usados no ambiente Docker local.

### Autenticação

- `MAGIC_LINK_SECRET` segredo para hash dos tokens.
- `AUTH_COOKIE_SECURE` força cookie seguro.
- `AUTH_SESSION_COOKIE_NAME` nome do cookie de sessão, opcional.

### E-mail

- `EMAIL_FROM` remetente dos e-mails.
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE`
- `ACCESS_REQUEST_NOTIFICATION_EMAIL` e-mail que recebe notificação de novas solicitações.

### Rate limit e expiração

- `AUTH_MAGIC_LINK_RATE_LIMIT_WINDOW_MINUTES`
- `AUTH_MAGIC_LINK_RATE_LIMIT_EMAIL_MAX`
- `AUTH_MAGIC_LINK_RATE_LIMIT_IP_MAX`
- `AUTH_MAGIC_LINK_RATE_LIMIT_EMAIL_COOLDOWN_SECONDS`
- `AUTH_ACCESS_REQUEST_VERIFICATION_TTL_MINUTES`
- `AUTH_ACCESS_REQUEST_PENDING_TTL_DAYS`
- `AUTH_ACCESS_REQUEST_RATE_LIMIT_WINDOW_MINUTES`
- `AUTH_ACCESS_REQUEST_RATE_LIMIT_EMAIL_MAX`
- `AUTH_ACCESS_REQUEST_RATE_LIMIT_IP_MAX`
- `AUTH_ACCESS_REQUEST_RATE_LIMIT_EMAIL_COOLDOWN_SECONDS`

### Mapas

- `VITE_MAPBOX_ACCESS_TOKEN` habilita a renderização dos mapas Mapbox no frontend.

Sem esse token, a aplicação continua funcionando, mas os componentes de mapa exibem aviso em vez do mapa interativo.

## E-mail em desenvolvimento

Se `SMTP_HOST` não estiver configurado, o servidor usa `jsonTransport`.

Na prática:

- magic links não são enviados de fato;
- e-mails de verificação de solicitação não são enviados de fato;
- o conteúdo do e-mail é registrado no terminal do processo.

Logs esperados:

- `Magic link gerado em modo local: ...`
- `Verificação de solicitação de acesso gerada em modo local: ...`
- `Notificação de solicitação de acesso gerada em modo local: ...`

Isso é suficiente para desenvolvimento local, mas para testes reais de e-mail você deve configurar SMTP.

## Dependências externas para replicar o projeto

Para rodar uma instância equivalente em outro ambiente, você precisa reproduzir:

- PostgreSQL com a estrutura de `supabase/bootstrap_full_schema.sql`;
- frontend Vite;
- runtime Node capaz de servir `/api/auth/*` e `/api/db/*`;
- SMTP para produção;
- acesso aos endpoints do IBGE;
- acesso aos endpoints Overpass do OpenStreetMap;
- token do Mapbox, se quiser mapas interativos.

## Estrutura principal do repositório

```text
api/                     adaptadores das rotas /api no ambiente Vite/Node
public/                  PDFs, imagens e assets públicos
scripts/                 bootstrap e seed do banco
server/                  lógica das APIs locais de auth e leitura do banco
src/components/          componentes reutilizáveis
src/pages/               páginas públicas, avaliação e admin
src/services/            acesso a APIs, banco e integrações
src/lib/                 regras de permissão e helpers de acesso
supabase/                schema SQL usado no bootstrap
```

## Build e deploy

O deploy de produção atual assume:

- frontend Vite;
- funções Node em `/api/auth/*` e `/api/db/*`;
- PostgreSQL acessível por `DATABASE_URL`.

### Requisitos mínimos de produção

- `APP_URL` com `https`
- `MAGIC_LINK_SECRET` forte, com pelo menos 32 caracteres
- `EMAIL_FROM` real
- `SMTP_HOST` configurado
- `AUTH_COOKIE_SECURE=true`

Depois de provisionar o banco:

1. aplicar a estrutura com `npm run db:bootstrap` ou equivalente;
2. executar `npm run db:seedsudo` uma única vez para criar o primeiro `admin_global`.

## Observações operacionais

- O ranking depende de formulários persistidos no banco, não só da flag de liberação.
- O refinamento de dados usa persistência local e remota; snapshots antigos com `length` como string já são normalizados pela aplicação.
- Admin regional revisa solicitações apenas do próprio estado ou cidade.
- A página inicial não expõe mais os atalhos antigos de `Aprimorar os dados` e `Avaliar infraestrutura`; o fluxo parte da página `/avaliacao`.

## Licença

Veja [LICENSE.md](LICENSE.md).
