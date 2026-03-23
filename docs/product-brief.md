# AgentRail Product Brief

## One-line positioning

AgentRail is a payments, permissions, and safe-execution layer for AI agents on Solana.

## Problem

Many AI agents can plan tasks, but the moment real payments, tool calls, and onchain execution show up, they lack budget control, permission boundaries, risk checks, and auditability.

## Target users

1. AI agent developers
2. MCP / API tool providers
3. Solana teams that want agents to automate onchain operations

## MVP

- Policy Vault: constrained wallet rules such as daily limit, per-transaction limit, allowlisted tokens, programs, and recipients
- Paid Tool Gateway: a backend path for pay-per-use tool calls, with x402 compatibility in mind
- Simulation + Risk Engine: classify requests before execution
- Approval Engine: low-risk auto-approve, medium-risk require confirmation, high-risk block
- Audit Timeline: record tool usage, risk reports, and execution attempts

## Demo story

A user creates an agent vault, assigns rules, and submits a request. The system evaluates the request, explains the risk, and decides whether the agent can safely continue.

## Success criteria

1. one full request flow runs end to end
2. one devnet-ready transaction path is modeled
3. risk explanations are understandable to humans
4. an audit trail can replay what happened
