# Second Brain — API

API utilitária standalone (Express + TypeScript) para cron jobs, webhooks e tarefas assíncronas do Second Brain.

## Stack

- **Runtime**: Node.js 20+
- **Framework**: Express 5
- **Linguagem**: TypeScript (strict)
- **Banco**: Supabase (via service role key, server-side only)
- **Validação**: Zod
- **Lint/Format**: ESLint 9 + Prettier

## Estrutura

```
src/
├── config/        # Validação de env com Zod
├── controllers/   # Handlers das rotas
├── lib/           # Clients externos (Supabase)
├── middlewares/    # Auth, error handler, logger
├── repositories/  # Acesso a dados (Supabase queries)
├── routes/        # Definição das rotas Express
├── services/      # Lógica de negócio
├── types/         # Interfaces e enums
├── utils/         # Utilitários (datas, logger)
├── app.ts         # Setup do Express
└── server.ts      # Entrypoint
```

## Setup

```bash
cd api
cp .env.example .env   # preencha as variáveis
pnpm install
pnpm dev               # tsx watch mode
```

## Variáveis de ambiente

| Variável                    | Descrição                              |
| --------------------------- | -------------------------------------- |
| `PORT`                      | Porta do servidor (default: 3001)      |
| `NODE_ENV`                  | `development` \| `production`          |
| `SUPABASE_URL`              | URL do projeto Supabase                |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (nunca expor no client)|
| `CRON_SECRET`               | Token de autenticação para cron jobs   |

## Endpoints

### Health

```
GET /api/health
```

### Jobs (protegidos por `Authorization: Bearer <CRON_SECRET>`)

```
POST /api/jobs/close-day
POST /api/jobs/close-day?date=2025-01-13
POST /api/jobs/close-day?date=2025-01-13&from=2025-01-10
```

Marca hábitos sem log como **skipped** para a(s) data(s) especificada(s).
Por padrão processa o dia anterior (ontem).

### Webhooks

```
POST /api/webhooks/example
```

Endpoint de exemplo para receber payloads externos.

## Scripts

| Comando          | Descrição                        |
| ---------------- | -------------------------------- |
| `pnpm dev`       | Dev server com hot reload (tsx)  |
| `pnpm build`     | Compila para `dist/`             |
| `pnpm start`     | Roda build de produção           |
| `pnpm lint`      | ESLint                           |
| `pnpm lint:fix`  | ESLint com auto-fix              |
| `pnpm format`    | Prettier                         |

## Deploy

Esta API pode ser hospedada como um serviço separado (Railway, Render, Fly.io, VPS, etc.) ou como serverless functions. O endpoint `/api/jobs/close-day` pode ser chamado por um cron externo (Vercel Cron, GitHub Actions, cron-job.org, etc.) com o header `Authorization: Bearer <CRON_SECRET>`.
