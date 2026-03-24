import { z } from 'zod';

const PublicKeySchema = z
  .string()
  .min(32)
  .max(44)
  .regex(/^[1-9A-HJ-NP-Za-km-z]+$/, 'Expected a base58 Solana public key.');

export const PolicyInputSchema = z.object({
  name: z.string().min(1),
  dailyLimitUsd: z.number().nonnegative(),
  perTxLimitUsd: z.number().nonnegative(),
  allowedTokens: z.array(z.string()).default([]),
  allowedPrograms: z.array(z.string()).default([]),
  allowedRecipients: z.array(z.string()).default([])
});

export const PolicySchema = PolicyInputSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime()
});

export const ExecutionRequestSchema = z.object({
  policyId: z.string().uuid().optional(),
  action: z.string().min(1),
  amountUsd: z.number().nonnegative(),
  token: z.string().min(1),
  program: z.string().min(1),
  recipient: z.string().min(1),
  requiresHumanApproval: z.boolean().optional().default(false)
});

export const RiskReportSchema = z.object({
  level: z.enum(['low', 'medium', 'high']),
  reasons: z.array(z.string()),
  canAutoExecute: z.boolean(),
  preview: z.object({
    amountUsd: z.number(),
    token: z.string(),
    program: z.string(),
    recipient: z.string()
  })
});

export const VaultPlanRequestSchema = z.object({
  policyId: z.string().uuid(),
  authority: PublicKeySchema
});

export const VaultPlanSchema = z.object({
  policyId: z.string().uuid(),
  policyName: z.string().min(1),
  authority: PublicKeySchema,
  network: z.string().min(1),
  rpcUrl: z.string().url(),
  programId: PublicKeySchema,
  vaultPda: PublicKeySchema,
  policyHash: z.string().regex(/^[a-f0-9]{64}$/i),
  limitUnit: z.literal('usd_cents'),
  warnings: z.array(z.string()),
  instruction: z.object({
    name: z.literal('initialize_vault'),
    accounts: z.object({
      authority: PublicKeySchema,
      vault: PublicKeySchema,
      systemProgram: PublicKeySchema
    }),
    args: z.object({
      policyHash: z.string().regex(/^[a-f0-9]{64}$/i),
      dailyLimit: z.number().int().nonnegative(),
      perTxLimit: z.number().int().nonnegative(),
      limitUnit: z.literal('usd_cents')
    })
  })
});
