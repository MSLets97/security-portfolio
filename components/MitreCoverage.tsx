export type MitreTechnique = { tactic: string; id: string; name: string };

export function MitreCoverage({ techniques, note }: { techniques: MitreTechnique[]; note?: string }) {
  return (
    <section className="mb-20">
      <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>
        MITRE ATT&amp;CK Coverage
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {techniques.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl p-6"
            style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--text-3)" }}>{t.tactic}</p>
            <p className="text-sm font-mono font-bold mb-1" style={{ color: "#ff9f0a" }}>{t.id}</p>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>{t.name}</p>
          </div>
        ))}
      </div>
      {note && (
        <p className="text-xs mt-6" style={{ color: "var(--text-3)" }}>{note}</p>
      )}
    </section>
  );
}
