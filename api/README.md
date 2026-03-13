# Second Brain — API

API backend standalone (Express + TypeScript) com cron jobs internos via `node-cron`, integrada ao Supabase. Roda como processo persistente — os cron jobs executam dentro do próprio processo, sem depender de serviços externos.

## Stack

- **Runtime**: Node.js 20+
- **Framework**: Express 5
- **Linguagem**: TypeScript (strict)
- **Banco**: Supabase (via service role key, server-side only)
- **Cron**: node-cron (in-process, timezone-aware)
- **Validação**: Zod
- **Lint/Format**: ESLint 9 + Prettier

## Estrutura

```
src/
├── config/        # Validação de env com Zod
├── controllers/   # Handlers das rotas HTTP
├── jobs/          # Cron jobs (scheduler + job functions)
│   ├── scheduler.ts       # Registra e inicia todos os cron jobs
│   └── close-day.job.ts   # Job de fechamento do dia (com lock guard)
├── lib/           # Clients externos (Supabase)
├── middlewares/    # Error handler, request logger
├── repositories/  # Acesso a dados (Supabase queries)
├── routes/        # Definição das rotas Express
├── services/      # Lógica de negócio
├── types/         # Interfaces e enums
├── utils/         # Utilitários (datas, logger)
├── app.ts         # Setup do Express
└── server.ts      # Entrypoint (inicia Express + scheduler)
```

## Setup

```bash
cd api
cp .env.example .env   # preencha as variáveis
pnpm install
pnpm dev               # tsx watch mode (cron jobs ativos)
```

## Variáveis de ambiente

| Variável                    | Descrição                                      | Default         |
| --------------------------- | ---------------------------------------------- | --------------- |
| `PORT`                      | Porta do servidor                              | `4000`          |
| `NODE_ENV`                  | `development` \| `production` \| `test`        | `development`   |
| `SUPABASE_URL`              | URL do projeto Supabase                        |                 |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (nunca expor no client)        |                 |
| `TZ`                        | Timezone IANA para os cron jobs                 | `Europe/Lisbon` |
| `CRON_CLOSE_DAY_SCHEDULE`   | Expressão cron para o job de fechamento do dia  | `55 23 * * *`   |

## Cron Jobs

### close-day

Roda diariamente às 23:55 (configurável via `CRON_CLOSE_DAY_SCHEDULE`) no timezone definido em `TZ`.

**O que faz:**
- Processa o dia anterior + os últimos 7 dias (backfill automático)
- Para cada dia, busca hábitos que estavam ativos naquela data (via `habit_versions`)
- Filtra hábitos arquivados antes da data
- Verifica quais hábitos não têm log registrado
- Insere log com `status: skipped` e `completed: false` para os que ficaram sem registro
- Idempotente: usa `upsert` com `onConflict: habit_id,log_date` — nunca sobrescreve logs existentes
- Lock guard: se o job anterior ainda está rodando, a nova execução é ignorada

**Backfill automático:** Cada execução processa os últimos 7 dias por padrão, garantindo que dias perdidos (reinício do servidor, deploy, etc.) sejam cobertos automaticamente.

## Endpoints HTTP

### Health

```
GET /api/health
```

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

## Deploy em produção com PM2

### Instalação

```bash
npm install -g pm2
```

### Configuração (ecosystem.config.cjs)

Crie na raiz de `api/`:

```js
module.exports = {
  apps: [{
    name: 'second-brain-api',
    script: 'dist/server.js',
    instances: 1,            // ⚠️ IMPORTANTE: apenas 1 instância
    exec_mode: 'fork',       // fork, NÃO cluster
    env: {
      NODE_ENV: 'production',
    },
    // Logs
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    merge_logs: true,
    // Restart automático
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000,
  }]
}
```

### Comandos

```bash
# Build primeiro
pnpm build

# Iniciar
pm2 start ecosystem.config.cjs

# Ver status
pm2 status

# Ver logs
pm2 logs second-brain-api

# Restart
pm2 restart second-brain-api

# Parar
pm2 stop second-brain-api

# Salvar configuração para iniciar no boot do sistema
pm2 save
pm2 startup
```

### Cuidados importantes

1. **Apenas 1 instância**: Nunca use `instances: 2+` ou `exec_mode: 'cluster'` — isso criaria múltiplos cron jobs rodando em paralelo, duplicando os logs de skip.

2. **Cron jobs iniciam automaticamente**: O scheduler é registrado no `server.ts` assim que o servidor liga. Não precisa de configuração extra.

3. **Graceful shutdown**: O servidor escuta `SIGTERM` e `SIGINT` para parar os cron jobs antes de encerrar. O PM2 envia `SIGTERM` automaticamente ao parar/reiniciar.

4. **Idempotência garante segurança**: Mesmo se o processo reiniciar no meio de uma execução, na próxima rodada o job reprocessa os mesmos dias sem duplicar dados (graças ao `upsert` com `onConflict`).

5. **Backfill automático**: Se o servidor ficar offline por alguns dias, ao reiniciar o job automaticamente cobre os últimos 7 dias. Para gaps maiores, aumente `BACKFILL_DAYS` na service.
