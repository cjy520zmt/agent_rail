import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import { PolicyInputSchema, type Policy } from '@agentrail/shared';

const policies = new Map<string, Policy>();

export const policiesRoute = new Hono()
  .get('/', (c) => {
    return c.json({ items: [...policies.values()] });
  })
  .post('/', async (c) => {
    const body = await c.req.json();
    const input = PolicyInputSchema.parse(body);

    const policy: Policy = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...input
    };

    policies.set(policy.id, policy);

    return c.json(policy, 201);
  });

export function getPolicy(policyId: string | undefined) {
  if (!policyId) return undefined;
  return policies.get(policyId);
}
