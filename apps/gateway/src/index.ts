import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { config } from './lib/config.js';
import { auditRoute } from './routes/audit.js';
import { healthRoute } from './routes/health.js';
import { policiesRoute } from './routes/policies.js';
import { executeRoute } from './routes/execute.js';

const app = new Hono();

app.use('*', cors());

app.get('/', (c) =>
  c.json({
    name: 'agentrail-gateway',
    status: 'ready',
    endpoints: ['/health', '/policies', '/execute', '/audit']
  })
);

app.route('/health', healthRoute);
app.route('/policies', policiesRoute);
app.route('/execute', executeRoute);
app.route('/audit', auditRoute);

serve(
  {
    fetch: app.fetch,
    port: config.GATEWAY_PORT
  },
  (info) => {
    console.log(`AgentRail gateway listening on http://localhost:${info.port}`);
  }
);
