import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import { classifyExecution, explainRisk } from '@agentrail/risk-engine';
import { ExecutionRequestSchema } from '@agentrail/shared';
import { getPolicy } from './policies.js';

export const executeRoute = new Hono().post('/', async (c) => {
  const body = await c.req.json();
  const request = ExecutionRequestSchema.parse(body);
  const policy = getPolicy(request.policyId);
  const report = classifyExecution(request, policy);

  return c.json({
    requestId: randomUUID(),
    request,
    policy,
    report,
    summary: explainRisk(report),
    nextAction: report.canAutoExecute ? 'auto_execute' : report.level === 'medium' ? 'require_human_approval' : 'block'
  });
});
