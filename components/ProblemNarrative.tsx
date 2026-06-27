export function ProblemNarrative({ text, compact }: { text: string; compact?: boolean }) {
  return (
    <div
      className={compact ? "rounded-xl px-4 py-3 mb-4" : "rounded-2xl px-6 py-5 mb-6"}
      style={{ backgroundColor: "var(--bg-alt)", borderLeft: "3px solid var(--accent)" }}
    >
      <p className={compact ? "text-xs leading-relaxed" : "text-sm leading-relaxed"} style={{ color: "var(--text-2)" }}>
        {text}
      </p>
    </div>
  );
}
