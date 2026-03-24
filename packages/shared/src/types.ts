export type RiskLevel = 'low' | 'medium' | 'high';

export type AuditEventType =
  | 'policy_created'
  | 'tool_payment'
  | 'simulation'
  | 'execution'
  | 'vault_plan_generated';

export interface Policy {
  id: string;
  name: string;
  dailyLimitUsd: number;
  perTxLimitUsd: number;
  allowedTokens: string[];
  allowedPrograms: string[];
  allowedRecipients: string[];
  createdAt: string;
}

export interface ExecutionRequest {
  policyId?: string;
  action: string;
  amountUsd: number;
  token: string;
  program: string;
  recipient: string;
  requiresHumanApproval?: boolean;
}

export interface RiskReport {
  level: RiskLevel;
  reasons: string[];
  canAutoExecute: boolean;
  preview: {
    amountUsd: number;
    token: string;
    program: string;
    recipient: string;
  };
}

export interface VaultPlanRequest {
  policyId: string;
  authority: string;
}

export interface VaultPlan {
  policyId: string;
  policyName: string;
  authority: string;
  network: string;
  rpcUrl: string;
  programId: string;
  vaultPda: string;
  policyHash: string;
  limitUnit: 'usd_cents';
  warnings: string[];
  instruction: {
    name: 'initialize_vault';
    accounts: {
      authority: string;
      vault: string;
      systemProgram: string;
    };
    args: {
      policyHash: string;
      dailyLimit: number;
      perTxLimit: number;
      limitUnit: 'usd_cents';
    };
  };
}

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  createdAt: string;
  payload: Record<string, unknown>;
}
