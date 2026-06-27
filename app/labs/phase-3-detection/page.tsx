import Link from "next/link";
import { KeyLearningsRollup, KeyLearning } from "@/components/KeyLearningsRollup";

const keyLearnings: KeyLearning[] = [
  { source: "Lab 3.2 — Suricata IDS/IPS", lesson: "OPNsense plugin UIs change between major versions — the Suricata config moved from a per-interface tab with a binary IPS checkbox to a single unified Settings page with a Capture mode dropdown. Never document a workflow purely from memory or an older guide; confirm against the live, running version first." },
];

const labs = [
  {
    slug: "zenarmor",
    number: "3.1",
    title: "Zenarmor Next-Gen Firewall Plugin",
    description: "Install Zenarmor on OPNsense to add cloud-based threat intelligence, DNS-layer domain blocking, application-aware traffic inspection, and TLS-aware classification — turning the stateful firewall into a next-gen security layer.",
    skills: ["Zenarmor / NGF plugin", "DNS-layer filtering", "Cloud threat intelligence", "Application visibility", "TLS inspection"],
    status: "Completed",
    date: "Jun 2026",
  },
  {
    slug: "suricata-ids",
    number: "3.2",
    title: "Suricata IDS/IPS & Custom Signatures",
    description: "Deploy Suricata in active IPS prevention mode on OPNsense with Emerging Threats Open rule sets. Write custom Snort-format signatures to detect and drop Nmap SYN reconnaissance in real time, and stream alerts to Sentinel.",
    skills: ["Suricata IDS/IPS", "Emerging Threats rules", "Custom signatures", "IPS prevention mode", "Sentinel alert integration"],
    status: "In Progress",
    date: "In Progress",
  },
];

const nseMapping = [
  { skill: "IDS/IPS Deployment", detail: "Installing and tuning Suricata on an existing NVA — IPS mode requires careful configuration to avoid blocking legitimate traffic" },
  { skill: "Signature Management", detail: "Working with Emerging Threats rule sets, understanding rule categories, enabling/disabling specific signatures based on the environment" },
  { skill: "Threat Intelligence Integration", detail: "Zenarmor cloud feeds provide real-time domain reputation — blocking known-malicious domains before the connection reaches any firewall rule" },
  { skill: "Alert Engineering", detail: "Getting IDS/IPS alerts into Sentinel in a structured format: syslog EVE JSON output, field extraction, actionable alert content" },
  { skill: "Next-Gen Firewall Concepts", detail: "Application-layer inspection, TLS-aware classification, DNS-based control — capabilities beyond stateful packet inspection" },
];

export default function Phase3Page() {
  return (
    <div className="pt-32 pb-32 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-12" style={{ color: "var(--text-3)" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--text-2)" }}>Home</Link>
          <span>/</span>
          <Link href="/labs" className="hover:underline" style={{ color: "var(--text-2)" }}>Labs</Link>
          <span>/</span>
          <span>Phase 3</span>
        </div>

        {/* Header */}
        <div className="mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              Phase 03
            </span>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "#2997ff20", color: "#2997ff" }}>
              In Progress
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-8" style={{ color: "var(--text)" }}>
            Threat Detection<br />&amp; IDS/IPS.
          </h1>
          <p className="text-xl leading-relaxed max-w-2xl" style={{ color: "var(--text-2)" }}>
            Move beyond stateful firewalling: add Zenarmor next-gen capabilities for DNS-layer and
            application-aware threat blocking, and deploy Suricata in active IPS mode to detect and
            drop network intrusions based on signature matching and custom rules.
          </p>
        </div>

        {/* What this phase proves */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>What This Phase Proves</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-2)" }}>
              A traditional stateful firewall operates at Layer 3/4 — it makes decisions based on IP
              addresses and ports. Modern threats operate at Layer 7: malicious domains that resolve to
              clean IPs, attack patterns in protocol payloads, and known-bad signatures in otherwise
              permitted traffic. This phase adds the detection layers that operate above Layer 4.
            </p>
            <div className="space-y-4">
              {nseMapping.map((m) => (
                <div key={m.skill} className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                  <span className="text-sm font-semibold flex-shrink-0 w-52" style={{ color: "var(--text)" }}>{m.skill}</span>
                  <span className="text-sm" style={{ color: "var(--text-2)" }}>{m.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Labs */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>Labs in This Phase</h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>Two labs extending OPNsense with next-gen detection capabilities.</p>
          <div className="flex flex-col gap-5">
            {labs.map((lab) => {
              const isCompleted = lab.status === "Completed";
              const statusStyle = isCompleted
                ? { bg: "#30d15820", color: "#30d158" }
                : { bg: "#2997ff20", color: "#2997ff" };
              return (
                <div key={lab.slug} className="rounded-3xl p-8"
                  style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start gap-5 mb-5">
                    <span className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                      style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
                      {lab.number}
                    </span>
                    <div className="flex-1 pt-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          {lab.status}
                        </span>
                        <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>{lab.date}</span>
                      </div>
                      <h3 className="text-lg font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>{lab.title}</h3>
                      <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-2)" }}>{lab.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {lab.skills.map((s) => (
                          <span key={s} className="text-xs px-2.5 py-0.5 rounded-full"
                            style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                      <Link href={`/labs/phase-3-detection/${lab.slug}`}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium"
                        style={{ backgroundColor: isCompleted ? "var(--accent)" : "var(--bg-alt)", color: isCompleted ? "#fff" : "var(--text)", border: isCompleted ? "none" : "1px solid var(--border)" }}>
                        {isCompleted ? "Read case study →" : "View progress so far →"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Key Learnings */}
        <KeyLearningsRollup items={keyLearnings} />

        {/* Nav */}
        <div className="flex items-center justify-between pt-8" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/labs/phase-2-visibility" className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            ← Phase 2: Security Visibility
          </Link>
          <Link href="/labs" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            All phases →
          </Link>
        </div>
      </div>
    </div>
  );
}
