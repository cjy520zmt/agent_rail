import 'dotenv/config';
import { z } from 'zod';

const ConfigSchema = z.object({
  GATEWAY_PORT: z.coerce.number().default(3001),
  SOLANA_NETWORK: z.string().default('devnet'),
  SOLANA_RPC_URL: z.string().url().default('https://api.devnet.solana.com'),
  X402_ENABLED: z
    .string()
    .optional()
    .transform((value) => value === 'true')
    .default(false)
});

export const config = ConfigSchema.parse(process.env);
