export type RiskLevel = 'low' | 'medium' | 'high';

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

export interface AuditEvent {
  id: string;
  type: 'policy_created' | 'tool_payment' | 'simulation' | 'execution';
  createdAt: string;
  payload: Record<string, unknown>;
}
