export type BuildStep = {
  title: string;
  what?: string;
  why?: string;
  tools?: string;
  expected?: string;
  status?: "Completed" | "In Progress" | "Planned";
};

const statusStyle = (status: string) => {
  if (status === "Completed") return { bg: "#30d15820", color: "#30d158" };
  if (status === "In Progress") return { bg: "#2997ff20", color: "#2997ff" };
  return { bg: "var(--bg-alt)", color: "var(--text-3)" };
};

export function BuildSequence({ steps, defaultStatus = "Completed" }: { steps: BuildStep[]; defaultStatus?: BuildStep["status"] }) {
  return (
    <section className="mb-20">
      <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>
        Build Sequence
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
        The exact steps taken, in order.
      </p>
      <div className="flex flex-col gap-4">
        {steps.map((s, i) => {
          const status = s.status ?? defaultStatus ?? "Completed";
          const st = statusStyle(status);
          return (
            <div
              key={i}
              className="rounded-2xl p-6"
              style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)", borderLeft: "3px solid var(--accent)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-mono font-bold flex-shrink-0 mt-0.5" style={{ color: "var(--text-3)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-sm font-semibold leading-snug" style={{ color: "var(--text)" }}>{s.title}</h3>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0" style={{ backgroundColor: st.bg, color: st.color }}>
                  {status}
                </span>
              </div>
              {(s.what || s.why || s.tools || s.expected) && (
                <div className="ml-7 mt-3 space-y-2">
                  {s.what && <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}><span style={{ color: "var(--text-3)" }}>What: </span>{s.what}</p>}
                  {s.why && <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}><span style={{ color: "var(--text-3)" }}>Why: </span>{s.why}</p>}
                  {s.tools && <p className="text-xs leading-relaxed font-mono" style={{ color: "var(--text-3)" }}>{s.tools}</p>}
                  {s.expected && <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}><span style={{ color: "var(--text-3)" }}>Expected: </span>{s.expected}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
