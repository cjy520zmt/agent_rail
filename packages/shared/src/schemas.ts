import { z } from 'zod';

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
