import { randomUUID } from 'node:crypto';
import type { AuditEvent } from '@agentrail/shared';

const MAX_AUDIT_EVENTS = 100;
const auditEvents: AuditEvent[] = [];

export function recordAuditEvent(type: AuditEvent['type'], payload: AuditEvent['payload']) {
  const event: AuditEvent = {
    id: randomUUID(),
    type,
    createdAt: new Date().toISOString(),
    payload
  };

  auditEvents.unshift(event);

  if (auditEvents.length > MAX_AUDIT_EVENTS) {
    auditEvents.length = MAX_AUDIT_EVENTS;
  }

  return event;
}

export function listAuditEvents(limit = 25) {
  return auditEvents.slice(0, Math.max(1, limit));
}
