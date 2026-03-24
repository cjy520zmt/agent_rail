import type { AuditEvent, ExecutionRequest, Policy, VaultPlan, VaultPlanRequest } from '@agentrail/shared';

export interface AgentRailClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
}

export class AgentRailClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: AgentRailClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async health() {
    const response = await this.fetchImpl(`${this.baseUrl}/health`);
    return response.json();
  }

  async listPolicies() {
    const response = await this.fetchImpl(`${this.baseUrl}/policies`);
    return response.json() as Promise<{ items: Policy[] }>;
  }

  async createPolicy(input: Omit<Policy, 'id' | 'createdAt'>) {
    const response = await this.fetchImpl(`${this.baseUrl}/policies`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input)
    });

    return response.json() as Promise<Policy>;
  }

  async execute(input: ExecutionRequest) {
    const response = await this.fetchImpl(`${this.baseUrl}/execute`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input)
    });

    return response.json();
  }

  async listAudit(limit = 25) {
    const response = await this.fetchImpl(`${this.baseUrl}/audit?limit=${limit}`);
    return response.json() as Promise<{ items: AuditEvent[] }>;
  }

  async createVaultPlan(input: VaultPlanRequest) {
    const response = await this.fetchImpl(`${this.baseUrl}/vault-plan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input)
    });

    return response.json() as Promise<VaultPlan>;
  }
}
