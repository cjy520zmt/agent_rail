import { createHash } from 'node:crypto';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import type { Policy, VaultPlan } from '@agentrail/shared';
import { config } from './config.js';

const PLACEHOLDER_PROGRAM_ID = '11111111111111111111111111111111';
const LIMIT_UNIT = 'usd_cents' as const;

function normalizeList(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function toUsdCents(value: number, fieldName: string, warnings: string[]) {
  const scaled = value * 100;
  const rounded = Math.round(scaled);

  if (Math.abs(rounded - scaled) > 1e-9) {
    warnings.push(`${fieldName} was rounded to the nearest cent for onchain encoding.`);
  }

  return rounded;
}

export function hashPolicy(policy: Policy) {
  const canonicalPolicy = JSON.stringify({
    name: policy.name.trim(),
    dailyLimitUsd: policy.dailyLimitUsd,
    perTxLimitUsd: policy.perTxLimitUsd,
    allowedTokens: normalizeList(policy.allowedTokens),
    allowedPrograms: normalizeList(policy.allowedPrograms),
    allowedRecipients: normalizeList(policy.allowedRecipients)
  });

  return createHash('sha256').update(canonicalPolicy).digest('hex');
}

export function buildVaultPlan(policy: Policy, authority: string): VaultPlan {
  const warnings = ['This preview encodes policy limits as USD cents for the MVP vault program.'];
  const authorityKey = new PublicKey(authority);
  const programId = new PublicKey(config.AGENT_VAULT_PROGRAM_ID);
  const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from('vault'), authorityKey.toBuffer()], programId);

  if (config.AGENT_VAULT_PROGRAM_ID === PLACEHOLDER_PROGRAM_ID) {
    warnings.unshift(
      'AGENT_VAULT_PROGRAM_ID is still the placeholder system address. Deploy the program and set the env var before submitting this instruction on devnet.'
    );
  }

  const dailyLimit = toUsdCents(policy.dailyLimitUsd, 'dailyLimitUsd', warnings);
  const perTxLimit = toUsdCents(policy.perTxLimitUsd, 'perTxLimitUsd', warnings);
  const policyHash = hashPolicy(policy);

  return {
    policyId: policy.id,
    policyName: policy.name,
    authority: authorityKey.toBase58(),
    network: config.SOLANA_NETWORK,
    rpcUrl: config.SOLANA_RPC_URL,
    programId: programId.toBase58(),
    vaultPda: vaultPda.toBase58(),
    policyHash,
    limitUnit: LIMIT_UNIT,
    warnings,
    instruction: {
      name: 'initialize_vault',
      accounts: {
        authority: authorityKey.toBase58(),
        vault: vaultPda.toBase58(),
        systemProgram: SystemProgram.programId.toBase58()
      },
      args: {
        policyHash,
        dailyLimit,
        perTxLimit,
        limitUnit: LIMIT_UNIT
      }
    }
  };
}
