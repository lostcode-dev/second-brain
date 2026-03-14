# Kortex

Kortex is a personal knowledge system built to capture, organize, and turn ideas into action. The product brings together focus routines, habits, scheduling, knowledge management, notifications, and account settings in a single application powered by Nuxt 4 + Supabase.

## Overview

- Frontend built with Nuxt 4, Vue 3, and TypeScript using `script setup`.
- UI based on `@nuxt/ui` and Tailwind CSS v4.
- Internal API under `server/api/**` with Nitro.
- Persistence and authentication handled through Supabase, always accessed server-side.
- Billing and customer portal powered by Stripe.
- PWA support configured with `@vite-pwa/nuxt`.
- Mobile packaging through Capacitor.

## Product Modules

- Daily dashboard with day overview, insights, and life areas.
- Calendar and events.
- Habits with visual sharing.
- Knowledge, ideas, journal, and capture flows.
- Feedback, notifications, and account settings.
- Billing, subscription management, and Supabase-backed administrative operations.

## Technical Stack

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

## Project Structure

```text
.
|- app/
|  |- components/       # domain UI and shared components
|  |- composables/      # client-side state and integrations
|  |- layouts/          # public, auth, docs, and app layouts
|  |- pages/            # marketing, docs, and authenticated app routes
|  `- types/            # frontend TypeScript contracts
|- content/             # docs, blog, changelog, and marketing content
|- public/              # icons, favicon, and public assets
|- server/
|  |- api/              # internal endpoints
|  `- utils/            # Supabase, auth, Stripe clients, and helper rules
|- scripts/             # utility scripts such as icon generation
|- supabase/
|  |- functions/        # edge functions
|  `- migrations/       # migrations SQL
`- capacitor.config.ts  # mobile configuration
```

## Requirements

- Node.js 20+
- pnpm 10+
- A configured Supabase project
- Stripe keys for subscription flows

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy the environment file:

```bash
cp .env.example .env
```

3. Fill in the required variables in `.env`.

4. Start the project:

```bash
pnpm dev
```

Local application: `http://localhost:3000`

## Environment Variables

The project reads configuration through `runtimeConfig` in `nuxt.config.ts`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NUXT_PUBLIC_SITE_URL` | recommended | Public URL used for generation and metadata |
| `SUPABASE_URL` | yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | yes | server-side anonymous auth and requests |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | server-side administrative operations |
| `STRIPE_SECRET_KEY` | yes for billing | Stripe integration |
| `STRIPE_ALLOWED_PRICE_IDS` | yes for billing | Comma-separated allowlist of accepted price IDs |
| `STRIPE_BILLING_PORTAL_CONFIGURATION_ID` | optional | Custom Stripe billing portal configuration |

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | starts the development environment |
| `pnpm build` | generates the production build |
| `pnpm preview` | opens a local preview of the build |
| `pnpm lint` | runs ESLint |
| `pnpm typecheck` | validates types with Nuxt TypeCheck |
| `pnpm generate:icons` | regenerates PWA icons and the favicon from the brand SVG |
| `pnpm cap:init` | initializes the Capacitor project |
| `pnpm cap:add:android` | adds the Android platform |
| `pnpm cap:add:ios` | adds the iOS platform |
| `pnpm cap:sync` | generates static output and syncs it with Capacitor |
| `pnpm cap:open:android` | opens the native Android project |
| `pnpm cap:open:ios` | opens the native iOS project |

## Data Flow And Architecture

- The client consumes only internal endpoints through `$fetch`, `useFetch`, or `useAsyncData`.
- Supabase integrations stay on the server, mainly under `server/api/**` and `server/utils/**`.
- Forms use `UForm` + Zod.
- Visual feedback for actions uses `useToast()`.
- Async loading states should use page-level or section-level skeletons.

## Important Conventions

- Do not call Supabase directly from the client.
- Prefer Nuxt UI components before building custom UI.
- Avoid local CSS when utility classes are sufficient.
- For large lists, use server-side filtering and pagination.
- Keep types explicit and avoid `any`.

## Database And Supabase

The repository includes migrations in `supabase/migrations` and functions in `supabase/functions`.

For new environments:

1. Create the project in Supabase.
2. Configure the variables in `.env`.
3. Apply the migrations using your Supabase CLI workflow.

## Billing

Subscription flows depend on:

- `STRIPE_SECRET_KEY`
- `STRIPE_ALLOWED_PRICE_IDS`
- `STRIPE_BILLING_PORTAL_CONFIGURATION_ID` when a custom portal configuration is used

Without these variables, the billing routes will not be operational.

## Mobile And PWA

- PWA manifest configured for standalone installation.
- Icons generated from `public/icons/kortex-icon.svg`.
- Capacitor configured in `capacitor.config.ts` with `appId` `com.kortex.app`.

## Quality

Before opening a PR or shipping changes:

```bash
pnpm lint
pnpm typecheck
```

## Internal References

- Public product documentation: `content/1.docs/**`
- Blog and changelog: `content/3.blog/**` and `content/4.changelog/**`
- Copilot contribution rules: `.github/copilot-instructions.md`

## Current State

The repository still preserves part of the original SaaS template structure, but the product itself is now oriented around the Kortex domain. The documentation above describes the real state of the project and the recommended development workflow.
