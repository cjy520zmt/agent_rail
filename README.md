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
pnpm install
pnpm dev
```

By default:

- web runs at `http://localhost:3000`
- gateway runs at `http://localhost:3001`
- Solana targets `devnet`

## Hackathon scope

The MVP focuses on one path:

1. create a constrained agent policy
2. submit an execution request
3. run risk checks before execution
4. return a human-readable decision and audit trail

## Why this structure?

The monorepo is intentionally split into apps, reusable packages, and an onchain program so the project can scale beyond a demo without becoming messy.
