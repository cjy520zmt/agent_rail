'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';

type Policy = {
  id: string;
  name: string;
  dailyLimitUsd: number;
  perTxLimitUsd: number;
  allowedTokens: string[];
  allowedPrograms: string[];
  allowedRecipients: string[];
  createdAt: string;
};

type AuditEvent = {
  id: string;
  type: 'policy_created' | 'tool_payment' | 'simulation' | 'execution';
  createdAt: string;
  payload: Record<string, unknown>;
};

type ExecutionResult = {
  requestId: string;
  summary: string;
  nextAction: 'auto_execute' | 'require_human_approval' | 'block';
  report: {
    level: 'low' | 'medium' | 'high';
    reasons: string[];
    canAutoExecute: boolean;
    preview: {
      amountUsd: number;
      token: string;
      program: string;
      recipient: string;
    };
  };
};

type PolicyFormState = {
  name: string;
  dailyLimitUsd: string;
  perTxLimitUsd: string;
  allowedTokens: string;
  allowedPrograms: string;
  allowedRecipients: string;
};

type ExecutionFormState = {
  policyId: string;
  action: string;
  amountUsd: string;
  token: string;
  program: string;
  recipient: string;
  requiresHumanApproval: boolean;
};

const defaultPolicyForm: PolicyFormState = {
  name: 'Demo agent policy',
  dailyLimitUsd: '150',
  perTxLimitUsd: '40',
  allowedTokens: 'USDC',
  allowedPrograms: 'x402-demo-program',
  allowedRecipients: 'merchant-demo-wallet'
};

const defaultExecutionForm: ExecutionFormState = {
  policyId: '',
  action: 'pay_for_tool_call',
  amountUsd: '12',
  token: 'USDC',
  program: 'x402-demo-program',
  recipient: 'merchant-demo-wallet',
  requiresHumanApproval: false
};

const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3001';

function parseList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function readJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${gatewayUrl}${path}`, init);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export default function HomePage() {
  const [policyForm, setPolicyForm] = useState<PolicyFormState>(defaultPolicyForm);
  const [executionForm, setExecutionForm] = useState<ExecutionFormState>(defaultExecutionForm);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isCreatingPolicy, setIsCreatingPolicy] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPolicy = useMemo(
    () => policies.find((policy) => policy.id === executionForm.policyId),
    [policies, executionForm.policyId]
  );

  async function refreshPolicies() {
    const data = await readJson<{ items: Policy[] }>('/policies');
    setPolicies(data.items);

    if (data.items.length > 0) {
      setExecutionForm((current) => ({
        ...current,
        policyId: current.policyId || data.items[0].id
      }));
    }
  }

  async function refreshAudit() {
    const data = await readJson<{ items: AuditEvent[] }>('/audit?limit=20');
    setAuditEvents(data.items);
  }

  useEffect(() => {
    void Promise.all([refreshPolicies(), refreshAudit()]).catch((cause) => {
      setError(cause instanceof Error ? cause.message : 'Failed to load dashboard data.');
    });
  }, []);

  async function handleCreatePolicy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsCreatingPolicy(true);

    try {
      const created = await readJson<Policy>('/policies', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: policyForm.name,
          dailyLimitUsd: Number(policyForm.dailyLimitUsd),
          perTxLimitUsd: Number(policyForm.perTxLimitUsd),
          allowedTokens: parseList(policyForm.allowedTokens),
          allowedPrograms: parseList(policyForm.allowedPrograms),
          allowedRecipients: parseList(policyForm.allowedRecipients)
        })
      });

      await Promise.all([refreshPolicies(), refreshAudit()]);
      setExecutionForm((current) => ({ ...current, policyId: created.id }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to create policy.');
    } finally {
      setIsCreatingPolicy(false);
    }
  }

  async function handleExecute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsExecuting(true);

    try {
      const nextResult = await readJson<ExecutionResult>('/execute', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          policyId: executionForm.policyId || undefined,
          action: executionForm.action,
          amountUsd: Number(executionForm.amountUsd),
          token: executionForm.token,
          program: executionForm.program,
          recipient: executionForm.recipient,
          requiresHumanApproval: executionForm.requiresHumanApproval
        })
      });

      setResult(nextResult);
      await refreshAudit();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to run execution review.');
    } finally {
      setIsExecuting(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="badges">
          <span className="badge">Solana devnet</span>
          <span className="badge">Agent payments</span>
          <span className="badge">Safe execution</span>
          <span className="badge">Gateway {gatewayUrl}</span>
        </div>
        <h1>AgentRail</h1>
        <p>
          A hackathon-ready control room for AI agents on Solana. Create a constrained policy, submit a
          tool payment or onchain action, and inspect the safety decision before anything real happens.
        </p>
      </section>

      {error ? <section className="alert error">{error}</section> : null}

      <section className="grid section two-up">
        <article className="card">
          <h2>Create policy</h2>
          <p>Start by giving the agent a bounded policy instead of a raw wallet.</p>
          <form className="stack" onSubmit={handleCreatePolicy}>
            <label>
              <span>Policy name</span>
              <input
                value={policyForm.name}
                onChange={(event) => setPolicyForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>

            <div className="split">
              <label>
                <span>Daily limit (USD)</span>
                <input
                  inputMode="decimal"
                  value={policyForm.dailyLimitUsd}
                  onChange={(event) =>
                    setPolicyForm((current) => ({ ...current, dailyLimitUsd: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Per-tx limit (USD)</span>
                <input
                  inputMode="decimal"
                  value={policyForm.perTxLimitUsd}
                  onChange={(event) =>
                    setPolicyForm((current) => ({ ...current, perTxLimitUsd: event.target.value }))
                  }
                />
              </label>
            </div>

            <label>
              <span>Allowed tokens</span>
              <input
                value={policyForm.allowedTokens}
                onChange={(event) =>
                  setPolicyForm((current) => ({ ...current, allowedTokens: event.target.value }))
                }
              />
            </label>

            <label>
              <span>Allowed programs</span>
              <input
                value={policyForm.allowedPrograms}
                onChange={(event) =>
                  setPolicyForm((current) => ({ ...current, allowedPrograms: event.target.value }))
                }
              />
            </label>

            <label>
              <span>Allowed recipients</span>
              <input
                value={policyForm.allowedRecipients}
                onChange={(event) =>
                  setPolicyForm((current) => ({ ...current, allowedRecipients: event.target.value }))
                }
              />
            </label>

            <button className="button primary" disabled={isCreatingPolicy} type="submit">
              {isCreatingPolicy ? 'Creating policy…' : 'Create policy'}
            </button>
          </form>
        </article>

        <article className="card">
          <h2>Review execution request</h2>
          <p>Send a mock action to the gateway and get a human-readable risk decision back.</p>
          <form className="stack" onSubmit={handleExecute}>
            <label>
              <span>Attached policy</span>
              <select
                value={executionForm.policyId}
                onChange={(event) =>
                  setExecutionForm((current) => ({ ...current, policyId: event.target.value }))
                }
              >
                <option value="">No policy attached</option>
                {policies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Action</span>
              <input
                value={executionForm.action}
                onChange={(event) =>
                  setExecutionForm((current) => ({ ...current, action: event.target.value }))
                }
              />
            </label>

            <div className="split">
              <label>
                <span>Amount (USD)</span>
                <input
                  inputMode="decimal"
                  value={executionForm.amountUsd}
                  onChange={(event) =>
                    setExecutionForm((current) => ({ ...current, amountUsd: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Token</span>
                <input
                  value={executionForm.token}
                  onChange={(event) =>
                    setExecutionForm((current) => ({ ...current, token: event.target.value }))
                  }
                />
              </label>
            </div>

            <label>
              <span>Program</span>
              <input
                value={executionForm.program}
                onChange={(event) =>
                  setExecutionForm((current) => ({ ...current, program: event.target.value }))
                }
              />
            </label>

            <label>
              <span>Recipient</span>
              <input
                value={executionForm.recipient}
                onChange={(event) =>
                  setExecutionForm((current) => ({ ...current, recipient: event.target.value }))
                }
              />
            </label>

            <label className="checkbox">
              <input
                checked={executionForm.requiresHumanApproval}
                type="checkbox"
                onChange={(event) =>
                  setExecutionForm((current) => ({
                    ...current,
                    requiresHumanApproval: event.target.checked
                  }))
                }
              />
              <span>Force a human approval step</span>
            </label>

            <button className="button primary" disabled={isExecuting} type="submit">
              {isExecuting ? 'Running review…' : 'Review request'}
            </button>
          </form>
        </article>
      </section>

      <section className="grid section two-up">
        <article className="card">
          <h2>Active policies</h2>
          {policies.length === 0 ? <p>No policies yet. Create one to unlock the full flow.</p> : null}
          <div className="stack compact">
            {policies.map((policy) => (
              <div className="panel" key={policy.id}>
                <div className="panel-head">
                  <strong>{policy.name}</strong>
                  <span>{policy.id.slice(0, 8)}</span>
                </div>
                <p>
                  Daily ${policy.dailyLimitUsd} · Per-tx ${policy.perTxLimitUsd}
                </p>
                <p>
                  Tokens: {policy.allowedTokens.join(', ') || 'Any'} · Programs:{' '}
                  {policy.allowedPrograms.join(', ') || 'Any'}
                </p>
                <p>Recipients: {policy.allowedRecipients.join(', ') || 'Any'}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h2>Latest decision</h2>
          {result ? (
            <div className="stack compact">
              <div className={`pill ${result.report.level}`}>{result.report.level.toUpperCase()}</div>
              <p>{result.summary}</p>
              <div className="panel">
                <div className="panel-head">
                  <strong>Next action</strong>
                  <span>{result.nextAction}</span>
                </div>
                <p>
                  ${result.report.preview.amountUsd} {result.report.preview.token} →{' '}
                  {result.report.preview.recipient}
                </p>
                <p>Program: {result.report.preview.program}</p>
                <ul>
                  {result.report.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p>Run a review to see the risk engine respond.</p>
          )}

          {selectedPolicy ? (
            <div className="panel subtle">
              <div className="panel-head">
                <strong>Selected policy</strong>
                <span>{selectedPolicy.name}</span>
              </div>
              <p>
                Budget guardrails: daily ${selectedPolicy.dailyLimitUsd}, per-tx ${selectedPolicy.perTxLimitUsd}
              </p>
            </div>
          ) : null}
        </article>
      </section>

      <section className="section">
        <article className="card">
          <div className="section-head">
            <div>
              <h2>Audit timeline</h2>
              <p>Every policy creation, simulation, and execution review is captured here.</p>
            </div>
            <button className="button secondary" onClick={() => void refreshAudit()} type="button">
              Refresh audit
            </button>
          </div>

          <div className="stack compact">
            {auditEvents.length === 0 ? <p>No audit events yet.</p> : null}
            {auditEvents.map((event) => (
              <div className="panel" key={event.id}>
                <div className="panel-head">
                  <strong>{event.type}</strong>
                  <span>{new Date(event.createdAt).toLocaleString()}</span>
                </div>
                <pre className="code small">{JSON.stringify(event.payload, null, 2)}</pre>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
