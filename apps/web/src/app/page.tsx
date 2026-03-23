const cards = [
  {
    title: 'Policy Vault',
    body: 'Give each agent a constrained budget, a per-transaction cap, and allowlists for programs and recipients.'
  },
  {
    title: 'Paid Tool Gateway',
    body: 'Route paid API or MCP-style tool calls through a backend designed for x402-compatible flows.'
  },
  {
    title: 'Risk Engine',
    body: 'Classify every execution request before it turns into an onchain action.'
  },
  {
    title: 'Audit Timeline',
    body: 'Keep a readable execution history so humans can understand what the agent tried to do.'
  }
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="badges">
          <span className="badge">Solana devnet</span>
          <span className="badge">Agent payments</span>
          <span className="badge">Safe execution</span>
        </div>
        <h1>AgentRail</h1>
        <p>
          AgentRail is a payments, permissions, and safe-execution layer for AI agents on Solana. This
          starter dashboard is intentionally small: it keeps the hackathon flow focused on policies,
          execution review, and human-readable safety decisions.
        </p>
      </section>

      <section className="grid">
        {cards.map((card) => (
          <article className="card" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.body}</p>
          </article>
        ))}
      </section>

      <section className="section grid">
        <article className="card">
          <h3>First demo path</h3>
          <ol>
            <li>Create a policy for an agent vault.</li>
            <li>Submit a mock execution request.</li>
            <li>Inspect the generated risk decision.</li>
            <li>Decide whether the action should auto-execute or wait for approval.</li>
          </ol>
        </article>

        <article className="card">
          <h3>Gateway endpoint</h3>
          <p>The API starter lives in the Hono app under <code>apps/gateway</code>.</p>
          <div className="code">POST http://localhost:3001/execute</div>
        </article>
      </section>
    </main>
  );
}
