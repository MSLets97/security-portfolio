export function ChallengesLessons({ items }: { items: string[] }) {
  return (
    <section className="mb-20">
      <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>
        Challenges &amp; Lessons Learned
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
        Specific, first-person takeaways from building this phase.
      </p>
      <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
        <div className="flex flex-col gap-5">
          {items.map((text, i) => (
            <div key={i} className="flex items-start gap-4">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}
              >
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
