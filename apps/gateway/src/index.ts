import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { config } from './lib/config.js';
import { healthRoute } from './routes/health.js';
import { policiesRoute } from './routes/policies.js';
import { executeRoute } from './routes/execute.js';

const app = new Hono();

app.get('/', (c) =>
  c.json({
    name: 'agentrail-gateway',
    status: 'ready',
    endpoints: ['/health', '/policies', '/execute']
  })
);

app.route('/health', healthRoute);
app.route('/policies', policiesRoute);
app.route('/execute', executeRoute);

serve(
  {
    fetch: app.fetch,
    port: config.GATEWAY_PORT
  },
  (info) => {
    console.log(`AgentRail gateway listening on http://localhost:${info.port}`);
  }
);
