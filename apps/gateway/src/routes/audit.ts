import { Hono } from 'hono';
import { listAuditEvents } from '../lib/audit-store.js';

export const auditRoute = new Hono().get('/', (c) => {
  const limit = Number(c.req.query('limit') ?? 25);

  return c.json({
    items: listAuditEvents(Number.isFinite(limit) ? limit : 25)
  });
});
