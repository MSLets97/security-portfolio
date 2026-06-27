export type KeyLearning = {
  lesson: string;
  source: string;
};

export function KeyLearningsRollup({ items }: { items: KeyLearning[] }) {
  return (
    <section className="mb-20">
      <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>
        Key Learnings
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
        Every lesson from this phase&apos;s labs, in one place — pulled from the individual
        Challenges &amp; Solutions sections below.
      </p>
      <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
        <div className="flex flex-col gap-5">
          {items.map((item, i) => (
            <div key={i} className="rounded-2xl px-5 py-4" style={{ backgroundColor: "var(--bg-alt)", borderLeft: "3px solid var(--accent)" }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "var(--accent)" }}>
                {item.source}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{item.lesson}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
