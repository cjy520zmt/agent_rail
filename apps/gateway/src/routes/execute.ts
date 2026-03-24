import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import { classifyExecution, explainRisk } from '@agentrail/risk-engine';
import { ExecutionRequestSchema } from '@agentrail/shared';
import { recordAuditEvent } from '../lib/audit-store.js';
import { getPolicy } from './policies.js';

export const executeRoute = new Hono().post('/', async (c) => {
  const body = await c.req.json();
  const request = ExecutionRequestSchema.parse(body);
  const policy = getPolicy(request.policyId);
  const report = classifyExecution(request, policy);
  const summary = explainRisk(report);
  const nextAction = report.canAutoExecute
    ? 'auto_execute'
    : report.level === 'medium'
      ? 'require_human_approval'
      : 'block';

  const simulationEvent = recordAuditEvent('simulation', {
    policyId: request.policyId ?? null,
    action: request.action,
    preview: report.preview,
    level: report.level,
    reasons: report.reasons
  });

  const executionEvent = recordAuditEvent('execution', {
    policyId: request.policyId ?? null,
    action: request.action,
    nextAction,
    canAutoExecute: report.canAutoExecute,
    recipient: request.recipient,
    amountUsd: request.amountUsd
  });

  return c.json({
    requestId: randomUUID(),
    request,
    policy,
    report,
    summary,
    nextAction,
    auditEvents: [simulationEvent, executionEvent]
  });
});
