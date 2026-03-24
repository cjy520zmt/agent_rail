import { Hono } from 'hono';
import { VaultPlanRequestSchema, VaultPlanSchema } from '@agentrail/shared';
import { recordAuditEvent } from '../lib/audit-store.js';
import { buildVaultPlan } from '../lib/vault-plan.js';
import { getPolicy } from './policies.js';

export const vaultPlanRoute = new Hono().post('/', async (c) => {
  const body = await c.req.json();
  const input = VaultPlanRequestSchema.parse(body);
  const policy = getPolicy(input.policyId);

  if (!policy) {
    return c.json({ message: `Policy ${input.policyId} was not found.` }, 404);
  }

  try {
    const plan = VaultPlanSchema.parse(buildVaultPlan(policy, input.authority));

    recordAuditEvent('vault_plan_generated', {
      policyId: plan.policyId,
      authority: plan.authority,
      vaultPda: plan.vaultPda,
      programId: plan.programId,
      network: plan.network
    });

    return c.json(plan);
  } catch (cause) {
    return c.json(
      {
        message: cause instanceof Error ? cause.message : 'Failed to build vault plan.'
      },
      400
    );
  }
});
