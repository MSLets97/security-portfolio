import Link from "next/link";

const techs = [
  "Zenarmor (NGF plugin)", "OPNsense (FreeBSD 14.1)", "Cloud threat intelligence",
  "DNS-layer filtering", "TLS traffic classification", "Application visibility",
];

const whatZenarmordoes = [
  {
    capability: "DNS-Layer Domain Blocking",
    detail: "Resolves domain reputation before a connection is established. Blocks known-malicious domains at DNS query time — the connection never reaches the destination IP, even if the IP itself is clean.",
  },
  {
    capability: "Cloud Threat Intelligence",
    detail: "Zenarmor cloud feeds update domain and IP reputation in real time. No local rule file to update — the plugin queries cloud verdict on every new domain encountered.",
  },
  {
    capability: "Application-Layer Visibility",
    detail: "Identifies the application behind each connection — not just the port. Flags protocols trying to tunnel through standard ports (e.g., non-HTTP traffic on port 80).",
  },
  {
    capability: "TLS-Aware Classification",
    detail: "Classifies encrypted HTTPS traffic by SNI (Server Name Indication) without decrypting it — enables domain-level blocking of HTTPS traffic without a full TLS intercept.",
  },
];

const outcomes = [
  "Zenarmor plugin installed on OPNsense — active and processing all traffic flows through the NVA",
  "Cloud threat intelligence feed active: domain reputation checked in real time on every new connection",
  "Malicious domain test confirmed blocked at DNS layer: connection terminated before reaching destination IP",
  "Application visibility dashboard active in Zenarmor — traffic classified by application, not just port",
  "Zenarmor working alongside OPNsense stateful rules: NGF layer above the existing WAN/LAN firewall policy",
  "No Terraform changes required — Zenarmor deployed entirely through OPNsense plugin manager GUI",
];

const roleSkills = [
  "Next-gen firewall concepts: moving from Layer 3/4 to Layer 7 inspection",
  "DNS-layer security: blocking threats at domain resolution before connection attempts reach the network",
  "Cloud-delivered threat intelligence: real-time reputation feeds vs static signature files",
  "Application-aware security policy: understanding traffic by application identity, not just port/protocol",
  "Layered security architecture: NGF capabilities stacked above a stateful firewall ruleset",
];

export default function ZenarmorPage() {
  return (
    <div className="pt-32 pb-32 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-12" style={{ color: "var(--text-3)" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--text-2)" }}>Home</Link>
          <span>/</span>
          <Link href="/labs" className="hover:underline" style={{ color: "var(--text-2)" }}>Labs</Link>
          <span>/</span>
          <Link href="/labs/phase-3-detection" className="hover:underline" style={{ color: "var(--text-2)" }}>Phase 3</Link>
          <span>/</span>
          <span>Zenarmor</span>
        </div>

        {/* Header */}
        <div className="mb-20">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              Lab 3.1
            </span>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "#30d15820", color: "#30d158" }}>Completed</span>
            <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>Jun 2026</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-8" style={{ color: "var(--text)" }}>
            Zenarmor Next-Gen<br />Firewall Plugin.
          </h1>
          <p className="text-xl leading-relaxed max-w-2xl" style={{ color: "var(--text-2)" }}>
            Extend OPNsense beyond stateful packet inspection by installing Zenarmor — a next-gen
            firewall plugin that adds cloud-based threat intelligence, DNS-layer domain blocking,
            application visibility, and TLS-aware traffic classification to the existing security stack.
          </p>
        </div>

        {/* Objective */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Objective</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
              <p>
                The WAN and LAN firewall rules from Phase 1 operate at Layer 3/4 — they make decisions
                based on IP addresses and TCP/UDP ports. This does not detect threats that operate at
                Layer 7: malware calling back to a domain that resolves to a clean IP, application
                protocols tunnelling through standard ports, or encrypted traffic to known-malicious
                infrastructure.
              </p>
              <p>
                Zenarmor adds a next-gen inspection layer directly within OPNsense. It operates
                in front of the existing firewall rules and adds reputation-based and
                application-aware controls without requiring hardware changes.
              </p>
            </div>
          </div>
        </section>

        {/* What Zenarmor does */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>What Zenarmor Adds</h2>
          <div className="flex flex-col gap-4">
            {whatZenarmordoes.map((cap) => (
              <div key={cap.capability} className="rounded-3xl p-7" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
                <p className="text-base font-semibold mb-2" style={{ color: "var(--text)" }}>{cap.capability}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{cap.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Where It Sits in the Stack</h2>
          <div
            className="rounded-3xl p-8 overflow-x-auto"
            style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)", fontFamily: "var(--font-geist-mono)" }}
          >
            <pre className="text-xs leading-relaxed whitespace-pre" style={{ color: "var(--text-2)" }}>{`
  Inbound traffic (WAN or LAN)
       │
       ▼
  ┌─────────────────────────────────────────────┐
  │  Zenarmor (NGF layer — runs on OPNsense)    │
  │  1. DNS query intercepted                   │
  │     → cloud reputation check               │
  │     → block if malicious domain            │
  │  2. Connection established                  │
  │     → application identification           │
  │     → TLS SNI classification               │
  │     → category/reputation verdict          │
  │  3. Block or allow based on NGF policy      │
  └──────────────────┬──────────────────────────┘
                     │ (traffic that passes Zenarmor)
                     ▼
  ┌─────────────────────────────────────────────┐
  │  OPNsense stateful firewall rules           │
  │  WAN rules: Block 22, 3389, log all blocked │
  │  LAN rules: Block SMB/RDP/RPC/NetBIOS       │
  └─────────────────────────────────────────────┘

  Zenarmor verdict → OPNsense block event → filterlog
  filterlog → syslog-ng → Log Forwarder → Sentinel
`}</pre>
          </div>
        </section>

        {/* Technologies */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Technologies Used</h2>
          <div className="flex flex-wrap gap-2">
            {techs.map((t) => (
              <span key={t} className="px-4 py-2 rounded-full text-sm"
                style={{ backgroundColor: "var(--surface)", color: "var(--text-2)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Results */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>Results</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <div className="space-y-4">
              {outcomes.map((o) => (
                <div key={o} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ backgroundColor: "#30d15820" }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#30d158" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{o}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Role Relevance */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--text)" }}>What This Demonstrates</h2>
          <div className="rounded-3xl p-8" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow)", border: "1px solid var(--border)" }}>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-2)" }}>
              Enterprise firewalls are almost always NGF-capable now. Understanding what next-gen
              capabilities exist beyond stateful inspection — and how to configure them — is a
              core NSE competency.
            </p>
            <div className="space-y-3">
              {roleSkills.map((s) => (
                <div key={s} className="flex items-start gap-3">
                  <span style={{ color: "var(--accent)" }} className="text-sm flex-shrink-0 mt-0.5">›</span>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nav */}
        <div className="flex items-center justify-between pt-8" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/labs/phase-3-detection" className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            ← Phase 3 overview
          </Link>
          <Link href="/labs/phase-3-detection/suricata-ids" className="text-sm font-medium" style={{ color: "var(--text-3)" }}>
            Lab 3.2: Suricata IDS/IPS (coming soon)
          </Link>
        </div>
      </div>
    </div>
  );
}
