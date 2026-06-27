export type Metric = { label: string; value: string };

export function KeyMetrics({ metrics }: { metrics: Metric[] }) {
  return (
    <section className="mb-20">
      <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>
        Key Metrics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}
          >
            <p className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>{m.value}</p>
            <p className="text-xs font-semibold tracking-widest uppercase mt-2" style={{ color: "var(--text-3)" }}>{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
