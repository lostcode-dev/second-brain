# Kortex

Kortex e um sistema pessoal de conhecimento para capturar, organizar e transformar ideias em acao. O produto concentra rotinas de foco, habitos, agenda, conhecimento, notificacoes e configuracoes em uma unica aplicacao baseada em Nuxt 4 + Supabase.

## Visao Geral

- Frontend em Nuxt 4, Vue 3 e TypeScript com `script setup`.
- UI baseada em `@nuxt/ui` e Tailwind CSS v4.
- API interna em `server/api/**` com Nitro.
- Persistencia e autenticacao via Supabase, sempre acessados server-side.
- Billing e portal do cliente via Stripe.
- PWA configurado com `@vite-pwa/nuxt`.
- Empacotamento mobile com Capacitor.

## Modulos Do Produto

- Dashboard diario com panorama do dia, insights e areas da vida.
- Agenda e eventos.
- Habitos com compartilhamento visual.
- Conhecimento, ideias, journal e fluxos de captura.
- Feedback, notificacoes e configuracoes da conta.
- Billing, assinatura e operacoes administrativas ligadas ao Supabase.

## Stack Tecnica

- Nuxt 4
- Vue 3
- TypeScript
- @nuxt/ui
- Tailwind CSS v4
- Nuxt Content
- Supabase
- Stripe
- Capacitor
- Zod

## Estrutura Do Projeto

```text
.
|- app/
|  |- components/       # UI por dominio e componentes compartilhados
|  |- composables/      # estado e integracoes do cliente
|  |- layouts/          # layouts publico, auth, docs e app
|  |- pages/            # rotas do marketing, docs e app autenticado
|  `- types/            # contratos TypeScript do frontend
|- content/             # docs, blog, changelog e conteudo de marketing
|- public/              # icones, favicon e assets publicos
|- server/
|  |- api/              # endpoints internos
|  `- utils/            # clientes Supabase, auth, Stripe e regras auxiliares
|- scripts/             # scripts utilitarios, como geracao de icones
|- supabase/
|  |- functions/        # edge functions
|  `- migrations/       # migrations SQL
`- capacitor.config.ts  # configuracao mobile
```

## Requisitos

- Node.js 20+
- pnpm 10+
- Projeto Supabase configurado
- Chaves do Stripe para fluxos de assinatura

## Setup Local

1. Instale as dependencias:

```bash
pnpm install
```

2. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

3. Preencha as variaveis obrigatorias no `.env`.

4. Inicie o projeto:

```bash
pnpm dev
```

Aplicacao local: `http://localhost:3000`

## Variaveis De Ambiente

O projeto le configuracoes via `runtimeConfig` em `nuxt.config.ts`.

| Variavel | Obrigatoria | Uso |
| --- | --- | --- |
| `NUXT_PUBLIC_SITE_URL` | recomendada | URL publica usada em geracao e metadados |
| `SUPABASE_URL` | sim | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | sim | autenticacao e chamadas anonimas server-side |
| `SUPABASE_SERVICE_ROLE_KEY` | sim | operacoes administrativas server-side |
| `STRIPE_SECRET_KEY` | sim para billing | integracao com Stripe |
| `STRIPE_ALLOWED_PRICE_IDS` | sim para billing | allowlist de precos aceitos, separados por virgula |
| `STRIPE_BILLING_PORTAL_CONFIGURATION_ID` | opcional | configuracao customizada do portal Stripe |

## Scripts

| Comando | Descricao |
| --- | --- |
| `pnpm dev` | sobe o ambiente de desenvolvimento |
| `pnpm build` | gera build de producao |
| `pnpm preview` | abre preview local do build |
| `pnpm lint` | roda o ESLint |
| `pnpm typecheck` | valida tipos com Nuxt TypeCheck |
| `pnpm generate:icons` | regenera icones PWA e favicon a partir do SVG da marca |
| `pnpm cap:init` | inicializa o projeto Capacitor |
| `pnpm cap:add:android` | adiciona plataforma Android |
| `pnpm cap:add:ios` | adiciona plataforma iOS |
| `pnpm cap:sync` | gera output estatico e sincroniza com Capacitor |
| `pnpm cap:open:android` | abre o projeto Android nativo |
| `pnpm cap:open:ios` | abre o projeto iOS nativo |

## Fluxo De Dados E Arquitetura

- O client consome apenas endpoints internos via `$fetch`, `useFetch` ou `useAsyncData`.
- Integracoes com Supabase ficam no servidor, principalmente em `server/api/**` e `server/utils/**`.
- Formularios usam `UForm` + Zod.
- Feedback visual de acoes usa `useToast()`.
- Carregamentos assicronos devem usar skeletons de pagina ou de secao.

## Convencoes Importantes

- Nao chamar Supabase diretamente no client.
- Preferir componentes do Nuxt UI antes de UI customizada.
- Evitar CSS local quando classes utilitarias forem suficientes.
- Para listas grandes, usar filtros e paginacao server-side.
- Manter tipos explicitos e evitar `any`.

## Banco E Supabase

O repositorio inclui migrations em `supabase/migrations` e funcoes em `supabase/functions`.

Para ambientes novos:

1. Crie o projeto no Supabase.
2. Configure as variaveis em `.env`.
3. Aplique as migrations com a sua rotina do Supabase CLI.

## Billing

Os fluxos de assinatura dependem de:

- `STRIPE_SECRET_KEY`
- `STRIPE_ALLOWED_PRICE_IDS`
- `STRIPE_BILLING_PORTAL_CONFIGURATION_ID` quando houver configuracao customizada do portal

Sem essas variaveis, as rotas de billing nao ficam operacionais.

## Mobile E PWA

- Manifest PWA configurado para instalacao standalone.
- Icones gerados a partir de `public/icons/kortex-icon.svg`.
- Capacitor configurado em `capacitor.config.ts` com `appId` `com.kortex.app`.

## Qualidade

Antes de abrir PR ou publicar alteracoes:

```bash
pnpm lint
pnpm typecheck
```

## Referencias Internas

- Documentacao publica do produto: `content/1.docs/**`
- Blog e changelog: `content/3.blog/**` e `content/4.changelog/**`
- Regras de contribuicao para Copilot: `.github/copilot-instructions.md`

## Estado Atual

O repositorio ainda preserva parte da estrutura original do template SaaS, mas o produto em si ja esta orientado ao dominio do Kortex. A documentacao acima descreve o estado real do projeto e o fluxo recomendado para desenvolvimento.
