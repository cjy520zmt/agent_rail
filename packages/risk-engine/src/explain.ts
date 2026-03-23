import type { RiskReport } from '@agentrail/shared';

export function explainRisk(report: RiskReport) {
  switch (report.level) {
    case 'low':
      return 'Low risk: the request stays inside the active policy and can proceed automatically.';
    case 'medium':
      return `Medium risk: ${report.reasons.join(' ')}`;
    case 'high':
      return `High risk: ${report.reasons.join(' ')}`;
    default:
      return 'Unknown risk state.';
  }
}
