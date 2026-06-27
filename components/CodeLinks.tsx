export type CodeLink = {
  label: string;
  href: string;
  description?: string;
};

export function CodeAndDocs({ links, note }: { links: CodeLink[]; note?: string }) {
  return (
    <section className="mb-20">
      <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>
        Code &amp; Documentation
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
        {note ?? "The real Terraform and scripts referenced in this lab, in the public repo."}
      </p>
      {links.length > 0 ? (
        <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 px-8 py-5 transition-colors hover:bg-[var(--bg-alt)]"
              >
                <div>
                  <p className="text-sm font-medium font-mono" style={{ color: "var(--text)" }}>{l.label}</p>
                  {l.description && <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>{l.description}</p>}
                </div>
                <span className="text-sm flex-shrink-0" style={{ color: "var(--accent)" }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
            No new Terraform or scripts for this lab — every step was configured through the
            OPNsense GUI, on top of infrastructure already provisioned in earlier labs.
          </p>
        </div>
      )}
    </section>
  );
}
