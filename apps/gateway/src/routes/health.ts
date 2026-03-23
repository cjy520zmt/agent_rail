import { Hono } from 'hono';
import { config } from '../lib/config.js';

export const healthRoute = new Hono().get('/', (c) => {
  return c.json({
    ok: true,
    service: 'agentrail-gateway',
    network: config.SOLANA_NETWORK,
    x402Enabled: config.X402_ENABLED
  });
});
