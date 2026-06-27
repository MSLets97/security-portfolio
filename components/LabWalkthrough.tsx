export type WalkthroughStep = {
  title: string;
  what: string;
  how: string;
  why: string;
  where: string;
};

export function LabWalkthrough({
  steps,
  intro,
}: {
  steps: WalkthroughStep[];
  intro?: string;
}) {
  const rows = (s: WalkthroughStep) => [
    { label: "What", text: s.what },
    { label: "How", text: s.how },
    { label: "Why this way", text: s.why },
    { label: "Where", text: s.where },
  ];

  return (
    <section className="mb-20">
      <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>
        Full Walkthrough
      </h2>
      <p className="text-sm mb-10" style={{ color: "var(--text-3)" }}>
        {intro ?? "Every step of this lab, in order — what was done, how it was done, why it was done that way, and where it happens."}
      </p>
      <div className="flex flex-col gap-5">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="rounded-3xl p-8"
            style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-start gap-5 mb-6">
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-bold tracking-tight pt-1.5" style={{ color: "var(--text)" }}>
                {s.title}
              </h3>
            </div>
            <div className="space-y-5 ml-15">
              {rows(s).map((row) => (
                <div key={row.label}>
                  <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--text-3)" }}>
                    {row.label}
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-2)" }}>
                    {row.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
