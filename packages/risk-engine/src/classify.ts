import type { ExecutionRequest, Policy, RiskLevel, RiskReport } from '@agentrail/shared';

export function classifyExecution(request: ExecutionRequest, policy?: Policy): RiskReport {
  const reasons: string[] = [];
  let level: RiskLevel = 'low';

  if (!policy) {
    level = 'medium';
    reasons.push('No policy was attached to this execution request.');
  } else {
    if (request.amountUsd > policy.perTxLimitUsd) {
      level = 'high';
      reasons.push('The requested amount exceeds the policy per-transaction limit.');
    } else if (request.amountUsd > policy.perTxLimitUsd * 0.5) {
      level = 'medium';
      reasons.push('The requested amount is unusually high relative to the policy limit.');
    }

    if (policy.allowedTokens.length > 0 && !policy.allowedTokens.includes(request.token)) {
      level = 'high';
      reasons.push('The requested token is not allowlisted by the policy.');
    }

    if (policy.allowedPrograms.length > 0 && !policy.allowedPrograms.includes(request.program)) {
      level = 'high';
      reasons.push('The target program is not allowlisted by the policy.');
    }

    if (policy.allowedRecipients.length > 0 && !policy.allowedRecipients.includes(request.recipient)) {
      level = 'high';
      reasons.push('The recipient is not allowlisted by the policy.');
    }
  }

  if (request.requiresHumanApproval && level === 'low') {
    level = 'medium';
    reasons.push('The request was explicitly marked for human approval.');
  }

  if (reasons.length === 0) {
    reasons.push('The request is within the current policy boundary.');
  }

  return {
    level,
    reasons,
    canAutoExecute: level === 'low',
    preview: {
      amountUsd: request.amountUsd,
      token: request.token,
      program: request.program,
      recipient: request.recipient
    }
  };
}
