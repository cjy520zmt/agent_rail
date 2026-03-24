# AgentRail

AgentRail is a payments, permissions, and safe-execution layer for AI agents on Solana.

## What is in this repo?

- `apps/web` — a lightweight Next.js dashboard for vaults, policies, and execution logs
- `apps/gateway` — a Hono API for policies, execution requests, and risk evaluation
- `packages/shared` — shared types and Zod schemas
- `packages/sdk` — a TypeScript client for apps and agents
- `packages/risk-engine` — risk classification and explanation logic
- `programs/agent-vault` — a minimal Anchor program for vault initialization and policy binding
- `docs/product-brief.md` — the one-page PRD / product brief

## Quick start

```bash
corepack pnpm install
corepack pnpm dev
```

By default:

- web runs at `http://localhost:3000`
- gateway runs at `http://localhost:3001`
- Solana targets `devnet`
- `AGENT_VAULT_PROGRAM_ID` falls back to the placeholder system address until you deploy the Anchor program

Gateway API includes:

- `GET /health`
- `GET/POST /policies`
- `POST /execute`
- `GET /audit`
- `POST /vault-plan` (derive vault PDA + initialize_vault preview)

## Demo flow

1. Open the dashboard in `apps/web`
2. Create a policy with budget and allowlists
3. Submit an execution request for review
4. Inspect the risk level, next action, and audit timeline returned by the gateway
5. Generate a devnet `initialize_vault` preview by entering an authority wallet and verify the derived PDA + policy hash

## Hackathon scope

The MVP focuses on one path:

1. create a constrained agent policy
2. submit an execution request
3. run risk checks before execution
4. return a human-readable decision and audit trail

## Why this structure?

The monorepo is intentionally split into apps, reusable packages, and an onchain program so the project can scale beyond a demo without becoming messy.
